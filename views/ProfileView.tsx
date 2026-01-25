
import React, { useState, useEffect } from 'react';
import { Settings, Lock, Shield, Trophy, Zap, Users, MapPin, ChevronRight, Crown, Crosshair, BarChart3, Plus, Hexagon, Medal, Award, Activity, ShieldCheck, User as UserIcon, LogOut, Bell, Volume2, ShieldAlert, UserCog, X, Save, Type, Footprints } from 'lucide-react';
import { backend } from '../services/mockBackend';
import { User as UserType, Crew, Discipline } from '../types';
import { COLLECTIBLES_DATABASE, MOCK_CHALLENGES } from '../constants';
import { triggerHaptic } from '../utils/haptics';
import { useAppStore } from '../store';
import { playSound } from '../utils/audio';

interface ProfileViewProps {
  onLogout: () => void;
  setActiveTab: (tab: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onLogout, setActiveTab }) => {
  const { user, updateUser } = useAppStore();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'locker'>('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
      name: '',
      bio: '',
      stance: 'regular' as 'regular' | 'goofy'
  });

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
        if (user?.crewId) {
            const c = await backend.getUserCrew(user.crewId);
            setCrew(c);
        }
    };
    loadData();
  }, [user]);

  // Initialize edit form when settings open
  useEffect(() => {
      if (showSettings && user) {
          setEditForm({
              name: user.name,
              bio: user.bio || '',
              stance: user.stance || 'regular'
          });
          setIsEditing(false);
      }
  }, [showSettings, user]);

  const handleSaveProfile = async () => {
      if (!user) return;
      triggerHaptic('success');
      playSound('success');
      
      const updatedUser = { 
          ...user, 
          name: editForm.name,
          bio: editForm.bio,
          stance: editForm.stance
      };
      
      await backend.updateUser(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
  };

  if (!user) return null;

  const nextLevelXp = user.level * 1000;
  const progress = (user.xp / nextLevelXp) * 100;
  const battlesWon = user.completedChallengeIds.length;
  const worldRank = Math.max(1, 1420 - Math.floor(user.xp / 100)); 

  const handleSectionChange = (section: 'overview' | 'locker') => {
      triggerHaptic('medium');
      setActiveSection(section);
  };

  const navigateToCrew = () => {
      triggerHaptic('medium');
      setActiveTab('crew');
  };

  const handleLogout = () => {
      triggerHaptic('medium');
      setShowSettings(false);
      onLogout();
  };

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#020202] pb-32 relative">
       {/* Background Layers */}
       <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
       <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

       {/* --- HEADER --- */}
       <div className="relative pt-[calc(env(safe-area-inset-top)+2rem)] px-6 pb-6 z-10">
           <div className="flex justify-between items-start mb-6">
               <div className="flex flex-col">
                   <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Operative ID</span>
                   <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                       {user.name}
                   </h1>
                   <div className="flex items-center gap-2 mt-2">
                       <span className="px-2 py-0.5 bg-indigo-600 rounded text-[9px] font-bold uppercase text-white tracking-widest shadow-[0_0_8px_rgba(79,70,229,0.3)]">
                           Level {user.level}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                           <MapPin size={10} /> {user.location}
                       </span>
                   </div>
               </div>
               
               <button 
                 onClick={() => { setShowSettings(true); triggerHaptic('light'); }} 
                 className="w-10 h-10 bg-[#0b0c10] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
               >
                  <Settings size={18} />
               </button>
           </div>

           <div className="flex gap-6 items-center">
               <div className="relative w-24 h-24 shrink-0">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl rotate-3 blur-sm opacity-50"></div>
                   <div className="relative w-full h-full bg-[#0b0c10] rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
                       <img src={user.avatar} className="w-full h-full object-cover" />
                   </div>
                   <div className="absolute -bottom-3 -right-3 bg-black border border-slate-800 rounded-lg p-1.5 shadow-lg">
                       {user.stance === 'regular' ? <span className="text-[8px] font-black uppercase text-white block">REG</span> : <span className="text-[8px] font-black uppercase text-white block">GOOFY</span>}
                   </div>
               </div>

               <div className="flex-1 space-y-2">
                   <div className="flex justify-between items-end">
                       <span className="text-[9px] font-bold uppercase text-indigo-400 tracking-widest">Experience</span>
                       <span className="text-[10px] font-mono font-bold text-white">{user.xp} <span className="text-slate-600">/</span> {nextLevelXp}</span>
                   </div>
                   <div className="h-2.5 w-full bg-[#0b0c10] rounded-full overflow-hidden border border-white/10 relative">
                       <div className="absolute inset-0 bg-slate-800/50" />
                       <div 
                         className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-all duration-1000 ease-out relative" 
                         style={{ width: `${mounted ? progress : 0}%` }} 
                       >
                           <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/50" />
                       </div>
                   </div>
                   <p className="text-[8px] text-slate-500 font-medium uppercase tracking-wide text-right">
                       {Math.round(nextLevelXp - user.xp)} XP to Level {user.level + 1}
                   </p>
               </div>
           </div>
       </div>

       {/* --- NAVIGATION TABS --- */}
       <div className="px-6 mb-6 relative z-10">
           <div className="flex bg-[#0b0c10] p-1 rounded-2xl border border-white/5 backdrop-blur-md">
               <button 
                 onClick={() => handleSectionChange('overview')}
                 className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${activeSection === 'overview' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <Activity size={14} strokeWidth={2.5} /> Overview
               </button>
               <button 
                 onClick={() => handleSectionChange('locker')}
                 className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${activeSection === 'locker' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <Shield size={14} strokeWidth={2.5} /> Locker
               </button>
           </div>
       </div>

       {/* --- OVERVIEW CONTENT --- */}
       {activeSection === 'overview' && (
           <div className="px-6 space-y-6 animate-view relative z-10">
               
               {/* Stats Grid */}
               <div className="grid grid-cols-3 gap-3">
                   <div className="bg-[#0b0c10] border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:border-indigo-500/30 transition-colors">
                       <div className="text-yellow-500 mb-1 group-hover:scale-110 transition-transform"><Crown size={20} /></div>
                       <div className="text-xl font-black text-white leading-none">#{worldRank}</div>
                       <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Global</div>
                   </div>
                   <div className="bg-[#0b0c10] border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:border-indigo-500/30 transition-colors">
                       <div className="text-blue-400 mb-1 group-hover:scale-110 transition-transform"><Zap size={20} /></div>
                       <div className="text-xl font-black text-white leading-none">{user.streak}</div>
                       <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Streak</div>
                   </div>
                   <div className="bg-[#0b0c10] border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:border-indigo-500/30 transition-colors">
                       <div className="text-red-400 mb-1 group-hover:scale-110 transition-transform"><Crosshair size={20} /></div>
                       <div className="text-xl font-black text-white leading-none">{battlesWon}</div>
                       <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Wins</div>
                   </div>
               </div>

               {/* Rider Identity Card (New) */}
               <section className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-5">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-black uppercase italic text-white tracking-widest flex items-center gap-2">
                           <UserIcon size={14} className="text-indigo-500" /> Rider Profile
                       </h3>
                   </div>
                   
                   {user.bio && (
                       <div className="mb-4">
                           <p className="text-xs text-slate-400 font-medium italic border-l-2 border-slate-800 pl-3">"{user.bio}"</p>
                       </div>
                   )}

                   <div className="space-y-3">
                       {user.deckDetails?.skate && (
                           <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Street Setup</span>
                               <span className="text-xs font-black text-white">{user.deckDetails.skate} Deck</span>
                           </div>
                       )}
                       {user.deckDetails?.downhill && (
                           <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Downhill Setup</span>
                               <span className="text-xs font-black text-white">{user.deckDetails.downhill} Deck</span>
                           </div>
                       )}
                       {/* Fallback if no specific details but discipline exists */}
                       {!user.deckDetails && (
                           <div className="text-center py-2">
                               <p className="text-[9px] text-slate-600 uppercase">No gear details logged.</p>
                           </div>
                       )}
                   </div>
               </section>

               {/* Crew Card */}
               <div onClick={navigateToCrew} className="group relative w-full aspect-[2.5/1] rounded-3xl overflow-hidden cursor-pointer shadow-2xl transition-transform active:scale-[0.98]">
                   {crew ? (
                       <>
                           <img src="https://images.unsplash.com/photo-1621360841013-c768371e93cf?w=800" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity" />
                           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                           <div className="absolute inset-0 p-6 flex flex-col justify-center">
                               <div className="flex items-center gap-4">
                                   <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                       {crew.avatar}
                                   </div>
                                   <div>
                                       <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                           <ShieldCheck size={10} /> Active Unit
                                       </div>
                                       <h3 className="text-2xl font-black italic text-white uppercase leading-none tracking-tight">{crew.name}</h3>
                                       <p className="text-[10px] text-slate-300 font-bold mt-1 uppercase tracking-wider">{crew.city} • Lvl {crew.level}</p>
                                   </div>
                               </div>
                           </div>
                           <div className="absolute right-4 bottom-4">
                               <div className="bg-black/40 backdrop-blur rounded-full p-2 text-white border border-white/10 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-colors">
                                   <ChevronRight size={16} />
                               </div>
                           </div>
                       </>
                   ) : (
                       <div className="absolute inset-0 bg-[#0b0c10] border-2 border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-slate-900 hover:border-slate-700 transition-all">
                           <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-indigo-600 transition-all shadow-lg">
                               <Plus size={20} />
                           </div>
                           <div className="text-center">
                               <h3 className="text-sm font-black text-white uppercase italic">No Allegiance</h3>
                               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Join or Create a Crew</p>
                           </div>
                       </div>
                   )}
               </div>

               {/* Battle Log */}
               <section>
                   <div className="flex justify-between items-end mb-3">
                       <h3 className="text-sm font-black uppercase italic text-white tracking-widest flex items-center gap-2">
                           <Medal size={16} className="text-indigo-500" /> Battle Log
                       </h3>
                       <button className="text-[9px] font-bold text-slate-600 uppercase tracking-widest hover:text-white">View All</button>
                   </div>
                   
                   <div className="space-y-3">
                       {user.completedChallengeIds.length > 0 ? (
                           user.completedChallengeIds.slice(0, 3).map((id) => {
                               const challenge = MOCK_CHALLENGES.find(c => c.id === id);
                               if (!challenge) return null;
                               return (
                                   <div key={id} className="flex items-center gap-4 bg-[#0b0c10] p-4 rounded-2xl border border-white/5 hover:bg-slate-900 transition-colors">
                                       <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 border border-green-500/20 shrink-0">
                                           <Trophy size={18} />
                                       </div>
                                       <div className="flex-1 min-w-0">
                                           <h4 className="text-xs font-black uppercase italic text-white truncate">{challenge.title}</h4>
                                           <div className="flex items-center gap-3 mt-1">
                                               <span className="text-[8px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wide">Victory</span>
                                               <span className="text-[8px] font-mono text-slate-500">+{challenge.xpReward} XP</span>
                                           </div>
                                       </div>
                                   </div>
                               )
                           })
                       ) : (
                           <div className="p-6 text-center border border-white/5 rounded-2xl bg-[#0b0c10]">
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No combat data recorded.</p>
                           </div>
                       )}
                   </div>
               </section>
           </div>
       )}

       {/* --- LOCKER CONTENT --- */}
       {activeSection === 'locker' && (
           <div className="px-6 animate-view relative z-10">
               <div className="grid grid-cols-2 gap-4">
                   {COLLECTIBLES_DATABASE.map(item => {
                       const unlocked = user.locker.includes(item.id);
                       return (
                           <div 
                             key={item.id} 
                             className={`aspect-[4/5] bg-[#0b0c10] rounded-[2rem] relative border transition-all duration-300 group overflow-hidden ${unlocked ? 'border-indigo-500/30 shadow-2xl' : 'border-slate-800 opacity-60'}`}
                           >
                               <div className={`absolute inset-0 bg-gradient-to-b ${unlocked ? 'from-indigo-900/20 to-black' : 'from-transparent to-black'} z-0`} />
                               
                               <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
                                   <img 
                                     src={item.imageUrl} 
                                     className={`w-full h-full object-contain transition-transform duration-500 ${unlocked ? 'group-hover:scale-110 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]' : 'grayscale blur-[2px] opacity-50'}`} 
                                   />
                               </div>

                               {!unlocked && (
                                   <div className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center border border-white/10">
                                       <Lock size={14} className="text-slate-400" />
                                   </div>
                               )}
                               
                               <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                                   <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/5 text-center">
                                       <p className={`text-[9px] font-black uppercase tracking-widest truncate ${unlocked ? 'text-white' : 'text-slate-600'}`}>
                                           {item.name}
                                       </p>
                                       {unlocked && <p className="text-[7px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">{item.rarity}</p>}
                                   </div>
                               </div>
                           </div>
                       )
                   })}
                   
                   {/* Empty Slots */}
                   {[...Array(4)].map((_, i) => (
                       <div key={i} className="aspect-[4/5] bg-[#0b0c10] rounded-[2rem] border border-white/5 flex flex-col items-center justify-center gap-2">
                           <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-700">
                               <Plus size={16} />
                           </div>
                           <span className="text-[8px] font-bold uppercase text-slate-700 tracking-widest">Empty Slot</span>
                       </div>
                   ))}
               </div>
           </div>
       )}

       {/* --- SETTINGS MODAL --- */}
       {showSettings && (
         <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-view" onClick={() => setShowSettings(false)}>
            <div className="w-full max-w-sm bg-[#1a1a1a] border-t md:border border-white/10 rounded-t-[2rem] md:rounded-[2rem] p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black italic uppercase text-white tracking-tight">{isEditing ? 'EDIT PROFILE' : 'SYSTEM CONFIG'}</h3>
                    <button onClick={() => { setIsEditing(false); setShowSettings(false); }} className="p-2 bg-black/40 rounded-full text-slate-400 hover:text-white active:scale-95 transition-transform"><X size={20} /></button>
                </div>

                {isEditing ? (
                    <div className="space-y-4 animate-view">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                                <Type size={12} /> Codename
                            </label>
                            <input 
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 uppercase"
                                placeholder="ENTER NAME"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                                <Type size={12} /> Bio
                            </label>
                            <textarea 
                                value={editForm.bio}
                                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 resize-none h-24"
                                placeholder="ENTER BIO..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                                <Footprints size={12} /> Stance
                            </label>
                            <div className="flex bg-[#0b0c10] p-1 rounded-xl border border-white/10">
                                {['regular', 'goofy'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setEditForm({...editForm, stance: s as any})}
                                        className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${editForm.stance === s ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                            <button onClick={handleSaveProfile} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                                <Save size={14} /> Save Config
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Options */}
                        <div className="space-y-2">
                            <button onClick={() => setIsEditing(true)} className="w-full p-4 bg-[#0b0c10] border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-slate-900 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all"><UserCog size={18} /></div>
                                <div className="text-left flex-1"><div className="text-sm font-bold text-white uppercase">Edit Identity</div><div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Update Profile Data</div></div>
                                <ChevronRight size={16} className="text-slate-600" />
                            </button>

                            <div className="flex gap-2">
                                <button className="flex-1 p-4 bg-[#0b0c10] border border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-900 transition-colors">
                                    <Bell size={20} className="text-slate-400" />
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Alerts: ON</span>
                                </button>
                                <button className="flex-1 p-4 bg-[#0b0c10] border border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-900 transition-colors">
                                    <Volume2 size={20} className="text-slate-400" />
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SFX: ON</span>
                                </button>
                            </div>

                            {user.isAdmin && (
                                <button onClick={() => setActiveTab('admin')} className="w-full p-4 bg-[#0b0c10] border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-slate-900 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 group-hover:text-white group-hover:bg-amber-600 transition-all"><ShieldAlert size={18} /></div>
                                    <div className="text-left flex-1"><div className="text-sm font-bold text-white uppercase">Admin Console</div><div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Restricted Access</div></div>
                                    <ChevronRight size={16} className="text-slate-600" />
                                </button>
                            )}

                            <div className="h-px bg-white/5 my-2" />

                            <button onClick={handleLogout} className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 hover:bg-red-500/20 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all"><LogOut size={18} /></div>
                                <div className="text-left flex-1"><div className="text-sm font-bold text-red-400 uppercase">Terminate Session</div><div className="text-[9px] font-bold text-red-500/50 uppercase tracking-widest">Log Out</div></div>
                            </button>
                        </div>
                        
                        <div className="mt-6 text-center">
                            <p className="text-[8px] font-mono text-slate-600 uppercase">PUSH OS v1.8 // ID: {user.id}</p>
                        </div>
                    </>
                )}
            </div>
         </div>
       )}
    </div>
  );
};

export default ProfileView;
