import React from 'react';
import {
  Shield, Cpu, Blocks, Mail, Route, Lock, ArrowRight,
  Activity, ChevronRight, Globe, Database, Zap
} from 'lucide-react';

interface LandingPageProps {
  onEnterWorkspace: (initialTab?: string) => void;
}

const NAV_LINKS = [
  { label: 'Forensics Lab',   tab: 'email_forensics'  },
  { label: 'Sandbox',         tab: 'sandbox'           },
  { label: 'Chain of Custody',tab: 'blockchain_proof'  },
  { label: 'Threat Intel',    tab: 'campaign_intel'    },
];

const FEATURES = [
  {
    icon: Mail,
    color: 'var(--purple)',
    dimBg: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.25)',
    title: 'MIME Forensics Lab',
    desc: 'Decompose mail routing paths, analyze SPF/DKIM/DMARC headers, and detect display-name homoglyphs.',
    tab: 'email_forensics',
  },
  {
    icon: Route,
    color: 'var(--cyan)',
    dimBg: 'rgba(34,211,238,0.10)',
    border: 'rgba(34,211,238,0.25)',
    title: 'Header Flight Recorder',
    desc: 'Reconstruct hop-by-hop relay paths from origin MTA to inbox with real AbuseIPDB reputation scoring.',
    tab: 'header_flight',
  },
  {
    icon: Cpu,
    color: 'var(--red)',
    dimBg: 'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.25)',
    title: 'Detonation Sandbox',
    desc: 'Isolate attachments in a read-only environment — YARA rules, process trees, network IOCs, MITRE mapping.',
    tab: 'sandbox',
  },
  {
    icon: Blocks,
    color: 'var(--accent)',
    dimBg: 'rgba(59,130,246,0.10)',
    border: 'rgba(59,130,246,0.25)',
    title: 'Blockchain Proof',
    desc: 'Cryptographic SHA-256 Merkle chain of custody — tamper-evident, court-admissible evidence ledger.',
    tab: 'blockchain_proof',
  },
  {
    icon: Globe,
    color: 'var(--green)',
    dimBg: 'rgba(52,211,153,0.10)',
    border: 'rgba(52,211,153,0.25)',
    title: 'Geo-Financial Intel',
    desc: 'Bank IFSC branch coordinates vs. server IP origin — cross-region payout mismatch detection.',
    tab: 'geo_financial',
  },
  {
    icon: Zap,
    color: 'var(--amber)',
    dimBg: 'rgba(251,191,36,0.10)',
    border: 'rgba(251,191,36,0.25)',
    title: 'AI Forensic Copilot',
    desc: 'RAG-grounded investigator separating [FACT], [INFERENCE], and [UNCERTAINTY] with evidence citations.',
    tab: 'ai_copilot',
  },
];

