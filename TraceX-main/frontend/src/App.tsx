import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './config';
import { Download, Globe2 } from 'lucide-react';
import { downloadForensicPdf, ReportLanguage } from './utils/pdfExport';
import { ModernNavbar } from './components/layout/ModernNavbar';
import { CaseDesk } from './components/case/CaseDesk';
import { EmailForensics } from './components/forensics/EmailForensics';
import { HeaderFlightRecorder } from './components/forensics/HeaderFlightRecorder';
import { IdentityDeceptionView } from './components/forensics/IdentityDeceptionView';
import { SocialEngineeringView } from './components/forensics/SocialEngineeringView';
import { UrlRedirectTracer } from './components/forensics/UrlRedirectTracer';
import { AttackGraphView } from './components/graph/AttackGraphView';
import { CampaignIntelligenceView } from './components/campaign/CampaignIntelligenceView';
import { GeoFinancialMapView } from './components/geo/GeoFinancialMapView';
import { ImpactLabView } from './components/lab/ImpactLabView';
import { ForensicRagCopilotView } from './components/ai/ForensicRagCopilotView';
import { EvidenceVaultView } from './components/vault/EvidenceVaultView';
import { ExecutiveRiskView } from './components/executive/ExecutiveRiskView';
import { BlockchainProofView } from './components/blockchain/BlockchainProofView';
import { AttachmentSandboxView } from './components/sandbox/AttachmentSandboxView';
import { LandingPage } from './components/layout/LandingPage';
import { CaseDetail, UserRole } from './types';

const SLIDES = ['/slideshow/img1.jpg', '/slideshow/img2.jpg', '/slideshow/img3.avif'];

const Slideshow: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      {SLIDES.map((src, i) => (
        <div
          key={src}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: current === i ? 0.6 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      ))}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(20,22,48,0.55)',
      }} />
    </div>
  );
};

