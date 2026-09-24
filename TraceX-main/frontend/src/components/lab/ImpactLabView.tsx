import React, { useState, useEffect } from 'react';
import { Sliders, ArrowRight, AlertCircle } from 'lucide-react';
import { CaseDetail } from '../../types';

interface ImpactLabViewProps { caseDetail: CaseDetail; }

export const ImpactLabView: React.FC<ImpactLabViewProps> = ({ caseDetail }) => {
  const [removeUrl,           setRemoveUrl]           = useState(false);
  const [assumeSpfPass,       setAssumeSpfPass]       = useState(false);
  const [disconnectCampaign,  setDisconnectCampaign]  = useState(false);
  const [removeReplyMismatch, setRemoveReplyMismatch] = useState(false);
  const [simulatedResult,     setSimulatedResult]     = useState<any>(null);
  const [loading,             setLoading]             = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/cases/${caseDetail.case_id}/impact-lab?remove_url=${removeUrl}&assume_spf_pass=${assumeSpfPass}&disconnect_campaign=${disconnectCampaign}&remove_reply_mismatch=${removeReplyMismatch}`,
        { method: 'POST' }
      );
      setSimulatedResult(await res.json());
    } catch (e) { console.error('Impact lab simulation error:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { runSimulation(); }, [removeUrl, assumeSpfPass, disconnectCampaign, removeReplyMismatch, caseDetail.case_id]);

  const originalScore = caseDetail.threat_score.overall_score;
  const simScore      = simulatedResult?.simulated_score ?? originalScore;
  const delta         = simulatedResult?.score_delta ?? 0;
  const improved      = delta < 0;

  const MODIFIERS = [
    { key:'removeUrl',           label:'Remove Suspicious URL & Redirect Chain', sub:'Hypothesize email contains no external redirect links.',                    state: removeUrl,           set: setRemoveUrl           },
    { key:'assumeSpfPass',       label:'Assume SPF Authentication Pass',          sub:'Hypothesize sender infrastructure passed SPF domain verification.',        state: assumeSpfPass,       set: setAssumeSpfPass       },
    { key:'disconnectCampaign',  label:'Disconnect Historical Campaign',           sub:'Hypothesize case has no historical campaign memory overlap.',              state: disconnectCampaign,  set: setDisconnectCampaign  },
    { key:'removeReplyMismatch', label:'Align Reply-To Domain',                    sub:'Hypothesize Reply-To domain matches visible sender.',                     state: removeReplyMismatch, set: setRemoveReplyMismatch },
  ];

  return (
    <div className="page space-y-7 anim-fade-up">

      {/* ── Page header ── */}
      <div className="section-header">
        <div className="section-icon" style={{ background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.25)' }}>
          <Sliders className="w-4 h-4" style={{ color:'var(--purple)' }} />
        </div>
        <div>
          <h1 className="t-title">Impact Lab</h1>
          <p className="t-body mt-0.5">Counterfactual risk sensitivity — simulate "what-if" scenarios to quantify threat score drivers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Modifier toggles ── */}
        <div className="lg:col-span-2 apple-card p-6 space-y-4">
          <p className="t-heading pb-4" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
            Hypothetical Evidence Modifiers
          </p>

          <div className="space-y-3 stagger">
            {MODIFIERS.map(({ key, label, sub, state, set }) => (
              <div
                key={key}
                onClick={() => set(!state)}
                className="flex items-start justify-between gap-5 p-4 rounded-2xl cursor-pointer transition-all duration-180"
                style={{
                  background: state ? 'var(--accent-dim)' : 'var(--bg-04)',
                  border: `1px solid ${state ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                }}
              >
                <div className="min-w-0">
                  <p
                    className="font-medium"
                    style={{ fontSize:'0.9rem', color:'var(--text-primary)', letterSpacing:'-0.01em' }}
                  >
                    {label}
                  </p>
                  <p className="t-caption mt-0.5">{sub}</p>
                </div>

                {/* Toggle pill */}
                <div
                  className="relative shrink-0 mt-0.5 transition-all duration-200"
                  style={{
                    width: 40, height: 24,
                    borderRadius: 99,
                    background: state ? 'var(--accent)' : 'var(--bg-03)',
                    border: `1px solid ${state ? 'var(--accent)' : 'var(--border-default)'}`,
                    boxShadow: state ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                  }}
                >
                  <div
                    className="absolute top-0.5 transition-all duration-200 rounded-full"
                    style={{
                      width: 18, height: 18,
                      background: '#fff',
                      left: state ? 19 : 2,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Score delta ── */}
        <div className="apple-card p-6 flex flex-col gap-6">
          <p className="t-heading pb-4" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
            Simulated Delta
          </p>

          {/* Score comparison */}
          <div
            className="flex items-center justify-center gap-4 p-5 rounded-2xl"
            style={{ background:'var(--bg-04)', border:'1px solid var(--border-subtle)' }}
          >
            <div className="text-center">
              <p className="t-label mb-1">Actual</p>
              <p
                className="font-bold leading-none"
                style={{ fontSize:'2rem', color:'var(--red)', letterSpacing:'-0.04em' }}
              >
                {originalScore.toFixed(1)}
              </p>
            </div>

            <ArrowRight className="w-5 h-5 shrink-0" style={{ color:'var(--text-tertiary)' }} />

            <div className="text-center">
              <p className="t-label mb-1">Simulated</p>
              <p
                className="font-bold leading-none"
                style={{
                  fontSize:'2rem',
                  color: loading ? 'var(--text-tertiary)' : (improved ? 'var(--green)' : 'var(--amber)'),
                  letterSpacing:'-0.04em',
                  transition:'color 400ms',
                }}
              >
                {simScore.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Delta badge */}
          {simulatedResult && (
            <div
              className="flex flex-col items-center gap-2 p-4 rounded-2xl anim-scale-in"
              style={{
                background: improved ? 'var(--green-dim)' : 'var(--bg-04)',
                border: `1px solid ${improved ? 'var(--green-border)' : 'var(--border-subtle)'}`,
              }}
            >
              <p className="t-label">Net Risk Impact</p>
              <p
                className="font-bold"
                style={{
                  fontSize:'1.25rem',
                  color: improved ? 'var(--green)' : 'var(--text-secondary)',
                  letterSpacing:'-0.03em',
                }}
              >
                {delta < 0 ? '' : '+'}{delta} pts
              </p>
              <span
                className={`pill ${improved ? 'pill-green' : 'pill-muted'}`}
                style={{ fontSize:'0.65rem' }}
              >
                {simulatedResult.impact_direction}
              </span>
            </div>
          )}

          {/* Applied hypotheses */}
          {simulatedResult?.simulated_changes?.length > 0 && (
            <div>
              <p className="t-label mb-2">Applied Hypotheses</p>
              <div className="space-y-1.5">
                {simulatedResult.simulated_changes.map((c: string, i: number) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-xl text-xs"
                    style={{
                      background:'var(--accent-dim)',
                      border:'1px solid var(--accent-border)',
                      color:'var(--accent)',
                    }}
                  >
                    · {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl mt-auto"
            style={{ background:'var(--bg-04)', border:'1px solid var(--border-subtle)' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color:'var(--amber)' }} />
            <p className="t-caption leading-relaxed">Illustrative model only. Not a guaranteed financial forecast.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
