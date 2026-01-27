
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { backend } from '../services/mockBackend';
import { useAppStore } from '../store';
import { DailyNote, ExtendedSession, Challenge, Discipline, SpotStatus } from '../types';
import { 
  FileText, MapPin, Calendar, Clock, Edit2, 
  Send, Terminal, Bookmark, Trophy, Zap, 
  Activity, ArrowRight, Video, Target, TrendingUp,
  AlertTriangle, Camera, X
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';
import SkillTree from '../components/SkillTree';

const JourneyView: React.FC = () => {
  const { user, sessions, challenges, skills, notes, initializeData } = useAppStore();
  const [noteInput, setNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'upcoming' | 'tech_tree'>('timeline');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      initializeData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setMediaFile(file);
          setMediaPreview(URL.createObjectURL(file));
          triggerHaptic('light');
      }
  };

  const handleAddNote = async () => {
      if (!noteInput.trim() && !mediaFile) return;
      setIsSubmitting(true);
      triggerHaptic('medium');
      playSound('log_click'); 
      
      const mediaUrl = mediaFile ? mediaPreview : undefined; // In real app, this would be the uploaded URL
      const mediaType = mediaFile ? (mediaFile.type.startsWith('video') ? 'video' : 'image') : undefined;

      await backend.saveDailyNote(noteInput, mediaUrl, mediaType);
      await initializeData(); 
      
      setNoteInput('');
      setMediaFile(null);
      setMediaPreview(null);
      setIsSubmitting(false);
      
      setTimeout(() => playSound('success'), 300);
  };

  const skillStats = useMemo(() => {
      if (!user) return { skate: 0, downhill: 0, freestyle: 0 };
      const calculateDiscProgress = (d: Discipline) => {
          const total = skills.filter(s => s.category === d).length;
          const mastered = skills.filter(s => s.category === d && user.masteredSkills.includes(s.id)).length;
          return total > 0 ? Math.round((mastered / total) * 100) : 0;
      };
      return {
          skate: calculateDiscProgress(Discipline.SKATE),
          downhill: calculateDiscProgress(Discipline.DOWNHILL),
          freestyle: calculateDiscProgress(Discipline.FREESTYLE)
      };
  }, [skills, user]);

  const timeline = useMemo(() => {
      const all: any[] = [];
      notes.forEach(n => all.push({ ...n, type: 'note', sortDate: new Date(n.timestamp).getTime() }));
      sessions.forEach(s => {
          if (new Date(s.date) < new Date()) {
              all.push({ ...s, type: 'session', sortDate: new Date(`${s.date}T${s.time}`).getTime() });
          }
      });
      if (user) {
          user.completedChallengeIds.forEach(cid => {
              const challenge = challenges.find(c => c.id === cid);
              if (challenge) {
                  all.push({ ...challenge, type: 'challenge', sortDate: Date.now() - Math.random() * 1000000000 });
              }
          });
      }
      return all.sort((a, b) => b.sortDate - a.sortDate);
  }, [notes, sessions, user, challenges]);

  const upcomingSessions = useMemo(() => {
      const now = new Date();
      now.setHours(0,0,0,0);
      return sessions
        .filter(s => new Date(s.date) >= now)
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }, [sessions]);

  return (
    <div className="h-full overflow-y-auto hide-scrollbar pb-32 pt-safe-top bg-[#020202] relative flex flex-col">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

      <header className="px-6 pt-6 pb-2 shrink-0 z-10">
        <div className="flex justify-between items-end mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-indigo-500 animate-pulse rounded-full shadow-[0_0_8px_#6366f1]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Rider's Log</span>
                </div>
                <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter drop-shadow-lg leading-[0.85]">Mission<br/>Control</h1>
            </div>
            <div className="text-right">
                <div className="text-2xl font-black text-white italic">{user?.level || 1}</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Current Level</div>
            </div>
        </div>

        {/* Skill Holo-Stats */}
        <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-3 flex gap-4 overflow-x-auto hide-scrollbar">
            {[
                { label: 'Street', val: skillStats.skate, color: 'bg-indigo-500' },
                { label: 'Downhill', val: skillStats.downhill, color: 'bg-purple-500' },
                { label: 'Freestyle', val: skillStats.freestyle, color: 'bg-amber-500' }
            ].map((stat) => (
                <div key={stat.label} className="flex-1 min-w-[80px]">
                    <div className="flex justify-between mb-1">
                        <span className="text-[8px] font-black uppercase text-slate-400">{stat.label}</span>
                        <span className="text-[8px] font-mono text-white">{stat.val}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: `${stat.val}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
      </header>

      {/* TABS */}
      <div className="px-6 py-4 shrink-0 z-10">
          <div className="flex bg-[#0b0c10] p-1 rounded-xl border border-white/10 backdrop-blur-md">
              <button 
                onClick={() => { setActiveTab('timeline'); triggerHaptic('light'); playSound('click'); }}
                className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'timeline' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  <Activity size={12} /> Datastream
              </button>
              <button 
                onClick={() => { setActiveTab('upcoming'); triggerHaptic('light'); playSound('click'); }}
                className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'upcoming' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  <Target size={12} /> Radar ({upcomingSessions.length})
              </button>
              <button 
                onClick={() => { setActiveTab('tech_tree'); triggerHaptic('light'); playSound('click'); }}
                className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'tech_tree' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  <TrendingUp size={12} /> Tech Tree
              </button>
          </div>
      </div>

      {activeTab === 'tech_tree' && (
          <div className="px-6 pb-6 relative z-10">
              <SkillTree />
          </div>
      )}

      {activeTab === 'timeline' && (
          <div className="px-6 space-y-6 pb-6 relative z-10">
              
              {/* Quick Log Input */}
              <div className="bg-[#0b0c10] border border-slate-800 rounded-[1.5rem] p-1 shadow-lg relative overflow-hidden group focus-within:border-indigo-500/50 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20"></div>
                  <div className="p-3">
                      <div className="flex items-center gap-2 mb-2 px-1">
                          <Terminal size={12} className="text-indigo-400" />
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest">New Entry...</span>
                      </div>
                      
                      <textarea 
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Log spot conditions, trick progress, or thoughts..."
                        rows={2}
                        className="w-full bg-[#020202] rounded-xl p-3 text-xs font-medium text-white placeholder:text-slate-600 focus:outline-none resize-none font-mono leading-relaxed border border-white/5"
                      />

                      {mediaPreview && (
                          <div className="relative mt-2 rounded-xl overflow-hidden aspect-video border border-white/10 bg-black">
                              {mediaFile?.type.startsWith('video') ? (
                                  <video src={mediaPreview} className="w-full h-full object-cover" autoPlay loop muted />
                              ) : (
                                  <img src={mediaPreview} className="w-full h-full object-cover" />
                              )}
                              <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white border border-white/20"><X size={12} /></button>
                          </div>
                      )}

                      <div className="flex justify-between items-center mt-2">
                          <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-[#151515] rounded-lg text-slate-400 hover:text-white border border-white/5 transition-colors">
                              <Camera size={14} />
                          </button>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />

                          <button 
                            onClick={handleAddNote}
                            disabled={(!noteInput.trim() && !mediaFile) || isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                          >
                              {isSubmitting ? 'Saving...' : 'Commit Log'} <Send size={10} />
                          </button>
                      </div>
                  </div>
              </div>

              {/* Timeline Feed */}
              <div className="relative pl-4 space-y-6 border-l border-slate-800/50">
                  {timeline.map((item, idx) => (
                      <div key={idx} className="relative pl-6 animate-pop" style={{ animationDelay: `${idx * 50}ms` }}>
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full border-2 border-black ${
                              item.type === 'note' ? 'bg-indigo-500' :
                              item.type === 'session' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>

                          {/* Card Content */}
                          <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-4 hover:bg-slate-900/60 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                      item.type === 'note' ? 'bg-indigo-500/10 text-indigo-400' :
                                      item.type === 'session' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                  }`}>
                                      {item.type === 'note' ? 'Log Entry' : item.type === 'session' ? 'Session' : 'Achievement'}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">
                                      {item.type === 'note' 
                                        ? new Date(item.timestamp).toLocaleDateString() 
                                        : item.type === 'session' 
                                            ? item.date 
                                            : 'Recent'}
                                  </span>
                              </div>

                              {item.type === 'note' && (
                                  <div>
                                      {item.text && <p className="text-xs text-slate-300 font-mono leading-relaxed opacity-90 mb-2">"{item.text}"</p>}
                                      {item.mediaUrl && (
                                          <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-black mt-2">
                                              {item.mediaType === 'video' ? (
                                                  <video src={item.mediaUrl} className="w-full h-full object-cover" controls />
                                              ) : (
                                                  <img src={item.mediaUrl} className="w-full h-full object-cover" />
                                              )}
                                          </div>
                                      )}
                                  </div>
                              )}

                              {item.type === 'session' && (
                                  <div>
                                      <h3 className="text-sm font-black uppercase italic text-white mb-1">{item.title}</h3>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                          <MapPin size={10} /> {item.spotName}
                                      </div>
                                  </div>
                              )}

                              {item.type === 'challenge' && (
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                          <Trophy size={18} />
                                      </div>
                                      <div>
                                          <h3 className="text-sm font-black uppercase italic text-white">{item.title}</h3>
                                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">+{item.xpReward} XP</p>
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
                  
                  {timeline.length === 0 && (
                      <div className="py-10 text-center pl-6">
                          <p className="text-xs font-mono text-slate-600">-- NO DATA FOUND IN LOGS --</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'upcoming' && (
          <div className="px-6 pb-6 space-y-4 relative z-10 animate-view">
              {upcomingSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-[2rem] border border-slate-800 border-dashed">
                      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 mb-4 animate-pulse">
                          <Target size={24} />
                      </div>
                      <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest">Radar Clear</h3>
                      <p className="text-[10px] text-slate-600 mt-2">No upcoming sessions detected.</p>
                  </div>
              ) : (
                  upcomingSessions.map(session => (
                      <div key={session.id} className="bg-[#0b0c10] border border-slate-800 p-5 rounded-[2rem] relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                          
                          <div className="pl-3">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex gap-2">
                                      <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded">
                                          Incoming
                                      </span>
                                      <span className="text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1">
                                          <Clock size={10} /> {session.time}
                                      </span>
                                  </div>
                                  <div className="text-[9px] font-black uppercase text-white bg-slate-800 px-2 py-1 rounded">
                                      {session.date}
                                  </div>
                              </div>

                              <h3 className="text-xl font-black italic uppercase text-white mb-1 leading-none">{session.title}</h3>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1 mb-4">
                                  <MapPin size={12} className="text-indigo-500" /> {session.spotName}
                              </p>

                              <div className="flex items-center gap-3 border-t border-slate-800 pt-3">
                                  <div className="flex -space-x-2">
                                      {session.participants.slice(0,3).map(pid => (
                                          <div key={pid} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 overflow-hidden">
                                              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${pid}`} className="w-full h-full object-cover" />
                                          </div>
                                      ))}
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                      {session.participants.length} Operatives Ready
                                  </span>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
      )}
    </div>
  );
};

export default JourneyView;
