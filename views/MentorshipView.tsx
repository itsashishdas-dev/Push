
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mentor, Booking, Discipline } from '../types';
import { backend } from '../services/mockBackend';
import { askAICoach } from '../services/geminiService';
import { Star, Send, Loader2, Sparkles, Play, X, Calendar, Clock, CheckCircle2, Quote, User as UserIcon, BadgeCheck, Zap, Filter, Bot, MessageSquare, ChevronRight, Terminal, BrainCircuit, Activity, Settings } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'find' | 'ai-coach'>('find');
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
      <div className="grid grid-cols-2 gap-2 mb-6 shrink-0 relative z-10">
           <button 
             onClick={() => { setActiveTab('find'); triggerHaptic('light'); }} 
             className={`relative overflow-hidden py-4 rounded-2xl border transition-all duration-300 group ${activeTab === 'find' ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.25)]' : 'bg-[#0b0c10] border-slate-800'}`}
           >
               <div className="flex flex-col items-center gap-1 relative z-10">
                   <UserIcon size={20} className={activeTab === 'find' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                   <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'find' ? 'text-white' : 'text-slate-500'}`}>Live Coaching</span>
               </div>
               {activeTab === 'find' && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />}
           </button>

           <button 
             onClick={() => { setActiveTab('ai-coach'); triggerHaptic('light'); }} 
             className={`relative overflow-hidden py-4 rounded-2xl border transition-all duration-300 group ${activeTab === 'ai-coach' ? 'bg-emerald-600 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]' : 'bg-[#0b0c10] border-slate-800'}`}
           >
               <div className="flex flex-col items-center gap-1 relative z-10">
                   <Bot size={20} className={activeTab === 'ai-coach' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                   <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'ai-coach' ? 'text-white' : 'text-slate-500'}`}>System Link</span>
               </div>
               {activeTab === 'ai-coach' && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />}
           </button>
      </div>

      {/* --- AI COACH INTERFACE --- */}
      {activeTab === 'ai-coach' && (
          <div className="flex-1 flex flex-col bg-[#0b0c10] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative min-h-0 animate-view">
              
              {/* Terminal Header */}
              <div className="bg-[#020202] p-3 border-b border-white/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">SPOT_NET // v2.5</span>
                  </div>
                  <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-800" />
                      <div className="w-2 h-2 rounded-full bg-slate-800" />
                  </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                      <BrainCircuit size={200} />
                  </div>

                  {chat.length === 0 && (
                      <div className="space-y-6 mt-4 relative z-10">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                              <p className="text-xs font-mono text-emerald-400 mb-2">> SYSTEM INITIALIZED</p>
                              <p className="text-sm text-emerald-100">Welcome to the Neural Training Network. I can analyze tricks, suggest gear, or help you find lines.</p>
                          </div>
                          
                          <div>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Execute Command:</p>
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
                      </div>
                  )}

                  {chat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop relative z-10`}>
                          <div 
                            className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-lg ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                : 'bg-[#1e2330] border border-white/5 text-slate-200 rounded-tl-sm'
                            }`}
                          >
                              {msg.role === 'model' && <div className="text-[8px] font-black uppercase text-emerald-500 mb-1 tracking-widest">> RESPONSE</div>}
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  
                  {isAiThinking && (
                      <div className="flex justify-start animate-pulse relative z-10">
                          <div className="bg-[#1e2330] border border-white/5 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                              <Loader2 className="animate-spin text-emerald-500" size={16} />
                              <span className="text-xs font-mono text-emerald-500">PROCESSING DATA...</span>
                          </div>
                      </div>
                  )}
                  <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-[#020202] border-t border-white/10 shrink-0">
                  <div className="flex gap-2 items-center bg-[#0b0c10] rounded-xl px-4 py-2 border border-white/10 focus-within:border-emerald-500/50 transition-colors">
                      <Terminal size={16} className="text-slate-500" />
                      <input 
                        className="flex-1 bg-transparent text-sm text-white focus:outline-none py-2 placeholder:text-slate-600 font-mono"
                        placeholder="Enter command..."
                        value={aiInput}
                        onChange={e => setAiInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                      />
                      <button 
                        onClick={() => handleAiSend()} 
                        disabled={!aiInput.trim()} 
                        className="p-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-600 transition-all hover:bg-emerald-500 active:scale-95"
                      >
                          <Send size={16} strokeWidth={2.5} />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MENTORS LIST INTERFACE --- */}
      {activeTab === 'find' && (
          <div className="space-y-6 relative z-10">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col gap-3">
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Filter size={14} className="text-slate-500" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Search by name or style..."
                        className="w-full bg-[#0b0c10]/80 rounded-xl py-3 pl-9 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/10 uppercase tracking-wide placeholder:text-slate-600 font-mono"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                  </div>
                  
                  {/* Filter Chips */}
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                      {['ALL', Discipline.SKATE, Discipline.DOWNHILL].map(d => (
                          <button
                            key={d}
                            onClick={() => { setDisciplineFilter(d as any); triggerHaptic('light'); }}
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                disciplineFilter === d 
                                ? 'bg-white text-black border-white shadow-lg' 
                                : 'bg-[#0b0c10] text-slate-500 border-slate-800 hover:bg-slate-900'
                            }`}
                          >
                              {d}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Mentor Cards Grid */}
              <div className="grid grid-cols-1 gap-4 pb-4">
                  {filteredMentors.map(mentor => (
                      <div 
                        key={mentor.id} 
                        onClick={() => { setSelectedMentor(mentor); triggerHaptic('medium'); }} 
                        className="group bg-[#0b0c10] border border-white/10 rounded-[2rem] p-1 pr-5 flex items-center gap-4 cursor-pointer hover:bg-slate-900 transition-all active:scale-[0.98] shadow-lg"
                      >
                          {/* Avatar */}
                          <div className="relative w-20 h-20 rounded-[1.7rem] overflow-hidden bg-slate-800 shrink-0 border border-white/5 group-hover:border-white/20 transition-colors">
                              <img src={mentor.avatar} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-2 left-0 w-full flex justify-center">
                                  <div className="flex gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} size={8} className={i < Math.floor(mentor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
                                      ))}
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 py-2">
                              <div className="flex justify-between items-start mb-1">
                                  <h3 className="text-base font-black italic uppercase text-white truncate">{mentor.name}</h3>
                                  <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-indigo-300">
                                      <span className="text-[10px] font-bold">₹{mentor.rate}</span>
                                  </div>
                              </div>
                              
                              <div className="flex gap-2 mb-2 flex-wrap">
                                 {mentor.disciplines.map(d => (
                                     <span key={d} className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-black px-1.5 py-0.5 rounded border border-white/5">{d}</span>
                                 ))}
                              </div>

                              <div className="flex items-center justify-between mt-1">
                                  <div className="flex -space-x-1.5">
                                      {mentor.badges.includes('certified' as any) && (
                                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border border-slate-900 text-white" title="Certified">
                                              <BadgeCheck size={10} />
                                          </div>
                                      )}
                                      {mentor.badges.includes('expert' as any) && (
                                          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center border border-slate-900 text-white" title="Expert">
                                              <Zap size={10} fill="currentColor" />
                                          </div>
                                      )}
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                                      <UserIcon size={10} /> {mentor.studentsTrained} Students
                                  </span>
                              </div>
                          </div>
                      </div>
                  ))}
                  
                  {filteredMentors.length === 0 && (
                      <div className="py-12 text-center">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No mentors found in this sector.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- MENTOR PROFILE & BOOKING OVERLAY --- */}
      {selectedMentor && (
          <div className="fixed inset-0 z-[100] bg-[#020202] overflow-y-auto animate-view">
             
             {/* Header Image Area */}
             <div className="relative h-80 w-full shrink-0">
                 <img src={selectedMentor.avatar} className="w-full h-full object-cover opacity-70" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/40 to-transparent" />
                 
                 {/* Navigation Actions */}
                 <div className="absolute top-0 left-0 w-full p-6 pt-safe-top z-20 flex justify-between">
                     <button onClick={closeProfile} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 flex items-center justify-center active:scale-95 transition-all">
                         <X size={20} />
                     </button>
                 </div>
                 
                 <div className="absolute bottom-0 left-0 w-full p-6 space-y-2">
                     <div className="flex gap-2">
                        {selectedMentor.badges.map(badge => (
                            <span key={badge} className="bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded shadow-lg tracking-widest">
                                {badge}
                            </span>
                        ))}
                     </div>
                     <h1 className="text-5xl font-black italic uppercase text-white leading-[0.8] tracking-tighter drop-shadow-xl">{selectedMentor.name}</h1>
                     <p className="text-xs font-bold text-slate-300 max-w-xs leading-relaxed opacity-90">"{selectedMentor.bio}"</p>
                 </div>
             </div>

             <div className="p-6 space-y-10 pb-32">
                 
                 {/* Stats Row */}
                 <div className="flex justify-between items-center bg-[#0b0c10] p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                     <div className="text-center">
                         <div className="text-xl font-black text-white italic">{selectedMentor.rating}</div>
                         <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Rating</div>
                     </div>
                     <div className="w-px h-8 bg-white/10" />
                     <div className="text-center">
                         <div className="text-xl font-black text-white italic">{selectedMentor.studentsTrained}+</div>
                         <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Students</div>
                     </div>
                     <div className="w-px h-8 bg-white/10" />
                     <div className="text-center">
                         <div className="text-xl font-black text-white italic text-indigo-400">₹{selectedMentor.rate}</div>
                         <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Per Hour</div>
                     </div>
                 </div>

                 {/* Availability & Booking */}
                 <section>
                    <h3 className="text-sm font-black uppercase italic text-white tracking-widest mb-4 flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-500" /> Session Booking
                    </h3>
                    
                    {/* Date Selector */}
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-1">
                        {MOCK_DATES.map(date => (
                            <button
                                key={date}
                                onClick={() => { setSelectedDate(date); triggerHaptic('light'); }}
                                className={`flex-1 min-w-[80px] p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                                    selectedDate === date 
                                    ? 'bg-white text-black border-white shadow-lg transform scale-105' 
                                    : 'bg-[#0b0c10] text-slate-500 border-slate-800'
                                }`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest">{date.split(' ')[0]}</span>
                                <span className={`text-xs font-bold ${selectedDate === date ? 'text-black' : 'text-white'}`}>{date.split(' ')[1] || '23'}</span>
                            </button>
                        ))}
                    </div>

                    {/* Time Slots */}
                    <div className="grid grid-cols-3 gap-2">
                        {MOCK_SLOTS.map(slot => (
                            <button 
                                key={slot}
                                onClick={() => { setSelectedSlot(slot); triggerHaptic('light'); }}
                                className={`py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                                    selectedSlot === slot 
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                                    : 'bg-[#0b0c10] text-slate-400 border-slate-800 hover:border-slate-600'
                                }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                 </section>

                 {/* Reviews */}
                 <section>
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-sm font-black uppercase italic text-white tracking-widest">Cadet Intel</h3>
                        <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                        </div>
                    </div>
                    <div className="space-y-3">
                        {MOCK_REVIEWS.map(review => (
                            <div key={review.id} className="bg-[#0b0c10] border border-white/5 p-4 rounded-2xl relative">
                                <Quote size={16} className="absolute top-4 right-4 text-slate-800" />
                                <p className="text-xs text-slate-300 italic mb-2 pr-6">"{review.text}"</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center">
                                        <UserIcon size={10} className="text-slate-500" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{review.user}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                 </section>

             </div>

             {/* Booking Action Bar */}
             <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent z-50">
                 {bookingSuccess ? (
                     <div className="w-full h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.25)] animate-view border border-green-400">
                         <CheckCircle2 size={24} className="animate-bounce" />
                         <div className="flex flex-col items-start">
                             <span className="font-black uppercase tracking-[0.2em] text-xs">Request Sent</span>
                             <span className="text-[9px] font-bold opacity-80 uppercase">Awaiting Confirmation</span>
                         </div>
                     </div>
                 ) : (
                     <button
                        onClick={handleBookSession}
                        disabled={!selectedSlot || isBooking}
                        className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl ${
                            selectedSlot 
                            ? 'bg-white text-black hover:bg-slate-200 active:scale-95' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                     >
                        {isBooking ? <Loader2 className="animate-spin" /> : <Clock size={18} />}
                        {isBooking ? 'Processing...' : selectedSlot ? `Confirm: ${selectedSlot}` : 'Select Time Slot'}
                     </button>
                 )}
             </div>

          </div>
      )}
    </div>
  );
};

export default MentorshipView;
