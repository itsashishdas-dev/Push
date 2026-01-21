
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Mentor, Booking, Discipline, MentorBadge, ChatMessage } from '../types';
import { MENTOR_BADGE_META } from '../constants';
import { backend } from '../services/mockBackend';
import { askAICoach } from '../services/geminiService';
import { Star, GraduationCap, Clock, IndianRupee, Zap, Mountain, CalendarDays, Loader2, Check, UserPlus, TrendingUp, X, Filter, Bot, Send, Brain, Upload, Lock, FileText, Video, Search, MapPin, BadgeCheck, Trophy } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';

const MentorshipView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myMentorProfile, setMyMentorProfile] = useState<Mentor | undefined>(undefined);
  
  const [activeTab, setActiveTab] = useState<'find' | 'dashboard' | 'my-lessons' | 'ai-coach'>('find');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDisciplineFilter, setActiveDisciplineFilter] = useState<'ALL' | Discipline>('ALL');
  const [activeBadgeFilter, setActiveBadgeFilter] = useState<MentorBadge | 'ALL'>('ALL');

  // AI Coach State
  const [aiInput, setAiInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "What's up! I'm Coach PUSH. Ask me anything about trick tips, spots, or gear setup. I can think deep if you have a complex question." }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Application Form State
  const [applyRate, setApplyRate] = useState(500);
  const [applyBio, setApplyBio] = useState('');
  const [applyExperience, setApplyExperience] = useState('');
  const [applyStyle, setApplyStyle] = useState('Technical');
  const [applyVideo, setApplyVideo] = useState(''); // File name simulation

  // Booking Form State
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'ai-coach') {
      scrollToBottom();
    }
  }, [aiChatHistory, activeTab]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    if (!applyVideo) {
        alert("Please provide video proof.");
        return;
    }
    setIsProcessing(true);
    try {
      await backend.applyToBecomeMentor({
          rate: applyRate,
          bio: applyBio,
          experience: applyExperience,
          style: applyStyle,
          video: applyVideo
      });
      setShowApplyModal(false);
      triggerHaptic('success');
      playSound('success');
      loadData();
      alert("Application Submitted! Pending Admin Review.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Application failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !bookDate || !bookTime) return;
    setIsProcessing(true);
    try {
      await backend.bookMentor(selectedMentor.id, bookDate, bookTime);
      setSelectedMentor(null);
      triggerHaptic('success');
      playSound('click');
      loadData();
      setActiveTab('my-lessons');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAiSend = async () => {
    if (!aiInput.trim() || isAiThinking) return;
    
    const userMsg = aiInput.trim();
    setAiInput('');
    setAiChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiThinking(true);
    triggerHaptic('light');

    const response = await askAICoach(userMsg);
    
    setIsAiThinking(false);
    setAiChatHistory(prev => [...prev, { role: 'model', text: response }]);
    triggerHaptic('medium');
    playSound('success');
  };

  const filteredMentors = useMemo(() => {
    let result = mentors;

    // Filter by Badge
    if (activeBadgeFilter !== 'ALL') {
      result = result.filter(m => m.badges.includes(activeBadgeFilter));
    }

    // Filter by Discipline
    if (activeDisciplineFilter !== 'ALL') {
      result = result.filter(m => m.disciplines.includes(activeDisciplineFilter));
    }

    // Filter by Search (Name, Bio, Location approximation)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.bio.toLowerCase().includes(q)
        // Note: Real location data would be joined here. For mock, relying on bio/name.
      );
    }

    // Sort by Achievements (Rating + Sessions) to prioritize active/good mentors
    // Heuristic: Rating (0-5) * 20 + SessionsCount
    return result.sort((a, b) => {
        const scoreA = (a.rating * 20) + a.studentsTrained;
        const scoreB = (b.rating * 20) + b.studentsTrained;
        return scoreB - scoreA;
    });
  }, [mentors, activeBadgeFilter, activeDisciplineFilter, searchQuery]);

  const myIncomingBookings = bookings.filter(b => myMentorProfile && b.mentorId === myMentorProfile.id);
  const myOutgoingBookings = bookings.filter(b => currentUser && b.studentId === currentUser.id);

  if (!currentUser) return <div className="p-10 text-center text-slate-500">Loading PUSH Academy...</div>;

  return (
    <div className="pb-32 pt-6 md:pb-10 space-y-6 px-4 animate-view relative min-h-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">PUSH Academy</h1>
          <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase">
            Learn from the Pro Community
          </p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto hide-scrollbar max-w-[50%]">
           <button onClick={() => setActiveTab('find')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'find' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Find</button>
           <button onClick={() => setActiveTab('ai-coach')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1 ${activeTab === 'ai-coach' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}><Brain size={10} /> AI Coach</button>
           
           {currentUser.isMentor ? (
             <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Stats</button>
           ) : (
             <button onClick={() => setActiveTab('my-lessons')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'my-lessons' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>My Lessons</button>
           )}
        </div>
      </header>

      {/* AI COACH TAB */}
      {activeTab === 'ai-coach' && (
        <div className="flex flex-col h-[calc(100vh-220px)] bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
           {/* Chat Area */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiChatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                     msg.role === 'user' 
                     ? 'bg-indigo-500 text-white rounded-tr-none' 
                     : 'bg-slate-800 text-slate-300 rounded-tl-none border border-slate-700'
                   }`}>
                      {msg.text.split('\n').map((line, idx) => (
                        <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                      ))}
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
              <div ref={chatEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-4 bg-slate-950 border-t border-slate-800">
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={aiInput}
                   onChange={(e) => setAiInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                   placeholder="Ask about tricks, gear, or mindset..."
                   className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
                 />
                 <button 
                   onClick={handleAiSend}
                   disabled={isAiThinking || !aiInput.trim()}
                   className="bg-amber-500 text-white p-3 rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
                 >
                   <Send size={18} />
                 </button>
              </div>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-2 text-center">Powered by Gemini 3.0 Pro Thinking Mode</p>
           </div>
        </div>
      )}

      {/* MARKETPLACE TAB */}
      {activeTab === 'find' && (
        <div className="space-y-4">
          
          {/* Controls Panel */}
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-4 rounded-[2rem] space-y-3 sticky top-0 z-10 shadow-xl">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by name or location..."
                  className="w-full bg-black border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             
             <div className="flex gap-2">
                <button
                  onClick={() => setActiveDisciplineFilter('ALL')}
                  className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${activeDisciplineFilter === 'ALL' ? 'bg-white text-black border-white' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
                >
                  All Skills
                </button>
                <button
                  onClick={() => setActiveDisciplineFilter(Discipline.SKATE)}
                  className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${activeDisciplineFilter === Discipline.SKATE ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
                >
                  Street
                </button>
                <button
                  onClick={() => setActiveDisciplineFilter(Discipline.DOWNHILL)}
                  className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${activeDisciplineFilter === Discipline.DOWNHILL ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
                >
                  Downhill
                </button>
             </div>
          </div>

          {/* Badge Filter Scroll */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2">
             <button
               onClick={() => { setActiveBadgeFilter('ALL'); playSound('click'); triggerHaptic('light'); }}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${activeBadgeFilter === 'ALL' ? 'bg-slate-700 text-white border-slate-600' : 'bg-transparent text-slate-500 border-slate-800'}`}
             >
               <Filter size={10} /> All Badges
             </button>
             {(Object.keys(MENTOR_BADGE_META) as MentorBadge[]).map(badge => {
               const meta = MENTOR_BADGE_META[badge];
               const isActive = activeBadgeFilter === badge;
               return (
                 <button 
                   key={badge}
                   onClick={() => { setActiveBadgeFilter(badge); playSound('click'); triggerHaptic('light'); }}
                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${isActive ? 'bg-slate-100 text-black border-white' : 'bg-transparent text-slate-500 border-slate-800'}`}
                 >
                   <meta.icon size={10} className={isActive ? 'text-black' : ''} /> {meta.label}
                 </button>
               )
             })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMentors.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-900/50 rounded-[2rem] border border-slate-800 border-dashed">
                No mentors found matching your criteria.
              </div>
            ) : (
              filteredMentors.map(mentor => (
                <div key={mentor.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 relative group hover:border-indigo-500/30 transition-all shadow-xl overflow-hidden">
                   
                   {/* Availability Dot */}
                   <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                      <span className="text-[8px] font-bold uppercase text-green-400 tracking-wide">Available</span>
                   </div>

                   <div className="flex gap-4 items-start mb-4">
                      <div className="w-14 h-14 rounded-2xl border-2 border-slate-700 overflow-hidden bg-slate-800 shrink-0">
                         <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                         <h4 className="text-lg font-black italic uppercase text-white leading-none truncate">{mentor.name}</h4>
                         <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                               <Star size={10} fill="currentColor" /> {mentor.rating.toFixed(1)} <span className="text-slate-600">({mentor.reviewCount})</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                               <UserPlus size={10} /> {mentor.studentsTrained} <span className="text-slate-600 hidden sm:inline">Sessions</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Badges Row */}
                   {mentor.badges && mentor.badges.length > 0 && (
                     <div className="flex gap-1.5 flex-wrap mb-4">
                       {mentor.badges.slice(0,3).map(badge => {
                         const meta = MENTOR_BADGE_META[badge];
                         return (
                           <div key={badge} className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[7px] font-black uppercase tracking-wider ${meta.color}`}>
                             <meta.icon size={8} />
                             {meta.label}
                           </div>
                         )
                       })}
                       {mentor.badges.length > 3 && (
                          <div className="px-2 py-1 rounded-md border border-slate-800 bg-slate-800 text-[7px] font-black text-slate-500">+{mentor.badges.length - 3}</div>
                       )}
                     </div>
                   )}

                   <div className="space-y-3 pt-3 border-t border-slate-800/50">
                      <div className="flex gap-1 flex-wrap">
                         {mentor.disciplines.map(d => (
                           <span key={d} className={`text-[8px] font-black uppercase px-2 py-1 rounded border flex items-center gap-1 ${d === Discipline.SKATE ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                             {d === Discipline.SKATE ? <Zap size={8} /> : <Mountain size={8} />} {d}
                           </span>
                         ))}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 italic">"{mentor.bio}"</p>
                   </div>

                   <button 
                     onClick={() => setSelectedMentor(mentor)}
                     className="w-full mt-4 bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-200"
                   >
                     Book • <IndianRupee size={10} strokeWidth={3} />{mentor.rate}
                   </button>
                </div>
              ))
            )}
          </div>
          
          {/* Become a Mentor Prompt (Moved to bottom to prioritize discovery) */}
          {!currentUser.isMentor && (
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Are you an expert?</p>
               <button 
                 onClick={() => {
                     if(currentUser.level >= 5) {
                         setShowApplyModal(true);
                     } else {
                         alert("You must be at least Level 5 to apply.");
                     }
                 }}
                 disabled={currentUser.level < 5}
                 className={`mx-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors border flex items-center gap-2 ${currentUser.level < 5 ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-900 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10'}`}
               >
                 {currentUser.level < 5 && <Lock size={12} />} Apply to Teach
               </button>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD TAB (Mentors Only) */}
      {activeTab === 'dashboard' && currentUser.isMentor && myMentorProfile && (
        <div className="space-y-6 animate-view">
           {/* Stats */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-2">
                 <div className="flex items-center gap-2 text-indigo-400 mb-1">
                    <TrendingUp size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Earnings</span>
                 </div>
                 <div className="text-3xl font-black italic text-white flex items-center gap-1">
                    <IndianRupee size={24} /> {myMentorProfile.earnings}
                 </div>
                 <p className="text-[9px] text-slate-500 font-bold uppercase">Paid out weekly</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-2">
                 <div className="flex items-center gap-2 text-green-400 mb-1">
                    <UserPlus size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Students</span>
                 </div>
                 <div className="text-3xl font-black italic text-white">
                    {myMentorProfile.studentsTrained}
                 </div>
                 <p className="text-[9px] text-slate-500 font-bold uppercase">Sessions completed</p>
              </div>
           </div>

           {/* Upcoming Sessions */}
           <div className="space-y-4">
              <h3 className="text-lg font-black uppercase italic tracking-tight text-white px-2">Upcoming Lessons</h3>
              {myIncomingBookings.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-[2rem] p-8 text-center">
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No bookings yet. Keep pushing your profile!</p>
                </div>
              ) : (
                myIncomingBookings.map(booking => (
                  <div key={booking.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                     <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">{booking.studentName}</h4>
                        <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
                           <span className="flex items-center gap-1"><CalendarDays size={12} /> {booking.date}</span>
                           <span className="flex items-center gap-1"><Clock size={12} /> {booking.time}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-green-400 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                           + <IndianRupee size={10} /> {booking.amount - booking.commission}
                        </div>
                        <span className="text-[8px] font-bold text-slate-600 uppercase">Net Income</span>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {/* MY LESSONS TAB (Students) */}
      {activeTab === 'my-lessons' && (
        <div className="space-y-4 animate-view">
           <h3 className="text-lg font-black uppercase italic tracking-tight text-white px-2">My Schedule</h3>
           {myOutgoingBookings.length === 0 ? (
             <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-[2rem] p-8 text-center space-y-4">
                <GraduationCap size={32} className="mx-auto text-slate-700" />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">You haven't booked any lessons yet.</p>
                <button onClick={() => setActiveTab('find')} className="text-indigo-400 text-xs font-black uppercase tracking-widest underline">Find a Mentor</button>
             </div>
           ) : (
             myOutgoingBookings.map(booking => (
               <div key={booking.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                     <span className="text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded w-fit block mb-1">Confirmed</span>
                     <div className="flex items-center gap-3 text-xs font-bold text-white">
                        <span className="flex items-center gap-1"><CalendarDays size={14} className="text-slate-500" /> {booking.date}</span>
                        <span className="flex items-center gap-1"><Clock size={14} className="text-slate-500" /> {booking.time}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-xs font-black uppercase tracking-widest text-slate-400">Paid</div>
                     <div className="text-white text-sm font-black flex items-center justify-end gap-0.5">
                        <IndianRupee size={12} strokeWidth={3} /> {booking.amount}
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedMentor && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Book Session</span>
                    <h3 className="text-xl font-black italic uppercase text-white tracking-tight">With {selectedMentor.name}</h3>
                 </div>
                 <button onClick={() => setSelectedMentor(null)} className="p-2 -mr-2 text-slate-500"><X size={24} /></button>
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Date</label>
                       <input 
                         type="date" 
                         required 
                         className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-indigo-500 outline-none"
                         value={bookDate}
                         onChange={(e) => setBookDate(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Time</label>
                       <input 
                         type="time" 
                         required 
                         className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-indigo-500 outline-none"
                         value={bookTime}
                         onChange={(e) => setBookTime(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="bg-slate-800/50 p-4 rounded-xl space-y-2 border border-slate-800">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                       <span>Lesson Fee (1hr)</span>
                       <span>₹{selectedMentor.rate}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                       <span>Service Fee</span>
                       <span>₹0</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-white border-t border-slate-700 pt-2 mt-2">
                       <span>Total</span>
                       <span>₹{selectedMentor.rate}</span>
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={isProcessing}
                   className="w-full py-4 bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                 >
                   {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Confirm & Pay
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view overflow-y-auto max-h-[90vh] hide-scrollbar">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">Pro Application</span>
                    <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Become a Mentor</h3>
                 </div>
                 <button onClick={() => setShowApplyModal(false)} className="p-2 -mr-2 text-slate-500"><X size={24} /></button>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                 Requirements: Level 5+, clear video proof of advanced skills, and a complete profile.
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Skate Experience</label>
                    <textarea 
                      required 
                      placeholder="Years skating, competitions won, crews you ride with..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none h-20 resize-none"
                      value={applyExperience}
                      onChange={(e) => setApplyExperience(e.target.value)}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Video Proof (Clip)</label>
                    <label className="w-full flex items-center justify-center gap-3 p-4 bg-slate-800 border border-slate-700 border-dashed rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors">
                        <Upload size={16} className="text-amber-500" />
                        <span className="text-xs font-bold text-slate-300">{applyVideo ? 'Video Selected' : 'Upload Trick Reel'}</span>
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => setApplyVideo(e.target.files?.[0]?.name || 'video_clip.mp4')} />
                    </label>
                    {applyVideo && <p className="text-[9px] text-green-400 font-bold ml-1 flex items-center gap-1"><Check size={10} /> {applyVideo}</p>}
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Mentoring Style</label>
                       <select 
                         className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none"
                         value={applyStyle}
                         onChange={(e) => setApplyStyle(e.target.value)}
                       >
                          <option>Technical</option>
                          <option>Supportive</option>
                          <option>Strict</option>
                          <option>Freestyle</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Hourly Rate (₹)</label>
                        <input 
                        type="number" 
                        min="100"
                        step="50"
                        required 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-bold focus:border-amber-500 outline-none"
                        value={applyRate}
                        onChange={(e) => setApplyRate(parseInt(e.target.value))}
                        />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Bio for Students</label>
                    <textarea 
                      required 
                      placeholder="What's your style? What can you teach?"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none h-20 resize-none"
                      value={applyBio}
                      onChange={(e) => setApplyBio(e.target.value)}
                    />
                 </div>

                 <button 
                   type="submit" 
                   disabled={isProcessing}
                   className="w-full py-4 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                 >
                   {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Submit Application
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipView;
