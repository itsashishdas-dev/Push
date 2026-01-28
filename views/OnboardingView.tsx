
import React, { useState, useRef, useEffect } from 'react';
import { Discipline } from '../types';
import { MapPin, ChevronRight, ChevronLeft, Loader2, Mountain, Camera, User as UserIcon, Globe, ShieldCheck, ArrowRight, Plus, Terminal, Cpu, ScanLine, Mail, Lock, Key, Crosshair, Radar, Swords, Users, Zap, AlertCircle } from 'lucide-react';
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

// Custom Brand Icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.053-1.147 8.16-3.293 2.133-2.133 2.8-5.147 2.8-7.56 0-.76-.053-1.467-.173-2.227H12.48z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05 1.4-3.05 1.4-1.25 0-2.35-.95-3.85-.95-1.5 0-2.65.9-3.8.9-.95 0-2.15-.55-3.15-1.5-2.1-2.05-3.3-5.2-3.3-7.55 0-2.55 1.6-3.9 3.1-3.9 1.15 0 2.25.75 3.05.75.75 0 2.25-.75 3.3-.75.65 0 2.5.4 3.65 1.7-.1.05-.2.1-.3.15-1.55.95-2.55 2.65-2.55 4.3 0 2.95 2.35 4.15 2.45 4.2-.05.15-.1.3-.15.45zM12 5.3c-.65 0-1.45.2-1.9.7-.55.55-.95 1.35-.9 2.15.75.05 1.55-.25 2.1-.75.5-.55.95-1.35.9-2.15-.75 0-1.55.05-2.1.05z"/>
  </svg>
);

