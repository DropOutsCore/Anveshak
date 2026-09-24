import React, { useState } from 'react';
import { Flame, CheckCircle2, Layers, Hash } from 'lucide-react';
import { CampaignMatch, CaseDetail } from '../../types';

interface CampaignIntelligenceViewProps { caseDetail: CaseDetail; }

export const CampaignIntelligenceView: React.FC<CampaignIntelligenceViewProps> = ({ caseDetail }) => {
  const [matches, setMatches] = useState<CampaignMatch[]>(caseDetail.campaign_matches);
  const dna = caseDetail.attack_dna;

  const handleDecision = (campId: string, newStatus: string) =>
    setMatches(prev => prev.map(m => m.campaign_id === campId ? { ...m, status: newStatus } : m));

  const statusStyle = (status: string) => {
    if (status === 'CONFIRMED') return { bg:'var(--green-dim)',  color:'var(--green)',  border:'var(--green-border)' };
    if (status === 'REJECTED')  return { bg:'var(--bg-04)',      color:'var(--text-tertiary)', border:'var(--border-subtle)' };
    return                             { bg:'var(--amber-dim)',  color:'var(--amber)',  border:'var(--amber-border)' };
  };

  return (
    <div className="page space-y-7 anim-fade-up">

      {/* ── Page header ── */}
      <div className="section-header">
        <div className="section-icon" style={{ background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.25)' }}>
          <Flame className="w-4 h-4" style={{ color:'var(--red)' }} />
        </div>
        <div>
          <h1 className="t-title">Campaign Intelligence</h1>
          <p className="t-body mt-0.5">Attack DNA fingerprints correlated with historical cases and shared infrastructure.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── DNA Fingerprint card ── */}
        <div className="apple-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-4" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
            <div className="section-icon w-8 h-8" style={{ background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.25)' }}>
              <Layers className="w-3.5 h-3.5" style={{ color:'var(--cyan)' }} />
            </div>
            <p className="t-heading">Attack DNA</p>
          </div>

          {/* DNA hash pill */}
          <div>
            <p className="t-label mb-2">DNA Hash</p>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background:'var(--cyan-dim)', border:'1px solid var(--cyan-border)' }}
            >
              <Hash className="w-3.5 h-3.5 shrink-0" style={{ color:'var(--cyan)' }} />
              <span className="font-mono font-semibold text-xs truncate" style={{ color:'var(--cyan)' }}>
                {dna.dna_hash}
              </span>
            </div>
          </div>

          {[
            { label:'Identity Pattern',    value: dna.identity_fingerprint  },
            { label:'Redirect Pattern',    value: dna.url_structure_hash    },
            { label:'Auth Profile',        value: dna.auth_behavior_code    },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="t-label mb-1.5">{label}</p>
              <p className="font-medium text-sm" style={{ color:'var(--text-primary)', wordBreak:'break-all' }}>{value}</p>
            </div>
          ))}

          <div>
            <p className="t-label mb-2">Infrastructure ASN Set</p>
            <div className="flex flex-wrap gap-2">
              {dna.infrastructure_asn_set.map(asn => (
                <span
                  key={asn}
                  className="px-2.5 py-1 rounded-lg font-mono font-semibold text-xs"
                  style={{ background:'var(--bg-04)', border:'1px solid var(--border-default)', color:'var(--cyan)' }}
                >
                  {asn}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Campaign matches ── */}
        <div className="lg:col-span-2 apple-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-4" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
            <p className="t-heading">Campaign Correlations</p>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background:'var(--bg-04)', border:'1px solid var(--border-default)', color:'var(--text-secondary)' }}
            >
              {matches.length} matched
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="py-12 text-center">
              <p className="t-heading mb-1">No Campaign Matches</p>
              <p className="t-body">No historical campaign correlations found in institutional threat memory.</p>
            </div>
          ) : (
            <div className="space-y-4 stagger">
              {matches.map(camp => {
                const ss = statusStyle(camp.status);
                return (
                  <div
                    key={camp.campaign_id}
                    className="rounded-2xl p-5 space-y-4"
                    style={{ background:'var(--bg-04)', border:'1px solid var(--border-default)' }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold" style={{ fontSize:'0.9375rem', color:'var(--text-primary)', letterSpacing:'-0.01em' }}>
                          {camp.campaign_name}
                        </p>
                        <p className="t-caption mt-0.5">
                          Confidence:&nbsp;
                          <span className="font-semibold" style={{ color:'var(--cyan)' }}>
                            {camp.confidence.toFixed(1)}%
                          </span>
                        </p>
                      </div>
                      <span
                        className="pill shrink-0"
                        style={{ background: ss.bg, color: ss.color, border:`1px solid ${ss.border}`, fontSize:'0.65rem' }}
                      >
                        {camp.status}
                      </span>
                    </div>

                    {/* Confidence bar */}
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background:'var(--bg-03)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width:`${camp.confidence}%`,
                          background:'linear-gradient(90deg,var(--accent),var(--cyan))',
                          transition:'width 600ms var(--ease-apple)',
                        }}
                      />
                    </div>

                    {/* Matched signals */}
                    <div>
                      <p className="t-label mb-2">Shared Evidence Signals</p>
                      <div className="space-y-1.5">
                        {camp.matched_signals.map((sig, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color:'var(--cyan)' }} />
                            <span className="t-body text-xs">{sig}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Decision buttons */}
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop:'1px solid var(--border-subtle)' }}
                    >
                      <span className="t-label">Analyst Decision</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecision(camp.campaign_id, 'CONFIRMED')}
                          className="btn btn-xs"
                          style={{
                            background: camp.status === 'CONFIRMED' ? 'var(--green-dim)' : 'transparent',
                            color: 'var(--green)',
                            border:`1px solid var(--green-border)`,
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleDecision(camp.campaign_id, 'SUSPECTED')}
                          className="btn btn-xs"
                          style={{
                            background: camp.status === 'SUSPECTED' ? 'var(--amber-dim)' : 'transparent',
                            color: 'var(--amber)',
                            border:`1px solid var(--amber-border)`,
                          }}
                        >
                          Uncertain
                        </button>
                        <button
                          onClick={() => handleDecision(camp.campaign_id, 'REJECTED')}
                          className="btn btn-xs"
                          style={{
                            background: camp.status === 'REJECTED' ? 'var(--bg-03)' : 'transparent',
                            color: 'var(--text-tertiary)',
                            border:'1px solid var(--border-default)',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
