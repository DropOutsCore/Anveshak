"""
Qdrant vector database service.
Abstracts all Qdrant implementation details from the rest of the application.
Supports three modes:
  1. Remote Qdrant server (Docker / cloud) — configured via QDRANT_URL
  2. Local file-based Qdrant — falls back automatically when remote is unavailable
  3. In-memory Qdrant — used as last resort (data lost on restart)
"""
import logging
import os
from typing import List, Dict, Any, Optional

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from app.core.config import settings
from app.services.embedding_service import get_dimension

logger = logging.getLogger("uvicorn.error")

# Module-level client singleton
_client: Optional[QdrantClient] = None

# Path for local file-based Qdrant storage (no Docker needed)
_LOCAL_QDRANT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "storage", "qdrant_local"
)


def _get_client() -> QdrantClient:
    """
    Get or create the Qdrant client singleton.
    Tries remote first, then falls back to local file-based storage.
    """
    global _client
    if _client is None:
        url = settings.QDRANT_URL
        api_key = settings.QDRANT_API_KEY or None

        # Try remote Qdrant first
        try:
            logger.info(f"[QdrantService] Connecting to Qdrant at {url}")
            remote_client = QdrantClient(url=url, api_key=api_key, timeout=3, check_compatibility=False)
            remote_client.get_collections()  # ping
            _client = remote_client
            logger.info("[QdrantService] Connected to remote Qdrant successfully.")
        except Exception as e:
            logger.warning(f"[QdrantService] Remote Qdrant unavailable ({e}). Falling back to local file-based storage.")
            # Fall back to local persistent storage
            try:
                os.makedirs(_LOCAL_QDRANT_PATH, exist_ok=True)
                _client = QdrantClient(path=_LOCAL_QDRANT_PATH)
                logger.info(f"[QdrantService] Using local file-based Qdrant at {_LOCAL_QDRANT_PATH}")
                # Auto-ingest knowledge base if collection is empty
                _maybe_ingest_knowledge(_client)
            except Exception as e2:
                logger.warning(f"[QdrantService] Local Qdrant also failed ({e2}). Using in-memory mode.")
                _client = QdrantClient(":memory:")
                _maybe_ingest_knowledge(_client)

    return _client


def _maybe_ingest_knowledge(client: QdrantClient) -> None:
    """Auto-ingest the knowledge base if the collection doesn't exist or is empty."""
    try:
        col_name = settings.RAG_COLLECTION_NAME
        collections = [c.name for c in client.get_collections().collections]
        if col_name in collections:
            info = client.get_collection(col_name)
            if (info.points_count or 0) > 0:
                logger.info(f"[QdrantService] Collection '{col_name}' already has {info.points_count} points. Skipping ingest.")
                return
        logger.info(f"[QdrantService] Auto-ingesting knowledge base into '{col_name}'...")
        _ingest_knowledge_base(client)
    except Exception as e:
        logger.warning(f"[QdrantService] Auto-ingest check failed: {e}")


def _ingest_knowledge_base(client: QdrantClient) -> None:
    """Load all markdown files from data/knowledge and ingest into Qdrant."""
    try:
        from app.services.embedding_service import embed_documents
        import hashlib

        knowledge_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "data", "knowledge"
        )
        if not os.path.exists(knowledge_dir):
            logger.warning(f"[QdrantService] Knowledge directory not found: {knowledge_dir}")
            return

        # Ensure collection exists
        col_name = settings.RAG_COLLECTION_NAME
        collections = [c.name for c in client.get_collections().collections]
        if col_name not in collections:
            dim = get_dimension()
            client.create_collection(
                collection_name=col_name,
                vectors_config=qmodels.VectorParams(size=dim, distance=qmodels.Distance.COSINE)
            )

        # Walk the knowledge directory and read all .md files
        all_chunks = []
        chunk_size = settings.RAG_CHUNK_SIZE
        overlap = settings.RAG_CHUNK_OVERLAP

        for root, _, files in os.walk(knowledge_dir):
            for fname in files:
                if not fname.endswith(".md"):
                    continue
                fpath = os.path.join(root, fname)
                category = os.path.basename(root)
                with open(fpath, "r", encoding="utf-8") as f:
                    text = f.read()

                # Split into overlapping chunks
                words = text.split()
                for i in range(0, len(words), chunk_size - overlap):
                    chunk_words = words[i:i + chunk_size]
                    if len(chunk_words) < 20:
                        continue
                    chunk_text = " ".join(chunk_words)
                    chunk_id = hashlib.md5(f"{fpath}_{i}".encode()).hexdigest()
                    # Convert hex to int for Qdrant point ID
                    point_id = int(chunk_id[:15], 16)
                    all_chunks.append({
                        "id": point_id,
                        "text": chunk_text,
                        "title": fname.replace(".md", "").replace("_", " ").title(),
                        "category": category,
                        "source": f"TRACE-X KB: {category}/{fname}",
                        "document_id": chunk_id,
                        "chunk_id": chunk_id,
                        "technique_id": None,
                    })

        if not all_chunks:
            logger.warning("[QdrantService] No knowledge chunks found to ingest.")
            return

        # Embed all chunks
        texts = [c["text"] for c in all_chunks]
        vectors = embed_documents(texts)

        points = [
            qmodels.PointStruct(
                id=all_chunks[i]["id"],
                vector=vectors[i],
                payload={k: v for k, v in all_chunks[i].items() if k != "id"}
            )
            for i in range(len(all_chunks))
        ]

        # Upsert in batches
        batch = 50
        for i in range(0, len(points), batch):
            client.upsert(collection_name=col_name, points=points[i:i+batch])

        logger.info(f"[QdrantService] Auto-ingested {len(points)} chunks into '{col_name}'.")
    except Exception as e:
        logger.error(f"[QdrantService] Knowledge ingestion failed: {e}")


