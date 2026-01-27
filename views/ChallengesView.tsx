
import React, { useState, useEffect } from 'react';
import { Challenge, ChallengeSubmission, Difficulty, Collectible, Crew } from '../types';
import { backend } from '../services/mockBackend';
import { Swords, Check, Video, Play, X, Crosshair, Users, Shield, ShieldCheck, ChevronRight, Plus, Trophy } from 'lucide-react';
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
  const { challenges, user, isLoading, updateUser, spots } = useAppStore();
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

  return (
    <div className="h-full overflow-y-auto hide-scrollbar pb-32 pt-8 px-6 animate-view relative min-h-full space-y-8 bg-[#020202]">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

      <header className="relative z-10 flex flex-col gap-6">
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

      {isLoading ? (
        <div className="space-y-4 relative z-10">
           {[...Array(3)].map((_, i) => <ChallengeCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-2 px-1">
              <Swords size={14} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Challenges</span>
          </div>

          {filteredChallenges.length === 0 ? (
            <EmptyState icon={Swords} title="No Challenges" description="Check back later for new ops matching your style." />
          ) : (
            filteredChallenges.map(challenge => {
               const isCompleted = user?.completedChallengeIds.includes(challenge.id);
               const submissions = submissionsMap[challenge.id] || [];
               
               return (
                 <div key={challenge.id} className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/20">
                    
                    {/* Scanline Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none opacity-20" />

                    {/* Card Content */}
                    <div className="relative z-10">
                        {/* Top Status Bar */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-indigo-500 animate-pulse'}`} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    {isCompleted ? 'MISSION COMPLETE' : 'ACTIVE BOUNTY'}
                                </span>
                            </div>
                            <div className={`px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${
                                challenge.difficulty === Difficulty.ADVANCED 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}>
                                {challenge.difficulty}
                            </div>
                        </div>

                        {/* Title & Spot */}
                        <div className="mb-6">
                            <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-[0.9] mb-2 drop-shadow-xl w-[95%]">
                                {challenge.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                                <Crosshair size={12} strokeWidth={2.5} /> 
                                <span className="border-b border-dashed border-indigo-500/50 pb-0.5">{challenge.spotName}</span>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mb-6 pl-4 border-l-2 border-slate-800">
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                {challenge.description}
                            </p>
                        </div>

                        {/* Recent Activity (Feed) */}
                        {submissions.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Users size={10} className="text-slate-600" />
                                    <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Live Feed</span>
                                </div>
                                <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                                    {submissions.map(sub => (
                                        <button key={sub.id} onClick={() => setViewingSubmission(sub)} className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative shrink-0 group/sub shadow-lg">
                                            <img src={sub.thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover/sub:opacity-100 transition-opacity grayscale group-hover/sub:grayscale-0" />
                                            <div className="absolute inset-0 flex items-center justify-center"><Play size={12} className="text-white fill-white" /></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer Action Deck */}
                        <div className="flex items-center justify-between gap-4 mt-auto border-t border-white/5 pt-5">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest mb-0.5">Reward</span>
                                <span className="text-lg font-black text-white font-mono leading-none">+{challenge.xpReward} XP</span>
                            </div>

                            <div className="flex-1">
                                {isCompleted ? (
                                     <button disabled className="w-full h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                                        <Check size={14} strokeWidth={3} /> Verified
                                     </button>
                                ) : (
                                     <button 
                                        onClick={() => setUploadingChallenge(challenge)} 
                                        className="w-full h-12 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-lg active:scale-95 relative overflow-hidden group/btn"
                                     >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                        <Video size={14} strokeWidth={2.5} /> Upload Proof
                                     </button>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>
               );
            })
          )}
        </div>
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
