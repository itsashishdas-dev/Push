import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Mentor, Booking, Discipline } from '../types';
import { backend } from '../services/mockBackend';
import { askAICoach } from '../services/geminiService';
import { Star, Send, Loader2, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const MentorshipView: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'find' | 'ai-coach'>('find');
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Chat
  const [aiInput, setAiInput] = useState('');
  const [chat, setChat] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (activeTab === 'ai-coach') chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, activeTab]);

  const loadData = async () => {
    setMentors(await backend.getMentors());
    setBookings(await backend.getUserBookings());
  };

  const handleAiSend = async () => {
    if (!aiInput.trim() || isAiThinking) return;
    const msg = aiInput.trim();
    setAiInput('');
    setChat(prev => [...prev, { role: 'user', text: msg }]);
    setIsAiThinking(true);
    
    try {
        const response = await askAICoach(msg);
        setChat(prev => [...prev, { role: 'model', text: response }]);
    } catch {
        setChat(prev => [...prev, { role: 'model', text: "Can't connect right now." }]);
    } finally {
        setIsAiThinking(false);
    }
  };

  const filteredMentors = mentors.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="pb-32 pt-8 px-6 animate-view min-h-full flex flex-col">
       <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mentorship</h1>
          <p className="text-slate-400 font-medium">Learn from pros or ask AI.</p>
        </div>
      </header>
      
      <div className="flex bg-slate-900 p-1 rounded-2xl mb-6 border border-white/5">
           <button onClick={() => setActiveTab('find')} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'find' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}>Mentors</button>
           <button onClick={() => setActiveTab('ai-coach')} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'ai-coach' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}>AI Coach</button>
      </div>

      {activeTab === 'ai-coach' && (
          <div className="flex-1 flex flex-col bg-slate-900 rounded-[2rem] overflow-hidden border border-white/5 h-[60vh]">
              <div className="bg-slate-800/50 p-4 border-b border-white/5 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-2"><Sparkles size={14} /> Coach AI Active</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chat.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-40">
                          <p className="text-sm font-medium">Ask me anything about tricks or spots.</p>
                      </div>
                  )}
                  {chat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  {isAiThinking && <Loader2 className="animate-spin text-slate-500 mx-auto" size={20} />}
                  <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-slate-800/30">
                  <div className="flex gap-2 items-center bg-slate-900 rounded-full px-4 py-2 border border-white/5">
                      <input 
                        className="flex-1 bg-transparent text-sm text-white focus:outline-none py-2"
                        placeholder="Type a message..."
                        value={aiInput}
                        onChange={e => setAiInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                      />
                      <button onClick={handleAiSend} disabled={!aiInput.trim()} className="text-indigo-500 disabled:opacity-50">
                          <Send size={20} />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'find' && (
          <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Search mentors..."
                className="w-full bg-slate-900 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/5"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              {filteredMentors.map(mentor => (
                  <div key={mentor.id} className="bg-slate-900 rounded-3xl p-5 flex gap-4 border border-white/5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 shrink-0">
                          <img src={mentor.avatar} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                              <h3 className="text-base font-bold text-white truncate">{mentor.name}</h3>
                              <span className="text-sm font-bold text-indigo-400">₹{mentor.rate}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500 mb-2">
                              <Star size={12} fill="currentColor" /> <span className="text-xs font-bold">{mentor.rating}</span>
                              <span className="text-slate-600 text-[10px]">•</span>
                              <span className="text-slate-500 text-xs">{mentor.studentsTrained} students</span>
                          </div>
                          
                          <button className="w-full py-2 bg-white text-black rounded-xl text-xs font-bold mt-2">Book Session</button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default MentorshipView;