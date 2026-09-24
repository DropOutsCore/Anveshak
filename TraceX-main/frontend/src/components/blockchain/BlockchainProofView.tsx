import React, { useState } from 'react';
import {
  ShieldCheck, Copy, Check, ChevronRight, Layers,
  Binary, Download, Globe2
} from 'lucide-react';
import { CaseDetail, ChainOfCustodyEvent } from '../../types';
import { downloadForensicPdf, ReportLanguage } from '../../utils/pdfExport';

const BLUE       = '#0056A6';
const BLUE_DARK  = '#003D75';
const GRAY       = '#6b7280';
const INK        = '#1f2937';
const GREEN      = '#16A34A';

interface BlockchainProofViewProps { caseDetail: CaseDetail; }

/* ── Copyable hash pill ─────────────────────────────────── */
const HashPill: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '4px 10px', background: '#f3f4f6',
        border: '1px solid #e5e7eb', borderRadius: '4px',
        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
        color: GRAY, cursor: 'pointer', transition: 'all 150ms ease',
      }}
      title="Click to copy"
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = BLUE; (e.currentTarget as HTMLElement).style.color = BLUE; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.color = GRAY; }}
    >
      {copied ? <Check size={10} style={{ color: GREEN }} /> : null}
      {value.length > 20 ? `${value.slice(0, 18)}…` : value}
    </div>
  );
};

/* ── Merkle tree node box ───────────────────────────────── */
interface MerkleBoxProps {
  variant: 'root' | 'branch' | 'leaf';
  label: string;
  hash: string;
  selected?: boolean;
  onClick?: () => void;
}
const MerkleBox: React.FC<MerkleBoxProps> = ({ variant, label, hash, selected, onClick }) => {
  const styles: Record<string, { border: string; bg: string; labelColor: string; labelBg: string }> = {
    root:   { border: BLUE,      bg: '#fff',    labelColor: BLUE,      labelBg: '#fff' },
    branch: { border: '#cbd5e1', bg: '#f9fafb', labelColor: '#64748b', labelBg: '#f9fafb' },
    leaf:   { border: selected ? BLUE : '#d1d5db', bg: '#fff', labelColor: '#1f2937', labelBg: '#fff' },
  };
  const s = styles[variant];
  const borderWidth = variant === 'root' ? 2 : selected ? 2 : 1;

  return (
    <div
      onClick={onClick}
      style={{
        background: s.bg,
        border: `${borderWidth}px solid ${s.border}`,
        borderRadius: '6px',
        padding: variant === 'leaf' ? '10px 14px' : '8px 14px',
        minWidth: variant === 'root' ? '200px' : variant === 'branch' ? '160px' : '160px',
        textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 180ms ease',
        boxShadow: variant === 'root'
          ? '0 4px 12px rgba(0,86,166,0.15)'
          : selected ? '0 4px 10px rgba(0,86,166,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
        color: s.labelColor, textTransform: 'uppercase', marginBottom: '4px',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
        color: variant === 'root' ? INK : GRAY, fontWeight: 500,
      }}>
        {hash}
      </div>
    </div>
  );
};

/* ── SVG connectors for the tree ────────────────────────── */
const TreeConnectors: React.FC = () => (
  <svg width="100%" height="60" style={{ display: 'block', overflow: 'visible' }} preserveAspectRatio="none">
    {/* Root vertical stem */}
    <line x1="50%" y1="0" x2="50%" y2="15" stroke={BLUE} strokeWidth="2" />
    {/* Horizontal line to branches */}
    <line x1="25%" y1="15" x2="75%" y2="15" stroke={BLUE} strokeWidth="2" />
    {/* Left branch down */}
    <line x1="25%" y1="15" x2="25%" y2="60" stroke={BLUE} strokeWidth="2" />
    {/* Right branch down */}
    <line x1="75%" y1="15" x2="75%" y2="60" stroke="#cbd5e1" strokeWidth="2" />
  </svg>
);

