import React, { useState } from 'react';
import { Mail, ShieldAlert, Eye, EyeOff, Paperclip, X } from 'lucide-react';
import { CaseDetail } from '../../types';

interface EmailForensicsProps { caseDetail: CaseDetail; }

export const EmailForensics: React.FC<EmailForensicsProps> = ({ caseDetail }) => {
  const [showRaw, setShowRaw]   = useState(false);
  const [tab, setTab]           = useState<'HEADER'|'BODY'|'ATTACHMENTS'>('HEADER');
  const auth     = caseDetail.auth_status;
  const identity = caseDetail.identity_analysis;

  const authCards = [
    { label: 'SPF',         value: auth.spf_domain,           status: auth.spf_status   },
    { label: 'DKIM',        value: `Selector: ${auth.dkim_selector||'—'}`, status: auth.dkim_status },
    { label: 'DMARC',       value: `Policy: ${auth.dmarc_policy}`,         status: auth.dmarc_status },
    { label: 'Alignment',   value: 'Infrastructure',           status: auth.alignment    },
  ];

  const statusPill = (s: string) => {
    const pass = s === 'PASS' || s === 'ALIGNED';
    return (
      <span
        className="pill"
        style={pass ? {
          background:'var(--green-dim)', color:'var(--green)', border:'1px solid var(--green-border)'
        } : {
          background:'var(--red-dim)', color:'var(--red)', border:'1px solid var(--red-border)'
        }}
      >
        {s}
      </span>
    );
  };

  const TABS = ['HEADER', 'BODY', 'ATTACHMENTS'] as const;

  return (
    <div className="page space-y-7 anim-fade-up">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="section-header flex-1" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
          <div className="section-icon" style={{ background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.25)' }}>
            <Mail className="w-4 h-4" style={{ color:'var(--purple)' }} />
          </div>
          <div>
            <h1 className="t-title">Email Forensics</h1>
            <p className="t-body mt-0.5">MIME structure · identity alignment · authentication · attachments</p>
          </div>
        </div>
        <button onClick={() => setShowRaw(!showRaw)} className="btn btn-secondary btn-sm shrink-0">
          {showRaw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showRaw ? 'Hide Raw' : 'Raw Headers'}
        </button>
      </div>

      {/* ── Auth status cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {authCards.map(({ label, value, status }) => (
          <div key={label} className="apple-card p-4">
            <p className="t-label mb-2">{label}</p>
            <p className="font-medium truncate mb-2" style={{ fontSize:'0.8125rem', color:'var(--text-primary)' }}>
              {value}
            </p>
            {statusPill(status)}
          </div>
        ))}
      </div>

      {/* ── Tab content card ── */}
      <div className="apple-card overflow-hidden">

        {/* Tab bar */}
        <div
          className="flex items-center gap-0 px-6 pt-1"
          style={{ borderBottom:'1px solid var(--border-subtle)' }}
        >
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-4 py-3.5 text-xs font-medium transition-all duration-180"
              style={{ color: tab === t ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
            >
              {t === 'ATTACHMENTS' ? `Attachments (${caseDetail.attachments.length})` : t === 'HEADER' ? 'Envelope Headers' : 'Body View'}
              {tab === t && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                  style={{ background:'var(--accent)' }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── HEADER tab ── */}
          {tab === 'HEADER' && (
            <div className="space-y-5 anim-fade-up">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl"
                style={{ background:'var(--bg-04)', border:'1px solid var(--border-subtle)' }}
              >
                {[
                  { label:'Subject',       value: caseDetail.email_subject, mono:false },
                  { label:'Date',          value: caseDetail.email_date,    mono:false },
                  { label:'From',          value: caseDetail.email_from,    mono:true  },
                  { label:'To',            value: caseDetail.email_to,      mono:true  },
                  { label:'Reply-To',      value: identity.reply_to || 'None specified',
                    alert: identity.reply_to_mismatch, mono:true },
                  { label:'Return-Path',   value: identity.return_path || 'None specified',
                    alert: identity.return_path_mismatch, mono:true },
                ].map(({ label, value, mono, alert }) => (
                  <div key={label}>
                    <p className="t-label mb-1">{label}</p>
                    <p
                      className="font-medium break-all"
                      style={{
                        fontSize: mono ? '0.72rem' : '0.875rem',
                        fontFamily: mono ? 'var(--font-mono, monospace)' : 'inherit',
                        color: (alert as boolean) ? 'var(--red)' : 'var(--text-primary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {identity.reply_to_mismatch && (
                <div
                  className="flex items-start gap-3 p-4 rounded-2xl anim-scale-in"
                  style={{ background:'var(--red-dim)', border:'1px solid var(--red-border)' }}
                >
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" style={{ color:'var(--red)' }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color:'var(--red)' }}>
                      Critical Envelope Mismatch
                    </p>
                    <p className="t-caption mt-1 leading-relaxed" style={{ color:'var(--text-secondary)' }}>
                      Reply-To <code className="t-code">{identity.reply_to}</code> routes replies away from the visible sender domain.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BODY tab ── */}
          {tab === 'BODY' && (
            <div className="space-y-3 anim-fade-up">
              {caseDetail.social_eng_signals.length === 0 ? (
                <p className="t-body py-6 text-center">No social engineering signals detected in email body.</p>
              ) : (
                caseDetail.social_eng_signals.map((s, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl"
                    style={{ background:'var(--amber-dim)', border:'1px solid var(--amber-border)' }}
                  >
                    <span
                      className="pill pill-amber text-[10px] mb-2 inline-flex"
                    >
                      Line {s.line_number||1} · {s.category}
                    </span>
                    <p
                      className="leading-relaxed"
                      style={{ fontSize:'0.8125rem', color:'var(--text-secondary)', fontStyle:'italic' }}
                    >
                      "{s.evidence_quote}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── ATTACHMENTS tab ── */}
          {tab === 'ATTACHMENTS' && (
            <div className="anim-fade-up">
              {caseDetail.attachments.length === 0 ? (
                <p className="t-body py-8 text-center">No attachments present in email MIME payload.</p>
              ) : (
                <div className="space-y-3">
                  {caseDetail.attachments.map(att => (
                    <div
                      key={att.attachment_id}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background:'var(--bg-04)', border:'1px solid var(--border-default)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.25)' }}
                        >
                          <Paperclip className="w-4 h-4" style={{ color:'var(--purple)' }} />
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color:'var(--text-primary)' }}>{att.filename}</p>
                          <p className="t-caption mt-0.5">{att.mime_type} · {(att.size_bytes/1024).toFixed(1)} KB</p>
                          <p className="t-caption mt-0.5">
                            SHA-256: <span className="font-mono" style={{ color:'var(--purple)', fontSize:'0.68rem' }}>{att.sha256.slice(0,24)}…</span>
                          </p>
                        </div>
                      </div>
                      <span className="pill pill-amber text-[10px]">
                        {att.risk_level}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Raw headers modal ── */}
      {showRaw && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}
        >
          <div
            className="w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden anim-scale-in"
            style={{
              background:'var(--bg-02)',
              border:'1px solid var(--border-default)',
              boxShadow:'var(--shadow-xl)',
              maxHeight:'85vh',
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom:'1px solid var(--border-subtle)' }}
            >
              <p className="t-heading">Raw Headers — {caseDetail.case_id}</p>
              <button onClick={() => setShowRaw(false)} className="btn btn-ghost btn-sm p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="code-block flex-1 overflow-y-auto rounded-none"
              style={{ borderRadius:0, border:'none', maxHeight:'70vh' }}
            >
              {caseDetail.header_hops.map(h => h.raw_header).join('\n\n')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
