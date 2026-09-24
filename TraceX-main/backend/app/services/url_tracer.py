import re
import requests
from typing import List, Dict, Any
from app.schemas.forensics import UrlAnalysisItem, UrlRedirectHop
from app.core.security import validate_ssrf_safe_url
from app.services.virustotal_service import VirusTotalService
from app.services.urlscan_service import UrlScanService
import logging

logger = logging.getLogger("uvicorn.error")

class UrlTracerService:
    SUSPICIOUS_TLDS = [".xyz", ".top", ".top", ".info", ".icu", ".biz", ".tk", ".fit", ".rest", ".online"]
    SHORTENER_SERVICES = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly"]

    @staticmethod
    def analyze_urls(urls: List[str]) -> List[UrlAnalysisItem]:
        """
        Analyzes a list of URLs extracted from an email.
        Calls VirusTotal and URLScan APIs for real threat intelligence.
        Builds multi-hop redirect chains, detects link shorteners, resolves hostnames/IPs,
        and assigns risk scores based on real API data.
        """
        analyzed_items: List[UrlAnalysisItem] = []
        
        for idx, url in enumerate(urls, start=1):
            is_ssrf_safe = validate_ssrf_safe_url(url)
            
            # Extract domain
            match = re.search(r'https?://([^/:\?#]+)', url)
            domain = match.group(1).lower() if match else "unknown-domain.com"
            
            is_shortener = any(short in domain for short in UrlTracerService.SHORTENER_SERVICES)
            is_suspicious_tld = any(domain.endswith(tld) for tld in UrlTracerService.SUSPICIOUS_TLDS)
            
            risk_factors = []
            if is_shortener:
                risk_factors.append("URL obfuscated using link shortening service")
            if is_suspicious_tld:
                risk_factors.append(f"Domain uses high-risk top-level domain ({domain.split('.')[-1]})")
            if any(kw in url.lower() for kw in ["login", "verify", "secure", "billing", "signin", "auth", "credential"]):
                risk_factors.append("URL path contains credential harvesting keywords")
            if not is_ssrf_safe:
                risk_factors.append("URL targets local/private IP range (SSRF guard trigger)")

            # Get real VirusTotal analysis
            vt_report = VirusTotalService.get_url_report(url)
            if vt_report.get("malicious"):
                risk_factors.append(f"VirusTotal detects {vt_report.get('positives', 0)}/{vt_report.get('total', 0)} engines flagged as malicious")
            
            # Get URLScan.io data (includes redirect chains and screenshots)
            urlscan_report = UrlScanService.scan_url(url)
            
            # Build redirect chain from URLScan or construct heuristic chain
            redirect_chain: List[UrlRedirectHop] = []
            
            if urlscan_report.get("redirect_chain"):
                # Use real redirect data from URLScan
                for step_idx, hop_data in enumerate(urlscan_report["redirect_chain"], start=1):
                    hop_domain = re.search(r'https?://([^/:\?#]+)', hop_data.get("url", "")).group(1) if re.search(r'https?://([^/:\?#]+)', hop_data.get("url", "")) else domain
                    redirect_chain.append(UrlRedirectHop(
                        step=step_idx,
                        url=hop_data.get("url", url),
                        domain=hop_domain,
                        ip=hop_data.get("ip", "Unknown"),
                        asn=hop_data.get("asn", "Unknown"),
                        status_code=hop_data.get("status", 200),
                        is_shortener=any(short in hop_domain for short in UrlTracerService.SHORTENER_SERVICES),
                        is_suspicious=hop_data.get("suspicious", False),
                        risk_factors=hop_data.get("risk_factors", [])
                    ))
                final_url = redirect_chain[-1].url if redirect_chain else url
            else:
                # Fallback: Try HTTP HEAD request to detect redirects
                try:
                    response = requests.head(url, allow_redirects=True, timeout=5)
                    redirect_chain.append(UrlRedirectHop(
                        step=1,
                        url=url,
                        domain=domain,
                        ip="Unknown",
                        asn="Unknown",
                        status_code=response.status_code,
                        is_shortener=is_shortener,
                        is_suspicious=is_shortener or is_suspicious_tld,
                        risk_factors=risk_factors.copy()
                    ))
                    
                    if response.url != url:
                        # Redirect detected
                        final_domain = re.search(r'https?://([^/:\?#]+)', response.url).group(1) if re.search(r'https?://([^/:\?#]+)', response.url) else domain
                        redirect_chain.append(UrlRedirectHop(
                            step=2,
                            url=response.url,
                            domain=final_domain,
                            ip="Unknown",
                            asn="Unknown",
                            status_code=200,
                            is_shortener=False,
                            is_suspicious=True,
                            risk_factors=["Redirect destination detected"]
                        ))
                        final_url = response.url
                    else:
                        final_url = url
                except Exception as e:
                    logger.warning(f"[UrlTracer] Could not follow redirects for {url}: {str(e)}")
                    redirect_chain.append(UrlRedirectHop(
                        step=1,
                        url=url,
                        domain=domain,
                        ip="Unknown",
                        asn="Unknown",
                        status_code=0,
                        is_shortener=is_shortener,
                        is_suspicious=is_shortener or is_suspicious_tld,
                        risk_factors=risk_factors.copy()
                    ))
                    final_url = url
            
            # Calculate reputation score from VirusTotal + heuristics
            reputation_score = vt_report.get("score", 0)
            if is_suspicious_tld:
                reputation_score = max(reputation_score, 60)
            if is_shortener:
                reputation_score = max(reputation_score, 50)
            if len(redirect_chain) > 1:
                reputation_score = max(reputation_score, 70)
            
            analyzed_items.append(UrlAnalysisItem(
                url_id=f"URL-00{idx}",
                original_url=url,
                final_url=final_url,
                domain=domain,
                redirect_count=len(redirect_chain) - 1,
                redirect_chain=redirect_chain,
                has_credential_form=True if "login" in final_url.lower() or "auth" in final_url.lower() else False,
                has_homoglyph_domain=urlscan_report.get("homoglyph_detected", False),
                reputation_score=float(reputation_score),
                evidence_id=f"EV-URL-00{idx}"
            ))
            
        return analyzed_items
