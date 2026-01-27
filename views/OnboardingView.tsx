
import React, { useState, useRef, useEffect } from 'react';
import { Discipline } from '../types';
import { MapPin, ChevronRight, ChevronLeft, Loader2, Mountain, Camera, User as UserIcon, Globe, ShieldCheck, ArrowRight, Plus, Terminal, Cpu, ScanLine, Mail, Lock, Key, Crosshair, Radar, Swords, Users, Zap } from 'lucide-react';
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

const FEATURES = [
    { id: 'spots', title: 'LOCATE', desc: 'Find hidden spots & skateparks.', icon: MapPin, color: 'text-emerald-400' },
    { id: 'crews', title: 'UNIT', desc: 'Join crews & dominate sectors.', icon: Users, color: 'text-indigo-400' },
    { id: 'battles', title: 'COMBAT', desc: 'Complete bounties & earn rep.', icon: Swords, color: 'text-red-400' }
];

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
  const [step, setStep] = useState(0); // 0 = Landing, 1-4 = Form
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Form State
  const [disciplines, setDisciplines] = useState<Discipline[]>([Discipline.SKATE]);
  const [stance, setStance] = useState<'regular' | 'goofy'>('regular');
  const [location, setLocation] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(PRESET_AVATARS[0]);
  
  const [deckSizes, setDeckSizes] = useState<{skate: string, downhill: string}>({
      skate: '8.0"',
      downhill: '9.5"'
  });

  const [isLocating, setIsLocating] = useState(false);
  // Radar state
  const [radarBlips, setRadarBlips] = useState<{id: number, x: number, y: number}[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalSteps = 4;

  // Boot Effect
  useEffect(() => {
    // Removed playSound('boot') to eliminate throttle sfx
    const interval = setInterval(() => {
        setBootProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => setIsBooting(false), 500); 
                return 100;
            }
            if (prev % 20 === 0) playSound('data_stream'); // Reduced frequency of data ticks
            return prev + 5;
        });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Feature Carousel Effect
  useEffect(() => {
      if (step !== 0) return;
      const interval = setInterval(() => {
          setActiveFeature(prev => (prev + 1) % FEATURES.length);
      }, 2500);
      return () => clearInterval(interval);
  }, [step]);

  // Glitch Effect Loop (Subtle but Evident)
  useEffect(() => {
    let timeoutId: any;
    let innerTimeoutId: any;
    
    if (step !== 0) return; // Only run on landing page

    const triggerGlitch = () => {
        // Randomize next glitch occurrence (2s - 5s)
        const nextDelay = 2000 + Math.random() * 3000; 
        
        timeoutId = setTimeout(() => {
            setGlitchActive(true);
            playSound('glitch'); // Sound always plays with visual
            
            // Random duration for glitch (50ms - 150ms)
            const duration = 50 + Math.random() * 100;
            
            innerTimeoutId = setTimeout(() => {
                setGlitchActive(false);
                triggerGlitch(); // Schedule next
            }, duration); 
        }, nextDelay);
    };
    
    triggerGlitch();
    
    return () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (innerTimeoutId) clearTimeout(innerTimeoutId);
    }; 
  }, [step]);

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
                  playSound('click'); // Tiny blip sound
              }
          }, 400);
      } else {
          setRadarBlips([]);
      }
      return () => clearInterval(interval);
  }, [isLocating]);

  const toggleDiscipline = (d: Discipline) => {
    triggerHaptic('medium');
    playSound('tactile_select'); 

    if (disciplines.includes(d)) {
       if (disciplines.length > 1) {
           setDisciplines(disciplines.filter(item => item !== d));
       }
    } else {
       setDisciplines([...disciplines, d]);
    }
  };

  const handleFinalize = (locationOverride?: string) => {
    triggerHaptic('success');
    playSound('radar_complete'); 
    
    onComplete({
      name: username || 'Rider',
      email: email, 
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

  // --- STEP 0: LANDING PAGE (GAME INTRO STYLE) ---
  if (step === 0) {
      return (
        <div className="h-screen w-full bg-[#030303] text-white overflow-hidden relative font-sans flex flex-col pt-[env(safe-area-inset-top)] animate-view">
            
            {/* Background Texture & Perspective Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            
            {/* Floor Grid Effect */}
            <div 
              className="absolute bottom-0 left-[-50%] right-[-50%] h-[50vh] bg-[linear-gradient(rgba(99,102,241,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.2)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"
              style={{ transform: 'perspective(500px) rotateX(60deg) translateY(100px)' }}
            />

            {/* Top Bar Decoration */}
            <div className="absolute top-[calc(env(safe-area-inset-top)+20px)] left-6 flex flex-col gap-1.5 z-10">
                <div className="w-8 h-0.5 bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                <div className="w-2 h-0.5 bg-slate-800" />
            </div>

            <div className="absolute top-[calc(env(safe-area-inset-top)+20px)] right-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 z-10 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_#22c55e]" />
                ONLINE
            </div>

            {/* Main Title Area */}
            <div className="flex-1 flex flex-col justify-center px-6 relative z-10 pb-12">
                <div className="mb-8">
                    <div className="w-16 h-0.5 bg-indigo-600 mb-6 shadow-[0_0_12px_#6366f1]"></div>
                    <h1 
                      className={`text-7xl font-black italic uppercase tracking-tighter leading-[0.85] mb-4 text-white transition-all duration-75 ${glitchActive ? 'opacity-90 translate-x-1 skew-x-6 text-indigo-100' : 'drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]'}`}
                      style={glitchActive ? { textShadow: '4px 0 rgba(255,0,0,0.8), -4px 0 rgba(0,255,255,0.8)' } : {}}
                    >
                        ENTER<br/>WORLD
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-1 flex items-center gap-2">
                        <Terminal size={12} className="text-indigo-500" /> Protocol v2.4 Initiated
                    </p>
                </div>

                {/* Feature Carousel (Mission Brief Style) */}
                <div className="h-24 relative overflow-hidden">
                    {FEATURES.map((feat, idx) => (
                        <div 
                            key={feat.id}
                            className={`absolute inset-0 transition-all duration-500 transform ${
                                idx === activeFeature 
                                ? 'opacity-100 translate-y-0' 
                                : 'opacity-0 translate-y-4 pointer-events-none'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-slate-900/50 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <feat.icon size={20} className={feat.color} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black italic uppercase text-white tracking-wide">{feat.title}</h3>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{feat.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Progress Bar for Carousel */}
                <div className="flex gap-1 mt-2">
                    {FEATURES.map((_, i) => (
                        <div key={i} className={`h-0.5 transition-all duration-300 ${i === activeFeature ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'}`} />
                    ))}
                </div>
            </div>

            {/* Bottom Action Area */}
            <div className="p-6 pb-10 bg-gradient-to-t from-black via-black to-transparent z-20">
                <button 
                    onClick={() => { setStep(1); playSound('click'); triggerHaptic('medium'); }}
                    className="w-full h-16 bg-[#1f2430] border border-white/5 rounded-2xl flex items-center justify-center gap-3 group active:scale-[0.98] transition-all shadow-2xl relative overflow-hidden"
                >
                    <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-white transition-colors relative z-10">
                        INITIALIZE RIDER PROFILE
                    </span>
                    <ArrowRight size={16} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all relative z-10" />
                    
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
      );
  }

  // --- STEPS 1-4: FORM ---
  return (
    <div className="h-screen w-full bg-[#050505] text-white overflow-hidden relative font-sans flex flex-col pt-[env(safe-area-inset-top)] animate-sheet">
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      <div className="flex-1 relative z-10 flex flex-col px-6 pb-24 overflow-y-auto hide-scrollbar">
          
          <StepIndicator />

          {step === 1 && (
              <div className="flex flex-col h-full animate-view relative">
                  <button onClick={prevStep} className="absolute top-0 right-0 p-2 -mr-2 text-slate-500 hover:text-white active:scale-95 transition-all">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">BACK</span>
                  </button>

                  <div className="mb-4 pl-1 pt-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 leading-[0.9] text-white">Identity<br/>Setup</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 leading-relaxed">
                        Establish your digital profile.
                    </p>
                  </div>

                  <div className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-6 flex flex-col gap-5 relative overflow-hidden flex-1 shadow-2xl backdrop-blur-sm">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none transform rotate-12">
                          <Terminal size={180} strokeWidth={1} />
                      </div>

                      {/* IDENTITY MODULE */}
                      <div className="space-y-4 z-10">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                              <ScanLine size={12} /> Avatar Selection
                          </div>
                          
                          <div className="flex items-start gap-5">
                              {/* Selected Avatar Preview */}
                              <div className="shrink-0 relative group">
                                  <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-indigo-500 overflow-hidden relative shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                                      <img src={avatar || PRESET_AVATARS[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ imageRendering: 'pixelated' }} />
                                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent animate-[scan_2.5s_ease-in-out_infinite] pointer-events-none" />
                                  </div>
                              </div>

                              {/* Selection Grid */}
                              <div className="flex-1 grid grid-cols-4 gap-2 content-start">
                                  <button 
                                      onClick={() => fileInputRef.current?.click()}
                                      className="aspect-square rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center gap-1 hover:bg-slate-800 hover:border-indigo-500/50 transition-all group"
                                  >
                                      <Camera size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                  </button>

                                  {PRESET_AVATARS.slice(0, 7).map((url, idx) => (
                                      <button
                                          key={idx}
                                          onClick={() => { setAvatar(url); triggerHaptic('light'); playSound('tactile_select'); }}
                                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${avatar === url ? 'border-indigo-500 shadow-lg scale-95 opacity-50' : 'border-transparent bg-slate-900 opacity-80 hover:opacity-100 hover:scale-105'}`}
                                      >
                                          <img src={url} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                      </div>

                      {/* FORM FIELDS */}
                      <div className="space-y-3 z-10 mt-2">
                          <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1 flex items-center gap-2"><Cpu size={10} /> Codename</label>
                              <div className="bg-[#050505] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-indigo-500/50 focus-within:bg-black transition-all shadow-inner group">
                                  <span className="text-slate-600 font-bold text-xs group-focus-within:text-indigo-500 transition-colors">@</span>
                                  <input 
                                    type="text" 
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="RIDER_HANDLE"
                                    className="bg-transparent border-none outline-none text-xs font-bold text-white uppercase w-full placeholder:text-slate-700 tracking-widest"
                                  />
                              </div>
                          </div>

                          <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1 flex items-center gap-2"><Mail size={10} /> Uplink Address</label>
                              <div className="bg-[#050505] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-indigo-500/50 focus-within:bg-black transition-all shadow-inner group">
                                  <input 
                                    type="email" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="USER@NETWORK.COM"
                                    className="bg-transparent border-none outline-none text-xs font-bold text-white uppercase w-full placeholder:text-slate-700 tracking-widest"
                                  />
                              </div>
                          </div>

                          <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1 flex items-center gap-2"><Lock size={10} /> Secure Key</label>
                              <div className="bg-[#050505] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-indigo-500/50 focus-within:bg-black transition-all shadow-inner group">
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
                  </div>
              </div>
          )}

          {step === 2 && (
             <div className="flex flex-col h-full animate-view relative">
                <button onClick={prevStep} className="absolute top-0 right-0 p-2 -mr-2 text-slate-500 hover:text-white active:scale-95 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">BACK</span>
                </button>

                <div className="mb-8 pl-1 pt-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-3 leading-[0.85]">Riding<br/>Style</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Choose your riding discipline</p>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <button 
                            onClick={() => toggleDiscipline(Discipline.SKATE)}
                            className={`relative w-full h-40 rounded-[2.5rem] transition-all duration-300 flex flex-col justify-between overflow-hidden text-left p-6 group ${disciplines.includes(Discipline.SKATE) ? 'bg-[#312e81] shadow-[0_0_40px_rgba(49,46,129,0.4)] border border-indigo-500/50' : 'bg-[#0f1115] border border-white/5'}`}
                        >
                            {disciplines.includes(Discipline.SKATE) && (
                                <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-[#6366f1] rounded-full opacity-30 blur-2xl pointer-events-none" />
                            )}
                            
                            <div className="relative z-10 flex justify-between items-start w-full">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md transition-colors ${disciplines.includes(Discipline.SKATE) ? 'bg-white/20 text-white' : 'bg-slate-800/50 text-slate-500'}`}>
                                    <SkateboardIcon size={20} strokeWidth={2} />
                                </div>
                                {disciplines.includes(Discipline.SKATE) && (
                                    <div className="bg-[#8b8df2] text-[#1e1b4b] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                                        Selected
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-1">Skateboard</h3>
                                <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${disciplines.includes(Discipline.SKATE) ? 'text-indigo-200' : 'text-slate-600'}`}>Street • Park • Freestyle</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => toggleDiscipline(Discipline.DOWNHILL)}
                            className={`relative w-full h-40 rounded-[2.5rem] transition-all duration-300 flex flex-col justify-between overflow-hidden text-left p-6 group ${disciplines.includes(Discipline.DOWNHILL) ? 'bg-[#312e81] shadow-[0_0_40px_rgba(49,46,129,0.4)] border border-indigo-500/50' : 'bg-[#0f1115] border border-white/5'}`}
                        >
                            {disciplines.includes(Discipline.DOWNHILL) && (
                                <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-[#6366f1] rounded-full opacity-30 blur-2xl pointer-events-none" />
                            )}

                            <div className="relative z-10 flex justify-between items-start w-full">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md transition-colors ${disciplines.includes(Discipline.DOWNHILL) ? 'bg-white/20 text-white' : 'bg-slate-800/50 text-slate-500'}`}>
                                    <Mountain size={20} strokeWidth={2} />
                                </div>
                                {disciplines.includes(Discipline.DOWNHILL) && (
                                    <div className="bg-[#8b8df2] text-[#1e1b4b] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                                        Selected
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-1">Longboard</h3>
                                <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${disciplines.includes(Discipline.DOWNHILL) ? 'text-indigo-200' : 'text-slate-600'}`}>Downhill • Freeride</p>
                            </div>
                        </button>
                    </div>
                </div>
             </div>
          )}

          {step === 3 && (
             <div className="flex flex-col h-full animate-view relative">
                 <button onClick={prevStep} className="absolute top-0 right-0 p-2 -mr-2 text-slate-500 hover:text-white active:scale-95 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">BACK</span>
                 </button>

                 <div className="mt-4 mb-10 pl-1">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4 leading-[0.8] text-white drop-shadow-2xl">
                        Stance<br/>Check
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">
                        Which foot pushes forward?
                    </p>
                </div>
                
                <div className="flex-1 flex flex-col gap-4">
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
                                    relative w-full h-40 rounded-[2.5rem] flex items-center justify-between px-8 transition-all duration-500 group overflow-hidden border
                                    ${isSelected 
                                        ? 'bg-gradient-to-b from-gray-100 to-gray-400 text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.15)] scale-[1.02] z-10' 
                                        : 'bg-[#050608] border-white/5 text-slate-700 hover:border-white/10 hover:bg-[#0a0a0a]'
                                    }
                                `}
                            >
                                <div className="relative z-10 text-left">
                                    <h3 className={`text-4xl font-black italic uppercase tracking-tighter mb-2 ${isSelected ? 'text-black' : 'text-slate-800 group-hover:text-slate-600'}`}>
                                        {s.label}
                                    </h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isSelected ? 'text-slate-600' : 'text-slate-800'}`}>
                                        {s.sub}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
             </div>
          )}

          {/* UPDATED STEP 4: RETRO TACTICAL SCANNER */}
          {step === 4 && (
            <div className="flex flex-col h-full items-center justify-center animate-view text-center relative z-10">
                 <button onClick={prevStep} className="absolute top-0 right-0 p-2 -mr-2 text-slate-500 hover:text-white active:scale-95 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">BACK</span>
                 </button>

                 {/* Main Radar Container */}
                 <div className="relative mb-12 w-72 h-72">
                    
                    {/* Outer Rings */}
                    <div className="absolute inset-0 rounded-full border border-white/10 bg-[#020202] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
                        
                        {/* Grid Overlay */}
                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        
                        {/* Radar Sweep */}
                        <div className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(16,185,129,0.1)_300deg,rgba(16,185,129,0.5)_360deg)] ${isLocating ? 'animate-[spin_2s_linear_infinite]' : 'opacity-20'}`} />
                        
                        {/* Concentric Circles */}
                        <div className="absolute inset-[15%] rounded-full border border-white/5 border-dashed"></div>
                        <div className="absolute inset-[35%] rounded-full border border-white/5"></div>
                        <div className="absolute inset-[55%] rounded-full border border-white/5 border-dashed"></div>

                        {/* Blips (Dots) */}
                        {radarBlips.map(blip => (
                            <div 
                                key={blip.id}
                                className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399] animate-[ping_1s_ease-out_infinite]"
                                style={{ top: `${blip.y}%`, left: `${blip.x}%` }}
                            />
                        ))}
                    </div>

                    {/* Central Crosshair */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <Crosshair size={24} className={`${isLocating ? 'text-emerald-500' : 'text-slate-700'} transition-colors`} />
                    </div>
                    
                    {/* Tactical Markings */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-emerald-500/50">N</div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-emerald-500/50">S</div>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-mono text-emerald-500/50">W</div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-mono text-emerald-500/50">E</div>
                 </div>

                 {/* Text HUD */}
                 <div className="space-y-2 mb-10">
                     <div className="flex items-center justify-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${isLocating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                         <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                            {isLocating ? 'Acquiring Signal...' : 'Establish Uplink'}
                         </h2>
                     </div>
                     <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest max-w-[200px] mx-auto">
                        {isLocating 
                            ? 'Scanning local frequencies...'
                            : 'Connect to network to reveal spots.'
                        }
                     </p>
                 </div>

                 {/* Action Button */}
                 <div className="relative w-full max-w-xs group">
                     <button 
                       onClick={handleLocation}
                       disabled={isLocating}
                       className="relative w-full py-4 bg-white text-black rounded-sm font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-80 disabled:cursor-wait shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden"
                     >
                        {isLocating ? (
                            <>
                                <Loader2 className="animate-spin text-emerald-600" size={14} />
                                <span className="text-emerald-900">TRIANGULATING...</span>
                            </>
                        ) : (
                            <>
                                <Radar size={14} strokeWidth={2.5} />
                                <span>INITIALIZE SCAN</span>
                            </>
                        )}
                     </button>
                 </div>
                 
                 {/* Manual Entry */}
                 <div className="mt-8 w-full max-w-[200px] relative group">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="text-[8px] font-mono text-slate-600">MANUAL_OVERRIDE</span>
                        <div className="flex gap-0.5">
                            <div className="w-0.5 h-2 bg-slate-800"></div>
                            <div className="w-0.5 h-2 bg-slate-800"></div>
                            <div className="w-0.5 h-2 bg-slate-800"></div>
                        </div>
                    </div>
                    <input 
                        type="text"
                        placeholder="ENTER SECTOR ID"
                        className="w-full bg-transparent py-2 text-center text-[10px] font-bold text-slate-500 focus:text-white focus:outline-none transition-colors uppercase placeholder:text-slate-800 tracking-widest font-mono"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualLocationSubmit()}
                    />
                 </div>
            </div>
          )}

      </div>

      {step > 0 && step < 4 && (
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
                NEXT STEP
                <ArrowRight size={20} strokeWidth={2.5} />
              </button>
          </div>
      )}
    </div>
  );
};

export default OnboardingView;
