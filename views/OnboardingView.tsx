
import React, { useState, useRef, useEffect } from 'react';
import { Discipline } from '../types';
import { MapPin, ChevronRight, Loader2, Mountain, Camera, User as UserIcon, Globe, ShieldCheck, ArrowRight, Plus, Terminal, Cpu, ScanLine, Mail, Lock, Key, Grid3X3, ArrowUpRight } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';

interface OnboardingViewProps {
  onComplete: (data: any) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ninja',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ghost',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Samurai',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Punk',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Cyborg',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Glitch',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=System',
];

const SKATE_SIZES = ['7.5"', '7.75"', '8.0"', '8.125"', '8.25"', '8.38"', '8.5"', '9.0"+'];
const LONGBOARD_SIZES = ['9.0"', '9.25"', '9.5"', '9.8"', '10.0"', '10.5"+'];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
    </g>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 12.625c0-2.604 2.135-3.854 2.229-3.906-.01-.042-0.427-1.469-1.875-1.469-0.792 0-1.531.469-2.031.469-0.5 0-1.281-.458-2.104-0.458-2.167 0-3.323 1.281-3.323 3.667 0 2.875 2.5 6.948 4.938 6.948 0.625 0 1.208-.438 1.938-0.438 0.719 0 1.229.438 1.958.438 1.344 0 2.365-1.229 2.365-1.229s-1.125-0.656-1.125-2.625zM14.406 5.865c0.698-0.844 1.167-2.021 1.031-3.188-1.010.042-2.229 0.677-2.958 1.521-0.635 0.74-1.146 1.927-1.010 3.063 1.135.083 2.26-0.552 2.938-1.396z"/>
  </svg>
);

