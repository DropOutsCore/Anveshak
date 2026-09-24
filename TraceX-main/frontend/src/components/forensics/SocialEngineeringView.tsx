import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { SocialEngSignal, CaseDetail } from '../../types';

interface SocialEngineeringViewProps { caseDetail: CaseDetail; }

export const SocialEngineeringView: React.FC<SocialEngineeringViewProps> = ({ caseDetail }) => {
  const signals: SocialEngSignal[] = caseDetail.social_eng_signals;

  const avgScore = signals.length
    ? Math.round(signals.reduce((a, s) => a + s.score, 0) / signals.length)
    : 0;

  return (
    <div className="page space-y-7 anim-fade-up">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="section-header flex-1" style={{ marginBottom:0, paddingBottom:0, border:'none' }}>
          <div className="section-icon" style={{ background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)' }}>
            <Zap className="w-4 h-4" style={{ color:'var(--amber)' }} />
          </div>
          <div>
            <h1 className="t-title">Social Engineering Analysis</h1>
            <p className="t-body mt-0.5">
              Urgency coercion · authority pressure · account threats · payment redirection
            </p>
          </div>
        </div>

        {/* Summary badge */}
        <div
          className="shrink-0 flex flex-col items-center px-5 py-3 rounded-2xl"
          style={{ background:'var(--bg-02)', border:'1px solid var(--border-default)' }}
        >
          <span
            className="font-bold leading-none"
            style={{ fontSize:'1.75rem', color: signals.length > 0 ? 'var(--amber)' : 'var(--green)', letterSpacing:'-0.04em' }}
          >
            {signals.length}
          </span>
          <span className="t-label mt-1">Signals</span>
          {signals.length > 0 && (
            <span className="t-caption mt-0.5">avg {avgScore}/100</span>
          )}
        </div>
      </div>

      {/* ── Signals ── */}
      {signals.length === 0 ? (
        <div
          className="apple-card p-12 flex flex-col items-center justify-center gap-3 text-center"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background:'var(--green-dim)', border:'1px solid var(--green-border)' }}
          >
            <Zap className="w-5 h-5" style={{ color:'var(--green)' }} />
          </div>
          <p className="t-heading">No Signals Detected</p>
          <p className="t-body max-w-sm">No social engineering patterns were identified in this email's content.</p>
        </div>
      ) : (
        <div className="space-y-4 stagger">
          {signals.map((s, i) => {
            const isHigh = s.severity === 'HIGH';
            const barColor = isHigh ? 'var(--red)' : 'var(--amber)';
            const cardBg   = isHigh ? 'var(--red-dim)'   : 'var(--amber-dim)';
            const cardBdr  = isHigh ? 'var(--red-border)': 'var(--amber-border)';

            return (
              <div
                key={i}
                className="apple-card p-5 space-y-4"
                style={{ borderColor: cardBdr }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: cardBg, border:`1px solid ${cardBdr}` }}
                    >
                      <AlertTriangle className="w-4 h-4" style={{ color: barColor }} />
                    </div>
                    <div>
                      <p
                        className="font-semibold"
                        style={{ fontSize:'0.9375rem', color:'var(--text-primary)', letterSpacing:'-0.01em' }}
                      >
                        {s.category}
                      </p>
                      <p className="t-caption mt-0.5">Signal #{i + 1} · Line {s.line_number || 1}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`pill ${isHigh ? 'pill-red' : 'pill-amber'}`}
                      style={{ fontSize:'0.65rem' }}
                    >
                      {s.severity}
                    </span>
                    <span
                      className="font-bold tabular-nums"
                      style={{ fontSize:'1.1rem', color: barColor, letterSpacing:'-0.03em' }}
                    >
                      {s.score.toFixed(0)}<span className="text-xs font-normal" style={{ color:'var(--text-tertiary)' }}>/100</span>
                    </span>
                  </div>
                </div>

                {/* Score bar */}
                <div
                  className="w-full h-1 rounded-full overflow-hidden"
                  style={{ background:'var(--bg-04)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width:`${s.score}%`,
                      background: isHigh
                        ? 'linear-gradient(90deg,var(--amber),var(--red))'
                        : 'linear-gradient(90deg,var(--green),var(--amber))',
                    }}
                  />
                </div>

                {/* Evidence quote */}
                <div
                  className="p-4 rounded-xl"
                  style={{ background:'var(--bg-04)', border:`1px solid ${cardBdr}` }}
                >
                  <p className="t-label mb-1.5">Evidence Quote</p>
                  <p
                    className="leading-relaxed"
                    style={{ fontSize:'0.8125rem', color:'var(--text-secondary)', fontStyle:'italic' }}
                  >
                    "{s.evidence_quote}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