export const App: React.FC = () => {
  const [showLanding,]              = useState<boolean>(false);
  const [cases, setCases]           = useState<CaseDetail[]>([]);
  const [activeCase, setActiveCase] = useState<CaseDetail | null>(null);
  const [activeTab, setActiveTab]   = useState<string>('case_desk');
  const [currentRole, setCurrentRole] = useState<UserRole>('SOC_ANALYST');
  const [voiceActive]               = useState<boolean>(false);
  const [loading, setLoading]       = useState<boolean>(false);
  const [heroDismissed, setHeroDismissed] = useState<boolean>(false);
  const [pdfMenuOpen, setPdfMenuOpen]   = useState<boolean>(false);
  const [pdfLoading, setPdfLoading]     = useState<boolean>(false);
  const pdfMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pdfMenuRef.current && !pdfMenuRef.current.contains(e.target as Node)) setPdfMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handlePdfDownload = async (lang: ReportLanguage) => {
    if (!activeCase) return;
    setPdfMenuOpen(false);
    setPdfLoading(true);
    try {
      await downloadForensicPdf(activeCase, lang);
    } catch (e) {
      alert(`PDF generation failed: ${e}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cases`);
      const summaries = await res.json();
      if (summaries.length > 0) {
        const fullRes = await fetch(`${API_BASE_URL}/api/v1/cases/${summaries[0].case_id}`);
        const fullDetail = await fullRes.json();
        setCases([fullDetail]);
        setActiveCase(fullDetail);
        const all = await Promise.all(summaries.map((s: any) =>
          fetch(`${API_BASE_URL}/api/v1/cases/${s.case_id}`).then(r => r.json())
        ));
        setCases(all);
      }
    } catch (e) { console.error('fetchCases:', e); }
  };

  useEffect(() => { fetchCases(); }, []);

  /* Role-tab compatibility: if the active tab isn't permitted for the current
     role, fall back to case_desk so the user is never stranded on a blank view. */
  useEffect(() => {
    const permissions: Record<UserRole, string[]> = {
      SOC_ANALYST: [
        'case_desk','email_forensics','header_flight','identity_deception',
        'social_eng','url_tracer','attack_graph','geo_financial','sandbox','impact_lab','ai_copilot',
      ],
      INVESTIGATOR: [
        'case_desk','email_forensics','header_flight','identity_deception',
        'social_eng','url_tracer','attack_graph','campaign_intel','geo_financial',
        'sandbox','evidence_vault','blockchain_proof','ai_copilot','impact_lab','risk_dashboard',
      ],
      EXECUTIVE: ['case_desk','campaign_intel','risk_dashboard'],
    };
    if (!permissions[currentRole].includes(activeTab)) {
      setActiveTab('case_desk');
    }
  }, [currentRole, activeTab]);

  const handleSelectCase = (c: CaseDetail) => setActiveCase(c);

  const handleIngestNewEmail = async (file: File | null, rawText: string) => {
    setLoading(true);
    try {
      const fd = new FormData();
      if (file) fd.append('file', file);
      if (rawText) fd.append('raw_text', rawText);
      const res = await fetch(`${API_BASE_URL}/api/v1/cases/ingest`, { method: 'POST', body: fd });
      if (!res.ok) { alert(`Upload failed: ${await res.text()}`); return; }
      const newCase = await res.json();
      setCases(p => [newCase, ...p]);
      setActiveCase(newCase);
      setActiveTab('email_forensics');
    } catch (e) { alert(`Upload error: ${e}`); }
    finally { setLoading(false); }
  };

  if (showLanding) return <LandingPage onEnterWorkspace={t => { if (t) setActiveTab(t); }} />;

  // India.gov.in official color palette
  const SAFFRON = '#FF9933';
  const GREEN   = '#138808';
  const BLUE    = '#0056A6';       // Primary government blue
  const BLUE_DARK = '#003D75';     // Hover/dark variant
  const RED     = BLUE;            // Alias - all "RED" refs now use blue
  const INK     = '#1f2937';
  const GRAY    = '#6b7280';
  const BORDER  = '#e5e7eb';

  const showHeroPage = !heroDismissed;

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden', 
      fontFamily: '"Segoe UI", "Noto Sans", system-ui, sans-serif', 
      color: INK, 
      background: '#fff', 
      position: 'relative' 
    }}>
      {showHeroPage && <Slideshow />}

      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        height: '100vh',
        width: '100vw',
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Hero Landing Page */}
        {showHeroPage ? (
          <>
            {/* Topbar with Anveshak logo on left */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 32px 0 32px', color: '#fff', fontSize: '14px',
              flexShrink: 0
            }}>
              {/* Anveshak Logo - white, transparent bg */}
              <img
                src="/anveshak-logo.png"
                alt="Anveshak"
                style={{
                  height: '110px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                }}
              />
              
              {/* Right side topbar items */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <span></span>
                <span style={{ opacity: 0.5 }}></span>
                <span style={{ fontSize: '14px', letterSpacing: '1px' }}></span>
                <span style={{ opacity: 0.5 }}></span>
                <div style={{
                  width: '26px', height: '16px', borderRadius: '2px',
                  background: `linear-gradient(to bottom, ${SAFFRON} 0% 33%, #fff 33% 66%, ${GREEN} 66% 100%)`,
                }} />
              </div>
            </div>

            {/* Hero content */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center', 
              padding: '20px',
              overflow: 'auto'
            }}>
              {/* Indian Government Emblem */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                alt="Emblem of India"
                style={{ width: '110px', marginBottom: '6px', filter: 'brightness(0) invert(1)' }}
              />
              <div style={{ color: '#fff', fontSize: '13px', letterSpacing: '1px', marginBottom: '18px', opacity: 0.9 }}>
                सत्यमेव जयते
              </div>
              <div style={{ color: '#fff', fontSize: '64px', fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>
                Anveshak<span style={{ fontWeight: 300 }}></span>
              </div>
              <div style={{ display: 'flex', width: '340px', maxWidth: '80vw', height: '4px', margin: '10px 0 8px 0' }}>
                <div style={{ flex: 1, background: SAFFRON }} />
                <div style={{ flex: 1, background: GREEN }} />
              </div>
              <div style={{ color: '#fff', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
                AI Powered Cyber Forensic Laboratory
              </div>
              <div style={{ color: '#f1f1f1', fontSize: '19px', fontWeight: 400, margin: '22px 0 40px 0' }}>
                Where Government Information Converges
              </div>

              {/* Launch Case Desk Button - india.gov.in style */}
              <button
                onClick={() => {
                  setActiveTab('case_desk');
                  setHeroDismissed(true);
                }}
                style={{
                  background: BLUE,
                  color: '#fff',
                  border: `2px solid ${BLUE}`,
                  padding: '16px 44px',
                  fontSize: '15px',
                  fontWeight: 600,
                  borderRadius: '30px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 86, 166, 0.35)',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = BLUE_DARK;
                  (e.currentTarget as HTMLElement).style.borderColor = BLUE_DARK;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0, 86, 166, 0.45)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = BLUE;
                  (e.currentTarget as HTMLElement).style.borderColor = BLUE;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0, 86, 166, 0.35)';
                }}
              >
                Launch Case Desk Intake
              </button>
            </div>

            {/* Quote wrap at bottom */}
            <div style={{ 
              padding: '0 24px 40px 24px', 
              maxWidth: '1200px', 
              margin: '0 auto',
              width: '100%',
              flexShrink: 0
            }}>
              <div style={{
                background: '#fff', borderRadius: '10px', boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
                padding: '28px 34px', display: 'flex', alignItems: 'flex-start', gap: '22px',
              }}>
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=Director&backgroundColor=e5e7eb"
                  alt="Director"
                  style={{ width: '78px', height: '78px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #eee' }}
                />
                <div>
                  <span style={{ color: RED, fontWeight: 800, fontSize: '20px' }}>"</span>
                  <span style={{ fontSize: '17px', fontWeight: 600, lineHeight: 1.5, color: INK }}>
                    India's Digital Public Infrastructure has demonstrated how technology can expand opportunity, improve governance, boost financial inclusion and deliver services for hundreds of millions of people.
                  </span>
                  <span style={{ color: RED, fontWeight: 800, fontSize: '20px' }}>"</span>
                  <div style={{ width: '50px', height: '3px', background: RED, marginTop: '10px' }} />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Main Application Views - Full Screen */
          <>
            {/* Top Navigation Bar - india.gov.in style */}
            <div style={{
              display: 'flex', 
              alignItems: 'center',
              padding: '0 24px',
              background: '#1a3a6b',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              flexShrink: 0,
              height: '80px',
              zIndex: 40,
              gap: '20px'
            }}>
              {/* Anveshak Logo - click to go back to hero */}
              <img
                onClick={() => { setHeroDismissed(false); }}
                title="Back to Home"
                src="/anveshak-logo.png"
                alt="Anveshak"
                style={{
                  height: '68px',
                  width: 'auto',
                  objectFit: 'contain',
                  cursor: 'pointer',
                  flexShrink: 0,
                  filter: 'brightness(0) invert(1)',
                }}
              />

              {/* Navigation from ModernNavbar */}
              <ModernNavbar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                currentRole={currentRole}
                onRoleChange={setCurrentRole}
                caseId={activeCase?.case_id}
              />
            </div>

            {/* Case Info Bar (if active) */}
            {activeCase && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 24px', gap: '12px',
                background: '#fff',
                borderBottom: `2px solid ${BLUE}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.06em',
                    padding: '4px 12px', background: BLUE, color: '#fff',
                    borderRadius: '3px', flexShrink: 0,
                  }}>
                    {activeCase.case_id}
                  </span>
                  <span style={{ color: BORDER }}>|</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeCase.title}
                  </span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', padding: '3px 10px', borderRadius: '3px', flexShrink: 0, textTransform: 'uppercase',
                    background: activeCase.severity === 'CRITICAL' ? '#fef2f2' : activeCase.severity === 'HIGH' ? '#fffbeb' : '#f0fdf4',
                    color: activeCase.severity === 'CRITICAL' ? '#DC2626' : activeCase.severity === 'HIGH' ? '#b45309' : '#166534',
                    border: `1px solid ${activeCase.severity === 'CRITICAL' ? '#fecaca' : activeCase.severity === 'HIGH' ? '#fde68a' : '#bbf7d0'}`,
                  }}>
                    {activeCase.severity}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {/* PDF Download - visible on every case page */}
                  <div ref={pdfMenuRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => setPdfMenuOpen(o => !o)}
                      disabled={pdfLoading}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        background: BLUE, color: '#fff', border: 'none',
                        padding: '7px 16px', borderRadius: '20px',
                        fontSize: '0.78rem', fontWeight: 700,
                        cursor: pdfLoading ? 'wait' : 'pointer', letterSpacing: '0.03em',
                        boxShadow: '0 2px 6px rgba(0,86,166,0.25)', transition: 'all 150ms ease',
                        opacity: pdfLoading ? 0.7 : 1,
                      }}
                      onMouseEnter={e => { if (!pdfLoading) (e.currentTarget as HTMLElement).style.background = '#003D75'; }}
                      onMouseLeave={e => { if (!pdfLoading) (e.currentTarget as HTMLElement).style.background = BLUE; }}
                    >
                      <Download size={13} />
                      {pdfLoading ? 'Generating…' : 'Download Report'}
                    </button>
                    {pdfMenuOpen && !pdfLoading && (
                      <div
                        className="anim-fade-up"
                        style={{
                          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden',
                          zIndex: 100, minWidth: '220px',
                        }}
                      >
                        <div style={{
                          padding: '10px 14px', borderBottom: '1px solid #f3f4f6',
                          fontSize: '0.65rem', color: '#6b7280', fontWeight: 700,
                          letterSpacing: '0.09em', textTransform: 'uppercase',
                          display: 'flex', alignItems: 'center', gap: '6px', background: '#fafbfc',
                        }}>
                          <Globe2 size={11} /> Select Language
                        </div>
                        {([
                          { code: 'en' as ReportLanguage, label: 'English',  native: 'English'   },
                          { code: 'hi' as ReportLanguage, label: 'Hindi',    native: 'हिन्दी'      },
                          { code: 'te' as ReportLanguage, label: 'Telugu',   native: 'తెలుగు'     },
                        ]).map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => handlePdfDownload(lang.code)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px', background: 'transparent',
                              border: 'none', cursor: 'pointer',
                              fontSize: '0.82rem', color: INK, textAlign: 'left',
                              transition: 'background 120ms ease',
                              borderBottom: '1px solid #f9fafb',
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#eff6ff'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                          >
                            <span style={{ fontWeight: 600 }}>{lang.label}</span>
                            <span style={{ color: '#6b7280', fontSize: '0.88rem', fontWeight: 500 }}>{lang.native}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { setActiveTab('case_desk'); setActiveCase(null); }}
                    style={{
                      background: 'transparent', border: `1px solid ${BLUE}`, color: BLUE,
                      fontSize: '0.75rem', fontWeight: 600, padding: '6px 16px', borderRadius: '20px',
                      cursor: 'pointer', letterSpacing: '0.04em', flexShrink: 0, transition: 'all 150ms ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BLUE; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = BLUE; }}
                  >
                    ← Change Case
                  </button>
                </div>
              </div>
            )}

            {/* Content Area - Full Screen */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto',
              background: '#f5f7fa'
            }}>
              <div key={activeTab} style={{ minHeight: '100%' }}>
                {activeTab === 'case_desk' && (
                  <CaseDesk
                    cases={cases}
                    activeCase={activeCase}
                    onSelectCase={handleSelectCase}
                    onIngestNewEmail={handleIngestNewEmail}
                    loading={loading}
                    onSelectTab={setActiveTab}
                  />
                )}
                {activeCase && (
                  <>
                    {(currentRole === 'SOC_ANALYST' || currentRole === 'INVESTIGATOR') && (
                      <>
                        {activeTab === 'email_forensics'    && <EmailForensics        caseDetail={activeCase} />}
                        {activeTab === 'header_flight'      && <HeaderFlightRecorder  caseDetail={activeCase} />}
                        {activeTab === 'identity_deception' && <IdentityDeceptionView caseDetail={activeCase} />}
                        {activeTab === 'social_eng'         && <SocialEngineeringView caseDetail={activeCase} />}
                        {activeTab === 'url_tracer'         && <UrlRedirectTracer     caseDetail={activeCase} />}
                        {activeTab === 'sandbox'            && <AttachmentSandboxView caseDetail={activeCase} />}
                        {activeTab === 'attack_graph'       && <AttackGraphView       caseDetail={activeCase} />}
                        {activeTab === 'geo_financial'      && <GeoFinancialMapView   caseDetail={activeCase} />}
                        {activeTab === 'impact_lab'         && <ImpactLabView         caseDetail={activeCase} />}
                        {activeTab === 'ai_copilot'         && <ForensicRagCopilotView caseDetail={activeCase} voiceActive={voiceActive} />}
                      </>
                    )}
                    {(currentRole === 'INVESTIGATOR' || currentRole === 'EXECUTIVE') && (
                      <>
                        {activeTab === 'campaign_intel' && <CampaignIntelligenceView caseDetail={activeCase} />}
                        {activeTab === 'risk_dashboard' && <ExecutiveRiskView        caseDetail={activeCase} />}
                      </>
                    )}
                    {currentRole === 'INVESTIGATOR' && (
                      <>
                        {activeTab === 'blockchain_proof' && <BlockchainProofView caseDetail={activeCase} />}
                        {activeTab === 'evidence_vault'   && <EvidenceVaultView   caseDetail={activeCase} />}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
