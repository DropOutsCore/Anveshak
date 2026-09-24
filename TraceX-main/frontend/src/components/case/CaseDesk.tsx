import React, { useState } from 'react';
import {
  UploadCloud, FileText, ShieldCheck, Fingerprint, Lock,
  PlayCircle, Briefcase, FolderOpen, Inbox, ScrollText, Sparkles,
  Link2, Zap, Mail, MapPin, ChevronRight
} from 'lucide-react';
import { CaseDetail } from '../../types';

interface CaseDeskProps {
  cases: CaseDetail[];
  activeCase: CaseDetail | null;
  onSelectCase: (caseDetail: CaseDetail) => void;
  onIngestNewEmail: (file: File | null, rawText: string) => Promise<void>;
  loading: boolean;
  onSelectTab?: (tab: string) => void;
}

const BLUE = '#0056A6';
const BLUE_DARK = '#003D75';
const RED = '#DC2626';
const GREEN = '#16A34A';
const AMBER = '#D97706';
const PURPLE = '#7C3AED';

export const CaseDesk: React.FC<CaseDeskProps> = ({
  cases, activeCase, onSelectCase, onIngestNewEmail, loading, onSelectTab
}) => {
  const [mode, setMode]           = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText]     = useState('');
  const [dragOver, setDragOver]   = useState(false);
  const [ingestStep, setIngestStep] = useState(0);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const run = async (file: File | null, text: string) => {
    for (let i = 1; i <= 4; i++) {
      setIngestStep(i);
      await new Promise(r => setTimeout(r, 380));
    }
    await onIngestNewEmail(file, text);
    setIngestStep(0);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) await run(e.dataTransfer.files[0], '');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) await run(e.target.files[0], '');
  };

  const handlePaste = async () => {
    if (!rawText.trim()) return;
    await run(null, rawText);
    setRawText('');
  };

  const sevBadge = (s: string) => {
    const map: Record<string, { bg: string; color: string; border: string }> = {
      CRITICAL: { bg: '#fef2f2', color: RED,   border: '#fecaca' },
      HIGH:     { bg: '#fffbeb', color: AMBER, border: '#fde68a' },
      MEDIUM:   { bg: '#eff6ff', color: BLUE,  border: '#bfdbfe' },
      LOW:      { bg: '#f0fdf4', color: GREEN, border: '#bbf7d0' },
    };
    return map[s] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' }} className="anim-fade-up">

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'flex-end',
        gap: '20px', marginBottom: '28px',
        paddingBottom: '20px', borderBottom: `3px solid ${BLUE}`,
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', background: 'rgba(0,86,166,0.08)',
            border: '1px solid rgba(0,86,166,0.20)', borderRadius: '20px',
            fontSize: '0.7rem', fontWeight: 700, color: BLUE,
            letterSpacing: '0.08em', marginBottom: '10px', textTransform: 'uppercase',
          }}>
            <Briefcase size={12} /> Investigation Workstation
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1f2937', letterSpacing: '-0.02em', margin: 0 }}>
            Case Desk
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '6px 0 0 0' }}>
            Upload suspicious email evidence for automated forensic analysis
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Active Cases',   value: cases.length, icon: FolderOpen, color: BLUE   },
            { label: 'Threat Chains',  value: 4,            icon: Link2,      color: AMBER  },
            { label: 'IOCs Extracted', value: 12,           icon: Zap,        color: RED    },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="gov-stat-box" style={{ minWidth: '150px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${s.color}18`, color: s.color, flexShrink: 0,
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1f2937', letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Evidence Intake ── */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '32px', overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(90deg, rgba(0,86,166,0.04) 0%, transparent 100%)',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: BLUE, color: '#fff',
              boxShadow: '0 4px 10px rgba(0,86,166,0.25)',
            }}>
              <UploadCloud size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', margin: 0, letterSpacing: '-0.01em' }}>
                Evidence Intake
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '2px 0 0 0' }}>
                MIME parsing · Route reconstruction · SHA-256 sealing
              </p>
            </div>
          </div>

          {/* Mode tabs */}
          <div style={{
            display: 'flex', gap: '4px', padding: '4px',
            background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb',
          }}>
            {([
              { id: 'upload', label: 'Upload File', icon: UploadCloud },
              { id: 'paste',  label: 'Paste Text',  icon: ScrollText  },
            ] as const).map(m => {
              const active = mode === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', border: 'none', borderRadius: '6px',
                    background: active ? '#fff' : 'transparent',
                    color: active ? BLUE : '#6b7280',
                    fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 150ms ease',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <Icon size={13} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {mode === 'upload' ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? BLUE : '#d1d5db'}`,
                borderRadius: '12px', padding: '48px 24px', textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'rgba(0,86,166,0.04)' : '#fafbfc',
                transition: 'all 200ms ease',
              }}
            >
              <input ref={fileRef} type="file" accept=".eml,.msg,.txt" onChange={handleFile} style={{ display: 'none' }} />

              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: dragOver ? BLUE : 'rgba(0,86,166,0.08)',
                color: dragOver ? '#fff' : BLUE,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px auto', transition: 'all 200ms ease',
                boxShadow: dragOver ? '0 8px 20px rgba(0,86,166,0.30)' : 'none',
              }}>
                <Inbox size={32} />
              </div>

              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                {dragOver ? 'Release to Upload' : 'Drop suspicious email here'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '20px' }}>
                Supported formats: <span style={{ color: BLUE, fontWeight: 600 }}>.eml</span>, .msg, .txt
              </div>

              <button
                onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: BLUE, color: '#fff', border: 'none',
                  padding: '11px 26px', borderRadius: '30px',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 180ms ease',
                  boxShadow: '0 4px 10px rgba(0,86,166,0.25)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = BLUE_DARK;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = BLUE;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <UploadCloud size={15} /> Browse Files
              </button>
            </div>
          ) : (
            <div>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste raw email MIME headers or body text here…"
                rows={8}
                className="apple-input"
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', lineHeight: 1.7, resize: 'vertical' }}
              />
              <button
                onClick={handlePaste}
                disabled={loading || !rawText.trim()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: BLUE, color: '#fff', border: 'none',
                  padding: '11px 26px', borderRadius: '30px',
                  fontSize: '0.85rem', fontWeight: 600,
                  cursor: rawText.trim() ? 'pointer' : 'not-allowed',
                  opacity: rawText.trim() ? 1 : 0.5, marginTop: '14px',
                  transition: 'all 180ms ease', boxShadow: '0 4px 10px rgba(0,86,166,0.25)',
                }}
              >
                <FileText size={15} /> Ingest Raw Headers
              </button>
            </div>
          )}

          {/* Integrity chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '20px' }}>
            {[
              { icon: Fingerprint, color: BLUE,   label: 'Integrity Verified', sub: 'SHA-256 auto-generated'     },
              { icon: ShieldCheck, color: GREEN,  label: 'Safe Processing',    sub: 'Attachments never executed' },
              { icon: Lock,        color: PURPLE, label: 'Chain of Custody',   sub: 'Merkle-anchored on ingest'  },
            ].map(({ icon: Icon, color, label, sub }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', background: '#fafbfc',
                border: '1px solid #e5e7eb', borderRadius: '10px',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${color}18`, color, flexShrink: 0,
                }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#1f2937' }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress */}
          {ingestStep > 0 && (
            <div style={{
              marginTop: '20px', padding: '16px',
              background: 'rgba(0,86,166,0.05)',
              border: '1px solid rgba(0,86,166,0.20)', borderRadius: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} style={{ color: BLUE }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1f2937' }}>
                    Ingesting & parsing evidence…
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: BLUE }}>Step {ingestStep} / 4</span>
              </div>
              <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${ingestStep * 25}%`,
                  background: `linear-gradient(90deg, ${BLUE}, ${BLUE_DARK})`,
                  transition: 'width 400ms ease', borderRadius: 3,
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Investigations ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1f2937', margin: 0, letterSpacing: '-0.01em' }}>
              Recent Investigations
            </h2>
            <span style={{
              padding: '3px 10px', background: BLUE, color: '#fff',
              borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
            }}>{cases.length}</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>Click a case to inspect</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: activeCase ? '1fr 340px' : '1fr',
          gap: '20px',
        }}>
          {/* Cases grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: activeCase ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }} className="stagger">
            {cases.map(c => {
              const isSelected = activeCase?.case_id === c.case_id;
              const sev = sevBadge(c.severity);

              return (
                <div
                  key={c.case_id}
                  onClick={() => onSelectCase(c)}
                  className="gov-category-card"
                  style={isSelected ? {
                    borderColor: BLUE, borderWidth: 2,
                    boxShadow: '0 8px 20px rgba(0,86,166,0.15)',
                  } : {}}
                >
                  <div className="gov-icon-box gov-icon-box-blue" style={
                    isSelected ? { background: BLUE, color: '#fff' } : {}
                  }>
                    <Mail size={22} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.68rem', fontWeight: 700,
                        color: '#6b7280', letterSpacing: '0.05em',
                      }}>{c.case_id}</span>
                      <span style={{
                        padding: '2px 8px', fontSize: '0.6rem', fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`,
                        borderRadius: '4px', flexShrink: 0,
                      }}>{c.severity}</span>
                    </div>

                    <h3 style={{
                      fontSize: '0.9rem', fontWeight: 700, color: '#1f2937',
                      margin: '0 0 6px 0', lineHeight: 1.3,
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>{c.title}</h3>

                    <p style={{
                      fontSize: '0.78rem', color: '#6b7280', margin: 0, lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>{c.summary}</p>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: '12px', paddingTop: '10px',
                      borderTop: '1px solid #f3f4f6',
                    }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {[
                          `${c.header_hops.length} hops`,
                          `${c.urls.length} urls`,
                          `${c.chain_of_custody.length} blocks`,
                        ].map(t => (
                          <span key={t} style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 500 }}>{t}</span>
                        ))}
                      </div>
                      <ChevronRight size={14} style={{ color: isSelected ? BLUE : '#9ca3af' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspector panel */}
          {activeCase && (
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: '12px', padding: '22px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column', gap: '18px',
              height: 'fit-content', position: 'sticky', top: '20px',
            }} className="anim-fade-up">
              {/* Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                paddingBottom: '14px', borderBottom: '1px solid #f3f4f6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: BLUE, color: '#fff',
                  }}>
                    <FolderOpen size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Selected Case
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                      {activeCase.case_id}
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', fontSize: '0.6rem', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: sevBadge(activeCase.severity).bg,
                  color: sevBadge(activeCase.severity).color,
                  border: `1px solid ${sevBadge(activeCase.severity).border}`,
                  borderRadius: '4px',
                }}>{activeCase.severity}</span>
              </div>

              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', marginBottom: '6px', lineHeight: 1.3 }}>
                  {activeCase.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.55 }}>
                  {activeCase.summary}
                </div>
              </div>

              {/* IOC grid */}
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Extracted Indicators
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { label: 'Hops',   value: activeCase.header_hops.length,     icon: MapPin, color: BLUE   },
                    { label: 'URLs',   value: activeCase.urls.length,            icon: Link2,  color: AMBER  },
                    { label: 'Files',  value: activeCase.attachments.length,     icon: FileText, color: PURPLE },
                    { label: 'Blocks', value: activeCase.chain_of_custody.length,icon: Lock,   color: GREEN  },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} style={{
                      padding: '12px', background: '#fafbfc',
                      border: '1px solid #e5e7eb', borderRadius: '8px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Icon size={12} style={{ color }} />
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {label}
                        </span>
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1f2937', letterSpacing: '-0.02em' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectTab?.('email_forensics')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: BLUE, color: '#fff', border: 'none',
                  padding: '12px 20px', borderRadius: '30px',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 180ms ease', width: '100%',
                  boxShadow: '0 4px 10px rgba(0,86,166,0.25)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = BLUE_DARK;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = BLUE;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <PlayCircle size={16} /> Launch Investigation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
