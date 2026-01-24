
import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
  onShowPrivacy: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onShowPrivacy }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = () => {
    setIsAuthenticating(true);
    // Simulate network authentication delay
    setTimeout(onLogin, 1500);
  };

  return (
    <div className="relative h-screen w-full bg-[#050505] flex flex-col items-center justify-center overflow-hidden font-sans isolate text-center">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Organic Loop - Simplified */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] pointer-events-none transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
         <svg className="w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
             d="M190 20C120 20 40 60 25 150C10 240 80 340 190 360C300 380 360 300 370 200C380 100 320 30 190 20Z" 
             stroke="#60A5FA" 
             strokeWidth="2" 
             strokeLinecap="round"
             className="drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]"
           />
        </svg>
      </div>

      {/* --- CONTENT --- */}

      <div className={`relative z-10 flex flex-col items-center gap-12 transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
        
        {/* Brand Group */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-8xl font-black italic tracking-tighter text-white drop-shadow-2xl">
            SPOTS
          </h1>
          <p className="text-slate-400 font-bold text-[10px] tracking-[0.4em] uppercase">
            Skateboarding Network
          </p>
        </div>

        {/* Action Group */}
        <div className="w-full max-w-xs flex flex-col items-center gap-6">
          <button 
              onClick={handleAuth}
              disabled={isAuthenticating}
              className="w-full h-14 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-70 disabled:cursor-wait"
            >
              {isAuthenticating ? (
                  <Loader2 className="animate-spin text-black" size={18} />
              ) : (
                  'GET STARTED'
              )}
            </button>
            
            <button 
              onClick={onShowPrivacy} 
              className="text-[10px] text-slate-600 font-bold hover:text-slate-400 transition-colors uppercase tracking-widest"
            >
              Privacy Policy
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
