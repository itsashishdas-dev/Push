
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mentor, Booking, Discipline, BadgeTier, MentorBadge } from '../types';
import { backend } from '../services/mockBackend';
import { askAICoach } from '../services/geminiService';
import { Star, Send, Loader2, Sparkles, Play, X, Calendar, Clock, CheckCircle2, Quote, User as UserIcon, BadgeCheck, Zap, Filter, Bot, MessageSquare, ChevronRight, Terminal, BrainCircuit, Activity, Settings, Lock, Users } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';
import { useAppStore } from '../store';

const MOCK_SLOTS = ['10:00 AM', '1:00 PM', '3:30 PM', '5:00 PM', '7:00 PM'];
const MOCK_DATES = ['Today', 'Tomorrow', 'Wed 24', 'Thu 25', 'Fri 26'];

const MOCK_REVIEWS = [
    { id: 1, user: 'Rohan K.', rating: 5, text: "Learned kickflips in one session. Absolute legend." },
    { id: 2, user: 'Sarah M.', rating: 4, text: "Great tips on stance correction." },
    { id: 3, user: 'Vikram', rating: 5, text: "The best downhill spot guide in the city." }
];

const SUGGESTED_AI_PROMPTS = [
    { id: 1, text: "How to Ollie higher?", icon: Zap },
    { id: 2, text: "Fix my speed wobble", icon: Activity },
    { id: 3, text: "Best wheels for rough roads?", icon: Settings },
    { id: 4, text: "Mental tips for dropping in", icon: BrainCircuit }
];