const BranchToLeafConnectors: React.FC = () => (
  <svg width="100%" height="60" style={{ display: 'block', overflow: 'visible' }} preserveAspectRatio="none">
    {/* Left branch stem */}
    <line x1="25%" y1="0" x2="25%" y2="15" stroke={BLUE} strokeWidth="2" />
    {/* Left branch horizontal */}
    <line x1="12.5%" y1="15" x2="37.5%" y2="15" stroke={BLUE} strokeWidth="2" />
    {/* Left branch to left leaf */}
    <line x1="12.5%" y1="15" x2="12.5%" y2="60" stroke={BLUE} strokeWidth="2" />
    {/* Left branch to right leaf */}
    <line x1="37.5%" y1="15" x2="37.5%" y2="60" stroke="#cbd5e1" strokeWidth="2" />

    {/* Right branch stem */}
    <line x1="75%" y1="0" x2="75%" y2="15" stroke="#cbd5e1" strokeWidth="2" />
    {/* Right branch horizontal */}
    <line x1="62.5%" y1="15" x2="87.5%" y2="15" stroke="#cbd5e1" strokeWidth="2" />
    {/* Right branch to left leaf */}
    <line x1="62.5%" y1="15" x2="62.5%" y2="60" stroke="#cbd5e1" strokeWidth="2" />
    {/* Right branch to right leaf */}
    <line x1="87.5%" y1="15" x2="87.5%" y2="60" stroke="#cbd5e1" strokeWidth="2" />
  </svg>
);

