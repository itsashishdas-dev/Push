
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mentor, Booking, Discipline, BadgeTier, MentorBadge } from '../types';
import { backend } from '../services/mockBackend';
import { askAICoach } from '../services/geminiService';
import { Star, Send, Loader2, Sparkles, Play, X, Calendar, Clock, CheckCircle2, Quote, User as UserIcon, BadgeCheck, Zap, Filter, Bot, MessageSquare, ChevronRight, Terminal, BrainCircuit, Activity, Settings, Lock, Users, MapPin, IndianRupee, Cpu, ChevronDown } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';
import { useAppStore } from '../store';

const MOCK_SLOTS = ['10:00 AM', '1:00 PM', '3:30 PM']; 
const MOCK_DATES = ['Today', 'Tomorrow', 'Wed 24', 'Thu 25', 'Fri 26'];

const SUGGESTED_AI_PROMPTS = [
    { id: 1, text: "How to Ollie higher?", icon: Zap, color: "text-yellow-400", border: "border-yellow-500/50" },
    { id: 2, text: "Fix my speed wobble", icon: Activity, color: "text-red-400", border: "border-red-500/50" },
    { id: 3, text: "Best wheels for rough roads?", icon: Settings, color: "text-slate-300", border: "border-slate-500/50" },
    { id: 4, text: "Mental tips for dropping in", icon: BrainCircuit, color: "text-indigo-400", border: "border-indigo-500/50" }
];

// --- FORMATTER COMPONENTS ---

const FormattedInline = ({ text }: { text: string }) => {
    // Regex to capture **bold** text for highlighting
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    const content = part.slice(2, -2);
                    return (
                        <span key={idx} className="relative inline-block mx-0.5 px-1.5 py-0.5 rounded-[3px] bg-amber-500/10 border-b-2 border-amber-500/60 text-amber-200 font-bold shadow-[0_0_12px_rgba(245,158,11,0.15)] tracking-wide">
                            {content}
                        </span>
                    );
                }
                return part;
            })}
        </>
    );
};

const MessageContent = ({ text, isUser }: { text: string, isUser: boolean }) => {
    if (isUser) return <p className="font-medium tracking-wide">{text}</p>;

    const lines = text.split('\n');
    return (
        <div className="space-y-1">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-3" />; // Breathing space

                // Header Detection (###)
                if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
                    const content = trimmed.replace(/^#+\s*/, '');
                    return (
                        <h3 key={i} className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 border-b border-emerald-500/20 pb-2 mb-3 mt-5 flex items-center gap-2">
                            <div className="w-1 h-3 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                            {content}
                        </h3>
                    );
                }

                // List Detection (- or *)
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const content = trimmed.replace(/^[-*]\s*/, '');
                    return (
                        <div key={i} className="flex items-start gap-3 mb-2 pl-2 group/list">
                            <span className="text-emerald-500/70 mt-[6px] text-[8px] font-mono group-hover/list:text-emerald-400 transition-colors">▶</span>
                            <p className="text-sm leading-7 text-emerald-100/90 font-medium">
                                <FormattedInline text={content} />
                            </p>
                        </div>
                    );
                }
                
                // Numbered List (1.)
                if (/^\d+\.\s/.test(trimmed)) {
                     const content = trimmed.replace(/^\d+\.\s*/, '');
                     const num = trimmed.match(/^\d+/)?.[0];
                     return (
                        <div key={i} className="flex items-start gap-3 mb-2 pl-1">
                            <span className="text-emerald-500 font-mono font-bold text-[10px] mt-1 bg-emerald-500/10 px-1.5 rounded border border-emerald-500/20 h-fit min-w-[20px] text-center">{num}</span>
                            <p className="text-sm leading-7 text-emerald-100/90 font-medium">
                                <FormattedInline text={content} />
                            </p>
                        </div>
                     );
                }

                // Standard Paragraph
                return (
                    <p key={i} className="text-sm leading-7 mb-2 text-emerald-100/80 font-medium">
                        <FormattedInline text={line} />
                    </p>
                );
            })}
        </div>
    );
};

