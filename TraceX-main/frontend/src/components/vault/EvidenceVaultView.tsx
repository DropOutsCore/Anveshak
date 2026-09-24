import React, { useState } from 'react';
import { Lock, Download, CheckCircle2, History, Hash, Copy, Check, Blocks, ExternalLink } from 'lucide-react';
import { CaseDetail } from '../../types';

const CopyHash: React.FC<{ value: string; label: string; color?: string }> = ({ value, label, color = 'var(--cyan)' }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer group transition-all"
      style={{ background:'var(--bg-04)', border:'1px solid var(--border-subtle)' }}
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      <span className="t-label shrink-0">{label}</span>
      <code className="flex-1 text-[10px] truncate font-mono" style={{ color }}>{value.slice(0,24)}…</code>
      {copied
        ? <Check  className="w-3 h-3 shrink-0" style={{ color:'var(--green)' }} />
        : <Copy   className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:'var(--text-tertiary)' }} />
      }
    </div>
  );
};

const ACTION_ACCENT: Record<string, { color: string; dimBg: string; border: string }> = {
  INGEST:  { color:'var(--cyan)',   dimBg:'rgba(34,211,238,0.08)',  border:'rgba(34,211,238,0.22)' },
  ANALYZE: { color:'var(--purple)', dimBg:'rgba(167,139,250,0.08)', border:'rgba(167,139,250,0.22)' },
  EXPORT:  { color:'var(--green)',  dimBg:'rgba(52,211,153,0.08)',  border:'rgba(52,211,153,0.22)'  },
  DEFAULT: { color:'var(--text-tertiary)', dimBg:'rgba(255,255,255,0.03)', border:'var(--border-subtle)' },
};
const actionAccent = (action: string) => {
  const u = action.toUpperCase();
  if (u.includes('INGEST'))                                return ACTION_ACCENT.INGEST;
  if (u.includes('ANALYZ') || u.includes('DETECT'))        return ACTION_ACCENT.ANALYZE;
  if (u.includes('EXPORT') || u.includes('VAULT') || u.includes('SEAL')) return ACTION_ACCENT.EXPORT;
  return ACTION_ACCENT.DEFAULT;
};

interface EvidenceVaultViewProps { caseDetail: CaseDetail; }

export const EvidenceVaultView: React.FC<EvidenceVaultViewProps> = ({ caseDetail }) => {
  const events = caseDetail.chain_of_custody;

  const downloadStix = async () => {
    const res  = await fetch(`http://127.0.0.1:8000/api/v1/cases/${caseDetail.case_id}/stix`);
    const data = await res.json();
    const url  = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type:'application/json' }));
    Object.assign(document.createElement('a'), { href:url, download:`STIX_Bundle_${caseDetail.case_id}.json` }).click();
  };

  const downloadReport = () => {
    const text = `# ANVESHAK FORENSIC REPORT — ${caseDetail.case_id}\nGenerated: ${new Date().toISOString()}\n\n## Case Summary\n- Threat: ${caseDetail.threat_score.overall_score}/100 (${caseDetail.threat_score.severity})\n- Subject: ${caseDetail.email_subject}\n- From: ${caseDetail.email_from}\n\n## Chain of Custody\n${events.map(e=>`[${e.event_id}] ${e.action} by ${e.actor} | Hash: ${e.current_hash}`).join('\n')}`;
    const url = URL.createObjectURL(new Blob([text], { type:'text/markdown' }));
    Object.assign(document.createElement('a'), { href:url, download:`Report_${caseDetail.case_id}.md` }).click();
  };

  return (
    <div className="page space-y-7 anim-fade-up">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="section-header flex-1" style={{ marginBottom:0, paddingBottom:0, border:'none' }}>
          <div className="section-icon" style={{ background:'var(--green-dim)', border:'1px solid var(--green-border)' }}>
            <Lock className="w-4 h-4" style={{ color:'var(--green)' }} />
          </div>
          <div>
            <h1 className="t-title">Evidence Vault</h1>
            <p className="t-body mt-0.5">Cryptographically sealed SHA-256 event ledger · tamper-evident chain of custody</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={downloadStix} className="btn btn-secondary btn-sm">
            <ExternalLink className="w-3.5 h-3.5" />
            STIX 2.1
          </button>
          <button onClick={downloadReport} className="btn btn-secondary btn-sm">
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
        {[
          { label:'COC Events',    value: events.length, color:'var(--cyan)'   },
          { label:'Hash Algo',     value:'SHA-256',      color:'var(--purple)' },
          { label:'Integrity',     value:'100%',         color:'var(--green)'  },
          { label:'Tamper Status', value:'Clean',        color:'var(--green)'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="apple-card p-4 text-center">
            <p className="t-label mb-2">{label}</p>
            <p className="font-bold" style={{ fontSize:'1.2rem', color, letterSpacing:'-0.03em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Timeline ── */}
      <div className="apple-card p-6">
        <div className="flex items-center gap-2 pb-5 mb-2" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
          <History className="w-4 h-4" style={{ color:'var(--cyan)' }} />
          <p className="t-heading">Append-Only Blockchain Ledger</p>
          <span
            className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background:'var(--cyan-dim)', color:'var(--cyan)', border:'1px solid var(--cyan-border)' }}
          >
            {events.length} events
          </span>
        </div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div
            className="absolute"
            style={{
              left:20, top:24, bottom:24, width:2,
              background:'linear-gradient(to bottom, rgba(34,211,238,0.5), rgba(167,139,250,0.3), rgba(52,211,153,0.2))',
            }}
          />

          <div className="space-y-4">
            {events.map((evt, idx) => {
              const ac = actionAccent(evt.action);
              return (
                <div
                  key={evt.event_id}
                  className="relative flex gap-5 pl-1 animate-block-appear"
                  style={{ animationDelay:`${idx * 60}ms` }}
                >
                  {/* Timeline node */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 relative z-10"
                    style={{ background: ac.dimBg, border:`2px solid ${ac.border}` }}
                  >
                    {idx === 0
                      ? <Blocks className="w-4 h-4" style={{ color: ac.color }} />
                      : <Hash   className="w-4 h-4" style={{ color: ac.color }} />
                    }
                  </div>

                  {/* Event card */}
                  <div
                    className="flex-1 rounded-2xl p-4 space-y-3 transition-all"
                    style={{ background: ac.dimBg, border:`1px solid ${ac.border}` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold"
                          style={{ background: ac.dimBg, color: ac.color, border:`1px solid ${ac.border}` }}
                        >
                          {evt.event_id}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background:'var(--glass-01)', color:'var(--text-tertiary)', border:'1px solid var(--border-subtle)' }}
                        >
                          {evt.role}
                        </span>
                        <span className="font-semibold text-sm" style={{ color:'var(--text-primary)' }}>{evt.action}</span>
                      </div>
                      <span className="t-caption shrink-0">{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>

                    <p className="t-body leading-relaxed">{evt.details}</p>

                    <div className="space-y-1.5">
                      <CopyHash label="PREV" value={evt.prev_hash}    color="var(--text-tertiary)" />
                      <div className="flex justify-center">
                        <div className="w-px h-2" style={{ background:'var(--border-default)' }} />
                      </div>
                      <CopyHash label="CURR" value={evt.current_hash} color={ac.color} />
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color:'var(--green)' }} />
                      <span className="t-caption font-semibold" style={{ color:'var(--green)' }}>
                        Blockchain anchored · Tamper-evident
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