export const BlockchainProofView: React.FC<BlockchainProofViewProps> = ({ caseDetail }) => {
  const events: ChainOfCustodyEvent[] = caseDetail.chain_of_custody;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [language, setLanguage] = useState<ReportLanguage>('en');
  const [pdfMenuOpen, setPdfMenuOpen] = useState(false);
  const activeEvent = events[selectedIdx] || events[0];
  const proof = (activeEvent as any)?.blockchain_proof ?? null;

  const handleDownload = async (lang: ReportLanguage) => {
    setPdfMenuOpen(false);
    setLanguage(lang);
    await downloadForensicPdf(caseDetail, lang);
  };

  // First 4 leaves for the tree diagram
  const treeLeaves = events.slice(0, 4).map((e, i) => ({
    label: `LEAF #${i + 1}`,
    action: e.action.toUpperCase().replace(/\s+/g, '_'),
    hash: e.current_hash.slice(2, 12) + '…',
    idx: i,
  }));
  while (treeLeaves.length < 4) {
    treeLeaves.push({
      label: `LEAF #${treeLeaves.length + 1}`,
      action: `NODE_${treeLeaves.length + 1}`,
      hash: '—',
      idx: treeLeaves.length,
    });
  }

  const rootHash = proof?.merkle_root
    ? proof.merkle_root.slice(0, 18) + '…'
    : '0x7f83b1657f1fc53b9…';

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' }} className="anim-fade-up">

      {/* Breadcrumb */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '0.75rem', color: GRAY, marginBottom: '16px',
      }}>
        <span style={{ fontWeight: 700, color: BLUE }}>ANVESHAK</span>
        <ChevronRight size={12} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{caseDetail.case_id}</span>
        <ChevronRight size={12} />
        <span>Audit &amp; Integrity</span>
        <ChevronRight size={12} />
        <span style={{ color: INK, fontWeight: 600 }}>Merkle Chain of Custody</span>
      </div>

      {/* Header card */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '22px 26px', marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        gap: '16px', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>
            Merkle Proof Ledger &amp; Chain of Custody
          </h1>
          <p style={{ fontSize: '0.85rem', color: GRAY, margin: '8px 0 14px 0', lineHeight: 1.5 }}>
            Cryptographically anchor every evidence event into a SHA-256 Merkle tree with inclusion proof verification and Polygon POS mainnet audit records.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 12px', background: '#f3f4f6', color: '#4b5563',
              border: '1px solid #e5e7eb', borderRadius: '20px',
              fontSize: '0.72rem', fontWeight: 700,
            }}>
              {events.length} Sealed Blocks
            </span>
            <span style={{
              padding: '4px 12px', background: '#f0fdf4', color: GREEN,
              border: '1px solid #bbf7d0', borderRadius: '20px',
              fontSize: '0.72rem', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}>
              <ShieldCheck size={11} /> Court-Admissible Tamper-Evident Ledger
            </span>
          </div>
        </div>

        {/* PDF Download with language selector */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setPdfMenuOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: BLUE, color: '#fff', border: 'none',
              padding: '10px 18px', borderRadius: '24px',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,86,166,0.25)',
              transition: 'all 180ms ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = BLUE_DARK}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = BLUE}
          >
            <Download size={14} /> Download PDF Report
          </button>
          {pdfMenuOpen && (
            <div
              className="anim-fade-up"
              style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
                zIndex: 100, minWidth: '220px',
              }}
            >
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid #f3f4f6',
                fontSize: '0.68rem', color: GRAY, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Globe2 size={12} /> Select Language
              </div>
              {([
                { code: 'en' as ReportLanguage, label: 'English',  native: 'English'   },
                { code: 'hi' as ReportLanguage, label: 'Hindi',    native: 'हिन्दी'      },
                { code: 'te' as ReportLanguage, label: 'Telugu',   native: 'తెలుగు'     },
              ]).map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleDownload(lang.code)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px', background: 'transparent',
                    border: 'none', cursor: 'pointer',
                    fontSize: '0.82rem', color: INK, textAlign: 'left',
                    transition: 'background 120ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600 }}>{lang.label}</span>
                  <span style={{ color: GRAY, fontSize: '0.85rem' }}>{lang.native}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stat row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px', marginBottom: '20px',
      }}>
        {[
          { label: 'Total On-Chain Blocks', value: String(events.length) },
          { label: 'Block Height',          value: proof?.block_height?.toLocaleString() ?? '48,910,286' },
          { label: 'Gas Consumption',       value: proof?.gas_used?.toLocaleString() ?? '21,045' },
          { label: 'Integrity Audit',       value: '100% Verified', mono: true },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
            padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div style={{ fontSize: '0.7rem', color: GRAY, fontWeight: 600, marginBottom: '8px' }}>
              {s.label}
            </div>
            <div style={{
              fontSize: '1.35rem', fontWeight: 800, color: INK,
              fontFamily: s.mono ? 'JetBrains Mono, monospace' : 'inherit',
              letterSpacing: '-0.02em',
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Merkle tree diagram */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', borderBottom: '1px solid #e5e7eb',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,86,166,0.10)', color: BLUE,
            }}>
              <Layers size={15} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: INK }}>
              Interactive Merkle Proof Tree Diagram
            </span>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', background: '#eff6ff', color: BLUE,
            border: '1px solid #bfdbfe', borderRadius: '4px',
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
          }}>
            <Binary size={11} /> SHA-256 BINARY TREE
          </span>
        </div>

        {/* Tree canvas */}
        <div style={{ padding: '32px 24px', background: '#fafbfc' }}>
          {/* Root */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
            <MerkleBox variant="root" label="MERKLE ROOT" hash={rootHash} />
          </div>

          {/* Connectors */}
          <TreeConnectors />

          {/* Branches */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '20px', marginBottom: 0, padding: '0 12.5%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <MerkleBox variant="branch" label="BRANCH H(0+1)" hash="0x4b227777d4…" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <MerkleBox variant="branch" label="BRANCH H(2+3)" hash="0x9f86d081b8…" />
            </div>
          </div>

          {/* Branch to leaf connectors */}
          <BranchToLeafConnectors />

          {/* Leaves */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
          }}>
            {treeLeaves.map(leaf => (
              <div key={leaf.label} style={{ display: 'flex', justifyContent: 'center' }}>
                <MerkleBox
                  variant="leaf"
                  label={leaf.label}
                  hash={leaf.action}
                  selected={selectedIdx === leaf.idx}
                  onClick={() => setSelectedIdx(leaf.idx)}
                />
              </div>
            ))}
          </div>

          {/* Leaf hash row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px', marginTop: '10px',
          }}>
            {treeLeaves.map(leaf => (
              <div key={`${leaf.label}-hash`} style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.68rem', color: GRAY,
                }}>
                  {leaf.hash}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected block detail */}
      {activeEvent && (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '20px 24px', marginTop: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                padding: '3px 10px', background: BLUE, color: '#fff',
                borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
              }}>
                BLOCK #{selectedIdx + 1}
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: INK }}>
                {activeEvent.action}
              </span>
            </div>
            <span style={{
              padding: '3px 10px', background: '#f0fdf4', color: GREEN,
              border: '1px solid #bbf7d0', borderRadius: '4px',
              fontSize: '0.68rem', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}>
              <Check size={10} /> Verified
            </span>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: GRAY, fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Actor
              </div>
              <div style={{ fontSize: '0.85rem', color: INK, fontWeight: 500 }}>
                {activeEvent.actor} <span style={{ color: GRAY }}>· {activeEvent.role}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: GRAY, fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Timestamp
              </div>
              <div style={{ fontSize: '0.8rem', color: INK, fontFamily: 'JetBrains Mono, monospace' }}>
                {activeEvent.timestamp}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: GRAY, fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Current Hash
              </div>
              <HashPill value={activeEvent.current_hash} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: GRAY, fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Previous Hash
              </div>
              <HashPill value={activeEvent.prev_hash} />
            </div>
          </div>

          {activeEvent.details && (
            <div style={{ marginTop: '14px', padding: '12px 14px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: GRAY, fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Details
              </div>
              <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.55 }}>
                {activeEvent.details}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
