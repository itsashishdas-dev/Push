
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Mentor, Booking, Discipline, MentorBadge } from '../types';
import { MENTOR_BADGE_META } from '../constants';
import { backend } from '../services/mockBackend';
import { askAICoach } from '../services/geminiService';
import { Star, GraduationCap, IndianRupee, Zap, Mountain, Loader2, Check, Brain, Send, Bot, Video, ShieldCheck, Sparkles, X, MessageCircle, Lock } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';

const SUGGESTIONS = [
  { icon: Sparkles, label: "Fix my Ollie", prompt: "My ollies are low and I turn slightly frontside. How do I fix this?" },
  { icon: ShieldCheck, label: "Mental Game", prompt: "I'm scared to commit to dropping in. Give me a mental strategy." },
  { icon: Zap, label: "Speed Wobbles", prompt: "How do I handle speed wobbles when going downhill?" },
  { icon: Video, label: "Filming Tips", prompt: "What are the best angles for filming a skate line with a phone?" },
];

const MentorshipView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myMentorProfile, setMyMentorProfile] = useState<Mentor | undefined>(undefined);
  
  const [activeTab, setActiveTab] = useState<'find' | 'dashboard' | 'my-lessons' | 'ai-coach'>('find');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDisciplineFilter, setActiveDisciplineFilter] = useState<'ALL' | Discipline>('ALL');

  const [aiInput, setAiInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'ai-coach') chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChatHistory, activeTab]);

  const loadData = async () => {
    const user = await backend.getUser();
    const allMentors = await backend.getMentors();
    const myProfile = await backend.getMyMentorProfile();
    const myBookings = await backend.getUserBookings();

    setCurrentUser(user);
    setMentors(allMentors);
    setMyMentorProfile(myProfile);
    setBookings(myBookings);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await backend.applyToBecomeMentor({ rate: 500, bio: 'Expert', experience: '10 years', style: 'Street', video: 'link' });
      setShowApplyModal(false);
      triggerHaptic('success');
      playSound('success');
      loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAiSend = async (textOverride?: string) => {
    const textToSend = textOverride || aiInput.trim();
    if (!textToSend || isAiThinking) return;
    
    setAiInput('');
    setAiChatHistory(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsAiThinking(true);
    triggerHaptic('light');

    const context = `Context: User Level ${currentUser?.level || 1}, ${currentUser?.stance || 'regular'}. Discipline: ${currentUser?.disciplines.join(', ')}.`;
    const fullQuery = `${context}\n\nQuestion: ${textToSend}`;

    const response = await askAICoach(fullQuery);
    
    setIsAiThinking(false);
    setAiChatHistory(prev => [...prev, { role: 'model', text: response }]);
    triggerHaptic('medium');
    playSound('success');
  };

  const filteredMentors = useMemo(() => {
    let result = mentors;
    if (activeDisciplineFilter !== 'ALL') result = result.filter(m => m.disciplines.includes(activeDisciplineFilter));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.bio.toLowerCase().includes(q));
    }
    return result;
  }, [mentors, activeDisciplineFilter, searchQuery]);

  if (!currentUser) return null;

  const isLevelLocked = currentUser.level < 5;

  return (
    <div className="pb-32 pt-6 md:pb-10 space-y-6 px-4 animate-view relative min-h-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Academy</h1>
          <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase">Learn from the Community</p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto hide-scrollbar max-w-[60%]">
           <button onClick={() => setActiveTab('find')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'find' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Market</button>
           <button onClick={() => setActiveTab('ai-coach')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1 ${activeTab === 'ai-coach' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}><Brain size={10} /> AI Coach</button>
           <button onClick={() => setActiveTab('my-lessons')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'my-lessons' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Lessons</button>
        </div>
      </header>

      {activeTab === 'ai-coach' && (
        <div className="flex flex-col h-[calc(100vh-220px)] bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiChatHistory.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                        <Bot size={32} className="text-amber-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Coach PUSH</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">Expert technique analysis powered by Gemini.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
                        {SUGGESTIONS.map((s, i) => (
                            <button key={i} onClick={() => handleAiSend(s.prompt)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl text-left transition-all active:scale-95 group">
                                <div className="flex items-center gap-2 mb-1">
                                    <s.icon size={12} className="text-amber-500" />
                                    <span className="text-[9px] font-black uppercase text-indigo-400 group-hover:text-white transition-colors">{s.label}</span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-1">{s.prompt}</p>
                            </button>
                        ))}
                    </div>
                 </div>
              ) : (
                  <>
                    {aiChatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isAiThinking && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <Brain size={16} className="text-amber-500 animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thinking Deeply...</span>
                            </div>
                        </div>
                    )}
                  </>
              )}
              <div ref={chatEndRef} />
           </div>
           <div className="p-4 bg-slate-950 border-t border-slate-800">
              <div className="flex gap-2">
                 <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiSend()} placeholder="Ask the Coach..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                 <button onClick={() => handleAiSend()} disabled={isAiThinking || !aiInput.trim()} className="bg-amber-500 text-white p-3 rounded-xl disabled:opacity-50 active:scale-95"><Send size={18} /></button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'find' && (
        <div className="space-y-6">
          {!currentUser.isMentor && (
            <section className={`p-6 rounded-[2rem] border overflow-hidden relative ${isLevelLocked ? 'bg-slate-900 border-slate-800 opacity-60' : 'bg-indigo-900 border-indigo-500 shadow-xl'}`}>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <GraduationCap size={20} className="text-white" />
                            <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Teach the Squad</h3>
                        </div>
                        <p className={`text-xs font-medium max-w-sm ${isLevelLocked ? 'text-slate-500' : 'text-indigo-100/70'}`}>Earn money by coaching local skaters.</p>
                    </div>
                    {isLevelLocked ? (
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
                            <Lock size={14} className="text-slate-500" />
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Lvl 5 required</span>
                        </div>
                    ) : (
                        <button onClick={() => setShowApplyModal(true)} className="bg-white text-indigo-900 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Apply Now</button>
                    )}
                </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMentors.map(mentor => (
                <div key={mentor.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 rounded-2xl border-2 border-slate-800 overflow-hidden shrink-0"><img src={mentor.avatar} alt="" className="w-full h-full object-cover" /></div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h4 className="text-lg font-black italic uppercase text-white">{mentor.name}</h4>
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-black"><Star size={12} fill="currentColor" /> {mentor.rating}</div>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">₹{mentor.rate} / hr</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 italic">"{mentor.bio}"</p>
                    <button onClick={() => setSelectedMentor(mentor)} className="w-full py-3 bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500">Book Session</button>
                </div>
            ))}
          </div>
        </div>
      )}

      {selectedMentor && (
          <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-8 space-y-6 animate-view">
                  <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">Secure Slot</span>
                        <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Coach {selectedMentor.name}</h3>
                    </div>
                    <button onClick={() => setSelectedMentor(null)} className="p-2 -mr-2 text-slate-500"><X size={24} /></button>
                  </div>
                  <div className="space-y-4">
                      <div className="bg-slate-800 p-4 rounded-xl flex justify-between"><span className="text-[10px] font-black uppercase text-slate-500">Rate</span><span className="text-lg font-black italic text-white">₹{selectedMentor.rate}</span></div>
                      <button onClick={() => { setSelectedMentor(null); setActiveTab('my-lessons'); triggerHaptic('success'); }} className="w-full py-4 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"><IndianRupee size={16} /> Pay & Book</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MentorshipView;
