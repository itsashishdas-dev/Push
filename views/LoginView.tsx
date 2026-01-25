
import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, MapPin, Swords, Users, Zap, ScanLine, Crosshair } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface LoginViewProps {
  onLogin: () => void;
  onShowPrivacy: () => void;
}

const GLIMPSES = [
  { id: 1, text: "Locate Hidden Spots", sub: "Scan your sector", icon: MapPin, color: "text-emerald-400" },
  { id: 2, text: "Battle for Territory", sub: "Claim the streets", icon: Swords, color: "text-red-400" },
  { id: 3, text: "Form Your Unit", sub: "Ride together", icon: Users, color: "text-indigo-400" },
  { id: 4, text: "Track Progression", sub: "Level up skills", icon: Zap, color: "text-yellow-400" }
];

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onShowPrivacy }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeGlimpse, setActiveGlimpse] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
        setActiveGlimpse(prev => (prev + 1) % GLIMPSES.length);
    }, 2000); // Faster cycle
    return () => clearInterval(interval);
  }, []);

  const handleAuth = () => {
    triggerHaptic('medium');
    setIsAuthenticating(true);
    // Simulate network authentication delay
    setTimeout(onLogin, 1500);
  };

  return (
    <div className="relative h-screen w-full bg-[#020202] flex flex-col items-center justify-between overflow-hidden font-sans isolate pb-12 pt-32">
      
      {/* --- TACTICAL BACKGROUND LAYERS --- */}
      
      {/* 1. Base Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* 2. Abstract Map Shapes / Radar Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-1/4 left-[-10%] w-[120%] h-[1px] bg-indigo-500 blur-[1px]"></div>
          <div className="absolute top-3/4 left-[-10%] w-[120%] h-[1px] bg-indigo-500 blur-[1px]"></div>
          <div className="absolute top-[-10%] left-1/3 w-[1px] h-[120%] bg-indigo-500 blur-[1px]"></div>
          <div className="absolute top-[-10%] right-1/3 w-[1px] h-[120%] bg-indigo-500 blur-[1px]"></div>
          
          {/* Radar Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full border border-indigo-500/30"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full border border-indigo-500/20 border-dashed"></div>
      </div>

      {/* 3. Noise Texture */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* 4. Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#020202]/50 to-[#020202] pointer-events-none"></div>

      {/* --- HUD ELEMENTS --- */}
      <div className="absolute top-6 left-6 text-[8px] font-mono text-indigo-500/50 tracking-widest pointer-events-none">
          SYS.RDY <br/> SECURE_CONN: FALSE
      </div>
      <div className="absolute top-6 right-6 text-[8px] font-mono text-indigo-500/50 tracking-widest text-right pointer-events-none">
          LAT: 28.6139 <br/> LNG: 77.2090
      </div>
      <div className="absolute bottom-6 left-6 pointer-events-none">
          <Crosshair className="text-indigo-500/30 w-6 h-6" />
      </div>
      <div className="absolute bottom-6 right-6 pointer-events-none">
          <ScanLine className="text-indigo-500/30 w-6 h-6" />
      </div>


      {/* --- CONTENT --- */}

      <div className={`relative z-10 flex flex-col items-center gap-8 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* REPLACED LOGO WITH TEXT HEADER */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-8xl font-black italic tracking-tighter text-white leading-[0.85] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            SPOTS
          </h1>
          <div className="flex items-center gap-3 mt-6">
              <div className="h-px w-8 bg-indigo-500/50"></div>
              <p className="text-indigo-300 font-bold text-[10px] tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]">
                Core Skate Network
              </p>
              <div className="h-px w-8 bg-indigo-500/50"></div>
          </div>
        </div>

        {/* Feature Glimpses Carousel */}
        <div className="mt-12 h-24 flex flex-col items-center justify-center w-full max-w-xs relative">
            {/* Tactical Frame */}
            <div className="absolute inset-0 border-x border-white/10 opacity-50"></div>
            
            {GLIMPSES.map((item, idx) => (
                <div 
                    key={item.id}
                    className={`absolute flex flex-col items-center transition-all duration-500 transform ${
                        idx === activeGlimpse 
                        ? 'opacity-100 translate-y-0 scale-100 blur-none' 
                        : 'opacity-0 translate-y-4 scale-95 blur-sm pointer-events-none'
                    }`}
                >
                    <div className={`flex items-center gap-2 mb-2 ${item.color}`}>
                        <item.icon size={20} strokeWidth={2.5} />
                        <span className="text-sm font-black uppercase tracking-widest">{item.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] bg-slate-900/50 px-2 py-1 rounded">{item.sub}</span>
                </div>
            ))}
        </div>
        
        {/* Carousel Indicators */}
        <div className="flex gap-1.5 mt-2">
            {GLIMPSES.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`h-0.5 transition-all duration-300 ${idx === activeGlimpse ? 'w-4 bg-indigo-500' : 'w-2 bg-slate-800'}`} 
                />
            ))}
        </div>
      </div>

      <div className={`relative z-10 w-full max-w-xs flex flex-col items-center gap-6 transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center space-y-1">
             <p className="text-slate-600 text-[9px] uppercase tracking-widest font-mono">v1.8-RC // REGION: IND</p>
          </div>

          <button 
              onClick={handleAuth}
              disabled={isAuthenticating}
              className="group w-full h-16 bg-white text-black rounded-sm font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-50 active:scale-[0.98] transition-all flex items-center justify-between px-6 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:cursor-wait relative overflow-hidden"
            >
              {/* Button Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <span className="group-hover:translate-x-1 transition-transform relative z-10">
                  {isAuthenticating ? 'ESTABLISHING UPLINK...' : 'INITIALIZE UPLINK'}
              </span>
              
              {isAuthenticating ? (
                  <Loader2 className="animate-spin text-black relative z-10" size={20} />
              ) : (
                  <div className="flex items-center relative z-10">
                      <div className="w-2 h-2 bg-black mr-1 animate-pulse"></div>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
              )}
            </button>
            
            <button 
              onClick={onShowPrivacy} 
              className="text-[9px] text-slate-600 font-mono hover:text-indigo-400 transition-colors uppercase tracking-widest"
            >
              [ View Protocols ]
            </button>
      </div>
    </div>
  );
};

export default LoginView;