const ARCH = [
  'MIME Parsing Engine',
  'SHA-256 Merkle Proof System',
  'Qdrant Vector RAG Engine',
  'FastAPI 0.110 Async Gateway',
  'Polygon POS + Hyperledger',
  'VirusTotal / AbuseIPDB APIs',
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterWorkspace }) => {
  return (
    <div
      className="min-h-screen flex flex-col antialiased relative overflow-x-hidden"
      style={{ background:'var(--bg-01)', color:'var(--text-primary)' }}
    >
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/3 w-[700px] h-[500px] rounded-full pointer-events-none"
           style={{ background:'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', filter:'blur(80px)' }} />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
           style={{ background:'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)', filter:'blur(80px)' }} />
      <div className="fixed inset-0 bg-dot opacity-30 pointer-events-none" />

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 px-6 py-4"
        style={{
          background:'rgba(10,11,15,0.80)',
          backdropFilter:'blur(40px) saturate(200%)',
          borderBottom:'1px solid var(--border-subtle)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{ background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.3)' }}
            >
              <Shield className="w-4 h-4" style={{ color:'var(--accent)' }} />
            </div>
            <span className="font-semibold" style={{ fontSize:'1rem', letterSpacing:'-0.02em', color:'var(--text-primary)' }}>
              Trace<span style={{ color:'var(--accent)' }}>X</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, tab }) => (
              <button
                key={label}
                onClick={() => onEnterWorkspace(tab)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-180"
                style={{ color:'var(--text-secondary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='var(--text-primary)'; (e.currentTarget as HTMLElement).style.background='var(--glass-01)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background='transparent'; }}
              >
                {label}
              </button>
            ))}
          </nav>

          <button onClick={() => onEnterWorkspace()} className="btn btn-primary btn-sm">
            Launch Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 max-w-4xl mx-auto z-10">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 text-xs font-medium"
          style={{ background:'var(--accent-dim)', border:'1px solid var(--accent-border)', color:'var(--accent)' }}
        >
          <Activity className="w-3.5 h-3.5" />
          Cyber-Forensics Intelligence Platform
        </div>

        <h1
          className="font-bold leading-tight mb-6"
          style={{ fontSize:'clamp(2.2rem, 6vw, 3.5rem)', letterSpacing:'-0.03em', color:'var(--text-primary)' }}
        >
          Forensic Intelligence,<br />
          <span style={{ color:'var(--accent)' }}>End-to-End.</span>
        </h1>

        <p
          className="leading-relaxed mb-10 max-w-2xl"
          style={{ fontSize:'1.0625rem', color:'var(--text-secondary)', lineHeight:1.65 }}
        >
          Enterprise-grade email forensics workstation — header relay tracing, attachment detonation,
          geo-financial intelligence, and tamper-evident Merkle chain of custody.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => onEnterWorkspace()} className="btn btn-primary btn-lg">
            Enter Forensic Lab
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEnterWorkspace('case_desk')}
            className="btn btn-secondary btn-lg"
          >
            View Cases
          </button>
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section className="relative z-10 max-w-6xl mx-auto w-full px-6 pb-20">
        <div className="text-center mb-12">
          <p className="t-label mb-2">Capabilities</p>
          <h2
            className="font-semibold"
            style={{ fontSize:'1.75rem', letterSpacing:'-0.025em', color:'var(--text-primary)' }}
          >
            Everything you need to investigate
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {FEATURES.map(({ icon: Icon, color, dimBg, border, title, desc, tab }) => (
            <div
              key={title}
              onClick={() => onEnterWorkspace(tab)}
              className="group p-6 rounded-2xl cursor-pointer transition-all duration-220 flex flex-col gap-4"
              style={{ background:'var(--bg-02)', border:'1px solid var(--border-default)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = border;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${border}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                (e.currentTarget as HTMLElement).style.transform = 'none';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: dimBg, border:`1px solid ${border}` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>

              <div className="flex-1">
                <h3
                  className="font-semibold mb-2"
                  style={{ fontSize:'0.9375rem', color:'var(--text-primary)', letterSpacing:'-0.01em' }}
                >
                  {title}
                </h3>
                <p className="t-body text-sm leading-relaxed">{desc}</p>
              </div>

              <div
                className="flex items-center gap-1 text-xs font-medium transition-all duration-180"
                style={{ color:'var(--text-tertiary)' }}
              >
                <span>Explore</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 mt-auto"
        style={{ borderTop:'1px solid var(--border-subtle)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background:'var(--accent-dim)', border:'1px solid var(--accent-border)' }}
              >
                <Shield className="w-3.5 h-3.5" style={{ color:'var(--accent)' }} />
              </div>
              <span className="font-semibold" style={{ fontSize:'0.9375rem', letterSpacing:'-0.015em' }}>
                Trace<span style={{ color:'var(--accent)' }}>X</span>
              </span>
            </div>
            <p className="t-caption leading-relaxed">Digital Forensics &amp; Immutable Evidence Chain Platform.</p>
          </div>

          {/* Modules */}
          <div>
            <p className="t-label mb-3">Modules</p>
            <ul className="space-y-2">
              {[
                { label:'Case Desk',          tab:'case_desk'        },
                { label:'Header Recorder',    tab:'header_flight'    },
                { label:'Identity Deception', tab:'identity_deception'},
                { label:'Chain of Custody',   tab:'blockchain_proof' },
              ].map(({ label, tab }) => (
                <li key={label}>
                  <button
                    onClick={() => onEnterWorkspace(tab)}
                    className="t-caption hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Architecture */}
          <div>
            <p className="t-label mb-3">Architecture</p>
            <ul className="space-y-2">
              {ARCH.map(a => (
                <li key={a} className="t-caption">{a}</li>
              ))}
            </ul>
          </div>

          {/* Status */}
          <div>
            <p className="t-label mb-3">Telemetry</p>
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background:'var(--bg-02)', border:'1px solid var(--border-default)' }}
            >
              {[
                { label:'Status',    value:'Online',       color:'var(--green)' },
                { label:'Integrity', value:'SHA-256 Sealed', color:'var(--text-secondary)' },
                { label:'Blockchain',value:'Polygon POS',  color:'var(--purple)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="t-caption">{label}</span>
                  <span className="text-xs font-medium" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop:'1px solid var(--border-subtle)' }}
        >
          <p className="t-caption">© 2026 Anveshak Forensics. All rights reserved.</p>
          <p className="t-caption">SIH 2026 · Cyber-Forensics Intelligence</p>
        </div>
      </footer>
    </div>
  );
};