const MentorshipView: React.FC = () => {
  const { user } = useAppStore();
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
      setTimeout(() => {
          setIsBooking(false);
          setBookingSuccess(true);
          triggerHaptic('success');
          playSound('success');
      }, 1500);
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
              <div className="bg-[#020202] p-3 border-b border-white/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">SPOT_NET // v2.5</span>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
                  {chat.length === 0 && (
                      <div className="space-y-6 mt-4 relative z-10">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                              <p className="text-xs font-mono text-emerald-400 mb-2">> SYSTEM INITIALIZED</p>
                              <p className="text-sm text-emerald-100">Welcome to the Neural Training Network.</p>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                                  {SUGGESTED_AI_PROMPTS.map((prompt) => (
                                      <button 
                                        key={prompt.id}
                                        onClick={() => handleAiSend(prompt.text)}
                                        className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-slate-800 transition-all text-left group active:scale-95"
                                      >
                                          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors border border-slate-800">
                                              <prompt.icon size={16} />
                                          </div>
                                          <span className="text-xs font-bold text-slate-300 group-hover:text-white">{prompt.text}</span>
                                          <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-emerald-500" />
                                      </button>
                                  ))}
                          </div>
                      </div>
                  )}
                  {chat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop relative z-10`}>
                          <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-[#1e2330] border border-white/5 text-slate-200'}`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  {isAiThinking && <div className="flex justify-start animate-pulse"><div className="bg-[#1e2330] p-4 rounded-2xl"><Loader2 className="animate-spin text-emerald-500" size={16} /></div></div>}
                  <div ref={chatEndRef} />
              </div>
              <div className="p-3 bg-[#020202] border-t border-white/10 shrink-0">
                  <div className="flex gap-2 items-center bg-[#0b0c10] rounded-xl px-4 py-2 border border-white/10 focus-within:border-emerald-500/50 transition-colors">
                      <Terminal size={16} className="text-slate-500" />
                      <input className="flex-1 bg-transparent text-sm text-white focus:outline-none py-2 placeholder:text-slate-600 font-mono" placeholder="Enter command..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} />
                      <button onClick={() => handleAiSend()} disabled={!aiInput.trim()} className="p-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50"><Send size={16} /></button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MENTOR LIST --- */}
      {activeTab === 'find' && (
          <div className="space-y-6 relative z-10">
              <div className="flex flex-col gap-3">
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Filter size={14} className="text-slate-500" /></div>
                      <input type="text" placeholder="Search mentors..." className="w-full bg-[#0b0c10]/80 rounded-xl py-3 pl-9 pr-4 text-xs font-bold text-white focus:outline-none border border-white/10 uppercase tracking-wide" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
              </div>
              <div className="grid grid-cols-1 gap-4 pb-4">
                  {filteredMentors.map(mentor => (
                      <div key={mentor.id} onClick={() => { setSelectedMentor(mentor); triggerHaptic('medium'); }} className="group bg-[#0b0c10] border border-white/10 rounded-[2rem] p-1 pr-5 flex items-center gap-4 cursor-pointer hover:bg-slate-900 transition-all active:scale-[0.98] shadow-lg">
                          <div className="relative w-20 h-20 rounded-[1.7rem] overflow-hidden bg-slate-800 shrink-0 border border-white/5">
                              <img src={mentor.avatar} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 py-2">
                              <h3 className="text-base font-black italic uppercase text-white truncate">{mentor.name}</h3>
                              <div className="flex items-center justify-between mt-1">
                                  <div className="flex -space-x-1.5">
                                      {mentor.badges.includes(MentorBadge.CERTIFIED) && <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border border-slate-900 text-white"><BadgeCheck size={10} /></div>}
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-500">₹{mentor.rate}/hr</span>
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

      {/* --- MENTOR PROFILE MODAL (REMASTERED) --- */}
      {selectedMentor && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-view">
            {/* Card Container */}
            <div className="w-full max-w-md bg-[#0b0c10] border border-white/10 rounded-[2.5rem] relative overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                
                {/* 1. Header Image & Name */}
                <div className="relative h-96 w-full shrink-0">
                     {/* Image - Scaling pixel art properly */}
                     <img src={selectedMentor.avatar} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                     
                     {/* Gradients to ensure text readability */}
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/20 to-transparent" />
                     <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

                     {/* Top Controls */}
                     <button 
                        onClick={closeProfile} 
                        className="absolute top-6 left-6 z-20 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 flex items-center justify-center active:scale-95 transition-all hover:bg-white/10"
                     >
                         <X size={20} />
                     </button>
                     
                     {/* Status Pill */}
                     <div className="absolute top-6 right-6 z-20 bg-green-900/30 backdrop-blur-md border border-green-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                         <span className="text-[9px] font-black uppercase text-green-400 tracking-widest">1 Pros Online</span>
                     </div>

                     {/* Name & Rate */}
                     <div className="absolute bottom-0 left-0 w-full p-8 pb-4">
                         <h1 className="text-6xl font-black italic uppercase text-white leading-[0.85] tracking-tighter drop-shadow-2xl mb-3">
                             {selectedMentor.name}
                         </h1>
                         
                         <div className="flex items-center gap-3">
                             {selectedMentor.badges.includes(MentorBadge.CERTIFIED) && (
                                 <div className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-md flex items-center gap-1 shadow-lg shadow-blue-900/20">
                                     <BadgeCheck size={12} strokeWidth={3} /> Certified
                                 </div>
                             )}
                             <span className="text-2xl font-black text-slate-200 italic tracking-tight">₹{selectedMentor.rate}/hr</span>
                         </div>
                     </div>
                </div>

                {/* 2. Scrollable Content */}
                <div className="flex-1 overflow-y-auto hide-scrollbar p-6 pt-2 space-y-8 relative bg-[#0b0c10]">
                    
                    {/* Stats Row (New Detail) */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-1">
                            <Star size={16} className="text-yellow-500 mb-1" fill="currentColor" />
                            <span className="text-lg font-black text-white leading-none">{selectedMentor.rating}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Rating</span>
                        </div>
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-1">
                            <Users size={16} className="text-indigo-500 mb-1" />
                            <span className="text-lg font-black text-white leading-none">{selectedMentor.studentsTrained}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Students</span>
                        </div>
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-1">
                            <Activity size={16} className="text-emerald-500 mb-1" />
                            <span className="text-lg font-black text-white leading-none">Lvl {selectedMentor.badges.includes(MentorBadge.EXPERT) ? '50' : '25'}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Rank</span>
                        </div>
                    </div>

                    {/* Booking Section */}
                    <section>
                        <h3 className="text-xs font-black uppercase italic text-white tracking-widest mb-4 flex items-center gap-2">
                            <Calendar size={14} className="text-indigo-500" /> Session Booking
                        </h3>
                        
                        {/* Time Slots Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {MOCK_SLOTS.map(slot => (
                                <button 
                                    key={slot} 
                                    onClick={() => { setSelectedSlot(slot); triggerHaptic('medium'); }} 
                                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border relative overflow-hidden group active:scale-95 ${
                                        selectedSlot === slot 
                                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] z-10' 
                                        : 'bg-[#151515] text-slate-500 border-white/5 hover:border-white/20 hover:bg-[#1a1a1a] hover:text-slate-300'
                                    }`}
                                >
                                    {slot}
                                    {selectedSlot === slot && (
                                        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Bio Snippet (New Detail) */}
                    <section>
                        <h3 className="text-xs font-black uppercase italic text-white tracking-widest mb-3 flex items-center gap-2">
                            <Terminal size={14} className="text-indigo-500" /> Bio_Data
                        </h3>
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-4">
                            <p className="text-xs text-slate-400 font-medium leading-relaxed font-mono">
                                "{selectedMentor.bio}"
                            </p>
                        </div>
                    </section>

                    {/* Reviews Snippet (New Detail) */}
                    <section>
                        <h3 className="text-xs font-black uppercase italic text-white tracking-widest mb-3 flex items-center gap-2">
                            <MessageSquare size={14} className="text-indigo-500" /> Recent Comms
                        </h3>
                        <div className="space-y-3">
                            {MOCK_REVIEWS.slice(0, 2).map(r => (
                                <div key={r.id} className="bg-[#121214] border border-white/5 rounded-xl p-3 flex gap-3">
                                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black text-slate-500">
                                        {r.user.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase text-white">{r.user}</span>
                                            <div className="flex text-yellow-500"><Star size={8} fill="currentColor" /></div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight">"{r.text}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Spacer for bottom button */}
                    <div className="h-4" />
                </div>

                {/* 3. Sticky Action Footer */}
                <div className="p-6 pt-4 bg-[#0b0c10] border-t border-white/10 shrink-0 relative z-20">
                     {bookingSuccess ? (
                         <div className="w-full h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-pop border border-green-400">
                             <CheckCircle2 size={24} className="animate-bounce" />
                             <div className="flex flex-col text-left">
                                <span className="font-black uppercase tracking-[0.2em] text-sm leading-none">Booking Confirmed</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-80 mt-1">Check logs for details</span>
                             </div>
                         </div>
                     ) : (
                         <button 
                            onClick={handleBookSession} 
                            disabled={!selectedSlot || isBooking} 
                            className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm transition-all relative overflow-hidden group ${
                                selectedSlot 
                                ? 'bg-[#3730a3] text-white hover:bg-[#312e81] shadow-[0_0_30px_rgba(99,102,241,0.4)] active:scale-[0.98]' 
                                : 'bg-[#1a1a1a] text-slate-600 cursor-not-allowed border border-white/5'
                            }`}
                        >
                            {/* Button Shine Effect */}
                            {selectedSlot && !isBooking && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            )}

                            {isBooking ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Processing Uplink...</span>
                                </>
                            ) : (
                                <>
                                    <Clock size={20} className={selectedSlot ? "text-indigo-300" : "text-slate-600"} />
                                    <span>{selectedSlot ? `Confirm: ${selectedSlot}` : 'Select Time'}</span>
                                </>
                            )}
                         </button>
                     )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipView;
