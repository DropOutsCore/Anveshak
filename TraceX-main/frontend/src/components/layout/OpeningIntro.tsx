import React, { useEffect, useState } from 'react';
import { Shield, Zap, Lock } from 'lucide-react';

interface OpeningIntroProps {
  onComplete: () => void;
}

export const OpeningIntro: React.FC<OpeningIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 1200),
      setTimeout(() => setStage(3), 2000),
      setTimeout(() => onComplete(), 3500)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opening-intro">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      {/* Glowing orb effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-[120px] transition-all duration-1000 ${stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Logo animation */}
        <div className={`transition-all duration-700 ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-cyan-400" strokeWidth={2.5} />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            TRACE<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">X</span>
          </h1>
          <div className="h-0.5 w-32 mx-auto mt-3 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        </div>

        {/* Subtitle animation */}
        <div className={`transition-all duration-700 delay-300 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-lg text-slate-300 font-light">
            Cyber Forensic Intelligence Platform
          </p>
        </div>

        {/* Status indicators */}
        <div className={`transition-all duration-700 delay-500 ${stage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>SECURE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span>ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
              <span>VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Loading bar */}
        <div className={`transition-all duration-700 delay-700 ${stage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-64 h-0.5 mx-auto bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 intro-progress-bar"></div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        .opening-intro {
          animation: introFadeOut 0.5s ease 3.5s forwards;
        }
        
        @keyframes introFadeOut {
          to { opacity: 0; pointer-events: none; }
        }
        
        .intro-progress-bar {
          animation: progressFill 1.5s ease forwards;
        }
        
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};