const SkateboardIcon = ({ size = 24, strokeWidth = 2, className }: { size?: number, strokeWidth?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20.5 10a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V9h17v1Z" />
    <circle cx="7" cy="14" r="2.5" />
    <circle cx="17" cy="14" r="2.5" />
    <path d="M5 9c0-1 1-1.5 2-1.5h10c1 0 2 .5 2 1.5" />
  </svg>
);

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isBooting, setIsBooting] = useState(true); // Boot sequence state
  const [bootProgress, setBootProgress] = useState(0); // Boot scan progress

  // Form State
  const [disciplines, setDisciplines] = useState<Discipline[]>([Discipline.SKATE]);
  const [stance, setStance] = useState<'regular' | 'goofy'>('regular');
  const [location, setLocation] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  
  // New split deck sizes
  const [deckSizes, setDeckSizes] = useState<{skate: string, downhill: string}>({
      skate: '8.0"',
      downhill: '9.5"'
  });

  const [isLocating, setIsLocating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalSteps = 4;

  // Boot Effect
  useEffect(() => {
    const interval = setInterval(() => {
        setBootProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => setIsBooting(false), 500); // Small delay after 100%
                return 100;
            }
            return prev + 5;
        });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const toggleDiscipline = (d: Discipline) => {
    triggerHaptic('medium');
    playSound('click');
    if (disciplines.includes(d)) {
       if (disciplines.length > 1) {
           setDisciplines(disciplines.filter(item => item !== d));
       }
    } else {
       setDisciplines([...disciplines, d]);
    }
  };

  const updateDeckSize = (type: 'skate' | 'downhill', size: string) => {
      triggerHaptic('light');
      setDeckSizes(prev => ({ ...prev, [type]: size }));
  };

  const handleFinalize = (locationOverride?: string) => {
    triggerHaptic('success');
    playSound('success');
    
    // Default starting stats
    const startingXp = 0;
    const startingLevel = 1;

    onComplete({
      name: username || 'Rider',
      email: email, // New field
      bio: bio,
      location: locationOverride || location || 'India',
      disciplines: disciplines,
      avatar: avatar || PRESET_AVATARS[0],
      stance: stance,
      deckDetails: deckSizes,
      level: startingLevel,
      xp: startingXp,
      masteredCount: 0,
      locker: []
    });
  };

  const handleLocation = () => {
    setIsLocating(true);
    triggerHaptic('heavy');
    playSound('click');
    
    const finalizeWithLocation = (loc: string) => {
        setTimeout(() => {
           setLocation(loc);
           setIsLocating(false);
           handleFinalize(loc); // Trigger completion immediately
        }, 2500); // Cinematic delay
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
          finalizeWithLocation('Verified GPS Signal');
      }, () => {
          setIsLocating(false);
          triggerHaptic('error');
      });
    } else {
      setIsLocating(false);
      triggerHaptic('error');
    }
  };

  const handleManualLocationSubmit = () => {
      if (!location) return;
      handleFinalize();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        triggerHaptic('success');
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
      triggerHaptic('medium');
      playSound('click');
      setStep(step + 1);
  };

  // --- UI COMPONENTS ---

  const StepIndicator = () => (
      <div className="flex justify-between items-center mb-6 px-2 pt-4">
          <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></div>
              {[...Array(totalSteps - 1)].map((_, i) => (
                  <div key={i} className={`w-0.5 h-0.5 rounded-full ${step > i + 1 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
              ))}
          </div>
      </div>
  );

  // --- BOOT SCREEN RENDER ---
  if (isBooting) {
      return (
          <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative font-mono text-green-500 p-8">
              <div className="w-full max-w-xs space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                      <span>System Boot</span>
                      <span>{bootProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${bootProgress}%` }} />
                  </div>
                  <div className="text-[10px] space-y-1 opacity-70">
                      <p>> Initializing SPOTS Protocol...</p>
                      {bootProgress > 20 && <p>> Loading Map Data...</p>}
                      {bootProgress > 50 && <p>> Syncing Crew Database...</p>}
                      {bootProgress > 80 && <p>> Establishing Uplink...</p>}
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-screen w-full bg-[#050505] text-white overflow-hidden relative font-sans flex flex-col pt-[env(safe-area-inset-top)]">
      {/* Background Noise & Grain */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 flex flex-col px-6 pb-24 overflow-y-auto hide-scrollbar">
          
          <StepIndicator />

          {/* STEP 1: IDENTITY (Enter World - Enhanced) */}
          {step === 1 && (
              <div className="flex flex-col h-full animate-view relative">
                  {/* Phase Indicator */}
                  <div className="absolute top-0 right-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                      Phase 01
                  </div>

                  <div className="mb-4 pl-2 pt-2">
                    <div className="w-12 h-0.5 bg-indigo-500 mb-6 shadow-[0_0_10px_#6366f1]"></div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-2 leading-[0.85] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">Enter<br/>World</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 leading-relaxed">
                        Find Spots • Join Crews • Battle
                    </p>
                  </div>

                  {/* Character Creation Container */}
                  <div className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-5 flex flex-col gap-4 relative overflow-hidden flex-1 shadow-2xl backdrop-blur-sm animate-[fadeIn_0.5s_ease-out_0.2s_both]">
                      
                      {/* Decorative Background Icon */}
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none transform rotate-12">
                          <Terminal size={180} strokeWidth={1} />
                      </div>

                      {/* Avatar Section - Grid Mode */}
                      <div className="space-y-3 z-10">
                          <div className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1 flex items-center gap-2">
                              <ScanLine size={10} /> Identity Module
                          </div>
                          
                          <div className="flex gap-4">
                              {/* Selected Avatar Large Display */}
                              <div className="shrink-0">
                                  <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-indigo-500 overflow-hidden relative shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                                      <img src={avatar || PRESET_AVATARS[0]} className="w-full h-full object-cover" />
                                      {/* Scanline effect */}
                                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent animate-[scan_2s_ease-in-out_infinite] pointer-events-none" />
                                  </div>
                              </div>

                              {/* Avatar Selection Grid */}
                              <div className="flex-1 grid grid-cols-4 gap-2">
                                  {/* Custom Upload Button */}
                                  <button 
                                      onClick={() => fileInputRef.current?.click()}
                                      className="aspect-square rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center gap-1 hover:bg-slate-800 hover:border-white/20 transition-all group"
                                  >
                                      <Camera size={14} className="text-slate-500 group-hover:text-white" />
                                      <span className="text-[6px] font-black uppercase text-slate-500">Upload</span>
                                  </button>

                                  {/* Presets */}
                                  {PRESET_AVATARS.slice(0, 7).map((url, idx) => (
                                      <button
                                          key={idx}
                                          onClick={() => { setAvatar(url); triggerHaptic('light'); }}
                                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${avatar === url ? 'border-indigo-500 shadow-lg z-10 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                      >
                                          <img src={url} className="w-full h-full object-cover bg-black" />
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                      </div>

                      {/* Inputs */}
                      <div className="space-y-3 z-10">
                          
                          {/* Username */}
                          <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1 flex items-center gap-2"><Cpu size={10} /> Codename</label>
                              <div className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:border-indigo-500/50 focus-within:bg-black/80 transition-all shadow-inner group">
                                  <span className="text-slate-600 font-bold text-xs group-focus-within:text-indigo-500 transition-colors">@</span>
                                  <input 
                                    type="text" 
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="RIDER_HANDLE"
                                    className="bg-transparent border-none outline-none text-xs font-bold text-white uppercase w-full placeholder:text-slate-700 tracking-wider"
                                  />
                              </div>
                          </div>

                          {/* Email */}
                          <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1 flex items-center gap-2"><Mail size={10} /> Uplink Address</label>
                              <div className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:border-indigo-500/50 focus-within:bg-black/80 transition-all shadow-inner group">
                                  <input 
                                    type="email" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="USER@NETWORK.COM"
                                    className="bg-transparent border-none outline-none text-xs font-bold text-white uppercase w-full placeholder:text-slate-700 tracking-wider"
                                  />
                              </div>
                          </div>

                          {/* Password */}
                          <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1 flex items-center gap-2"><Lock size={10} /> Secure Key</label>
                              <div className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:border-indigo-500/50 focus-within:bg-black/80 transition-all shadow-inner group">
                                  <Key size={12} className="text-slate-700 group-focus-within:text-indigo-500 transition-colors" />
                                  <input 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="bg-transparent border-none outline-none text-xs font-bold text-white w-full placeholder:text-slate-700 tracking-widest"
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Social Login */}
                      <div className="mt-1 z-10">
                          <div className="relative flex py-2 items-center">
                              <div className="flex-grow border-t border-slate-800"></div>
                              <span className="flex-shrink-0 mx-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">Or Initialize Via</span>
                              <div className="flex-grow border-t border-slate-800"></div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mt-1">
                              <button className="flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-lg">
                                  <AppleIcon /> Apple
                              </button>
                              <button className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg">
                                  <GoogleIcon /> Google
                              </button>
                          </div>
                      </div>

                  </div>
              </div>
          )}

          {/* STEP 2: CLASS SELECTION */}
          {step === 2 && (
             <div className="flex flex-col h-full animate-view relative">
                <div className="absolute top-0 right-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    Phase 02
                </div>

                <div className="mb-8 pl-1 pt-2">
                    <div className="w-12 h-0.5 bg-indigo-500 mb-6 shadow-[0_0_10px_#6366f1]"></div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-3 leading-[0.85] drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">Riding<br/>Style</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Choose your riding discipline</p>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
                    <div className="grid grid-cols-1 gap-4 mb-6">
                        {/* SKATEBOARD CARD */}
                        <button 
                            onClick={() => toggleDiscipline(Discipline.SKATE)}
                            className={`relative w-full h-48 rounded-[2.5rem] transition-all duration-300 flex flex-col justify-between overflow-hidden text-left p-6 group ${disciplines.includes(Discipline.SKATE) ? 'bg-[#312e81] shadow-[0_0_40px_rgba(49,46,129,0.4)] border border-indigo-500/50' : 'bg-[#0f1115] border border-white/5'}`}
                        >
                            {disciplines.includes(Discipline.SKATE) && (
                                <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-[#6366f1] rounded-full opacity-30 blur-2xl pointer-events-none" />
                            )}
                            
                            <div className="relative z-10 flex justify-between items-start w-full">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md transition-colors ${disciplines.includes(Discipline.SKATE) ? 'bg-white/20 text-white' : 'bg-slate-800/50 text-slate-500'}`}>
                                    <SkateboardIcon size={24} strokeWidth={2} />
                                </div>
                                {disciplines.includes(Discipline.SKATE) && (
                                    <div className="bg-[#8b8df2] text-[#1e1b4b] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                                        Selected
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-1">Skateboard</h3>
                                <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${disciplines.includes(Discipline.SKATE) ? 'text-indigo-200' : 'text-slate-600'}`}>Street • Park • Freestyle</p>
                            </div>
                        </button>

                        {/* LONGBOARD CARD */}
                        <button 
                            onClick={() => toggleDiscipline(Discipline.DOWNHILL)}
                            className={`relative w-full h-48 rounded-[2.5rem] transition-all duration-300 flex flex-col justify-between overflow-hidden text-left p-6 group ${disciplines.includes(Discipline.DOWNHILL) ? 'bg-[#312e81] shadow-[0_0_40px_rgba(49,46,129,0.4)] border border-indigo-500/50' : 'bg-[#0f1115] border border-white/5'}`}
                        >
                            {disciplines.includes(Discipline.DOWNHILL) && (
                                <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-[#6366f1] rounded-full opacity-30 blur-2xl pointer-events-none" />
                            )}

                            <div className="relative z-10 flex justify-between items-start w-full">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md transition-colors ${disciplines.includes(Discipline.DOWNHILL) ? 'bg-white/20 text-white' : 'bg-slate-800/50 text-slate-500'}`}>
                                    <Mountain size={24} strokeWidth={2} />
                                </div>
                                {disciplines.includes(Discipline.DOWNHILL) && (
                                    <div className="bg-[#8b8df2] text-[#1e1b4b] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                                        Selected
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-1">Longboard</h3>
                                <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${disciplines.includes(Discipline.DOWNHILL) ? 'text-indigo-200' : 'text-slate-600'}`}>Downhill • Freeride</p>
                            </div>
                        </button>
                    </div>

                    {/* DECK SIZE SELECTORS */}
                    <div className="space-y-6 animate-view" style={{ animationDelay: '0.1s' }}>
                        {disciplines.includes(Discipline.SKATE) && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Skateboard Deck Size</p>
                                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-1">
                                    {SKATE_SIZES.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => updateDeckSize('skate', size)}
                                            className={`min-w-[4rem] h-12 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-wide border transition-all ${
                                                deckSizes.skate === size 
                                                ? 'bg-white text-black border-white shadow-lg scale-105' 
                                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {disciplines.includes(Discipline.DOWNHILL) && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Longboard Width</p>
                                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-1">
                                    {LONGBOARD_SIZES.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => updateDeckSize('downhill', size)}
                                            className={`min-w-[4rem] h-12 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-wide border transition-all ${
                                                deckSizes.downhill === size 
                                                ? 'bg-white text-black border-white shadow-lg scale-105' 
                                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             </div>
          )}

          {/* STEP 3: STANCE (REDESIGNED) */}
          {step === 3 && (
             <div className="flex flex-col h-full animate-view relative">
                 {/* Phase Indicator */}
                 <div className="absolute top-0 right-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                     Phase 03
                 </div>

                 {/* Header */}
                 <div className="mt-8 mb-10 pl-1">
                    <div className="w-12 h-0.5 bg-indigo-500 mb-6 shadow-[0_0_10px_#6366f1]"></div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4 leading-[0.8] text-white drop-shadow-2xl">
                        Stance<br/>Check
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">
                        Which foot pushes forward?
                    </p>
                </div>
                
                {/* Cards */}
                <div className="flex-1 flex flex-col gap-4">
                    {[
                        { id: 'regular', label: 'Regular', sub: 'Left Foot Forward' },
                        { id: 'goofy', label: 'Goofy', sub: 'Right Foot Forward' }
                    ].map((s) => {
                        const isSelected = stance === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => { setStance(s.id as any); triggerHaptic('medium'); }}
                                className={`
                                    relative w-full h-44 rounded-[2.5rem] flex items-center justify-between px-8 transition-all duration-500 group overflow-hidden border
                                    ${isSelected 
                                        ? 'bg-gradient-to-b from-gray-100 to-gray-400 text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.15)] scale-[1.02] z-10' 
                                        : 'bg-[#050608] border-white/5 text-slate-700 hover:border-white/10 hover:bg-[#0a0a0a]'
                                    }
                                `}
                            >
                                {/* Selected Shine */}
                                {isSelected && <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent pointer-events-none" />}
                                
                                <div className="relative z-10 text-left">
                                    <h3 className={`text-5xl font-black italic uppercase tracking-tighter mb-2 ${isSelected ? 'text-black' : 'text-slate-800 group-hover:text-slate-600'}`}>
                                        {s.label}
                                    </h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isSelected ? 'text-slate-600' : 'text-slate-800'}`}>
                                        {s.sub}
                                    </p>
                                </div>

                                {/* Indicator Circle */}
                                <div className={`relative z-10 w-8 h-8 rounded-full transition-all duration-500 flex items-center justify-center
                                    ${isSelected ? 'bg-black scale-100 shadow-xl' : 'bg-slate-900 border border-slate-800 scale-90'}
                                `}>
                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
             </div>
          )}

          {/* STEP 4: UPLINK (Location - Final Step) */}
          {step === 4 && (
            <div className="flex flex-col h-full items-center justify-center animate-view text-center relative z-10">
                 
                 {/* Radar Container */}
                 <div className="relative mb-16 w-72 h-72">
                    
                    {/* Radar Background (Static Grid) */}
                    <div className="absolute inset-0 rounded-full border border-white/10 bg-[#0b0c10] shadow-2xl overflow-hidden">
                        {/* Concentric Circles */}
                        <div className="absolute inset-[15%] rounded-full border border-white/5" />
                        <div className="absolute inset-[35%] rounded-full border border-white/5" />
                        <div className="absolute inset-[55%] rounded-full border border-white/5" />
                        
                        {/* Crosshairs */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5" />
                        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/5" />

                        {/* Blips (Dots representing spots) */}
                        {isLocating && (
                           <>
                              {/* Static dots without glow */}
                              <div className="absolute top-[25%] left-[60%] w-1.5 h-1.5 bg-green-400 rounded-full animate-view" />
                              <div className="absolute top-[60%] left-[25%] w-1.5 h-1.5 bg-indigo-400 rounded-full animate-view" style={{ animationDelay: '0.2s' }} />
                              <div className="absolute top-[70%] left-[70%] w-1.5 h-1.5 bg-emerald-300 rounded-full animate-view" style={{ animationDelay: '0.4s' }} />
                           </>
                        )}
                        
                        {/* Radar Sweep (The gradient) - Always scanning, speeds up on locating */}
                        <div className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(99,102,241,0.1)_300deg,rgba(99,102,241,0.4)_360deg)] ${isLocating ? 'animate-[spin_1.5s_linear_infinite]' : 'animate-[spin_4s_linear_infinite]'}`} />
                    </div>

                    {/* Central Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className={`w-16 h-16 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center shadow-xl transition-all duration-500 ${isLocating ? 'scale-90 border-indigo-500/50' : ''}`}>
                            <Globe size={24} className={`${isLocating ? 'text-indigo-400' : 'text-slate-600'} transition-colors`} />
                        </div>
                    </div>

                    {/* Outer Glow Halo - only when locating */}
                    {isLocating && (
                        <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-pulse" />
                    )}
                 </div>

                 {/* Text Content */}
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4 drop-shadow-lg">
                    {isLocating ? 'Scanning Sector...' : 'Establish Uplink'}
                 </h2>
                 <p className="text-xs text-slate-500 font-medium max-w-[260px] leading-relaxed mb-10">
                    {isLocating 
                        ? 'Decrypting local spot coordinates and crew signals.'
                        : 'Connect to the network to reveal nearby spots and active sessions.'
                    }
                 </p>

                 {/* Main Button */}
                 <div className="relative w-full max-w-xs group">
                     {/* Button Glow */}
                     <div className={`absolute -inset-0.5 bg-indigo-500/20 rounded-xl blur opacity-0 transition-opacity duration-500 ${!isLocating ? 'group-hover:opacity-100' : ''}`} />
                     
                     <button 
                       onClick={handleLocation}
                       disabled={isLocating}
                       className="relative w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-80 disabled:cursor-wait shadow-xl overflow-hidden"
                     >
                        {isLocating ? (
                            <>
                                <Loader2 className="animate-spin text-indigo-600" size={16} />
                                <span className="text-indigo-900">ACQUIRING SIGNAL...</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={16} strokeWidth={2.5} />
                                <span>ALLOW ACCESS & ENTER</span>
                            </>
                        )}
                        
                        {/* Shimmer effect on button */}
                        {!isLocating && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        )}
                     </button>
                 </div>
                 
                 {/* Manual Entry Link */}
                 <div className="mt-8 w-full max-w-[200px] relative group">
                    <input 
                        type="text"
                        placeholder="ENTER SECTOR ID"
                        className="w-full bg-transparent border-b border-slate-800 py-2 text-center text-[10px] font-bold text-slate-500 focus:text-white focus:outline-none focus:border-indigo-500 transition-colors uppercase placeholder:text-slate-800 tracking-widest font-mono"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualLocationSubmit()}
                    />
                 </div>
            </div>
          )}

      </div>

      {/* FOOTER ACTIONS - Only for steps 1-3 */}
      {step < 4 && (
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent z-50">
              <button
                onClick={nextStep}
                disabled={step === 1 && !username}
                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 shadow-2xl ${
                    (step === 1 && !username)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-[#1e2330] text-white border border-white/10 hover:bg-[#252a3a] active:scale-[0.98]'
                }`}
              >
                {step === 1 ? 'CREATE ACCOUNT' : 'NEXT STEP'}
                <ArrowRight size={20} strokeWidth={2.5} />
              </button>
          </div>
      )}

      <style>{`
        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
      `}</style>

    </div>
  );
};

export default OnboardingView;
