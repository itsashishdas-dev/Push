
import React, { useState, useEffect } from 'react';
import { Challenge, ChallengeSubmission, Difficulty, Collectible, Crew } from '../types';
import { backend } from '../services/mockBackend';
import { Swords, Check, Video, Play, X, Crosshair, Users, Shield, ShieldCheck, ChevronRight, Plus, Trophy, MessageSquare, Clock, MapPin, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { playSound } from '../utils/audio';
import { COLLECTIBLES_DATABASE } from '../constants';
import { ChallengeCardSkeleton, EmptyState } from '../components/States';
import VideoUploadModal from '../components/VideoUploadModal';
import { useAppStore } from '../store';
import { triggerHaptic } from '../utils/haptics';

interface ChallengesViewProps {
  onNavigate?: (tab: string) => void;
}

const ChallengesView: React.FC<ChallengesViewProps> = ({ onNavigate }) => {
  const { challenges, user, isLoading, updateUser, spots, sessions, openChat } = useAppStore();
  const [viewingSubmission, setViewingSubmission] = useState<ChallengeSubmission | null>(null);
  const [uploadingChallenge, setUploadingChallenge] = useState<(Challenge & { spotName: string }) | null>(null);
  const [unlockedItem, setUnlockedItem] = useState<Collectible | null>(null);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, ChallengeSubmission[]>>({});
  const [myCrew, setMyCrew] = useState<Crew | null>(null);

  useEffect(() => {
      const loadCrew = async () => {
          if (user?.crewId) {
              const c = await backend.getUserCrew(user.crewId);
              setMyCrew(c);
          }
      };
      loadCrew();
  }, [user]);

  const filteredChallenges = React.useMemo(() => {
     let result = challenges;
     if (user && user.disciplines && user.disciplines.length > 0) {
        result = result.filter(c => {
            const spot = spots.find(s => s.id === c.spotId);
            return spot && user.disciplines.includes(spot.type);
        });
     }
     return result;
  }, [challenges, user?.disciplines, spots]);

  // Derived: My Active Sessions
  const mySessions = React.useMemo(() => {
      if (!user) return [];
      const now = new Date();
      now.setHours(0,0,0,0);
      
      // Show sessions user is participant of, sorted by date
      return sessions
        .filter(s => s.participants.includes(user.id) && new Date(s.date) >= now)
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }, [sessions, user]);

  React.useEffect(() => {
    const fetchSubs = async () => {
        const map: Record<string, ChallengeSubmission[]> = {};
        for (const c of filteredChallenges) {
            map[c.id] = await backend.getChallengeSubmissions(c.id);
        }
        setSubmissionsMap(map);
    };
    if (filteredChallenges.length > 0) fetchSubs();
  }, [filteredChallenges]);

  const handleUploadComplete = async (file: File) => {
    if (!uploadingChallenge || !user) return;
    try {
      const { newUnlocks, user: updatedUser } = await backend.completeChallenge(uploadingChallenge.id);
      updateUser(updatedUser);
      
      const updatedSubmissions = await backend.getChallengeSubmissions(uploadingChallenge.id);
      setSubmissionsMap(prev => ({ ...prev, [uploadingChallenge.id]: updatedSubmissions }));

      setUploadingChallenge(null);
      playSound('unlock');
      if (newUnlocks.length > 0) {
         const item = COLLECTIBLES_DATABASE.find(c => c.id === newUnlocks[0]);
         if (item) setUnlockedItem(item);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const navigateToCrew = (e?: React.MouseEvent) => {
      e?.stopPropagation(); // Prevent duplicate bubbling if clicking specific elements
      triggerHaptic('medium');
      if (onNavigate) onNavigate('CREW');
  };

  const handleOpenChat = (sessionId: string, title: string, e: React.MouseEvent) => {
      e.stopPropagation();
      triggerHaptic('medium');
      playSound('click');
      openChat(sessionId, title);
  };

  return (
    <div className="h-full overflow-y-auto hide-scrollbar pb-32 pt-8 px-6 animate-view relative min-h-full space-y-8 bg-[#020202]">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

      <header className="relative z-10 flex flex-col gap-6 pt-safe-top">
          <div>
            <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-[0.85] mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Active<br/>Ops</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Daily Objectives & Unit Status</p>
          </div>

          {/* CREW WIDGET */}
          {myCrew ? (
              <div 
                onClick={navigateToCrew}
                className="w-full bg-[#0b0c10] rounded-[2rem] border border-white/10 p-1 pr-6 flex items-center gap-4 relative overflow-hidden group cursor-pointer shadow-lg active:scale-[0.98] transition-all"
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-transparent to-transparent opacity-50" />
                  
                  <div className="w-20 h-20 bg-slate-900 rounded-[1.7rem] flex items-center justify-center text-3xl border border-white/5 relative z-10">
                      {myCrew.avatar}
                  </div>
                  
                  <div className="flex-1 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-1"><ShieldCheck size={10} /> Your Unit</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          <span className="text-[9px] font-bold uppercase text-slate-500">Lvl {myCrew.level}</span>
                      </div>
                      <h3 className="text-xl font-black italic uppercase text-white tracking-tight">{myCrew.name}</h3>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">{myCrew.weeklyGoal.description}</p>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-colors z-10">
                      <ChevronRight size={18} />
                  </div>
              </div>
          ) : (
              <div 
                onClick={navigateToCrew}
                className="w-full bg-[#0b0c10] rounded-[2rem] border border-white/10 border-dashed p-6 flex items-center justify-between group cursor-pointer hover:bg-slate-900/50 transition-all active:scale-[0.98]"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-white transition-colors">
                          <Users size={24} />
                      </div>
                      <div>
                          <h3 className="text-lg font-black italic uppercase text-white tracking-tight">No Unit Assigned</h3>
                          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Find or form a crew</p>
                      </div>
                  </div>
                  <button 
                    onClick={navigateToCrew}
                    className="px-4 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform"
                  >
                      <Plus size={12} strokeWidth={3} /> Join
                  </button>
              </div>
          )}
      </header>

      {/* ACTIVE MISSIONS (SESSIONS) */}
      {mySessions.length > 0 && (
          <section className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 px-1 text-emerald-400">
                  <Clock size={14} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Active Missions ({mySessions.length})</span>
              </div>
              
              <div className="space-y-3">
                  {mySessions.map(session => (
                      <div key={session.id} className="bg-[#0b0c10] border border-emerald-500/20 rounded-[1.5rem] p-4 flex items-center justify-between group relative overflow-hidden shadow-lg hover:border-emerald-500/40 transition-colors">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/5 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                          
                          <div className="flex items-center gap-4 pl-2">
                              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-white/5 shrink-0">
                                  <Calendar size={20} className="text-emerald-500" />
                              </div>
                              <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">{session.time} Today</span>
                                      <span className="text-[8px] font-mono text-slate-500">{session.participants.length} OPS</span>
                                  </div>
                                  <h4 className="text-sm font-black italic uppercase text-white truncate leading-none mb-1">{session.title}</h4>
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                                      <MapPin size={10} /> {session.spotName}
                                  </div>
                              </div>
                          </div>

                          <div className="flex gap-2">
                              <button 
                                onClick={(e) => handleOpenChat(session.id, session.title, e)}
                                className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all active:scale-95"
                              >
                                  <MessageSquare size={16} />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </section>
      )}

      {isLoading ? (
        <div className="space-y-4 relative z-10">
           {[...Array(3)].map((_, i) => <ChallengeCardSkeleton key={i} />)}
        </div>
      ) : (
        <section className="space-y-4 relative z-10">
          <div className="flex items-center gap-2 px-1 text-white">
              <Swords size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Available Contracts</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredChallenges.length === 0 ? (
                <EmptyState icon={Swords} title="No Challenges" description="Check back later for new ops matching your style." />
            ) : (
                filteredChallenges.map(challenge => {
                const isCompleted = user?.completedChallengeIds.includes(challenge.id);
                const submissions = submissionsMap[challenge.id] || [];
                
                return (
                    <div key={challenge.id} className="group bg-[#0b0c10] border border-white/10 rounded-[1.5rem] overflow-hidden hover:border-white/20 transition-all shadow-xl relative">
                        {/* Status Bar Indicator */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${isCompleted ? 'bg-green-500' : challenge.difficulty === Difficulty.PRO ? 'bg-red-500' : challenge.difficulty === Difficulty.ADVANCED ? 'bg-orange-500' : 'bg-indigo-500'}`} />

                        <div className="p-5 pl-6">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[9px] text-slate-500 uppercase tracking-[0.2em]">{challenge.id.split('-')[1] || 'CNT'} // {challenge.difficulty}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#151515] border border-white/5 px-2 py-1 rounded-md">
                                    <Trophy size={10} className="text-yellow-500" />
                                    <span className="font-mono text-[10px] font-bold text-white">{challenge.xpReward} XP</span>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="mb-4">
                                <h3 className={`text-xl font-black uppercase italic tracking-tighter leading-none mb-1 ${isCompleted ? 'text-green-400 line-through decoration-green-500/50' : 'text-white'}`}>
                                    {challenge.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                                    <Crosshair size={10} /> 
                                    <span className="border-b border-dashed border-indigo-500/30">{challenge.spotName}</span>
                                </div>
                            </div>

                            {/* Compact Brief */}
                            <div className="bg-[#111] p-3 rounded-lg border border-white/5 mb-4 relative">
                                <FileText size={40} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-800 opacity-20 pointer-events-none" />
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed font-mono relative z-10">
                                    "{challenge.description}"
                                </p>
                            </div>

                            {/* Footer / Action */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex -space-x-2">
                                    {submissions.slice(0,3).map(sub => (
                                        <div key={sub.id} className="w-6 h-6 rounded-full border border-black bg-slate-800 overflow-hidden">
                                            <img src={sub.thumbnailUrl} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {submissions.length > 0 && (
                                        <div className="w-6 h-6 rounded-full border border-black bg-slate-800 flex items-center justify-center text-[7px] font-bold text-slate-400">
                                            +{submissions.length > 3 ? submissions.length - 3 : ''}
                                        </div>
                                    )}
                                    {submissions.length === 0 && <span className="text-[8px] text-slate-600 font-mono self-center ml-2">NO RECORDS</span>}
                                </div>

                                {isCompleted ? (
                                    <button disabled className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-default">
                                        <Check size={12} strokeWidth={3} /> Cleared
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setUploadingChallenge(challenge)} 
                                        className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 shadow-lg group/btn"
                                    >
                                        <Video size={12} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" /> Upload
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
                })
            )}
          </div>
        </section>
      )}

      {viewingSubmission && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
             <div className="relative w-full max-w-lg aspect-[9/16] md:aspect-video bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <button onClick={() => setViewingSubmission(null)} className="absolute top-4 right-4 text-white z-10 bg-black/50 p-2 rounded-full backdrop-blur border border-white/10"><X size={20} /></button>
                <video src={viewingSubmission.videoUrl} className="w-full h-full object-cover" controls autoPlay playsInline loop />
             </div>
        </div>
      )}

      {uploadingChallenge && (
         <VideoUploadModal 
            title={uploadingChallenge.title}
            description={uploadingChallenge.description}
            onClose={() => setUploadingChallenge(null)}
            onUpload={handleUploadComplete}
         />
      )}

      {unlockedItem && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-view">
             <div className="flex flex-col items-center text-center space-y-6 max-w-sm w-full bg-[#0b0c10] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                  {/* Rays Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-transparent animate-pulse" />
                  
                  <div className="w-32 h-32 relative flex items-center justify-center z-10">
                      <img src={unlockedItem.imageUrl} className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
                  </div>
                  <div className="space-y-2 z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Item Decrypted</p>
                      <h2 className="text-3xl font-black italic uppercase text-white tracking-tight">{unlockedItem.name}</h2>
                  </div>
                  <button onClick={() => setUnlockedItem(null)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg z-10 hover:bg-indigo-500 active:scale-95 transition-all">Collect Item</button>
             </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesView;
