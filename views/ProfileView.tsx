
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Lock, Shield, Trophy, Zap, Users, MapPin, ChevronRight, Crown, Crosshair, BarChart3, Plus, Activity, User as UserIcon, LogOut, Bell, Volume2, UserCog, X, Save, Type, Footprints, History, Hexagon, Star } from 'lucide-react';
import { backend } from '../services/mockBackend';
import { User as UserType, Crew, BadgeTier } from '../types';
import { COLLECTIBLES_DATABASE, BADGE_DATABASE } from '../constants';
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
  const [activeSection, setActiveSection] = useState<'overview' | 'badges' | 'history'>('overview');
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

  // Progression Maths
  // Formula: Next Level XP = 100 + (Level * 40)
  // To visualize progress bar, we need XP earned within *current* level vs total required for *next*.
  // For simplicity in mock, we'll just use a direct calculation relative to threshold.
  // Note: user.xp is Cumulative.
  
  // Re-calculate thresholds for accurate bar
  let xpAccumulated = 0;
  for(let i=1; i < user.level; i++) {
      xpAccumulated += 100 + (i * 40);
  }
  const xpRequiredForCurrentLevel = xpAccumulated;
  const xpRequiredForNextLevel = 100 + (user.level * 40);
  
  const xpInCurrentLevel = user.xp - xpRequiredForCurrentLevel;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForNextLevel) * 100));

  const handleSectionChange = (section: 'overview' | 'badges' | 'history') => {
      triggerHaptic('medium');
      setActiveSection(section);
  };

  const handleLogout = () => {
      triggerHaptic('medium');
      setShowSettings(false);
      onLogout();
  };

  const navigateToCrew = () => {
      triggerHaptic('light');
      // Fix: Ensure we pass 'CREW' uppercase
      setActiveTab('CREW');
  };

  // Badge Visual Logic
  const getTierColor = (tier: BadgeTier) => {
      switch(tier) {
          case BadgeTier.ROOKIE: return 'text-amber-700'; // Bronze
          case BadgeTier.INITIATE: return 'text-slate-400'; // Silver
          case BadgeTier.SKILLED: return 'text-yellow-400'; // Gold
          case BadgeTier.VETERAN: return 'text-purple-400'; // Platinum
          case BadgeTier.LEGEND: return 'text-red-500'; // Onyx/Red
          default: return 'text-slate-500';
      }
  };

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#020202] pb-32 relative">
       {/* Background Layers */}
       <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
       <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

       {/* --- HEADER (IDENTITY) --- */}
       <div className="relative pt-[calc(env(safe-area-inset-top)+2rem)] px-6 pb-6 z-10">
           <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-4">
                   {/* Avatar */}
                   <div className="relative w-20 h-20 shrink-0">
                       <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl rotate-3 blur-sm opacity-50"></div>
                       <div className="relative w-full h-full bg-[#0b0c10] rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
                           <img src={user.avatar} className="w-full h-full object-cover" />
                       </div>
                   </div>
                   
                   {/* Name & Title */}
                   <div>
                       <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none mb-1">
                           {user.name}
                       </h1>
                       <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                               <MapPin size={10} /> {user.location}
                           </span>
                           <span className="w-1 h-1 bg-slate-700 rounded-full" />
                           <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                               {user.level > 30 ? 'Legend' : user.level > 15 ? 'Veteran' : user.level > 5 ? 'Skater' : 'Rookie'}
                           </span>
                       </div>
                   </div>
               </div>
               
               <button 
                 onClick={() => { setShowSettings(true); triggerHaptic('light'); }} 
                 className="w-10 h-10 bg-[#0b0c10] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
               >
                  <Settings size={18} />
               </button>
           </div>

           {/* --- XP BAR (PROGRESSION) --- */}
           <div className="mb-2">
               <div className="flex justify-between items-end mb-1">
                   <div className="flex items-baseline gap-1">
                       <span className="text-4xl font-black text-white italic leading-none">{user.level}</span>
                       <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Current Level</span>
                   </div>
                   <div className="text-right">
                       <span className="text-[10px] font-mono font-bold text-indigo-400">{Math.floor(xpInCurrentLevel)} / {xpRequiredForNextLevel} XP</span>
                   </div>
               </div>
               <div className="h-3 w-full bg-[#0b0c10] rounded-full overflow-hidden border border-white/10 relative">
                   <div className="absolute inset-0 bg-slate-800/30" />
                   <div 
                     className="h-full bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.6)] transition-all duration-1000 ease-out relative" 
                     style={{ width: `${mounted ? progressPercent : 0}%` }} 
                   >
                       <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/50" />
                   </div>
               </div>
               <p className="text-[8px] text-slate-500 font-medium uppercase tracking-wide text-right mt-1">
                   {Math.ceil(xpRequiredForNextLevel - xpInCurrentLevel)} XP to Level {user.level + 1}
               </p>
           </div>
       </div>

       {/* --- NAVIGATION TABS --- */}
       <div className="px-6 mb-6 relative z-10">
           <div className="flex bg-[#0b0c10] p-1 rounded-2xl border border-white/5 backdrop-blur-md">
               <button 
                 onClick={() => handleSectionChange('overview')}
                 className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${activeSection === 'overview' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <Activity size={14} strokeWidth={2.5} /> Overview
               </button>
               <button 
                 onClick={() => handleSectionChange('badges')}
                 className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${activeSection === 'badges' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <Shield size={14} strokeWidth={2.5} /> Badges
               </button>
               <button 
                 onClick={() => handleSectionChange('history')}
                 className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${activeSection === 'history' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <History size={14} strokeWidth={2.5} /> History
               </button>
           </div>
       </div>

       {/* --- OVERVIEW CONTENT --- */}
       {activeSection === 'overview' && (
           <div className="px-6 space-y-6 animate-view relative z-10">
               
               {/* Stats Grid */}
               <div className="grid grid-cols-3 gap-3">
                   <div className="bg-[#0b0c10] border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:border-indigo-500/30 transition-colors">
                       <div className="text-yellow-500 mb-1 group-hover:scale-110 transition-transform"><Zap size={20} /></div>
                       <div className="text-xl font-black text-white leading-none">{user.streak}</div>
                       <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Day Streak</div>
                   </div>
                   <div className="bg-[#0b0c10] border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:border-indigo-500/30 transition-colors">
                       <div className="text-blue-400 mb-1 group-hover:scale-110 transition-transform"><Trophy size={20} /></div>
                       <div className="text-xl font-black text-white leading-none">{user.completedChallengeIds.length}</div>
                       <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Wins</div>
                   </div>
                   <div className="bg-[#0b0c10] border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:border-indigo-500/30 transition-colors">
                       <div className="text-green-400 mb-1 group-hover:scale-110 transition-transform"><Star size={20} /></div>
                       <div className="text-xl font-black text-white leading-none">{user.xp.toLocaleString()}</div>
                       <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Total XP</div>
                   </div>
               </div>

               {/* Rider Stats Card */}
               <section className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-5">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-black uppercase italic text-white tracking-widest flex items-center gap-2">
                           <UserIcon size={14} className="text-indigo-500" /> Identity Data
                       </h3>
                   </div>
                   
                   {user.bio && (
                       <div className="mb-4">
                           <p className="text-xs text-slate-400 font-medium italic border-l-2 border-slate-800 pl-3">"{user.bio}"</p>
                       </div>
                   )}

                   <div className="space-y-3">
                       <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sessions Logged</span>
                           <span className="text-xs font-black text-white">{user.stats?.totalSessions || 0}</span>
                       </div>
                       <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Stance</span>
                           <span className="text-xs font-black text-white uppercase">{user.stance}</span>
                       </div>
                   </div>
               </section>

               {/* Crew Status */}
               <div onClick={navigateToCrew} className="w-full bg-[#0b0c10] rounded-[2rem] border border-white/10 p-1 pr-6 flex items-center gap-4 relative overflow-hidden group cursor-pointer shadow-lg active:scale-[0.98] transition-all">
                  {crew ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-transparent to-transparent opacity-50" />
                        <div className="w-20 h-20 bg-slate-900 rounded-[1.7rem] flex items-center justify-center text-3xl border border-white/5 relative z-10">
                            {crew.avatar}
                        </div>
                        <div className="flex-1 relative z-10">
                            <div className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-1">Active Unit</div>
                            <h3 className="text-xl font-black italic uppercase text-white tracking-tight">{crew.name}</h3>
                            <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Lvl {crew.level} • {crew.city}</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-500 relative z-10" />
                      </>
                  ) : (
                      <div className="w-full p-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500"><Users size={20} /></div>
                              <div>
                                  <h3 className="text-sm font-black italic uppercase text-white">No Unit</h3>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Join a Crew</p>
                              </div>
                          </div>
                          <Plus size={18} className="text-indigo-500" />
                      </div>
                  )}
               </div>
           </div>
       )}

       {/* --- BADGES CONTENT --- */}
       {activeSection === 'badges' && (
           <div className="px-6 animate-view relative z-10 pb-6">
               <div className="grid grid-cols-2 gap-3">
                   {BADGE_DATABASE.map(badge => {
                       const isEarned = user.badges.includes(badge.id);
                       const TierIcon = Hexagon; 

                       return (
                           <div 
                             key={badge.id}
                             className={`bg-[#0b0c10] border rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden group ${
                                 isEarned 
                                 ? 'border-white/10 shadow-lg' 
                                 : 'border-slate-800 opacity-60 grayscale'
                             }`}
                           >
                               {/* Glow for Earned */}
                               {isEarned && <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />}
                               
                               <div className={`mb-3 relative ${getTierColor(badge.tier)}`}>
                                   <TierIcon size={40} strokeWidth={1.5} className="fill-current opacity-20" />
                                   <div className="absolute inset-0 flex items-center justify-center">
                                       {/* Icon placeholder logic */}
                                       <Shield size={18} className="text-white" />
                                   </div>
                               </div>

                               <h4 className="text-xs font-black uppercase text-white mb-1">{badge.name}</h4>
                               <p className="text-[9px] text-slate-400 font-medium leading-tight mb-2 h-6 overflow-hidden">{badge.description}</p>
                               
                               {isEarned ? (
                                   <span className="text-[8px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase tracking-wide">
                                       Earned
                                   </span>
                               ) : (
                                   <span className="text-[8px] font-bold text-slate-600 border border-slate-700 px-2 py-0.5 rounded uppercase tracking-wide truncate max-w-full">
                                       {badge.conditionDescription}
                                   </span>
                               )}
                           </div>
                       )
                   })}
               </div>
           </div>
       )}

       {/* --- HISTORY CONTENT (Collectibles + Log) --- */}
       {activeSection === 'history' && (
           <div className="px-6 animate-view relative z-10 space-y-6">
               
               <section>
                   <h3 className="text-xs font-black uppercase italic text-white tracking-widest mb-3 flex items-center gap-2">
                       <Lock size={12} className="text-indigo-500" /> Locker
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                       {COLLECTIBLES_DATABASE.map(item => {
                           const unlocked = user.locker.includes(item.id);
                           return (
                               <div key={item.id} className={`bg-[#0b0c10] border border-slate-800 rounded-2xl p-4 flex items-center gap-3 ${!unlocked && 'opacity-50'}`}>
                                   <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white/10 shrink-0">
                                       <img src={item.imageUrl} className="w-full h-full object-contain p-1" />
                                   </div>
                                   <div className="min-w-0">
                                       <div className="text-[10px] font-black uppercase text-white truncate">{item.name}</div>
                                       <div className="text-[8px] font-bold text-slate-500 uppercase">{unlocked ? 'Unlocked' : 'Locked'}</div>
                                   </div>
                               </div>
                           )
                       })}
                   </div>
               </section>

               <section>
                   <h3 className="text-xs font-black uppercase italic text-white tracking-widest mb-3 flex items-center gap-2">
                       <History size={12} className="text-indigo-500" /> Recent Logs
                   </h3>
                   <div className="space-y-2">
                       {/* Mock History Items */}
                       <div className="bg-[#0b0c10] border border-white/5 p-3 rounded-xl flex justify-between items-center">
                           <span className="text-[10px] font-bold text-slate-300">Level Up (Level {user.level})</span>
                           <span className="text-[8px] font-mono text-slate-500">Today</span>
                       </div>
                       {user.completedChallengeIds.slice(0,3).map((cid, i) => (
                           <div key={i} className="bg-[#0b0c10] border border-white/5 p-3 rounded-xl flex justify-between items-center">
                               <span className="text-[10px] font-bold text-slate-300">Challenge Completed</span>
                               <span className="text-[8px] font-mono text-slate-500">Recent</span>
                           </div>
                       ))}
                   </div>
               </section>
           </div>
       )}

       {/* --- SETTINGS MODAL (PORTAL) --- */}
       {showSettings && createPortal(
         <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-view" onClick={() => setShowSettings(false)}>
            <div className="w-full max-w-sm bg-[#1a1a1a] border-t md:border border-white/10 rounded-t-[2rem] md:rounded-[2rem] p-6 shadow-2xl relative mb-safe-bottom md:mb-0" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black italic uppercase text-white tracking-tight">{isEditing ? 'EDIT IDENTITY' : 'SYSTEM CONFIG'}</h3>
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

                            <div className="h-px bg-white/5 my-2" />

                            <button onClick={handleLogout} className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 hover:bg-red-500/20 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all"><LogOut size={18} /></div>
                                <div className="text-left flex-1"><div className="text-sm font-bold text-red-400 uppercase">Terminate Session</div><div className="text-[9px] font-bold text-red-500/50 uppercase tracking-widest">Log Out</div></div>
                            </button>
                        </div>
                        
                        <div className="mt-6 text-center">
                            <p className="text-[8px] font-mono text-slate-600 uppercase">PUSH OS v1.9 // ID: {user.id}</p>
                        </div>
                    </>
                )}
            </div>
         </div>,
         document.body
       )}
    </div>
  );
};

export default ProfileView;
