import React from 'react';
import { ExternalLink, ArrowRight, Lock, Shield } from 'lucide-react';
import { CaseDetail } from '../../types';

interface UrlRedirectTracerProps { caseDetail: CaseDetail; }

export const UrlRedirectTracer: React.FC<UrlRedirectTracerProps> = ({ caseDetail }) => {
  const urls = caseDetail.urls;

  return (
    <div className="page space-y-7 anim-fade-up">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="section-header flex-1" style={{ marginBottom:0, paddingBottom:0, border:'none' }}>
          <div className="section-icon" style={{ background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.25)' }}>
            <ExternalLink className="w-4 h-4" style={{ color:'var(--cyan)' }} />
          </div>
          <div>
            <h1 className="t-title">URL Redirect Tracer</h1>
            <p className="t-body mt-0.5">
              Un-shortens links · resolves redirect chains · inspects landing credential forms · SSRF guardrails
            </p>
          </div>
        </div>
        <div
          className="shrink-0 flex flex-col items-center px-5 py-3 rounded-2xl"
          style={{ background:'var(--bg-02)', border:'1px solid var(--border-default)' }}
        >
          <span
            className="font-bold leading-none"
            style={{ fontSize:'1.75rem', color: urls.length > 0 ? 'var(--cyan)' : 'var(--green)', letterSpacing:'-0.04em' }}
          >
            {urls.length}
          </span>
          <span className="t-label mt-1">URLs</span>
        </div>
      </div>

      {urls.length === 0 ? (
        <div className="apple-card p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background:'var(--green-dim)', border:'1px solid var(--green-border)' }}
          >
            <Shield className="w-5 h-5" style={{ color:'var(--green)' }} />
          </div>
          <p className="t-heading">No URLs Detected</p>
          <p className="t-body max-w-sm">No external hyperlinks or embedded URLs were detected in this email.</p>
        </div>
      ) : (
        <div className="space-y-5 stagger">
          {urls.map(u => {
            const riskHigh = u.reputation_score >= 60;
            const riskMed  = u.reputation_score >= 30 && !riskHigh;
            const riskColor = riskHigh ? 'var(--red)' : riskMed ? 'var(--amber)' : 'var(--green)';
            const riskPill  = riskHigh ? 'pill pill-red' : riskMed ? 'pill pill-amber' : 'pill pill-green';

            return (
              <div key={u.url_id} className="apple-card overflow-hidden">
                {/* Card header */}
                <div
                  className="flex items-center justify-between gap-4 px-6 py-4"
                  style={{ borderBottom:'1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="font-mono font-semibold text-xs shrink-0"
                      style={{ color:'var(--cyan)' }}
                    >
                      {u.url_id}
                    </span>
                    <span
                      className="font-semibold truncate"
                      style={{ fontSize:'0.9375rem', color:'var(--text-primary)' }}
                    >
                      {u.domain}
                    </span>
                    {u.redirect_count > 0 && (
                      <span className="pill pill-amber" style={{ fontSize:'0.65rem', flexShrink:0 }}>
                        {u.redirect_count} redirect{u.redirect_count > 1 ? 's' : ''}
                      </span>
                    )}
                    {u.has_credential_form && (
                      <span className="pill pill-red flex items-center gap-1" style={{ fontSize:'0.65rem', flexShrink:0 }}>
                        <Lock className="w-2.5 h-2.5" />
                        Credential Form
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="t-caption">Risk</span>
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: riskColor, fontSize:'1rem', letterSpacing:'-0.03em' }}
                    >
                      {u.reputation_score.toFixed(0)}<span className="text-xs font-normal" style={{ color:'var(--text-tertiary)' }}>/100</span>
                    </span>
                  </div>
                </div>

                {/* Redirect chain */}
                <div className="p-6 space-y-4">
                  <p className="t-label mb-3">Redirect Chain</p>

                  <div className="space-y-2">
                    {u.redirect_chain.map((hop, hi) => (
                      <React.Fragment key={hop.step}>
                        <div
                          className="flex items-center gap-4 p-3.5 rounded-xl"
                          style={{
                            background: hop.is_suspicious ? 'var(--red-dim)' : 'var(--bg-04)',
                            border: `1px solid ${hop.is_suspicious ? 'var(--red-border)' : 'var(--border-subtle)'}`,
                          }}
                        >
                          {/* Step badge */}
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs shrink-0"
                            style={{
                              background: hop.is_suspicious ? 'var(--red-dim)' : 'rgba(34,211,238,0.12)',
                              border: `1px solid ${hop.is_suspicious ? 'var(--red-border)' : 'rgba(34,211,238,0.25)'}`,
                              color: hop.is_suspicious ? 'var(--red)' : 'var(--cyan)',
                            }}
                          >
                            {hop.step}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate" style={{ color:'var(--text-primary)' }}>
                              {hop.domain}
                            </p>
                            <p
                              className="t-caption truncate mt-0.5 font-mono"
                              style={{ fontSize:'0.68rem', maxWidth:'40rem' }}
                            >
                              {hop.url}
                            </p>
                            {hop.risk_factors.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {hop.risk_factors.map((rf, ri) => (
                                  <span
                                    key={ri}
                                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                    style={{
                                      background: 'rgba(248,113,113,0.1)',
                                      color: 'var(--red)',
                                      border: '1px solid var(--red-border)',
                                    }}
                                  >
                                    {rf}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-mono text-xs" style={{ color:'var(--text-secondary)' }}>
                              {hop.ip !== 'Unknown' ? hop.ip : '—'}
                            </p>
                            {hop.asn !== 'Unknown' && (
                              <p className="t-caption mt-0.5 font-mono" style={{ fontSize:'0.65rem' }}>{hop.asn}</p>
                            )}
                            <span
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded mt-1 inline-block"
                              style={{
                                background: hop.status_code >= 400 ? 'var(--red-dim)' :
                                  hop.status_code >= 300 ? 'var(--amber-dim)' : 'var(--green-dim)',
                                color: hop.status_code >= 400 ? 'var(--red)' :
                                  hop.status_code >= 300 ? 'var(--amber)' : 'var(--green)',
                              }}
                            >
                              {hop.status_code || '—'}
                            </span>
                          </div>
                        </div>

                        {hi < u.redirect_chain.length - 1 && (
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex-1 h-px" style={{ background:'var(--border-subtle)' }} />
                            <ArrowRight className="w-3 h-3 shrink-0" style={{ color:'var(--text-tertiary)' }} />
                            <div className="flex-1 h-px" style={{ background:'var(--border-subtle)' }} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
