import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CaseDetail } from '../../types';

interface IdentityDeceptionViewProps { caseDetail: CaseDetail; }

export const IdentityDeceptionView: React.FC<IdentityDeceptionViewProps> = ({ caseDetail }) => {
  const id = caseDetail.identity_analysis;

  const score = id.deception_score;
  const scoreColor = score > 60 ? 'var(--red)' : score > 30 ? 'var(--amber)' : 'var(--green)';
  const scoreLabel = score > 60 ? 'High Deception Risk' : score > 30 ? 'Moderate Risk' : 'Likely Authentic';
  const scorePillClass = score > 60 ? 'pill pill-red' : score > 30 ? 'pill pill-amber' : 'pill pill-green';

  /* SVG arc */
  const r = 60, circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;

  return (
    <div className="page space-y-7 anim-fade-up">

      {/* ── Page header ── */}
      <div className="section-header">
        <div className="section-icon" style={{ background:'var(--red-dim)', border:'1px solid var(--red-border)' }}>
          <ShieldAlert className="w-4 h-4" style={{ color:'var(--red)' }} />
        </div>
        <div>
          <h1 className="t-title">Identity Deception Engine</h1>
          <p className="t-body mt-0.5">Display-name spoofing · homoglyph substitutions · typosquatting · reply-to misalignment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Score gauge ── */}
        <div className="apple-card p-8 flex flex-col items-center justify-center gap-5">
          <p className="t-label">Deception Score</p>

          {/* Arc */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r={r} fill="none" strokeWidth="10"
                stroke="var(--bg-04)" />
              <circle
                cx="72" cy="72" r={r} fill="none" strokeWidth="10"
                stroke={scoreColor}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="risk-arc-animate"
                style={{ '--arc-offset': offset } as React.CSSProperties}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span
                className="font-bold leading-none"
                style={{ fontSize:'2rem', color:'var(--text-primary)', letterSpacing:'-0.04em' }}
              >
                {score.toFixed(0)}
              </span>
              <span className="t-caption">/ 100</span>
            </div>
          </div>

          <span className={scorePillClass} style={{ fontSize:'0.72rem' }}>{scoreLabel}</span>

          {/* Quick flags */}
          <div className="w-full space-y-2 pt-2" style={{ borderTop:'1px solid var(--border-subtle)' }}>
            {[
              { label:'Lookalike domain', active: id.lookalike_detected   },
              { label:'Homoglyph chars',  active: id.homoglyph_detected   },
              { label:'Reply-To mismatch',active: id.reply_to_mismatch    },
              { label:'Return-Path diff', active: id.return_path_mismatch },
            ].map(({ label, active }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="t-caption">{label}</span>
                {active
                  ? <AlertTriangle className="w-3.5 h-3.5" style={{ color:'var(--amber)' }} />
                  : <CheckCircle2  className="w-3.5 h-3.5" style={{ color:'var(--green)' }} />
                }
              </div>
            ))}
          </div>
        </div>

        {/* ── Detail panel (right 2/3) ── */}
        <div className="lg:col-span-2 apple-card p-6 space-y-6">
          <p className="t-heading pb-4" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
            Sender Entity Analysis
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label:'Display Name',     value: id.display_name,                        alert: false },
              { label:'Claimed Brand',    value: id.claimed_brand || 'None detected',    alert: !!id.claimed_brand },
              { label:'Sender Email',     value: id.sender_email,                        mono: true, alert: false },
              { label:'Reply-To',         value: id.reply_to || 'Aligned with From',     mono: true, alert: id.reply_to_mismatch },
            ].map(({ label, value, mono, alert }) => (
              <div
                key={label}
                className="p-4 rounded-xl"
                style={{ background:'var(--bg-04)', border:'1px solid var(--border-subtle)' }}
              >
                <p className="t-label mb-1.5">{label}</p>
                <p
                  style={{
                    fontSize: mono ? '0.72rem' : '0.875rem',
                    fontFamily: mono ? 'monospace' : 'inherit',
                    fontWeight: 500,
                    color: (alert as boolean) ? 'var(--red)' : 'var(--text-primary)',
                    wordBreak: 'break-all',
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Deception factors */}
          {id.deception_factors.length > 0 && (
            <div>
              <p className="t-label mb-3">
                Detected Deception Factors
                <span
                  className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                  style={{ background:'var(--red-dim)', color:'var(--red)', border:'1px solid var(--red-border)' }}
                >
                  {id.deception_factors.length}
                </span>
              </p>
              <div className="space-y-2 stagger">
                {id.deception_factors.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-xl"
                    style={{ background:'var(--red-dim)', border:'1px solid var(--red-border)' }}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color:'var(--red)' }} />
                    <span style={{ fontSize:'0.8125rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
