import React, { useState } from 'react';
import { Route, Server, AlertTriangle, ArrowDown, Clock, Globe, Database } from 'lucide-react';
import { HeaderHop, CaseDetail } from '../../types';

interface HeaderFlightRecorderProps { caseDetail: CaseDetail; }

export const HeaderFlightRecorder: React.FC<HeaderFlightRecorderProps> = ({ caseDetail }) => {
  const hops = caseDetail.header_hops;
  const [sel, setSel] = useState(0);
  const hop: HeaderHop = hops[sel] || hops[0];

  return (
    <div className="page space-y-7 anim-fade-up">

      {/* ── Page header ── */}
      <div className="section-header">
        <div className="section-icon" style={{ background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.25)' }}>
          <Route className="w-4 h-4" style={{ color:'var(--cyan)' }} />
        </div>
        <div>
          <h1 className="t-title">Header Flight Recorder</h1>
          <p className="t-body mt-0.5">Hop-by-hop email delivery reconstruction from origin MTA to recipient inbox.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Flight path (left 2/3) ── */}
        <div className="lg:col-span-2 apple-card p-6 space-y-2">
          <div className="flex items-center justify-between mb-4">
            <p className="t-heading">Reconstructed Flight Path</p>
            <span className="t-label">{hops.length} hops · click to inspect</span>
          </div>

          <div className="space-y-1">
            {hops.map((h, i) => {
              const isSelected = sel === i;
              return (
                <React.Fragment key={h.hop_index}>
                  <div
                    onClick={() => setSel(i)}
                    className="w-full rounded-2xl p-4 cursor-pointer transition-all duration-200 text-left"
                    style={{
                      background: isSelected
                        ? 'var(--accent-dim)'
                        : h.is_suspicious
                        ? 'var(--amber-dim)'
                        : 'var(--bg-04)',
                      border: `1px solid ${
                        isSelected ? 'var(--accent-border)'
                        : h.is_suspicious ? 'var(--amber-border)'
                        : 'var(--border-subtle)'}`,
                      boxShadow: isSelected ? '0 0 0 1px var(--accent-border)' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Hop badge */}
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-semibold text-xs shrink-0"
                          style={{
                            background: isSelected ? 'rgba(59,130,246,0.2)'
                              : h.is_suspicious ? 'rgba(251,191,36,0.15)'
                              : 'var(--bg-03)',
                            border: `1px solid ${isSelected ? 'var(--accent-border)'
                              : h.is_suspicious ? 'var(--amber-border)'
                              : 'var(--border-default)'}`,
                            color: isSelected ? 'var(--accent)'
                              : h.is_suspicious ? 'var(--amber)'
                              : 'var(--text-secondary)',
                          }}
                        >
                          {h.hop_index}
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate" style={{ color:'var(--text-primary)' }}>
                            {h.from_host}
                          </p>
                          <p className="t-caption mt-0.5 truncate">
                            via <span className="font-mono" style={{ color:'var(--cyan)', fontSize:'0.68rem' }}>{h.by_host}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-mono font-medium text-sm" style={{ color:'var(--text-primary)' }}>{h.ip}</p>
                        <p className="t-caption mt-0.5">{h.geo_location}</p>
                      </div>
                    </div>

                    {h.is_suspicious && (
                      <div
                        className="flex items-center gap-2 mt-3 pt-3 text-xs"
                        style={{ borderTop:'1px solid rgba(251,191,36,0.2)', color:'var(--amber)' }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{h.flag_reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Connector */}
                  {i < hops.length - 1 && (
                    <div className="flex flex-col items-center py-0.5">
                      <div className="w-px h-3 chain-line" />
                      <ArrowDown className="w-3 h-3" style={{ color:'var(--accent)', opacity:0.7 }} />
                      <div className="w-px h-3 chain-line" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── Evidence inspector (right 1/3) ── */}
        <div className="apple-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-4" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
            <div className="section-icon w-8 h-8" style={{ background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.25)' }}>
              <Server className="w-3.5 h-3.5" style={{ color:'var(--cyan)' }} />
            </div>
            <p className="t-heading">Hop #{hop.hop_index} Inspector</p>
          </div>

          {[
            { label:'Relay IP',   value: hop.ip,           mono: true,  accent: true  },
            { label:'ASN',        value: hop.asn,          mono: true,  accent: false },
            { label:'ISP',        value: hop.isp,          mono: false, accent: false },
            { label:'Location',   value: hop.geo_location, mono: false, accent: false, icon: <Globe className="w-3.5 h-3.5 mr-1.5 inline" style={{color:'var(--cyan)',verticalAlign:'text-bottom'}}/> },
            { label:'Delay',      value: `+${hop.delay_seconds}s`, mono: true, accent: false, icon: <Clock className="w-3.5 h-3.5 mr-1.5 inline" style={{verticalAlign:'text-bottom'}}/> },
          ].map(({ label, value, mono, accent, icon }) => (
            <div key={label}>
              <p className="t-label mb-1">{label}</p>
              <p
                style={{
                  fontSize: mono ? '0.78rem' : '0.875rem',
                  fontFamily: mono ? 'monospace' : 'inherit',
                  fontWeight: accent ? 600 : 400,
                  color: accent ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {icon}{value}
              </p>
            </div>
          ))}

          <div>
            <p className="t-label mb-2">Raw Header Snippet</p>
            <div className="code-block">{hop.raw_header}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
