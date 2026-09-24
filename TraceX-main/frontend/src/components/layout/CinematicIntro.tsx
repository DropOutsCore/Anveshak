import React, { useEffect, useState } from 'react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Perfectly timed smooth sequence
    const timers = [
      setTimeout(() => setStage(1), 200),    // Start fade in
      setTimeout(() => setStage(2), 1500),   // Logo fully visible
      setTimeout(() => setStage(3), 2200),   // Sparkle
      setTimeout(() => setStage(4), 3200),   // Hold
      setTimeout(() => onComplete(), 4200)   // Smooth fade out
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] cinematic-intro">
      {/* Pure black background like PS5 */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Subtle ambient glow - very minimal */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className={`cinematic-glow ${stage >= 2 ? 'active' : ''}`}></div>
      </div>

      {/* Main logo container with camera push-in */}
      <div className={`absolute inset-0 flex items-center justify-center logo-container ${stage >= 1 ? 'camera-push' : ''}`}>
        
        {/* Logo assembly from particles/fragments */}
        <div className={`relative logo-wrapper ${stage >= 2 ? 'assembled' : ''}`}>
          
          {/* Logo image with cinematic reveal */}
          <div className={`logo-reveal ${stage >= 1 ? 'active' : ''}`}>
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='blueGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%230ea5e9;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%232563eb;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M 60 40 L 140 40 L 180 60 L 180 80 L 100 80 L 100 160 L 80 180 L 60 160 Z' fill='%23e5e7eb'/%3E%3Cpath d='M 140 40 L 180 60 L 180 80 L 100 80 L 100 160 L 140 160 L 140 100 L 160 100 L 170 110 L 170 130 L 160 140 L 140 140' fill='url(%23blueGrad)'/%3E%3C/svg%3E"
              alt="Anveshak Logo"
              className="logo-image"
            />
          </div>

          {/* Sparkle at corner */}
          {stage >= 2 && (
            <div className="logo-sparkle">
              <div className="sparkle-core"></div>
              <div className="sparkle-rays"></div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        /* Smooth fade out - no stutter */
        .cinematic-intro {
          animation: fadeOutIntro 1s cubic-bezier(0.4, 0, 0.2, 1) 3.5s forwards;
          will-change: opacity;
        }

        @keyframes fadeOutIntro {
          to {
            opacity: 0;
            pointer-events: none;
          }
        }

        /* Subtle ambient glow - very minimal like PS5 */
        .cinematic-glow {
          width: 800px;
          height: 800px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
          opacity: 0;
          filter: blur(100px);
          transition: opacity 2.5s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: opacity;
        }

        .cinematic-glow.active {
          opacity: 1;
        }

        /* Camera push-in effect - buttery smooth */
        .logo-container {
          perspective: 1000px;
          will-change: transform, opacity;
        }

        .logo-container.camera-push {
          animation: cameraPush 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes cameraPush {
          0% {
            transform: scale(1.15);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Logo wrapper - smooth hardware acceleration */
        .logo-wrapper {
          position: relative;
          width: 280px;
          height: 280px;
          filter: drop-shadow(0 0 40px rgba(59, 130, 246, 0.5));
          will-change: filter;
        }

        /* Logo reveal - ultra smooth fade */
        .logo-reveal {
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: opacity;
        }

        .logo-reveal.active {
          opacity: 1;
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 10px 40px rgba(0, 0, 0, 0.5));
        }

        .logo-wrapper.assembled .logo-image {
          animation: logoSettle 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes logoSettle {
          0% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Sparkle at corner of logo - smooth flash */
        .logo-sparkle {
          position: absolute;
          top: 15%;
          right: 15%;
          pointer-events: none;
          will-change: opacity, transform;
        }

        .sparkle-core {
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          box-shadow: 
            0 0 10px 2px rgba(255, 255, 255, 0.8),
            0 0 20px 4px rgba(59, 130, 246, 0.6);
          animation: sparkleFlash 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes sparkleFlash {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
        }

        .sparkle-rays {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
        }

        .sparkle-rays::before,
        .sparkle-rays::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          background: white;
          opacity: 0;
          animation: sparkleRay 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .sparkle-rays::before {
          width: 2px;
          height: 20px;
          transform: translate(-50%, -50%);
        }

        .sparkle-rays::after {
          width: 20px;
          height: 2px;
          transform: translate(-50%, -50%);
        }

        @keyframes sparkleRay {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          40% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};