// --- MAIN VIEW ---

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
    playSound('click');
    
    try {
        const response = await askAICoach(textToSend);
        setChat(prev => [...prev, { role: 'model', text: response }]);
        triggerHaptic('medium');
        playSound('data_stream');
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

  return (
    <div className="pb-32 pt-8 px-4 md:px-6 animate-view h-full flex flex-col relative overflow-y-auto hide-scrollbar bg-[#020202]">
       {/* Background Layers */}
       <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
       <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

       {/* --- HEADER --- */}
       <header className="mb-6 shrink-0 relative z-10 pt-safe-top">
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
                    {activeTab === 'find' ? `${filteredMentors.length} PROS ONLINE` : 'NET.ACTIVE'}
                </span>
            </div>
          </div>
       </header>
      
      {/* --- MODE SWITCHER --- */}
      <div className="flex bg-[#0b0c10] p-1 rounded-xl border border-white/10 mb-6 shrink-0 relative z-10 backdrop-blur-sm shadow-xl">
           <button 
             onClick={() => { setActiveTab('find'); triggerHaptic('light'); }} 
             className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'find' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
               <Users size={12} /> Find Mentor
           </button>
           <button 
             onClick={() => { setActiveTab('ai-coach'); triggerHaptic('light'); }} 
             className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'ai-coach' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
               <Cpu size={12} /> AI Coach
           </button>
           <button 
             onClick={() => { setActiveTab('apply'); triggerHaptic('light'); }} 
             className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'apply' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
               <BadgeCheck size={12} /> Teach
           </button>
      </div>

      {/* --- AI COACH INTERFACE (Overlay Drawer) --- */}
      {/* 
          This is now an overlay that slides up, positioned absolutely at bottom.
          It covers the list but leaves the nav bar accessible underneath if needed, 
          though design-wise it sits 'above' the nav bar visually.
      */}
      <div 
        className={`
            fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4rem)] top-20 z-40 
            transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) flex flex-col px-4
            ${activeTab === 'ai-coach' ? 'translate-y-0' : 'translate-y-[120%] pointer-events-none'}
        `}
      >
          <div className="flex-1 flex flex-col bg-[#0b0c10] rounded-[2rem] overflow-hidden border border-emerald-500/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] relative w-full max-w-2xl mx-auto">
              {/* Header */}
              <div className="bg-[#080808] p-4 border-b border-white/10 flex items-center justify-between shrink-0 cursor-pointer" onClick={() => setActiveTab('find')}>
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                      <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">SPOT_NET // v2.5 ONLINE</span>
                  </div>
                  <ChevronDown size={16} className="text-slate-500" />
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 relative hide-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                  
                  {chat.length === 0 && (
                      <div className="space-y-6 mt-4 relative z-10 animate-pop">
                          <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10"><Terminal size={64} /></div>
                              <p className="text-xs font-mono text-emerald-400 mb-2 font-bold">> SYSTEM INITIALIZED</p>
                              <p className="text-sm text-emerald-100 font-medium leading-relaxed">Welcome to the Neural Training Network. I am your specialized skate AI. Query me on technique, physics, or spot strategy.</p>
                          </div>
                          
                          <div>
                              <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-3 pl-2">Initialize Query Sequence:</p>
                              <div className="grid grid-cols-1 gap-3">
                                  {SUGGESTED_AI_PROMPTS.map((prompt) => (
                                      <button 
                                        key={prompt.id}
                                        onClick={() => handleAiSend(prompt.text)}
                                        className={`flex items-center gap-3 p-4 bg-[#111] border rounded-xl hover:bg-[#1a1a1a] transition-all text-left group active:scale-95 shadow-lg border-l-4 ${prompt.border} border-y-white/5 border-r-white/5`}
                                      >
                                          <div className={`w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform`}>
                                              <prompt.icon size={16} className={prompt.color} />
                                          </div>
                                          <span className="text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-wide flex-1">{prompt.text}</span>
                                          <ChevronRight size={14} className="text-slate-700 group-hover:text-white" />
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}

                  {chat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop relative z-10`}>
                          <div 
                            className={`max-w-[85%] p-5 shadow-lg border relative group
                            ${msg.role === 'user' 
                                ? 'bg-indigo-600 border-indigo-500 text-white rounded-2xl rounded-br-sm' 
                                : 'bg-[#080808] border-emerald-500/20 text-emerald-100 rounded-2xl rounded-bl-sm font-mono'}`}
                          >
                              {msg.role === 'model' && (
                                  <div className="absolute -top-3 left-0 bg-[#080808] border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                                      <Bot size={10} /> AI_CORE
                                  </div>
                              )}
                              
                              <MessageContent text={msg.text} isUser={msg.role === 'user'} />
                          </div>
                      </div>
                  ))}
                  
                  {isAiThinking && (
                      <div className="flex justify-start animate-pulse">
                          <div className="bg-[#080808] p-3 rounded-2xl rounded-bl-sm border border-emerald-500/20 flex items-center gap-2">
                              <Loader2 className="animate-spin text-emerald-500" size={14} />
                              <span className="text-[10px] font-mono text-emerald-500 uppercase">Processing...</span>
                          </div>
                      </div>
                  )}
                  <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[#0b0c10] border-t border-white/10 shrink-0">
                  <div className="flex gap-2 items-center bg-[#050505] rounded-xl px-4 py-1 border border-white/10 focus-within:border-emerald-500/50 transition-colors shadow-inner">
                      <span className="text-emerald-500 font-mono text-xs animate-pulse">{'>'}</span>
                      <input 
                        className="flex-1 bg-transparent text-sm text-white focus:outline-none py-3 placeholder:text-slate-700 font-mono tracking-wide" 
                        placeholder="ENTER COMMAND..." 
                        value={aiInput} 
                        onChange={e => setAiInput(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleAiSend()} 
                      />
                      <button 
                        onClick={() => handleAiSend()} 
                        disabled={!aiInput.trim()} 
                        className="p-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 active:scale-95 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-500"
                      >
                          <Send size={14} />
                      </button>
                  </div>
              </div>
          </div>
      </div>

      {/* --- MENTOR LIST (Always Visible Background) --- */}
      {/* Only hide if 'apply' mode is active, otherwise show find list so overlay sits on top */}
      {activeTab !== 'apply' && (
          <div className={`space-y-6 relative z-10 transition-opacity duration-300 ${activeTab === 'ai-coach' ? 'opacity-30 pointer-events-none blur-sm' : 'opacity-100'}`}>
              <div className="flex flex-col gap-3">
                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Filter size={14} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" /></div>
                      <input type="text" placeholder="FILTER BY EXPERTISE..." className="w-full bg-[#0b0c10] rounded-2xl py-4 pl-10 pr-4 text-xs font-bold text-white focus:outline-none border border-white/10 focus:border-indigo-500/50 uppercase tracking-widest font-mono transition-colors shadow-lg" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
              </div>
              <div className="flex flex-col gap-4 pb-4">
                  {filteredMentors.map(mentor => (
                      <div 
                        key={mentor.id} 
                        onClick={() => { setSelectedMentor(mentor); triggerHaptic('medium'); }} 
                        className="group bg-[#0b0c10] border border-white/10 rounded-[2rem] p-5 cursor-pointer hover:border-indigo-500/40 transition-all active:scale-[0.98] shadow-lg relative overflow-hidden flex flex-col gap-4"
                      >
                          {/* Scanline Effect on Hover */}
                          <div className="absolute inset-0 bg-indigo-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 pointer-events-none z-0" />

                          <div className="flex items-start gap-5 relative z-10">
                              {/* Avatar Block */}
                              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-inner shrink-0 group-hover:border-indigo-500/50 transition-colors">
                                  <img src={mentor.avatar} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ imageRendering: 'pixelated' }} />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                  
                                  {/* Rank Badge */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-[7px] font-black text-center text-white py-1 uppercase tracking-widest border-t border-white/5">
                                      LVL 50
                                  </div>
                              </div>
                              
                              {/* Header Info */}
                              <div className="flex-1 pt-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                      <h3 className="text-xl font-black italic uppercase text-white leading-none tracking-tighter truncate group-hover:text-indigo-300 transition-colors">{mentor.name}</h3>
                                      <div className="flex items-center gap-1 bg-green-950/50 border border-green-500/20 px-1.5 py-0.5 rounded-md">
                                          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_4px_#22c55e]" />
                                          <span className="text-[7px] font-black uppercase text-green-400 tracking-wider">ON</span>
                                      </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1 mb-2.5">
                                      {mentor.disciplines.map(d => (
                                          <span key={d} className="text-[7px] font-black uppercase bg-[#151515] text-slate-300 px-2 py-0.5 rounded tracking-wider border border-white/5 group-hover:border-white/10">
                                              {d}
                                          </span>
                                      ))}
                                      {mentor.badges.includes(MentorBadge.CERTIFIED) && (
                                          <span className="text-[7px] font-black uppercase bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded tracking-wider border border-blue-500/30 flex items-center gap-1">
                                              <BadgeCheck size={8} /> Pro
                                          </span>
                                      )}
                                  </div>
                                  <p className="text-[9px] text-slate-500 font-medium leading-tight line-clamp-2 border-l-2 border-slate-800 pl-2 group-hover:border-indigo-500/30 transition-colors">
                                      "{mentor.bio}"
                                  </p>
                              </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden mt-1 relative z-10">
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
                                  <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">Alumni</span>
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
                {/* (Profile Modal Content kept mostly same, visual tweaks applied above) */}
                <div className="relative h-72 w-full shrink-0 bg-[#111]">
                     <button 
                        onClick={closeProfile} 
                        className="absolute top-5 left-5 z-20 w-10 h-10 bg-black/40 backdrop-blur-md rounded-xl text-white/80 border border-white/10 flex items-center justify-center active:scale-95 transition-all hover:bg-white/10"
                     >
                         <X size={20} />
                     </button>

                     <div className="absolute top-5 right-5 z-20 bg-green-950/80 backdrop-blur-md border border-green-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                         <span className="text-[9px] font-black uppercase text-green-400 tracking-widest">Online</span>
                     </div>

                     <img src={selectedMentor.avatar} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

                     <div className="absolute bottom-0 left-0 w-full p-6 pb-2">
                         <h1 className="text-5xl font-black italic uppercase text-white leading-[0.8] tracking-tighter drop-shadow-xl mb-3">{selectedMentor.name}</h1>
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

                <div className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6">
                    {/* Simplified Stats */}
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

                    <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase italic text-white tracking-widest flex items-center gap-2"><Calendar size={14} className="text-indigo-500" /> Session Booking</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {MOCK_SLOTS.map(slot => (
                                <button 
                                    key={slot} 
                                    onClick={() => { setSelectedSlot(slot); triggerHaptic('medium'); }} 
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedSlot === slot ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-[#0b0c10] text-slate-500 border-white/5 hover:border-white/20'}`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-0 mt-auto bg-[#050505]">
                     <button 
                        onClick={handleBookSession} 
                        disabled={!selectedSlot || isBooking} 
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl relative overflow-hidden group ${selectedSlot ? 'bg-[#111] text-white border border-white/10 hover:bg-[#1a1a1a]' : 'bg-[#0b0c10] text-slate-700 border border-white/5 cursor-not-allowed'}`}
                    >
                        {isBooking ? <><Loader2 className="animate-spin" size={16} /><span>Processing...</span></> : bookingSuccess ? <><CheckCircle2 size={16} className="text-green-500" /><span className="text-green-500">Confirmed</span></> : <><Clock size={16} className={selectedSlot ? "text-slate-400 group-hover:text-white" : "text-slate-800"} /><span>{selectedSlot ? 'Confirm Time' : 'Select Time'}</span></>}
                     </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipView;
