
import React, { useState, useRef, useMemo } from 'react';
import { Discipline, Difficulty, Skill } from '../types';
import { SKILL_LIBRARY, RETRO_AVATARS } from '../constants';
import { MapPin, Check, ChevronRight, Loader2, Target, Zap, Mountain, Camera, User as UserIcon, Upload, ShieldCheck, Globe, Info } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';

interface OnboardingViewProps {
  onComplete: (data: any) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [disciplines, setDisciplines] = useState<Discipline[]>([Discipline.SKATE]);
  const [stance, setStance] = useState<'regular' | 'goofy'>('regular');
  const [location, setLocation] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [selectedTricks, setSelectedTricks] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDiscipline = (d: Discipline) => {
    triggerHaptic('light');
    if (disciplines.includes(d)) {
      if (disciplines.length > 1) {
        setDisciplines(disciplines.filter(item => item !== d));
      }
    } else {
      setDisciplines([...disciplines, d]);
    }
  };

  const handleLocation = () => {
    setIsLocating(true);
    triggerHaptic('medium');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        // Mocking city resolution from coordinates for this prototype
        setTimeout(() => {
           setLocation('Verified Region');
           setIsLocating(false);
           triggerHaptic('success');
           setStep(4); // Auto-advance past location
        }, 1200);
      }, () => {
          setIsLocating(false);
          setShowManualInput(true);
      });
    } else {
      setIsLocating(false);
      setShowManualInput(true);
    }
  };

  const handleSkipLocation = () => {
    setLocation('India');
    setStep(4);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTrick = (skillId: string) => {
    triggerHaptic('light');
    if (selectedTricks.includes(skillId)) {
      setSelectedTricks(prev => prev.filter(id => id !== skillId));
    } else {
      if (selectedTricks.length < 3) {
        setSelectedTricks(prev => [...prev, skillId]);
      }
    }
  };

  const availableSkills = useMemo(() => {
    return SKILL_LIBRARY.filter(s => disciplines.includes(s.category));
  }, [disciplines]);

  const handleFinalize = () => {
    triggerHaptic('success');
    playSound('success');
    
    const startingXp = selectedTricks.length * 500;
    const startingLevel = 1 + Math.floor(startingXp / 1000);

    onComplete({
      name: username || 'New Rider',
      bio: bio,
      location: location || 'India',
      disciplines: disciplines,
      avatar: avatar,
      stance: stance,
      level: startingLevel,
      xp: startingXp,
      masteredCount: selectedTricks.length,
      locker: selectedTricks
    });
  };

  const nextStep = () => {
      triggerHaptic('light');
      setStep(step + 1);
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-8 animate-view overflow-y-auto relative">
      <div className="w-full max-w-sm flex flex-col py-10 relative z-10">
        <div className="space-y-8">
          {/* Progress Header */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-start items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'w-10 bg-indigo-500' : 'w-4 bg-slate-900'}`} />
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Step 0{step} / 05</p>
          </div>

          {/* STEP 1: DISCIPLINE */}
          {step === 1 && (
            <div className="space-y-8 animate-view">
              <div className="space-y-3">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">Pick Your<br/>Discipline.</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic opacity-80">What kind of boards are we pushing?</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: Discipline.SKATE, label: 'Skateboarding', icon: <Zap size={24} strokeWidth={2.5} fill="currentColor" />, desc: 'Street, Park, & Technical' },
                  { id: Discipline.DOWNHILL, label: 'Downhill', icon: <Mountain size={24} strokeWidth={2.5} />, desc: 'High-speed Longboarding' }
                ].map(d => {
                  const isSelected = disciplines.includes(d.id as Discipline);
                  return (
                    <button 
                      key={d.id}
                      onClick={() => toggleDiscipline(d.id as Discipline)}
                      className={`p-4 rounded-[2rem] border-2 text-left transition-all duration-300 relative overflow-hidden group ${
                        isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-[1.02]' 
                        : 'bg-slate-900/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                            {d.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-black uppercase italic text-white tracking-tight">{d.label}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d.desc}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 mr-2">
                            <Check size={16} strokeWidth={4} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: STANCE */}
          {step === 2 && (
            <div className="space-y-8 animate-view">
              <div className="space-y-3">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">Identify Your<br/>Stance.</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic opacity-80">Which foot do you lead with?</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'regular', label: 'Regular', desc: 'Left foot forward' },
                  { id: 'goofy', label: 'Goofy', desc: 'Right foot forward' }
                ].map(s => {
                  const isSelected = stance === s.id;
                  return (
                    <button 
                      key={s.id}
                      onClick={() => { triggerHaptic('light'); setStance(s.id as any); }}
                      className={`p-6 rounded-[2rem] border-2 text-left transition-all duration-300 relative overflow-hidden group ${
                        isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-xl scale-[1.02]' 
                        : 'bg-slate-900/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                            <h4 className="text-2xl font-black uppercase italic text-white tracking-tight">{s.label}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Check size={16} strokeWidth={4} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION */}
          {step === 3 && (
            <div className="space-y-8 animate-view flex flex-col items-center text-center pt-4">
              <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center relative mb-2">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping opacity-75" />
                <div className="absolute inset-0 border border-indigo-500/20 rounded-full" />
                <MapPin size={48} className="text-indigo-500 relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">Enable Spot<br/>Radar</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                  PUSH needs your location to show <span className="text-white font-bold">hidden spots</span> and <span className="text-white font-bold">active crews</span> near you.
                </p>
                <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
                  <ShieldCheck size={12} className="text-green-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Privacy focused</span>
                </div>
              </div>
              
              <div className="w-full space-y-4 pt-4">
                 <button 
                  onClick={handleLocation}
                  disabled={isLocating}
                  className={`w-full py-5 bg-white text-black rounded-3xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(255,255,255,0.15)] ${isLocating ? 'opacity-80 cursor-wait' : ''}`}
                >
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mb-0.5 fill-black" />}
                  {isLocating ? 'Scanning Area...' : 'Allow Location Access'}
                </button>

                {!showManualInput ? (
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowManualInput(true)}
                      className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Enter City Manually
                    </button>
                    <div className="h-4"></div>
                    <button 
                      onClick={handleSkipLocation}
                      className="text-slate-700 text-[9px] font-bold uppercase tracking-widest hover:text-slate-500 transition-colors"
                    >
                      Skip for now
                    </button>
                  </div>
                ) : (
                  <div className="animate-view space-y-3 w-full">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Globe size={14} className="text-indigo-500" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Type your city..."
                        autoFocus
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-bold"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: IDENTITY */}
          {step === 4 && (
            <div className="space-y-8 animate-view">
              <div className="space-y-3">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">Create Your<br/>Identity.</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic opacity-80">This is how the network sees you.</p>
              </div>
              
              <div className="space-y-6 flex flex-col items-center">
                {/* Avatar Selection */}
                <div className="relative group">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-900 flex items-center justify-center cursor-pointer overflow-hidden relative shadow-2xl hover:border-indigo-500 transition-colors"
                  >
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={40} className="text-slate-700" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {!avatar && <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">Tap to Upload</p>}
                </div>

                {/* Retro Presets */}
                <div className="w-full space-y-2">
                   <p className="text-center text-[8px] font-black uppercase tracking-widest text-slate-600">Or Pick a Classic</p>
                   <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-1 justify-start md:justify-center">
                      {RETRO_AVATARS.map((url, i) => (
                        <button 
                          key={i}
                          onClick={() => { triggerHaptic('light'); setAvatar(url); }}
                          className={`w-12 h-12 rounded-full border-2 bg-slate-800 shrink-0 overflow-hidden transition-all ${avatar === url ? 'border-indigo-500 scale-110 shadow-lg' : 'border-slate-700 opacity-60 hover:opacity-100'}`}
                        >
                           <img src={url} className="w-full h-full object-cover" alt="Retro" />
                        </button>
                      ))}
                   </div>
                </div>

                <div className="w-full space-y-4">
                  <input 
                    type="text" 
                    placeholder="Enter Name"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-bold italic"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                  <textarea 
                    placeholder="Brief bio (your vibe...)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                    value={bio}
                    rows={2}
                    onChange={e => setBio(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: TRICKS */}
          {step === 5 && (
            <div className="space-y-6 animate-view flex flex-col">
              <div className="space-y-3 shrink-0">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">What's on<br/>Lock?</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic opacity-80">Select up to 3 mastered tricks to jumpstart your Rank.</p>
              </div>

              <div className="space-y-2 pr-1 max-h-[45vh] overflow-y-auto hide-scrollbar">
                 {availableSkills.map(skill => {
                   const isSelected = selectedTricks.includes(skill.id);
                   return (
                     <button
                       key={skill.id}
                       onClick={() => toggleTrick(skill.id)}
                       disabled={!isSelected && selectedTricks.length >= 3}
                       className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                         isSelected 
                           ? 'bg-indigo-500/10 border-indigo-500' 
                           : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800'
                       } ${(!isSelected && selectedTricks.length >= 3) ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                            skill.difficulty === Difficulty.ADVANCED ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                            skill.difficulty === Difficulty.INTERMEDIATE ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' :
                            'border-green-500/30 text-green-500 bg-green-500/10'
                          }`}>
                            {skill.difficulty.substring(0,1)}
                          </div>
                          <div>
                             <h4 className={`text-sm font-black uppercase italic leading-none ${isSelected ? 'text-white' : 'text-slate-400'}`}>{skill.name}</h4>
                             <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{skill.category}</span>
                          </div>
                       </div>
                       {isSelected && <div className="bg-indigo-500 text-white p-1 rounded-full"><Check size={12} strokeWidth={4} /></div>}
                     </button>
                   )
                 })}
              </div>
              
              <div className="bg-slate-900/80 p-4 rounded-2xl text-center shrink-0 border border-slate-800">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
                   Starting Rank: <span className="text-indigo-400 font-black text-sm">LVL {1 + Math.floor((selectedTricks.length * 500) / 1000)}</span>
                 </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation CTA */}
        <div className="pt-8 shrink-0">
          {(step !== 3 || showManualInput) && (
            <button 
              onClick={step === 5 ? handleFinalize : nextStep}
              disabled={
                  (step === 3 && !location && !isLocating) || 
                  (step === 4 && !username)
              }
              className={`w-full h-18 bg-indigo-500 py-5 rounded-3xl font-black uppercase italic tracking-[0.2em] text-sm text-white shadow-2xl active:scale-[0.96] transition-all flex items-center justify-center gap-3 ${
                ((step === 3 && !location && !isLocating) || (step === 4 && !username)) ? 'opacity-50 grayscale cursor-not-allowed' : ''
              }`}
            >
              {step === 5 ? 'Enter Network' : 'Continue'} <ChevronRight size={20} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
