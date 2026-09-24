import React from 'react';
import {
  LayoutDashboard,
  FileSearch,
  Mail,
  Route,
  UserRound,
  Link2,
  Paperclip,
  Network,
  Layers,
  Globe2,
  Bot,
  Blocks,
  FlaskConical,
  BarChart3,
  MessageSquareWarning
} from 'lucide-react';
import { UserRole, CaseDetail } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  activeCase: CaseDetail | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  activeCase
}) => {
  // Role-based navigation configuration
  const ALL_NAVIGATION = [
    {
      group: 'WORKSPACE',
      roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] as UserRole[],
      items: [
        { id: 'case_desk',      label: 'Overview',       icon: LayoutDashboard,    roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] as UserRole[] },
        { id: 'evidence_vault', label: 'Evidence Vault', icon: FileSearch,         roles: ['SOC_ANALYST', 'INVESTIGATOR'] as UserRole[] },
      ]
    },
    {
      group: 'EMAIL ANALYSIS',
      roles: ['SOC_ANALYST', 'INVESTIGATOR'] as UserRole[],
      items: [
        { id: 'email_forensics',    label: 'Email Forensics',  icon: Mail,               roles: ['SOC_ANALYST', 'INVESTIGATOR'] as UserRole[] },
        { id: 'header_recorder',    label: 'Header Path',      icon: Route,              roles: ['SOC_ANALYST'] as UserRole[] },
        { id: 'identity_deception', label: 'Identity Engine',  icon: UserRound,          roles: ['SOC_ANALYST', 'INVESTIGATOR'] as UserRole[] },
        { id: 'social_engineering', label: 'Social Eng.',      icon: MessageSquareWarning, roles: ['SOC_ANALYST', 'INVESTIGATOR'] as UserRole[] },
        { id: 'url_tracer',         label: 'URL Tracer',       icon: Link2,              roles: ['SOC_ANALYST'] as UserRole[] },
        { id: 'attachment_sandbox', label: 'Sandbox',          icon: Paperclip,          roles: ['SOC_ANALYST'] as UserRole[] },
      ]
    },
    {
      group: 'INVESTIGATION',
      roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] as UserRole[],
      items: [
        { id: 'attack_graph',   label: 'Attack Map',     icon: Network,            roles: ['INVESTIGATOR'] as UserRole[] },
        { id: 'campaign_intel', label: 'Campaigns',      icon: Layers,             roles: ['INVESTIGATOR'] as UserRole[] },
        { id: 'geo_financial',  label: 'Geo & Finance',  icon: Globe2,             roles: ['INVESTIGATOR'] as UserRole[] },
        { id: 'impact_lab',     label: 'Impact Lab',     icon: FlaskConical,       roles: ['INVESTIGATOR', 'EXECUTIVE'] as UserRole[] },
        { id: 'executive_risk', label: 'Risk Dashboard', icon: BarChart3,          roles: ['EXECUTIVE'] as UserRole[] },
      ]
    },
    {
      group: 'TOOLS',
      roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] as UserRole[],
      items: [
        { id: 'ai_copilot',      label: 'AI Copilot',        icon: Bot,    roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] as UserRole[] },
        { id: 'blockchain_proof', label: 'Chain of Custody',  icon: Blocks, roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] as UserRole[] },
      ]
    }
  ];

  // Filter navigation based on current role
  const NAVIGATION = ALL_NAVIGATION
    .filter(section => section.roles.includes(currentRole))
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(currentRole))
    }))
    .filter(section => section.items.length > 0);

  return (
    <aside className="w-56 bg-[#0B0D0F] border-r border-[#2A2E33] flex flex-col justify-between h-full shrink-0 select-none font-sans">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header / Brand */}
        <div className="p-5 border-b border-[#2A2E33]">
          <div className="text-white font-bold font-mono tracking-wide text-sm">ANVESHAK</div>
          <div className="text-gray-500 font-mono text-[10px] uppercase tracking-wider mt-0.5">Forensic Workstation</div>
          
          {/* Role Indicator Badge */}
          <div className="mt-3 px-2 py-1 bg-[#181C20] border border-[#2A2E33] rounded text-[10px] font-mono">
            <span className="text-gray-500">PERSPECTIVE:</span>
            <span className="text-white font-bold ml-1.5">
              {currentRole === 'SOC_ANALYST' ? 'ANALYST' : 
               currentRole === 'INVESTIGATOR' ? 'INVESTIGATOR' : 
               'EXECUTIVE'}
            </span>
          </div>
        </div>

        {/* Case Context (if active) */}
        {activeCase && (
          <div className="px-5 py-4 border-b border-[#2A2E33]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-200 font-mono text-xs font-bold">{activeCase.case_id}</span>
              <span className={`text-[9px] font-mono font-bold uppercase ${
                activeCase.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {activeCase.severity} RISK
              </span>
            </div>
            <div className="text-gray-400 text-xs truncate" title={activeCase.title}>
              {activeCase.title}
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <nav className="p-3 space-y-6 mt-2">
          {NAVIGATION.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-mono font-semibold text-gray-500 tracking-wider">
                {section.group}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors border-l-2 ${
                          isActive
                            ? 'bg-[#181C20] border-white text-white'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#121518]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-gray-300' : 'text-gray-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#2A2E33] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-mono text-gray-500 font-semibold tracking-wider">
          SYSTEM ONLINE
        </span>
      </div>
    </aside>
  );
};
