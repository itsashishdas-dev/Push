
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { backend } from '../services/mockBackend';
import { Crew } from '../types';
import { 
  Users, Shield, Target, MapPin, ChevronLeft, 
  Crown, Plus, Settings, Search, Loader2, LogOut, CheckCircle2, User as UserIcon, X, Check,
  Hexagon, MessageSquare
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';

interface CrewViewProps {
  onBack: () => void;
}

const CREW_AVATARS = ['🛹', '🔥', '⚡', '🌊', '💀', '👽', '🦖', '👹'];

const CrewView: React.FC<CrewViewProps> = ({ onBack }) => {
  const { user, spots, updateUser, openChat } = useAppStore();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [availableCrews, setAvailableCrews] = useState<Crew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'browse' | 'create' | 'dashboard'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestingCrewId, setRequestingCrewId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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
        setCrew(null);
        const all = await backend.getAllCrews();
        setAvailableCrews(all);
        setViewMode('browse');
      }
      setIsLoading(false);
    };
    init();
  }, [user?.crewId]);

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

  const handleRequestJoin = async (crewId: string) => {
      setRequestingCrewId(crewId);
      triggerHaptic('medium');
      try {
          await new Promise(resolve => setTimeout(resolve, 600)); // Network sim
          await backend.requestJoinCrew(crewId);
          const all = await backend.getAllCrews();
          setAvailableCrews(all);
          triggerHaptic('success');
      } catch (e) {
          triggerHaptic('error');
      } finally {
          setRequestingCrewId(null);
      }
  };

  const handleReviewRequest = async (userId: string, approved: boolean) => {
      if (!crew) return;
      triggerHaptic('medium');
      const updatedCrew = await backend.respondToJoinRequest(crew.id, userId, approved);
      setCrew(updatedCrew);
      playSound(approved ? 'success' : 'click');
  };

  const handleLeaveCrew = async () => {
      if (!confirm("Confirm removal from Unit? This action will reset your crew reputation.")) return;
      triggerHaptic('heavy');
      const updatedUser = await backend.leaveCrew();
      setCrew(null);
      setShowSettings(false);
      setViewMode('browse');
      updateUser(updatedUser);
      playSound('error');
      const all = await backend.getAllCrews();
      setAvailableCrews(all);
  };

  const handleOpenChat = () => {
      if (crew) {
          triggerHaptic('medium');
          openChat(crew.id, crew.name);
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
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 mb-6 active:scale-95 transition-transform hover:text-white text-[10px] font-bold uppercase tracking-widest">
                    <ChevronLeft size={16} /> Back to Ops
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
                <div className="relative mb-6 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="SEARCH SECTOR..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0b0c10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 uppercase tracking-widest transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 hide-scrollbar space-y-4">
                {filtered.map(c => {
                    const isFull = c.members.length >= (c.maxMembers || 10);
                    const isRequested = user && c.requests && c.requests.includes(user.id);
                    const isProcessing = requestingCrewId === c.id;
                    
                    return (
                        <div key={c.id} className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group hover:border-white/20 transition-all shadow-lg hover:shadow-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl border border-white/5 shadow-inner">
                                        {c.avatar}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none mb-1">{c.name}</h3>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                                            <span>{c.city}</span>
                                            <span className="text-slate-800">|</span>
                                            <span>Lvl {c.level}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-lg border backdrop-blur-md flex flex-col items-center ${isFull ? 'bg-red-950/50 border-red-500/30' : 'bg-emerald-950/50 border-emerald-500/30'}`}>
                                    <Users size={12} className={isFull ? 'text-red-400' : 'text-emerald-400'} />
                                    <span className={`text-[8px] font-bold font-mono mt-0.5 ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {c.members.length}/{c.maxMembers || 10}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="bg-[#111] rounded-xl p-3 border border-white/5 mb-4">
                                <p className="text-[10px] text-slate-400 font-medium italic uppercase tracking-wide text-center">"{c.moto}"</p>
                            </div>

                            <button 
                                onClick={() => !isFull && !isRequested && !isProcessing && handleRequestJoin(c.id)}
                                disabled={isFull || isRequested || isProcessing}
                                className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                    isRequested
                                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30 cursor-default'
                                    : isFull 
                                        ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800' 
                                        : 'bg-white text-black hover:bg-slate-200 shadow-lg disabled:opacity-70 disabled:cursor-wait'
                                }`}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={14} /> : null}
                                {isProcessing ? 'SENDING SIGNAL...' : isRequested ? 'REQUEST PENDING' : isFull ? 'UNIT FULL' : 'REQUEST ACCESS'}
                            </button>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-slate-600 font-mono text-xs border border-white/5 rounded-3xl bg-slate-900/20 uppercase tracking-widest">
                        NO UNITS DETECTED.
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- CREATE MODE ---
  if (!crew && viewMode === 'create') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#020202]/80 backdrop-blur-sm p-4 animate-view pt-safe-top font-sans relative z-50">
         
         {/* Background to match app feel if it's an overlay */}
         <div className="absolute inset-0 z-0 bg-[#020202]" />
         <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

         {/* Card Container */}
         <div className="w-full max-w-sm bg-[#0b0c10] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden z-10">
            
            {/* Header */}
            <div className="relative z-10 mb-6">
                <button onClick={() => setViewMode('browse')} className="flex items-center gap-2 text-slate-500 mb-4 active:scale-95 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                   <ChevronLeft size={16} /> CANCEL
                </button>
                
                <h1 className="text-5xl font-black italic uppercase text-white tracking-tighter mb-2 leading-[0.85]">
                    FORM<br/>UNIT
                </h1>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em] ml-1">
                    ESTABLISH YOUR CREW IDENTITY.
                </p>
            </div>

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 relative z-10 pr-2">
                
                {/* Unit Name */}
                <div className="space-y-2 group">
                    <label className="text-[9px] font-black uppercase text-indigo-500 tracking-widest ml-1 group-focus-within:text-white transition-colors">
                        UNIT NAME
                    </label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="E.g. NIGHT RIDERS"
                        className="w-full bg-[#050505] border border-white/10 rounded-3xl p-4 text-sm font-black italic uppercase text-white placeholder:text-slate-700 placeholder:not-italic focus:outline-none focus:border-indigo-500 focus:bg-[#0a0a0a] transition-all"
                    />
                </div>

                {/* Moto */}
                <div className="space-y-2 group">
                    <label className="text-[9px] font-black uppercase text-indigo-500 tracking-widest ml-1 group-focus-within:text-white transition-colors">
                        MOTO / ETHOS
                    </label>
                    <input 
                        type="text" 
                        value={formData.moto}
                        onChange={e => setFormData({...formData, moto: e.target.value})}
                        placeholder="E.g. SKATE AND DESTROY"
                        className="w-full bg-[#050505] border border-white/10 rounded-3xl p-4 text-xs font-bold uppercase text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-[#0a0a0a] transition-all"
                    />
                </div>

                {/* Home Turf */}
                <div className="space-y-2 group">
                    <label className="text-[9px] font-black uppercase text-indigo-500 tracking-widest ml-1 flex items-center gap-2">
                        HOME TURF
                    </label>
                    <div className="relative">
                        <select 
                            value={formData.homeSpotId}
                            onChange={e => setFormData({...formData, homeSpotId: e.target.value})}
                            className="w-full bg-[#050505] border border-white/10 rounded-3xl p-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 focus:bg-[#0a0a0a] appearance-none uppercase"
                        >
                            <option value="" className="text-slate-700">Select Local Spot</option>
                            {spots.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.location.address})</option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <MapPin size={16} />
                        </div>
                    </div>
                </div>

                {/* Emblem */}
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-indigo-500 tracking-widest ml-1">EMBLEM</label>
                    <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar px-1">
                        {CREW_AVATARS.map(av => (
                            <button 
                            key={av}
                            onClick={() => { setFormData({...formData, avatar: av}); triggerHaptic('light'); }}
                            className={`
                                w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 relative group shrink-0
                                ${formData.avatar === av 
                                    ? 'bg-indigo-600 border-2 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-100 z-10' 
                                    : 'bg-[#050505] border border-white/10 opacity-60 hover:opacity-100 hover:border-white/30 scale-95'
                                }
                            `}
                            >
                                <span className="relative z-10 leading-none select-none filter drop-shadow-lg">{av}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Button */}
            <div className="mt-2 pt-4 border-t border-white/5 relative z-20 shrink-0">
                <button 
                    onClick={handleCreateCrew}
                    disabled={!formData.name || !formData.homeSpotId}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10">INITIALIZE CREW</span>
                </button>
            </div>
         </div>
      </div>
    );
  }

  // --- DASHBOARD MODE ---
  if (crew) {
      const memberPercentage = Math.round((crew.members.length / (crew.maxMembers || 10)) * 100);
      const isAdmin = user && crew.adminIds && crew.adminIds.includes(user.id);
      const pendingRequests = crew.requests || [];

      return (
        <div className="h-full flex flex-col bg-[#020202] animate-view overflow-y-auto hide-scrollbar pb-32 pt-safe-top">
           {/* HERO */}
           <div className="relative w-full px-6 pt-6 pb-2 shrink-0">
               <div className="flex justify-between items-start mb-6">
                   <button onClick={onBack} className="p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-400 active:scale-95 transition-all hover:text-white">
                       <ChevronLeft size={20} />
                   </button>
                   <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-xl text-white border transition-all ${showSettings ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-white/10'}`}>
                       <Settings size={20} />
                   </button>
               </div>

               {/* Settings Popover */}
               {showSettings && (
                   <div className="absolute top-20 right-6 z-30 w-48 bg-[#0b0c10] border border-white/10 rounded-2xl shadow-2xl p-2 animate-pop">
                       <button onClick={handleLeaveCrew} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-900 rounded-xl transition-colors">
                           <LogOut size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Leave Unit</span>
                       </button>
                   </div>
               )}

               <div className="flex items-end gap-6 mb-6">
                   <div className="w-24 h-24 bg-[#0b0c10] border-2 border-white/10 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl">
                       {crew.avatar}
                   </div>
                   <div className="flex-1 pb-1">
                       <h1 className="text-4xl font-black italic uppercase text-white leading-[0.85] tracking-tighter mb-2">{crew.name}</h1>
                       <div className="flex items-center gap-2">
                           <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-[8px] font-black uppercase tracking-widest">{crew.city} Chapter</span>
                           <span className="px-2 py-1 bg-slate-900 border border-white/10 text-white rounded-md text-[8px] font-black uppercase tracking-widest">Lvl {crew.level}</span>
                       </div>
                   </div>
               </div>
           </div>

           {/* CONTENT */}
           <div className="px-6 space-y-6">
               
               {/* Quick Comms Button */}
               <button 
                   onClick={handleOpenChat}
                   className="w-full bg-[#111] border border-white/10 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-[#161616]"
               >
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-indigo-900/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                           <MessageSquare size={18} />
                       </div>
                       <div>
                           <h3 className="text-sm font-black uppercase text-white tracking-wide">Comms Link</h3>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Secure Unit Chat</p>
                       </div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                       <ChevronLeft size={16} className="rotate-180" />
                   </div>
               </button>

               {/* Requests */}
               {isAdmin && pendingRequests.length > 0 && (
                   <section className="bg-[#0b0c10] border border-indigo-500/30 p-5 rounded-[2rem] shadow-[0_0_20px_rgba(99,102,241,0.1)] relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-5"><Shield size={80} /></div>
                       <div className="relative z-10">
                           <div className="flex justify-between items-center mb-4">
                               <h3 className="text-xs font-black uppercase italic text-white tracking-widest flex items-center gap-2">
                                   <Shield size={14} className="text-indigo-500" /> Incoming Signal
                               </h3>
                               <span className="text-[9px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                           </div>
                           <div className="space-y-2">
                               {pendingRequests.map(reqId => (
                                   <div key={reqId} className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-white/5">
                                       <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                                               <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${reqId}`} className="w-full h-full object-cover" />
                                           </div>
                                           <div className="flex flex-col">
                                               <span className="text-[9px] font-bold text-white uppercase">User #{reqId.slice(-4)}</span>
                                               <span className="text-[7px] text-slate-500 uppercase tracking-widest">Awaiting Clearance</span>
                                           </div>
                                       </div>
                                       <div className="flex gap-2">
                                           <button onClick={() => handleReviewRequest(reqId, false)} className="p-2 bg-slate-900 border border-slate-800 text-red-400 rounded-xl hover:bg-red-900/20 transition-colors"><X size={14} /></button>
                                           <button onClick={() => handleReviewRequest(reqId, true)} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg"><Check size={14} /></button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                   </section>
               )}

               {/* Stats Grid */}
               <div className="grid grid-cols-2 gap-4">
                   <div className="bg-[#0b0c10] border border-white/10 p-5 rounded-[2rem] flex flex-col justify-between h-32">
                       <div className="flex items-center gap-2 text-indigo-400">
                           <Users size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Roster</span>
                       </div>
                       <div>
                           <span className="text-3xl font-black text-white italic leading-none">{crew.members.length}<span className="text-sm text-slate-500 not-italic font-medium">/{crew.maxMembers || 10}</span></span>
                           <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden border border-white/5">
                               <div className="h-full bg-indigo-500" style={{ width: `${memberPercentage}%` }}></div>
                           </div>
                       </div>
                   </div>
                   <div className="bg-[#0b0c10] border border-white/10 p-5 rounded-[2rem] flex flex-col justify-between h-32">
                       <div className="flex items-center gap-2 text-yellow-500">
                           <Crown size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Total XP</span>
                       </div>
                       <div>
                           <span className="text-3xl font-black text-white italic leading-none">{crew.totalXp > 1000 ? (crew.totalXp/1000).toFixed(1) + 'K' : crew.totalXp}</span>
                           <p className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">Unit Rank #--</p>
                       </div>
                   </div>
               </div>

               {/* Weekly Objective */}
               <div className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 to-transparent pointer-events-none" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                            <Target size={14} /> Weekly Objective
                        </h3>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-1 rounded uppercase tracking-wide">
                            Active
                        </div>
                    </div>
                    <p className="text-xl font-black text-white italic uppercase mb-6 leading-none relative z-10 w-[90%]">{crew.weeklyGoal.description}</p>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-emerald-500 w-1/3 shadow-[0_0_10px_#10b981]"></div>
                        </div>
                        <span className="text-xs font-mono font-bold text-white">{crew.weeklyGoal.current}/{crew.weeklyGoal.target}</span>
                    </div>
               </div>

               {/* Roster */}
               <div>
                   <h3 className="text-xs font-black uppercase italic text-white tracking-widest mb-4 flex items-center gap-2 pl-2">
                       <Hexagon size={14} className="text-slate-500" /> Unit Roster
                   </h3>
                   <div className="space-y-3">
                       {/* Current User */}
                       <div className="flex items-center gap-4 bg-[#0b0c10] p-4 rounded-[1.5rem] border border-white/10">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 overflow-hidden">
                                <img src={user?.avatar} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-black uppercase text-white italic">{user?.name}</h4>
                                    <span className="bg-indigo-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded tracking-wider">YOU</span>
                                    {isAdmin && <span className="bg-yellow-500/20 text-yellow-500 text-[7px] font-black px-1.5 py-0.5 rounded border border-yellow-500/30 tracking-wider">LEADER</span>}
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Level {user?.level}</p>
                            </div>
                       </div>
                       
                       {[...Array(Math.max(0, crew.members.length - 1))].map((_, i) => (
                           <div key={i} className="flex items-center gap-4 p-4 rounded-[1.5rem] border border-transparent opacity-60">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600">
                                    <UserIcon size={18} />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <div className="w-24 h-3 bg-slate-800 rounded animate-pulse"></div>
                                    <div className="w-10 h-2 bg-slate-900 rounded"></div>
                                </div>
                                <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">OPERATIVE</div>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
        </div>
      );
  }

  return null;
};

export default CrewView;
