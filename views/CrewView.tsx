
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { backend } from '../services/mockBackend';
import { Crew } from '../types';
import { 
  Users, Shield, Target, MapPin, Zap, ChevronLeft, 
  Crown, Plus, Activity, Settings, Flag, Search, Check, Loader2
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';

interface CrewViewProps {
  onBack: () => void;
}

const CREW_AVATARS = ['🛹', '🔥', '⚡', '🌊', '💀', '👽', '🦖', '👹'];

const CrewView: React.FC<CrewViewProps> = ({ onBack }) => {
  const { user, spots, updateUser } = useAppStore();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [availableCrews, setAvailableCrews] = useState<Crew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'browse' | 'create' | 'dashboard'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningCrewId, setJoiningCrewId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    moto: '',
    homeSpotId: '',
    avatar: CREW_AVATARS[0],
    maxMembers: 10
  });

  useEffect(() => {
    const init = async () => {
      if (user?.crewId) {
        const c = await backend.getUserCrew(user.crewId);
        setCrew(c);
        setViewMode('dashboard');
      } else {
        const all = await backend.getAllCrews();
        setAvailableCrews(all);
        setViewMode('browse');
      }
      setIsLoading(false);
    };
    init();
  }, [user]);

  const handleCreateCrew = async () => {
    if (!formData.name || !formData.homeSpotId) return;
    
    triggerHaptic('success');
    playSound('success');
    
    const selectedSpot = spots.find(s => s.id === formData.homeSpotId);
    
    const newCrew = await backend.createCrew({
      name: formData.name,
      city: user?.location || 'Unknown',
      moto: formData.moto || 'Ride or Die',
      homeSpotId: formData.homeSpotId,
      homeSpotName: selectedSpot?.name || 'Unknown Spot',
      avatar: formData.avatar,
      maxMembers: formData.maxMembers
    });
    
    if (user) updateUser({ ...user, crewId: newCrew.id });
    setCrew(newCrew);
    setViewMode('dashboard');
  };

  const handleJoinCrew = async (crewId: string) => {
      setJoiningCrewId(crewId);
      triggerHaptic('medium');
      try {
          // Simulate network handshake/encryption
          await new Promise(resolve => setTimeout(resolve, 800));

          const joined = await backend.joinCrew(crewId);
          if (user) updateUser({ ...user, crewId: joined.id });
          setCrew(joined);
          playSound('success');
          setViewMode('dashboard');
      } catch (e) {
          triggerHaptic('error');
          alert('Failed to join crew. Unit might be locked or network unstable.');
      } finally {
          setJoiningCrewId(null);
      }
  };

  if (isLoading) return <div className="h-full bg-black flex items-center justify-center"><div className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Syncing Unit Data...</div></div>;

  // --- BROWSE / JOIN MODE ---
  if (!crew && viewMode === 'browse') {
      const filtered = availableCrews.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.city.toLowerCase().includes(searchQuery.toLowerCase()));

      return (
        <div className="h-full flex flex-col bg-[#020202] animate-view pt-safe-top overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 mb-6 active:scale-95 transition-transform hover:text-white">
                    <ChevronLeft size={20} /> Back to Ops
                </button>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-[0.85] mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Global<br/>Units</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Find your squad or go rogue.</p>
                    </div>
                    <button 
                        onClick={() => setViewMode('create')}
                        className="bg-indigo-600 text-white rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2 hover:bg-indigo-500"
                    >
                        <Plus size={14} strokeWidth={3} /> Initialize Unit
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="SEARCH SECTOR..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0b0c10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 uppercase tracking-wider transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 hide-scrollbar space-y-3">
                {filtered.map(c => {
                    const isFull = c.members.length >= (c.maxMembers || 10);
                    const isJoining = joiningCrewId === c.id;
                    
                    return (
                        <div key={c.id} className="bg-[#0b0c10] border border-white/10 rounded-3xl p-5 relative overflow-hidden group hover:border-white/20 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl border border-white/5">
                                        {c.avatar}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black italic uppercase text-white tracking-tight leading-none mb-1">{c.name}</h3>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span>{c.city}</span>
                                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                            <span>Lvl {c.level}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${isFull ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                    {c.members.length}/{c.maxMembers || 10}
                                </span>
                            </div>
                            
                            <p className="text-xs text-slate-400 font-medium italic mb-4 pl-1">"{c.moto}"</p>

                            <button 
                                onClick={() => !isFull && !isJoining && handleJoinCrew(c.id)}
                                disabled={isFull || isJoining}
                                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                    isFull 
                                    ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800' 
                                    : 'bg-white text-black hover:bg-slate-200 shadow-lg disabled:opacity-70 disabled:cursor-wait'
                                }`}
                            >
                                {isJoining && <Loader2 className="animate-spin" size={14} />}
                                {isJoining ? 'Establishing Link...' : isFull ? 'Unit Full' : 'Request Access'}
                            </button>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-slate-600 font-mono text-xs">
                        NO UNITS FOUND IN SECTOR.
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- CREATE MODE ---
  if (!crew && viewMode === 'create') {
    return (
      <div className="h-full flex flex-col bg-black animate-view pt-safe-top overflow-y-auto hide-scrollbar">
         <div className="p-6">
            <button onClick={() => setViewMode('browse')} className="flex items-center gap-2 text-slate-500 mb-6 active:scale-95 hover:text-white transition-colors">
               <ChevronLeft size={20} /> Cancel
            </button>
            <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter mb-2">Form Unit</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Establish your crew identity.</p>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Unit Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="E.g. NIGHT RIDERS"
                    className="w-full bg-slate-900 border-b border-white/20 p-4 text-xl font-black italic uppercase text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Moto / Ethos</label>
                  <input 
                    type="text" 
                    value={formData.moto}
                    onChange={e => setFormData({...formData, moto: e.target.value})}
                    placeholder="E.g. SKATE AND DESTROY"
                    className="w-full bg-slate-900 border-b border-white/20 p-4 text-sm font-bold uppercase text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Home Turf</label>
                  <select 
                     value={formData.homeSpotId}
                     onChange={e => setFormData({...formData, homeSpotId: e.target.value})}
                     className="w-full bg-slate-900 border border-white/20 rounded-xl p-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                  >
                     <option value="">Select Local Spot</option>
                     {spots.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.location.address})</option>
                     ))}
                  </select>
               </div>

               <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Emblem</label>
                   <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                      {CREW_AVATARS.map(av => (
                         <button 
                           key={av}
                           onClick={() => setFormData({...formData, avatar: av})}
                           className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-slate-900 border transition-all ${formData.avatar === av ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110' : 'border-slate-800 opacity-50'}`}
                         >
                            {av}
                         </button>
                      ))}
                   </div>
               </div>
               
               <div className="pt-4">
                  <button 
                    onClick={handleCreateCrew}
                    disabled={!formData.name || !formData.homeSpotId}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-indigo-500 disabled:opacity-50 active:scale-95 transition-all"
                  >
                     Initialize Crew
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // --- CREW DASHBOARD (Existing view) ---
  if (crew) {
      const memberPercentage = Math.round((crew.members.length / (crew.maxMembers || 10)) * 100);

      return (
        <div className="h-full flex flex-col bg-black animate-view overflow-y-auto hide-scrollbar pb-32">
           {/* HERO BANNER */}
           <div className="relative h-64 w-full shrink-0">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
               </div>
               
               <div className="absolute top-0 left-0 w-full p-6 pt-safe-top z-20 flex justify-between items-start">
                   <button onClick={onBack} className="p-2 bg-black/30 backdrop-blur rounded-full text-white border border-white/10 active:scale-95 transition-transform">
                       <ChevronLeft size={24} />
                   </button>
                   <button className="p-2 bg-black/30 backdrop-blur rounded-full text-white border border-white/10">
                       <Settings size={20} />
                   </button>
               </div>

               <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                   <div className="flex items-end justify-between">
                       <div>
                           <div className="w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-2xl">
                               {crew.avatar}
                           </div>
                           <h1 className="text-4xl font-black italic uppercase text-white leading-none tracking-tight">{crew.name}</h1>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mt-2">{crew.city} Chapter</p>
                       </div>
                       <div className="text-center">
                           <div className="text-3xl font-black text-white italic">{crew.level}</div>
                           <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Level</div>
                       </div>
                   </div>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
           </div>

           {/* CONTENT */}
           <div className="px-6 space-y-8 mt-4">
               
               {/* Moto */}
               {crew.moto && (
                   <div className="border-l-2 border-indigo-500 pl-4 py-1">
                       <p className="text-sm font-bold text-slate-300 italic uppercase">"{crew.moto}"</p>
                   </div>
               )}

               {/* Stats Grid */}
               <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
                       <div className="flex items-center gap-2 mb-2 text-indigo-400">
                           <Users size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Roster</span>
                       </div>
                       <div className="flex items-end justify-between">
                           <span className="text-2xl font-black text-white italic">{crew.members.length}<span className="text-sm text-slate-500">/{crew.maxMembers || 10}</span></span>
                           <span className="text-[9px] font-bold text-slate-500">{memberPercentage}% Full</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{ width: `${memberPercentage}%` }}></div>
                       </div>
                   </div>
                   <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
                       <div className="flex items-center gap-2 mb-2 text-yellow-500">
                           <Crown size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Total XP</span>
                       </div>
                       <span className="text-2xl font-black text-white italic">{crew.totalXp}</span>
                       <p className="text-[9px] text-slate-500 mt-1">Global Rank #--</p>
                   </div>
               </div>

               {/* Home Turf */}
               <section>
                   <h3 className="text-xs font-black uppercase italic text-white tracking-widest mb-3 flex items-center gap-2">
                       <Flag size={14} className="text-red-500" /> Home Turf
                   </h3>
                   <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-1 flex items-center gap-4 pr-6">
                       <div className="w-20 h-20 bg-slate-800 rounded-[1.7rem] flex items-center justify-center text-slate-600 overflow-hidden relative">
                           <MapPin size={24} className="relative z-10" />
                           <div className="absolute inset-0 bg-indigo-500/10" />
                       </div>
                       <div className="flex-1">
                           <h4 className="text-sm font-black uppercase italic text-white">{crew.homeSpotName || 'Unknown Sector'}</h4>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">Designated Meeting Point</p>
                       </div>
                       <button className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                           <MapPin size={14} />
                       </button>
                   </div>
               </section>

               {/* Weekly Objective */}
               <section className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Target size={100} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Weekly Objective</h3>
                    <p className="text-lg font-black text-white italic uppercase mb-4">{crew.weeklyGoal.description}</p>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-1/3 shadow-[0_0_10px_#22c55e]"></div>
                        </div>
                        <span className="text-xs font-bold text-white mono">{crew.weeklyGoal.current}/{crew.weeklyGoal.target}</span>
                    </div>
               </section>

               {/* Members */}
               <section>
                   <h3 className="text-xs font-black uppercase italic text-white tracking-widest mb-3">Active Unit</h3>
                   <div className="space-y-3">
                       {/* Current User */}
                       <div className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
                                <img src={user?.avatar} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-black uppercase text-white">{user?.name}</h4>
                                    <span className="bg-indigo-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">YOU</span>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">Level {user?.level}</p>
                            </div>
                            <Crown size={14} className="text-yellow-500" />
                       </div>
                       {/* Placeholders for other members */}
                       {[1,2].map(i => (
                           <div key={i} className="flex items-center gap-4 p-3 opacity-50">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700"></div>
                                <div className="flex-1 space-y-1">
                                    <div className="w-24 h-3 bg-slate-800 rounded"></div>
                                    <div className="w-12 h-2 bg-slate-800 rounded"></div>
                                </div>
                           </div>
                       ))}
                   </div>
               </section>
           </div>
        </div>
      );
  }

  return null;
};

export default CrewView;