const SkateboardIcon = ({ size = 24, strokeWidth = 2, className }: { size?: number, strokeWidth?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 9c1.5 2 3.5 2 5 2h10c1.5 0 3.5 0 5-2" />
    <circle cx="7.5" cy="14" r="2.5" />
    <circle cx="16.5" cy="14" r="2.5" />
    <path d="M7.5 11v0.5" />
    <path d="M16.5 11v0.5" />
  </svg>
);

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0 = Auth, 1 = Profile, 2 = Style, 3 = Stance, 4 = Location
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  
  // Auth State
  const [authMode, setAuthMode] = useState<'social' | 'manual'>('social');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Profile State
  const [disciplines, setDisciplines] = useState<Discipline[]>([Discipline.SKATE]);
  const [stance, setStance] = useState<'regular' | 'goofy'>('regular');
  const [location, setLocation] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(PRESET_AVATARS[0]);
  
  const [deckSizes, setDeckSizes] = useState<{skate: string, downhill: string}>({
      skate: '8.0"',
      downhill: '9.5"'
  });

  const [isLocating, setIsLocating] = useState(false);
  const [radarBlips, setRadarBlips] = useState<{id: number, x: number, y: number}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalSteps = 4;

  // Boot Effect
  useEffect(() => {
    const interval = setInterval(() => {
        setBootProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => setIsBooting(false), 500); 
                return 100;
            }
            if (prev % 20 === 0) playSound('data_stream'); 
            return prev + 5;
        });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Radar Blip Effect
  useEffect(() => {
      let interval: any;
      if (isLocating) {
          interval = setInterval(() => {
              if (Math.random() > 0.3) {
                  const r = 30 + Math.random() * 40; // radius percent
                  const theta = Math.random() * 2 * Math.PI;
                  const x = 50 + r * Math.cos(theta);
                  const y = 50 + r * Math.sin(theta);
                  setRadarBlips(prev => [...prev.slice(-4), { id: Date.now(), x, y }]);
                  playSound('click'); 
              }
          }, 400);
      } else {
          setRadarBlips([]);
      }
      return () => clearInterval(interval);
  }, [isLocating]);

  const handleFinalize = (locationOverride?: string) => {
    triggerHaptic('success');
    playSound('radar_complete'); 
    
    onComplete({
      name: username || 'Rider',
      email: email || 'user@spots.net', 
      bio: bio,
      location: locationOverride || location || 'India',
      disciplines: disciplines,
      avatar: avatar || PRESET_AVATARS[0],
      stance: stance,
      deckDetails: deckSizes,
      level: 1,
      xp: 0,
      masteredCount: 0,
      locker: []
    });
  };

  const handleLocation = () => {
    setIsLocating(true);
    triggerHaptic('heavy');
    playSound('radar_scan'); 
    
    const finalizeWithLocation = (loc: string) => {
        setTimeout(() => {
           setLocation(loc);
           setIsLocating(false);
           handleFinalize(loc);
        }, 2500); 
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
          finalizeWithLocation('Verified GPS Signal');
      }, () => {
          setIsLocating(false);
          triggerHaptic('error');
          playSound('error');
      });
    } else {
      setIsLocating(false);
      triggerHaptic('error');
      playSound('error');
    }
  };

  const handleManualLocationSubmit = () => {
      if (location.trim()) {
          handleFinalize(location);
      }
  };

  const toggleDiscipline = (d: Discipline) => {
      triggerHaptic('light');
      playSound('tactile_select');
      setDisciplines(prev => 
          prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
      );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        triggerHaptic('success');
        playSound('land');
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
      triggerHaptic('medium');
      playSound('click');
      setStep(step + 1);
  };

  const prevStep = () => {
      triggerHaptic('light');
      playSound('click');
      if (step > 0) setStep(step - 1);
  };

  // --- RENDERING ---

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
                      {bootProgress > 50 && <p>> Decrypting Secure Channels...</p>}
                      {bootProgress > 80 && <p>> Establishing Uplink...</p>}
                  </div>
              </div>
          </div>
      );
  }

  // --- STEP 0: ACCESS TERMINAL (AUTH) ---
  if (step === 0) {
      return (
        <div className="h-screen w-full bg-[#030303] text-white overflow-hidden relative font-sans flex flex-col pt-[env(safe-area-inset-top)] animate-view">
            {/* Background */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            
            {/* Content Container */}
            <div className="flex-1 flex flex-col px-6 relative z-10">
                
                {/* Header */}
                <div className="mt-8 mb-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Secure Connection</span>
                    </div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.85] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] mb-4">
                        Access<br/>Terminal
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed max-w-[250px]">
                        Authenticate to access the global skate network.
                    </p>
                </div>

                {/* Auth Module */}
                <div className="mb-12 w-full max-w-sm mx-auto space-y-4">
                    
                    {authMode === 'social' ? (
                        <div className="space-y-3 animate-view">
                            <button 
                                onClick={() => { playSound('success'); triggerHaptic('medium'); nextStep(); }}
                                className="w-full h-14 bg-white text-black rounded-xl font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 shadow-lg"
                            >
                                <AppleIcon /> Continue with Apple
                            </button>
                            
                            <button 
                                onClick={() => { playSound('success'); triggerHaptic('medium'); nextStep(); }}
                                className="w-full h-14 bg-[#151515] border border-white/10 text-white rounded-xl font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3 hover:bg-[#1a1a1a] transition-all active:scale-95 shadow-lg"
                            >
                                <GoogleIcon /> Continue with Google
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                                <div className="relative flex justify-center"><span className="bg-[#030303] px-2 text-[8px] text-slate-600 uppercase tracking-widest font-black">Or</span></div>
                            </div>

                            <button 
                                onClick={() => { setAuthMode('manual'); triggerHaptic('light'); }}
                                className="w-full h-12 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-xl font-black uppercase tracking-[0.15em] text-[9px] flex items-center justify-center gap-2 hover:bg-indigo-600/20 transition-all active:scale-95"
                            >
                                <Terminal size={12} /> Manual Entry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-view bg-[#0b0c10] p-5 rounded-2xl border border-white/10 shadow-2xl">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                                    <Lock size={10} className="text-indigo-500" /> Credentials
                                </h3>
                                <button onClick={() => setAuthMode('social')} className="text-[9px] text-slate-500 hover:text-white transition-colors">CANCEL</button>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="bg-[#050505] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-indigo-500/50 transition-colors">
                                    <Mail size={12} className="text-slate-600" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="UPLINK ADDRESS"
                                        className="bg-transparent border-none outline-none text-[10px] font-bold text-white uppercase w-full placeholder:text-slate-700 tracking-widest font-mono"
                                    />
                                </div>
                                <div className="bg-[#050505] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-indigo-500/50 transition-colors">
                                    <Key size={12} className="text-slate-600" />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="ACCESS KEY"
                                        className="bg-transparent border-none outline-none text-[10px] font-bold text-white w-full placeholder:text-slate-700 tracking-widest font-mono"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={nextStep}
                                disabled={!email || !password}
                                className="w-full h-12 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-[0.15em] text-[9px] flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                Initialize <ArrowRight size={12} />
                            </button>
                        </div>
                    )}

                    <p className="text-[8px] text-slate-600 text-center uppercase tracking-widest max-w-xs mx-auto pt-4">
                        By accessing the network, you agree to the <span className="text-indigo-500 underline cursor-pointer">Safety Protocol</span>.
                    </p>
                </div>
            </div>
        </div>
      );
  }

  // --- STEP 1: RIDER PROFILE (Redesigned) ---
  if (step === 1) {
      return (
          <div className="h-screen w-full bg-[#050505] text-white overflow-hidden relative font-sans flex flex-col pt-[env(safe-area-inset-top)] animate-sheet">
              {/* Header */}
              <div className="px-6 pt-4 flex justify-between items-start mb-6">
                  <div>
                      <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none mb-1">Rider ID</h1>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Identity Fabrication</p>
                  </div>
                  <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                      ))}
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-24 hide-scrollbar">
                  
                  {/* Avatar Section */}
                  <div className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-6 mb-4 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><ScanLine size={120} /></div>
                      
                      <div className="flex flex-col items-center gap-6 relative z-10">
                          <div className="relative group">
                              <div className="w-28 h-28 rounded-full bg-[#050505] border-2 border-indigo-500 overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                  <img src={avatar || PRESET_AVATARS[0]} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                              </div>
                              <button 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full border-2 border-[#0b0c10] hover:bg-slate-200 transition-colors"
                              >
                                  <Camera size={14} />
                              </button>
                          </div>

                          <div className="w-full grid grid-cols-4 gap-3">
                              {PRESET_AVATARS.slice(0, 4).map((url, idx) => (
                                  <button
                                      key={idx}
                                      onClick={() => { setAvatar(url); triggerHaptic('light'); playSound('tactile_select'); }}
                                      className={`aspect-square rounded-xl overflow-hidden border transition-all ${avatar === url ? 'border-indigo-500 shadow-lg scale-95 opacity-50' : 'border-slate-800 bg-[#050505] hover:border-slate-600'}`}
                                  >
                                      <img src={url} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                                  </button>
                              ))}
                          </div>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-indigo-500 tracking-widest ml-1 flex items-center gap-2">
                              <Cpu size={10} /> Codename
                          </label>
                          <div className="bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-4 flex items-center gap-2 focus-within:border-indigo-500/50 transition-all shadow-lg">
                              <span className="text-slate-600 font-bold text-xs">@</span>
                              <input 
                                type="text" 
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="ENTER_HANDLE"
                                className="bg-transparent border-none outline-none text-xs font-bold text-white uppercase w-full placeholder:text-slate-700 tracking-widest font-mono"
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-indigo-500 tracking-widest ml-1 flex items-center gap-2">
                              <Terminal size={10} /> Bio Data
                          </label>
                          <div className="bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-4 flex items-center gap-2 focus-within:border-indigo-500/50 transition-all shadow-lg">
                              <input 
                                type="text" 
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                placeholder="SHORT DESCRIPTION..."
                                className="bg-transparent border-none outline-none text-xs font-bold text-white uppercase w-full placeholder:text-slate-700 tracking-widest font-mono"
                              />
                          </div>
                      </div>
                  </div>
              </div>

              {/* Action Bar */}
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent z-50">
                  <button
                    onClick={nextStep}
                    disabled={!username}
                    className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 shadow-xl ${
                        !username
                        ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98]'
                    }`}
                  >
                    CONFIRM IDENTITY
                    <ArrowRight size={14} />
                  </button>
              </div>
          </div>
      );
  }

  // --- STEP 2: RIDING STYLE ---
  if (step === 2) {
      return (
         <div className="h-screen w-full bg-[#050505] text-white overflow-hidden relative font-sans flex flex-col pt-[env(safe-area-inset-top)] animate-view">
            <button onClick={prevStep} className="absolute top-4 right-6 p-2 text-slate-500 hover:text-white active:scale-95 transition-all z-20">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">BACK</span>
            </button>

            <div className="px-6 pt-4 mb-4">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-white">Riding<br/>Style</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Select Discipline</p>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-24 space-y-4">
                <button 
                    onClick={() => toggleDiscipline(Discipline.SKATE)}
                    className={`relative w-full h-32 rounded-[2rem] transition-all duration-300 flex items-center justify-between px-6 overflow-hidden group border ${disciplines.includes(Discipline.SKATE) ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'bg-[#0b0c10] border-white/5'}`}
                >
                    <div className="relative z-10 text-left">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-1">Skateboard</h3>
                        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${disciplines.includes(Discipline.SKATE) ? 'text-indigo-300' : 'text-slate-600'}`}>Street • Park</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md transition-colors ${disciplines.includes(Discipline.SKATE) ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-600'}`}>
                        <SkateboardIcon size={24} />
                    </div>
                </button>

                <button 
                    onClick={() => toggleDiscipline(Discipline.DOWNHILL)}
                    className={`relative w-full h-32 rounded-[2rem] transition-all duration-300 flex items-center justify-between px-6 overflow-hidden group border ${disciplines.includes(Discipline.DOWNHILL) ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'bg-[#0b0c10] border-white/5'}`}
                >
                    <div className="relative z-10 text-left">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-1">Longboard</h3>
                        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${disciplines.includes(Discipline.DOWNHILL) ? 'text-indigo-300' : 'text-slate-600'}`}>Downhill • Freeride</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md transition-colors ${disciplines.includes(Discipline.DOWNHILL) ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-600'}`}>
                        <Mountain size={24} />
                    </div>
                </button>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent z-50">
              <button
                onClick={nextStep}
                className="w-full h-14 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 shadow-xl bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98]"
              >
                NEXT STEP <ArrowRight size={14} />
              </button>
            </div>
         </div>
      );
  }

  // --- STEP 3: STANCE ---
  if (step === 3) {
     return (
         <div className="h-screen w-full bg-[#050505] text-white overflow-hidden relative font-sans flex flex-col pt-[env(safe-area-inset-top)] animate-view">
             <button onClick={prevStep} className="absolute top-4 right-6 p-2 text-slate-500 hover:text-white active:scale-95 transition-all z-20">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">BACK</span>
             </button>

             <div className="px-6 pt-4 mb-4">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-white">Stance<br/>Check</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Which foot pushes forward?</p>
            </div>
            
            <div className="flex-1 px-6 space-y-4">
                {[
                    { id: 'regular', label: 'Regular', sub: 'Left Foot Forward' },
                    { id: 'goofy', label: 'Goofy', sub: 'Right Foot Forward' }
                ].map((s) => {
                    const isSelected = stance === s.id;
                    return (
                        <button
                            key={s.id}
                            onClick={() => { setStance(s.id as any); triggerHaptic('medium'); playSound('tactile_select'); }}
                            className={`
                                w-full h-24 rounded-[2rem] flex items-center justify-between px-8 transition-all duration-300 border
                                ${isSelected 
                                    ? 'bg-white text-black border-white shadow-xl scale-[1.02]' 
                                    : 'bg-[#0b0c10] border-white/5 text-slate-600 hover:border-white/10'
                                }
                            `}
                        >
                            <div className="text-left">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1">
                                    {s.label}
                                </h3>
                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-80">
                                    {s.sub}
                                </p>
                            </div>
                            {isSelected && <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center"><ArrowRight size={14} /></div>}
                        </button>
                    );
                })}
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent z-50">
              <button
                onClick={nextStep}
                className="w-full h-14 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 shadow-xl bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98]"
              >
                NEXT STEP <ArrowRight size={14} />
              </button>
            </div>
         </div>
     );
  }

  // --- STEP 4: LOCATION (Final) ---
  return (
    <div className="h-screen w-full bg-[#050505] text-white overflow-hidden relative font-sans flex flex-col pt-[env(safe-area-inset-top)] animate-view items-center justify-center">
         
         {/* Main Radar Container */}
         <div className="relative mb-12 w-72 h-72">
            <div className="absolute inset-0 rounded-full border border-white/10 bg-[#020202] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <div className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(16,185,129,0.1)_300deg,rgba(16,185,129,0.5)_360deg)] ${isLocating ? 'animate-[spin_2s_linear_infinite]' : 'opacity-20'}`} />
                <div className="absolute inset-[15%] rounded-full border border-white/5 border-dashed"></div>
                <div className="absolute inset-[35%] rounded-full border border-white/5"></div>
                
                {radarBlips.map(blip => (
                    <div 
                        key={blip.id}
                        className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399] animate-[ping_1s_ease-out_infinite]"
                        style={{ top: `${blip.y}%`, left: `${blip.x}%` }}
                    />
                ))}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Crosshair size={24} className={`${isLocating ? 'text-emerald-500' : 'text-slate-700'} transition-colors`} />
            </div>
         </div>

         {/* Text HUD */}
         <div className="space-y-2 mb-10 text-center">
             <div className="flex items-center justify-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${isLocating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                 <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                    {isLocating ? 'Acquiring Signal...' : 'Establish Uplink'}
                 </h2>
             </div>
             <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                {isLocating ? 'Scanning local frequencies...' : 'Connect to network to reveal spots.'}
             </p>
         </div>

         {/* Action Button */}
         <div className="w-full max-w-xs px-6">
             <button 
               onClick={handleLocation}
               disabled={isLocating}
               className="w-full h-14 bg-white text-black rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-80 disabled:cursor-wait shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden"
             >
                {isLocating ? (
                    <><Loader2 className="animate-spin text-emerald-600" size={14} /> <span className="text-emerald-900">TRIANGULATING...</span></>
                ) : (
                    <><Radar size={14} strokeWidth={2.5} /> <span>INITIALIZE SCAN</span></>
                )}
             </button>
             
             {/* Manual Entry */}
             <div className="mt-8 text-center">
                <div className="flex items-center justify-center border-b border-slate-800 pb-1 mb-2 max-w-[150px] mx-auto">
                    <span className="text-[8px] font-mono text-slate-600">MANUAL_OVERRIDE</span>
                </div>
                <input 
                    type="text"
                    placeholder="ENTER SECTOR ID"
                    className="bg-transparent py-2 text-center text-[10px] font-bold text-slate-500 focus:text-white focus:outline-none transition-colors uppercase placeholder:text-slate-800 tracking-widest font-mono w-full max-w-[200px]"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualLocationSubmit()}
                />
             </div>
         </div>
    </div>
  );
};

export default OnboardingView;
