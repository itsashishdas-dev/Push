
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mentor, Booking, Discipline, BadgeTier, MentorBadge } from '../types';
import { backend } from '../services/mockBackend';
import { askAICoach } from '../services/geminiService';
import { Star, Send, Loader2, Sparkles, Play, X, Calendar, Clock, CheckCircle2, Quote, User as UserIcon, BadgeCheck, Zap, Filter, Bot, MessageSquare, ChevronRight, Terminal, BrainCircuit, Activity, Settings, Lock, Users, MapPin, IndianRupee } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';
import { useAppStore } from '../store';

const MOCK_SLOTS = ['10:00 AM', '1:00 PM', '3:30 PM']; 
const MOCK_DATES = ['Today', 'Tomorrow', 'Wed 24', 'Thu 25', 'Fri 26'];

const SUGGESTED_AI_PROMPTS = [
    { id: 1, text: "How to Ollie higher?", icon: Zap },
    { id: 2, text: "Fix my speed wobble", icon: Activity },
    { id: 3, text: "Best wheels for rough roads?", icon: Settings },
    { id: 4, text: "Mental tips for dropping in", icon: BrainCircuit }
];

const MentorshipView: React.FC = () => {
  const { user, bookMentorSession } = useAppStore();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [activeTab, setActiveTab] = useState<'find' | 'ai-coach' | 'apply'>('find');
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<Discipline | 'ALL'>('ALL');
  
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [aiInput, setAiInput] = useState('');
  const [chat, setChat] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (activeTab === 'ai-coach') chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, activeTab]);

  const loadData = async () => {
    setMentors(await backend.getMentors());
  };

  // Eligibility Checks
  const isEligibleForMentor = user && user.level >= 15 && user.badges.includes('badge_veteran_guardian');

  const handleAiSend = async (textOverride?: string) => {
    const textToSend = textOverride || aiInput;
    if (!textToSend.trim() || isAiThinking) return;
    
    setAiInput('');
    setChat(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsAiThinking(true);
    triggerHaptic('light');
    
    try {
        const response = await askAICoach(textToSend);
        setChat(prev => [...prev, { role: 'model', text: response }]);
        triggerHaptic('medium');
    } catch {
        setChat(prev => [...prev, { role: 'model', text: "System Offline. Connection Failed." }]);
    } finally {
        setIsAiThinking(false);
    }
  };

  const handleBookSession = async () => {
      if (!selectedSlot || !selectedMentor) return;
      setIsBooking(true);
      triggerHaptic('medium');
      
      try {
          // Perform real booking via store action
          await bookMentorSession(selectedMentor, selectedDate, selectedSlot);
          
          setIsBooking(false);
          setBookingSuccess(true);
          triggerHaptic('success');
          playSound('success');
      } catch (e) {
          setIsBooking(false);
          triggerHaptic('error');
          playSound('error');
      }
  };

  const closeProfile = () => {
      setSelectedMentor(null);
      setSelectedSlot(null);
      setBookingSuccess(false);
  };

  const filteredMentors = useMemo(() => {
    let result = mentors.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (disciplineFilter !== 'ALL') {
        result = result.filter(m => m.disciplines.includes(disciplineFilter));
    }
    return result;
  }, [mentors, searchQuery, disciplineFilter]);

  const StatBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
      <div className="flex flex-col gap-1">
          <div className="flex justify-between items-end">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
              <span className="text-[9px] font-mono font-bold text-white">{value}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
          </div>
      </div>
  );

  return (
    <div className="pb-32 pt-8 px-6 animate-view h-full flex flex-col relative overflow-y-auto hide-scrollbar bg-[#020202]">
       {/* Background Layers */}
       <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
       <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

       {/* --- HEADER --- */}
       <header className="mb-6 shrink-0 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black italic uppercase text-white mb-2 leading-[0.85] tracking-tighter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                  Training<br/>Hub
              </h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">
                  Level Up Your Skills
              </p>
            </div>
            {/* Online Count Badge */}
            <div className="bg-[#0b0c10] border border-white/10 rounded-full px-3 py-1 flex items-center gap-2 shadow-lg">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_4px_#22c55e]" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                    {activeTab === 'find' ? `${filteredMentors.length} PROS ONLINE` : 'SYSTEM ACTIVE'}
                </span>
            </div>
          </div>
       </header>
      
      {/* --- MODE SWITCHER --- */}
      <div className="flex bg-[#0b0c10] p-1 rounded-xl border border-white/10 mb-6 shrink-0 relative z-10 backdrop-blur-sm">
           <button 
             onClick={() => { setActiveTab('find'); triggerHaptic('light'); }} 
             className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'find' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
               Find Mentor
           </button>
           <button 
             onClick={() => { setActiveTab('ai-coach'); triggerHaptic('light'); }} 
             className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'ai-coach' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
               AI Coach
           </button>
           <button 
             onClick={() => { setActiveTab('apply'); triggerHaptic('light'); }} 
             className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'apply' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
               Teach
           </button>
      </div>

      {/* --- AI COACH INTERFACE --- */}
      {activeTab === 'ai-coach' && (
          <div className="flex-1 flex flex-col bg-[#0b0c10] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative min-h-0 animate-view">
              <div className="bg-[#0b0c10] p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">SPOT_NET // v2.5</span>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6 relative hide-scrollbar">
                  {chat.length === 0 && (
                      <div className="space-y-6 mt-4 relative z-10">
                          <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl">
                              <p className="text-xs font-mono text-emerald-400 mb-2">> SYSTEM INITIALIZED</p>
                              <p className="text-sm text-emerald-100 font-medium">Welcome to the Neural Training Network.</p>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                                  {SUGGESTED_AI_PROMPTS.map((prompt) => (
                                      <button 
                                        key={prompt.id}
                                        onClick={() => handleAiSend(prompt.text)}
                                        className="flex items-center gap-3 p-3 bg-slate-900 border border-white/5 rounded-xl hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all text-left group active:scale-95"
                                      >
                                          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors border border-slate-800">
                                              <prompt.icon size={16} />
                                          </div>
                                          <span className="text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">{prompt.text}</span>
                                          <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-emerald-500" />
                                      </button>
                                  ))}
                          </div>
                      </div>
                  )}
                  {chat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop relative z-10`}>
                          <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-lg border ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white rounded-br-none' : 'bg-[#151515] border-white/10 text-slate-200 rounded-bl-none'}`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  {isAiThinking && <div className="flex justify-start animate-pulse"><div className="bg-[#151515] p-4 rounded-2xl border border-white/5"><Loader2 className="animate-spin text-emerald-500" size={16} /></div></div>}
                  <div ref={chatEndRef} />
              </div>
              <div className="p-4 bg-[#0b0c10] border-t border-white/10 shrink-0">
                  <div className="flex gap-2 items-center bg-[#151515] rounded-2xl px-4 py-2 border border-white/10 focus-within:border-emerald-500/50 transition-colors">
                      <Terminal size={16} className="text-slate-500" />
                      <input className="flex-1 bg-transparent text-sm text-white focus:outline-none py-3 placeholder:text-slate-600 font-mono" placeholder="ENTER COMMAND..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} />
                      <button onClick={() => handleAiSend()} disabled={!aiInput.trim()} className="p-2 bg-emerald-600 text-white rounded-xl disabled:opacity-50 active:scale-95 transition-transform"><Send size={16} /></button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MENTOR LIST (IMPROVED CARD) --- */}
      {activeTab === 'find' && (
          <div className="space-y-6 relative z-10">
              <div className="flex flex-col gap-3">
                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Filter size={14} className="text-slate-500 group-focus-within:text-indigo-400" /></div>
                      <input type="text" placeholder="SEARCH DATABASE..." className="w-full bg-[#0b0c10] rounded-xl py-4 pl-10 pr-4 text-xs font-bold text-white focus:outline-none border border-white/10 focus:border-indigo-500/50 uppercase tracking-widest font-mono transition-colors" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
              </div>
              <div className="flex flex-col gap-4 pb-4">
                  {filteredMentors.map(mentor => (
                      <div 
                        key={mentor.id} 
                        onClick={() => { setSelectedMentor(mentor); triggerHaptic('medium'); }} 
                        className="group bg-[#0b0c10] border border-white/10 rounded-[2rem] p-5 cursor-pointer hover:border-indigo-500/40 transition-all active:scale-[0.98] shadow-lg relative overflow-hidden flex flex-col gap-4"
                      >
                          {/* Online Indicator */}
                          <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-green-950/50 border border-green-500/20 px-2 py-1 rounded-full">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_#22c55e]" />
                              <span className="text-[7px] font-black uppercase text-green-400 tracking-wider">Online</span>
                          </div>

                          <div className="flex items-start gap-5">
                              {/* Avatar Block */}
                              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-inner shrink-0 group-hover:border-indigo-500/30 transition-colors">
                                  <img src={mentor.avatar} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ imageRendering: 'pixelated' }} />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                              </div>
                              
                              {/* Header Info */}
                              <div className="flex-1 pt-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                      <h3 className="text-xl font-black italic uppercase text-white leading-none tracking-tighter truncate">{mentor.name}</h3>
                                      {mentor.badges.includes(MentorBadge.CERTIFIED) && (
                                          <BadgeCheck size={14} className="text-blue-400" />
                                      )}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-2">
                                      {mentor.disciplines.map(d => (
                                          <span key={d} className="text-[7px] font-black uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded tracking-wider border border-white/5">
                                              {d}
                                          </span>
                                      ))}
                                  </div>
                                  <p className="text-[9px] text-slate-500 font-medium leading-tight line-clamp-2 border-l-2 border-slate-800 pl-2">
                                      "{mentor.bio}"
                                  </p>
                              </div>
                          </div>

                          {/* Skill Matrix */}
                          {mentor.stats && (
                              <div className="bg-[#111] rounded-xl p-3 border border-white/5 grid grid-cols-3 gap-3">
                                  <StatBar label="Technical" value={mentor.stats.technical} color="bg-indigo-500" />
                                  <StatBar label="Style" value={mentor.stats.style} color="bg-purple-500" />
                                  <StatBar label="Teaching" value={mentor.stats.teaching} color="bg-emerald-500" />
                              </div>
                          )}

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden mt-1">
                              <div className="bg-[#111] p-2 flex flex-col items-center justify-center gap-0.5 group/stat hover:bg-[#151515] transition-colors">
                                  <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">Rate</span>
                                  <span className="text-xs font-mono font-bold text-white group-hover/stat:text-indigo-400 transition-colors">₹{mentor.rate}</span>
                              </div>
                              <div className="bg-[#111] p-2 flex flex-col items-center justify-center gap-0.5 group/stat hover:bg-[#151515] transition-colors">
                                  <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">Rating</span>
                                  <div className="flex items-center gap-1 text-xs font-black text-white group-hover/stat:text-yellow-400 transition-colors">
                                      {mentor.rating} <Star size={8} fill="currentColor" className="text-yellow-500" />
                                  </div>
                              </div>
                              <div className="bg-[#111] p-2 flex flex-col items-center justify-center gap-0.5 group/stat hover:bg-[#151515] transition-colors">
                                  <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">Students</span>
                                  <span className="text-xs font-mono font-bold text-white group-hover/stat:text-emerald-400 transition-colors">{mentor.studentsTrained}</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- TEACH APPLICATION (GATED) --- */}
      {activeTab === 'apply' && (
          <div className="flex-1 bg-[#0b0c10] rounded-[2rem] border border-white/10 p-6 flex flex-col items-center justify-center text-center animate-view relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-black pointer-events-none" />
              
              {isEligibleForMentor ? (
                  <div className="relative z-10 space-y-4">
                      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/30">
                          <CheckCircle2 size={32} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Clearance Granted</h2>
                      <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                          You have proven your skill and dedication. You are eligible to apply for the mentorship program.
                      </p>
                      <button 
                        onClick={() => alert("Application Flow Coming Soon")}
                        className="bg-white text-black px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-200 transition-all active:scale-95 mt-4"
                      >
                          Start Application
                      </button>
                  </div>
              ) : (
                  <div className="relative z-10 space-y-6">
                      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border-2 border-slate-800">
                          <Lock size={24} className="text-slate-500" />
                      </div>
                      <div>
                          <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-2">Access Denied</h2>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requirements not met</p>
                      </div>
                      
                      <div className="bg-black/40 rounded-xl p-4 text-left space-y-3 border border-white/5 w-full max-w-xs">
                          <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Rider Level</span>
                              <span className={`text-[10px] font-black uppercase ${user?.level && user.level >= 15 ? 'text-green-400' : 'text-red-400'}`}>
                                  {user?.level || 0}/15
                              </span>
                          </div>
                          <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Guardian Badge</span>
                              <span className={`text-[10px] font-black uppercase ${user?.badges.includes('badge_veteran_guardian') ? 'text-green-400' : 'text-red-400'}`}>
                                  {user?.badges.includes('badge_veteran_guardian') ? 'Owned' : 'Locked'}
                              </span>
                          </div>
                      </div>
                      
                      <p className="text-[9px] text-slate-600 font-mono uppercase">Keep pushing to unlock this path.</p>
                  </div>
              )}
          </div>
      )}

      {/* --- MENTOR PROFILE MODAL --- */}
      {selectedMentor && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-view">
            <div className="w-full max-w-[360px] bg-[#050505] rounded-[2.5rem] border border-white/10 shadow-2xl relative flex flex-col overflow-hidden animate-pop max-h-[90vh]">
                
                {/* Header Image */}
                <div className="relative h-72 w-full shrink-0 bg-[#111]">
                     {/* Close Button - Top Left */}
                     <button 
                        onClick={closeProfile} 
                        className="absolute top-5 left-5 z-20 w-10 h-10 bg-black/40 backdrop-blur-md rounded-xl text-white/80 border border-white/10 flex items-center justify-center active:scale-95 transition-all hover:bg-white/10"
                     >
                         <X size={20} />
                     </button>

                     {/* Online Badge - Top Right */}
                     <div className="absolute top-5 right-5 z-20 bg-green-950/80 backdrop-blur-md border border-green-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                         <span className="text-[9px] font-black uppercase text-green-400 tracking-widest">Online</span>
                     </div>

                     <img 
                        src={selectedMentor.avatar} 
                        className="w-full h-full object-cover" 
                        style={{ imageRendering: 'pixelated' }} 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

                     {/* Identity Overlay */}
                     <div className="absolute bottom-0 left-0 w-full p-6 pb-2">
                         <h1 className="text-5xl font-black italic uppercase text-white leading-[0.8] tracking-tighter drop-shadow-xl mb-3">
                             {selectedMentor.name}
                         </h1>
                         <div className="flex items-center gap-3">
                             {selectedMentor.badges.includes(MentorBadge.CERTIFIED) && (
                                 <div className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-md flex items-center gap-1 shadow-lg uppercase tracking-wide">
                                     <BadgeCheck size={12} strokeWidth={3} /> Certified
                                 </div>
                             )}
                             <span className="text-xl font-black text-slate-300 italic tracking-tight">₹{selectedMentor.rate}/hr</span>
                         </div>
                     </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6">
                    
                    {/* Skill Matrix */}
                    {selectedMentor.stats && (
                        <div className="bg-[#111] rounded-xl p-4 border border-white/5 grid grid-cols-3 gap-3">
                            <StatBar label="Technical" value={selectedMentor.stats.technical} color="bg-indigo-500" />
                            <StatBar label="Style" value={selectedMentor.stats.style} color="bg-purple-500" />
                            <StatBar label="Teaching" value={selectedMentor.stats.teaching} color="bg-emerald-500" />
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 min-h-[90px]">
                            <Star size={18} className="text-yellow-500 fill-yellow-500 mb-1" />
                            <span className="text-xl font-black text-white leading-none">{selectedMentor.rating}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Rating</span>
                        </div>
                        <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 min-h-[90px]">
                            <Users size={18} className="text-indigo-500 mb-1" />
                            <span className="text-xl font-black text-white leading-none">{selectedMentor.studentsTrained}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Students</span>
                        </div>
                        <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 min-h-[90px]">
                            <Activity size={18} className="text-emerald-500 mb-1" />
                            <span className="text-xl font-black text-white leading-none">Lvl {selectedMentor.badges.includes(MentorBadge.EXPERT) ? '50' : '25'}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Rank</span>
                        </div>
                    </div>

                    {/* Booking */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase italic text-white tracking-widest flex items-center gap-2">
                            <Calendar size={14} className="text-indigo-500" /> Session Booking
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-2">
                            {MOCK_SLOTS.map(slot => (
                                <button 
                                    key={slot} 
                                    onClick={() => { setSelectedSlot(slot); triggerHaptic('medium'); }} 
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        selectedSlot === slot 
                                        ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                                        : 'bg-[#0b0c10] text-slate-500 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Button */}
                <div className="p-6 pt-0 mt-auto bg-[#050505]">
                     <button 
                        onClick={handleBookSession} 
                        disabled={!selectedSlot || isBooking} 
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl relative overflow-hidden group ${
                            selectedSlot 
                            ? 'bg-[#111] text-white border border-white/10 hover:bg-[#1a1a1a]' 
                            : 'bg-[#0b0c10] text-slate-700 border border-white/5 cursor-not-allowed'
                        }`}
                    >
                        {isBooking ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                <span>Processing...</span>
                            </>
                        ) : bookingSuccess ? (
                            <>
                                <CheckCircle2 size={16} className="text-green-500" />
                                <span className="text-green-500">Confirmed</span>
                            </>
                        ) : (
                            <>
                                <Clock size={16} className={selectedSlot ? "text-slate-400 group-hover:text-white" : "text-slate-800"} />
                                <span>{selectedSlot ? 'Confirm Time' : 'Select Time'}</span>
                            </>
                        )}
                     </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipView;
