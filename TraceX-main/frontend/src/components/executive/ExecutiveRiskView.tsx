import React, { useState } from 'react';
import { BarChart3, TrendingDown, AlertCircle, Calculator } from 'lucide-react';
import { CaseDetail } from '../../types';

interface ExecutiveRiskViewProps { caseDetail: CaseDetail; }

export const ExecutiveRiskView: React.FC<ExecutiveRiskViewProps> = ({ caseDetail }) => {
  const [investmentLakhs, setInvestmentLakhs] = useState(5);
  const threat             = caseDetail.threat_score;
  const baseExposureINR    = 485000 * 4;
  const riskReductionPct   = Math.min(85, investmentLakhs * 7.5);
  const projectedLossINR   = Math.max(72000, baseExposureINR * (1 - riskReductionPct / 100));
  const netSavedINR        = baseExposureINR - projectedLossINR;
  const roi                = ((netSavedINR / (investmentLakhs * 100000)) * 100).toFixed(0);

  const sevColor = threat.severity === 'CRITICAL' ? 'var(--red)' :
                   threat.severity === 'HIGH'     ? 'var(--amber)' : 'var(--green)';
  const sevPill  = threat.severity === 'CRITICAL' ? 'pill pill-red' :
                   threat.severity === 'HIGH'     ? 'pill pill-amber' : 'pill pill-green';

  const STATS = [
    { label:'Modeled Exposure',          value:`₹ ${(baseExposureINR/100000).toFixed(2)}L`, sub:'4 potential incidents',    color:'var(--red)'    },
    { label:'Threat Severity',           value:threat.severity,                             sub:`Score ${threat.overall_score}/100`, color: sevColor },
    { label:'Projected Loss',            value:`₹ ${(projectedLossINR/100000).toFixed(2)}L`,sub:`${riskReductionPct.toFixed(0)}% mitigated`, color:'var(--green)'  },
    { label:'Security ROI',              value:`${roi}%`,                                   sub:`Saves ₹ ${(netSavedINR/100000).toFixed(2)}L`, color:'var(--cyan)'  },
  ];

  /* decomposed score bars */
  const SCORE_COMPONENTS = [
    { label:'Identity',        score: threat.identity_score?.score       ?? 0, max: 25 },
    { label:'Authentication',  score: threat.auth_score?.score           ?? 0, max: 20 },
    { label:'Content',         score: threat.content_score?.score        ?? 0, max: 15 },
    { label:'URL / Redirect',  score: threat.url_score?.score            ?? 0, max: 15 },
    { label:'Infrastructure',  score: threat.infrastructure_score?.score ?? 0, max: 15 },
    { label:'Campaign',        score: threat.campaign_score?.score       ?? 0, max: 10 },
  ];

  return (
    <div className="page space-y-7 anim-fade-up">

      {/* ── Page header ── */}
      <div className="section-header">
        <div className="section-icon" style={{ background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)' }}>
          <BarChart3 className="w-4 h-4" style={{ color:'var(--accent)' }} />
        </div>
        <div>
          <h1 className="t-title">Executive Risk Dashboard</h1>
          <p className="t-body mt-0.5">Financial exposure metrics · decomposed risk vectors · security investment ROI simulator.</p>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {STATS.map(({ label, value, sub, color }) => (
          <div key={label} className="apple-card p-5">
            <p className="t-label mb-3">{label}</p>
            <p
              className="font-bold leading-none mb-1.5"
              style={{ fontSize:'1.4rem', color, letterSpacing:'-0.03em' }}
            >
              {value}
            </p>
            <p className="t-caption">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Decomposed threat score ── */}
        <div className="apple-card p-6 space-y-5">
          <p className="t-heading pb-4" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
            Decomposed Threat Score
          </p>

          {/* Overall gauge */}
          <div className="flex items-center gap-4 pb-4" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
            <div
              className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0"
              style={{ background: sevColor + '18', border:`1px solid ${sevColor}35` }}
            >
              <span className="font-bold leading-none" style={{ fontSize:'1.3rem', color: sevColor, letterSpacing:'-0.04em' }}>
                {threat.overall_score.toFixed(0)}
              </span>
              <span className="t-caption mt-0.5">/100</span>
            </div>
            <div>
              <span className={sevPill} style={{ fontSize:'0.65rem' }}>{threat.severity}</span>
              <p className="t-body mt-1.5">Requires SOC escalation and immediate containment review.</p>
            </div>
          </div>

          {/* Component bars */}
          <div className="space-y-3">
            {SCORE_COMPONENTS.map(({ label, score, max }) => {
              const pct = (score / max) * 100;
              const barColor = pct > 80 ? 'var(--red)' : pct > 50 ? 'var(--amber)' : 'var(--accent)';
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="t-subheading">{label}</span>
                    <span className="font-mono font-semibold text-xs" style={{ color: barColor }}>
                      {score.toFixed(1)}<span style={{ color:'var(--text-tertiary)', fontWeight:400 }}>/{max}</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background:'var(--bg-04)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width:`${pct}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Investment simulator ── */}
        <div className="apple-card p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
            <Calculator className="w-4 h-4" style={{ color:'var(--accent)' }} />
            <p className="t-heading">Security Investment Simulator</p>
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="t-subheading">Annual Investment</p>
              <p
                className="font-bold"
                style={{ fontSize:'1.1rem', color:'var(--cyan)', letterSpacing:'-0.03em' }}
              >
                ₹ {investmentLakhs} L
              </p>
            </div>

            <div className="relative">
              <input
                type="range"
                min="1" max="20" step="1"
                value={investmentLakhs}
                onChange={e => setInvestmentLakhs(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background:`linear-gradient(to right, var(--accent) ${(investmentLakhs/20)*100}%, var(--bg-04) ${(investmentLakhs/20)*100}%)`,
                  outline:'none',
                }}
              />
              <div className="flex justify-between mt-1.5">
                <span className="t-caption">₹1L basic</span>
                <span className="t-caption">₹10L MDR+SOC</span>
                <span className="t-caption">₹20L zero-trust</span>
              </div>
            </div>
          </div>

          {/* Result cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Risk Reduced',   value:`${riskReductionPct.toFixed(0)}%`, color:'var(--green)' },
              { label:'Projected Loss', value:`₹${(projectedLossINR/100000).toFixed(1)}L`, color:'var(--amber)' },
              { label:'Net Savings',    value:`₹${(netSavedINR/100000).toFixed(1)}L`,      color:'var(--cyan)'  },
              { label:'ROI',            value:`${roi}%`,                                   color:'var(--accent)'},
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="p-4 rounded-xl text-center"
                style={{ background:'var(--bg-04)', border:'1px solid var(--border-subtle)' }}
              >
                <p className="t-label mb-1.5">{label}</p>
                <p className="font-bold" style={{ fontSize:'1.1rem', color, letterSpacing:'-0.03em' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl"
            style={{ background:'var(--bg-04)', border:'1px solid var(--border-subtle)' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color:'var(--amber)' }} />
            <p className="t-caption leading-relaxed">
              Illustrative risk exposure model. Not a guaranteed financial forecast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