def is_connected() -> bool:
    """Check if Qdrant is reachable (always true since we fall back to local)."""
    try:
        client = _get_client()
        client.get_collections()
        return True
    except Exception as e:
        logger.warning(f"[QdrantService] Connection check failed: {e}")
        return False


def collection_exists(name: Optional[str] = None) -> bool:
    """Check if the target collection exists."""
    name = name or settings.RAG_COLLECTION_NAME
    try:
        client = _get_client()
        collections = client.get_collections().collections
        return any(c.name == name for c in collections)
    except Exception:
        return False


def create_collection(name: Optional[str] = None) -> bool:
    """Create the collection if it doesn't exist. Returns True if created."""
    name = name or settings.RAG_COLLECTION_NAME
    if collection_exists(name):
        logger.info(f"[QdrantService] Collection '{name}' already exists.")
        return False

    dimension = get_dimension()
    client = _get_client()
    client.create_collection(
        collection_name=name,
        vectors_config=qmodels.VectorParams(
            size=dimension,
            distance=qmodels.Distance.COSINE
        )
    )
    logger.info(f"[QdrantService] Created collection '{name}' (dim={dimension}, cosine).")
    return True


def delete_collection(name: Optional[str] = None) -> bool:
    """Delete a collection. Returns True if deleted."""
    name = name or settings.RAG_COLLECTION_NAME
    try:
        client = _get_client()
        client.delete_collection(collection_name=name)
        logger.info(f"[QdrantService] Deleted collection '{name}'.")
        return True
    except Exception as e:
        logger.warning(f"[QdrantService] Delete failed: {e}")
        return False


def get_collection_info(name: Optional[str] = None) -> Dict[str, Any]:
    """Return collection statistics."""
    name = name or settings.RAG_COLLECTION_NAME
    try:
        client = _get_client()
        info = client.get_collection(collection_name=name)
        return {
            "name": name,
            "vectors_count": info.indexed_vectors_count,
            "points_count": info.points_count,
            "status": str(info.status),
        }
    except Exception as e:
        return {"name": name, "error": str(e)}


def upsert_documents(points: List[Dict[str, Any]], name: Optional[str] = None, batch_size: int = 100) -> int:
    """
    Upsert document chunks as points into Qdrant.
    Each point dict must contain: id, vector, payload.
    Uses deterministic IDs so re-ingestion is idempotent.
    Returns the number of points upserted.
    """
    name = name or settings.RAG_COLLECTION_NAME
    client = _get_client()
    total = 0

    for i in range(0, len(points), batch_size):
        batch = points[i:i + batch_size]
        qdrant_points = [
            qmodels.PointStruct(
                id=p["id"],
                vector=p["vector"],
                payload=p["payload"]
            )
            for p in batch
        ]
        client.upsert(collection_name=name, points=qdrant_points)
        total += len(qdrant_points)

    logger.info(f"[QdrantService] Upserted {total} points into '{name}'.")
    return total


def search(vector: List[float], top_k: int = 5, score_threshold: float = 0.3, name: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Search for similar vectors in the collection.
    Returns list of dicts with score and payload.
    """
    name = name or settings.RAG_COLLECTION_NAME
    try:
        client = _get_client()
        results = client.query_points(
            collection_name=name,
            query=vector,
            limit=top_k,
            score_threshold=score_threshold,
        )
        
        output = []
        for point in results.points:
            entry = {
                "score": round(point.score, 4),
                **point.payload
            }
            output.append(entry)
        return output
    except Exception as e:
        logger.error(f"[QdrantService] Search failed: {e}")
        return []
