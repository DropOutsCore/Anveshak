import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, Folder, BarChart3, Network,
  FlaskConical, FileSearch, Map, Lock, Cpu, Menu, X,
  Shield, Globe, Activity, Layers, Search, User
} from 'lucide-react';
import { UserRole } from '../../types';

interface ModernNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  caseId?: string;
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
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

const NAV_SECTIONS = [
  {
    key: 'investigation', label: 'Investigation', icon: FileSearch,
    items: [
      { id: 'case_desk',          label: 'Case Desk',          icon: Folder,      desc: 'Upload & manage cases' },
      { id: 'email_forensics',    label: 'Email Forensics',    icon: FileSearch,  desc: 'MIME & header analysis' },
      { id: 'header_flight',      label: 'Header Flight Path', icon: Network,     desc: 'Hop-by-hop relay trace' },
      { id: 'identity_deception', label: 'Identity Analysis',  icon: Shield,      desc: 'Spoofing & impersonation' },
    ],
  },
  {
    key: 'analysis', label: 'Analysis', icon: BarChart3,
    items: [
      { id: 'social_eng',     label: 'Social Engineering', icon: Activity, desc: 'NLP coercion signals' },
      { id: 'url_tracer',     label: 'URL Tracer',          icon: Globe,    desc: 'Redirect chain inspector' },
      { id: 'attack_graph',   label: 'Attack Graph',        icon: Network,  desc: 'Visual threat topology' },
      { id: 'campaign_intel', label: 'Campaigns',           icon: Layers,   desc: 'Historical correlations' },
    ],
  },
  {
    key: 'forensics', label: 'Forensics', icon: Map,
    items: [
      { id: 'geo_financial',    label: 'Geo-Financial',   icon: Map,  desc: 'Bank & IP location map' },
      { id: 'sandbox',          label: 'Sandbox',          icon: Cpu,  desc: 'Attachment detonation' },
      { id: 'evidence_vault',   label: 'Evidence Vault',   icon: Lock, desc: 'Chain of custody ledger' },
      { id: 'blockchain_proof', label: 'Blockchain Proof', icon: Lock, desc: 'Merkle proof explorer' },
    ],
  },
  {
    key: 'intelligence', label: 'Intelligence', icon: Cpu,
    items: [
      { id: 'ai_copilot',     label: 'AI Investigator', icon: Search,       desc: 'RAG forensic copilot' },
      { id: 'impact_lab',     label: 'Impact Lab',       icon: FlaskConical, desc: 'Counterfactual simulator' },
      { id: 'risk_dashboard', label: 'Risk Dashboard',   icon: BarChart3,    desc: 'Executive risk view' },
    ],
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  SOC_ANALYST:  'SOC Analyst',
  INVESTIGATOR: 'Investigator',
  EXECUTIVE:    'Executive',
};

/* exact india.gov.in colors */
const BLUE  = '#1a3a6b';
const WHITE = '#ffffff';
const RED   = '#c0272d';

export const ModernNavbar: React.FC<ModernNavbarProps> = ({
  activeTab, onTabChange, currentRole, onRoleChange, caseId
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [roleOpen, setRoleOpen]         = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const filteredSections = NAV_SECTIONS.map(s => ({
    ...s,
    items: s.items.filter(i => ROLE_PERMISSIONS[currentRole].includes(i.id)),
  })).filter(s => s.items.length > 0);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenDropdown(null);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (key: string) => setOpenDropdown(p => p === key ? null : key);
  const pick   = (id: string)  => { onTabChange(id); setOpenDropdown(null); setMobileOpen(false); };

  const activeSection = filteredSections.find(s => s.items.some(i => i.id === activeTab))?.key;

  return (
    <div ref={wrapRef} style={{ display: 'flex', alignItems: 'center', gap: '0', flex: 1, justifyContent: 'flex-end' }}>

      {/* Desktop nav items */}
      <nav style={{ display: 'flex', alignItems: 'stretch', height: '52px' }} className="hidden lg:flex">
        {filteredSections.map(section => {
          const isActive = activeSection === section.key;
          const isOpen   = openDropdown  === section.key;
          const Icon     = section.icon;
          return (
            <div key={section.key} style={{ position: 'relative' }}>
              <button
                onClick={() => toggle(section.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '0 14px', height: '52px',
                  background: isActive || isOpen ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderBottom: isActive || isOpen ? '3px solid #f0a500' : '3px solid transparent',
                  color: WHITE,
                  fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 150ms ease',
                  border: 'none',
                  borderBottom: isActive || isOpen ? '3px solid #f0a500' : '3px solid transparent',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive && !isOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)';
                }}
                onMouseLeave={e => {
                  if (!isActive && !isOpen) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span>{section.label}</span>
                <ChevronDown style={{
                  width: 11, height: 11,
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 150ms ease', opacity: 0.65,
                }} />
              </button>

              {/* Dropdown — white card like india.gov.in */}
              {isOpen && (
                <div
                  className="anim-dropdown"
                  style={{
                    position: 'absolute', top: '100%', left: 0,
                    width: 260, background: WHITE,
                    border: `1px solid #dce0e6`,
                    borderTop: `3px solid ${RED}`,
                    boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
                    zIndex: 200, padding: '4px 0',
                  }}
                >
                  {section.items.map(item => {
                    const ItemIcon = item.icon;
                    const isCurrent = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => pick(item.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '9px 14px',
                          background: isCurrent ? '#eef2fa' : 'transparent',
                          borderLeft: isCurrent ? `3px solid ${BLUE}` : '3px solid transparent',
                          cursor: 'pointer', transition: 'all 120ms ease',
                          border: 'none',
                          borderLeft: isCurrent ? `3px solid ${BLUE}` : '3px solid transparent',
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => {
                          if (!isCurrent) (e.currentTarget as HTMLElement).style.background = '#f5f7fc';
                        }}
                        onMouseLeave={e => {
                          if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        <div style={{
                          width: 30, height: 30, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isCurrent ? BLUE : '#eef2fa',
                          borderRadius: '3px',
                        }}>
                          <ItemIcon style={{ width: 14, height: 14, color: isCurrent ? WHITE : BLUE }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isCurrent ? BLUE : '#1a1a1a' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '0.67rem', color: '#5a6475', marginTop: '1px' }}>
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.20)', margin: '0 8px' }} className="hidden lg:block" />

      {/* Case ID badge */}
      {caseId && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '2px',
          fontSize: '0.68rem',
          fontFamily: 'JetBrains Mono, monospace',
          color: WHITE, fontWeight: 600,
          letterSpacing: '0.05em',
          marginRight: '6px',
        }} className="hidden md:flex">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          {caseId}
        </div>
      )}

      {/* Role selector */}
      <div ref={roleRef} style={{ position: 'relative', marginRight: '8px' }}>
        <button
          onClick={() => setRoleOpen(!roleOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 12px',
            background: RED, color: WHITE,
            border: 'none', borderRadius: '2px',
            fontSize: '0.75rem', fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.02em',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#a31f24'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = RED}
        >
          <User style={{ width: 12, height: 12 }} />
          <span>{ROLE_LABELS[currentRole]}</span>
          <ChevronDown style={{ width: 10, height: 10, transform: roleOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
        </button>

        {roleOpen && (
          <div className="anim-dropdown" style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0,
            width: 180, background: WHITE,
            border: `1px solid #dce0e6`,
            borderTop: `3px solid ${RED}`,
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            zIndex: 200, padding: '4px 0',
          }}>
            {([
              { value: 'SOC_ANALYST'  as UserRole, label: 'SOC Analyst',  sub: 'Tier-1 Response'  },
              { value: 'INVESTIGATOR' as UserRole, label: 'Investigator', sub: 'Full Access'       },
              { value: 'EXECUTIVE'    as UserRole, label: 'Executive',    sub: 'Summary View'      },
            ]).map(role => {
              const isCurrent = currentRole === role.value;
              return (
                <button
                  key={role.value}
                  onClick={() => { onRoleChange(role.value); setRoleOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 14px',
                    background: isCurrent ? '#eef2fa' : 'transparent',
                    borderLeft: isCurrent ? `3px solid ${BLUE}` : '3px solid transparent',
                    cursor: 'pointer', transition: 'all 120ms ease',
                    border: 'none',
                    borderLeft: isCurrent ? `3px solid ${BLUE}` : '3px solid transparent',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = '#f5f7fc'; }}
                  onMouseLeave={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isCurrent ? BLUE : '#1a1a1a' }}>{role.label}</div>
                    <div style={{ fontSize: '0.62rem', color: '#5a6475', marginTop: '1px' }}>{role.sub}</div>
                  </div>
                  {isCurrent && <div style={{ width: 7, height: 7, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden"
        style={{
          padding: '5px 8px', background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: '2px',
          cursor: 'pointer', color: WHITE,
        }}
      >
        {mobileOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden anim-scale-in" style={{
          position: 'fixed', top: '112px', left: 0, right: 0,
          background: WHITE, borderBottom: `3px solid ${BLUE}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 300,
          maxHeight: 'calc(100vh - 112px)', overflowY: 'auto',
        }}>
          <div style={{ padding: '10px 0' }}>
            {filteredSections.map(section => {
              const Icon = section.icon;
              return (
                <div key={section.key} style={{ marginBottom: '4px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 16px', fontSize: '0.65rem', fontWeight: 700,
                    color: '#5a6475', letterSpacing: '0.10em', textTransform: 'uppercase',
                    borderBottom: `1px solid #f0f0f0`,
                  }}>
                    <Icon style={{ width: 11, height: 11 }} />
                    {section.label}
                  </div>
                  {section.items.map(item => {
                    const ItemIcon = item.icon;
                    const isCurrent = activeTab === item.id;
                    return (
                      <button key={item.id} onClick={() => pick(item.id)} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 20px',
                        background: isCurrent ? '#eef2fa' : 'transparent',
                        borderLeft: isCurrent ? `3px solid ${BLUE}` : '3px solid transparent',
                        color: isCurrent ? BLUE : '#1a1a1a',
                        fontSize: '0.83rem', fontWeight: isCurrent ? 600 : 400,
                        cursor: 'pointer', transition: 'all 120ms ease',
                        border: 'none',
                        borderLeft: isCurrent ? `3px solid ${BLUE}` : '3px solid transparent',
                        textAlign: 'left',
                      }}>
                        <ItemIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
