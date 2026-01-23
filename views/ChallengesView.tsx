
import React, { useState, useEffect } from 'react';
import { Challenge, ChallengeSubmission, User, Difficulty, Collectible } from '../types';
import { backend } from '../services/mockBackend';
import { Swords, Trophy, MapPin, Check, Video, Loader2, PlayCircle, Play, X, Upload } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';
import { COLLECTIBLES_DATABASE } from '../constants';
import { ChallengeCardSkeleton, EmptyState } from '../components/States';
import VideoUploadModal from '../components/VideoUploadModal';

const ChallengesView: React.FC = () => {
  const [challenges, setChallenges] = useState<(Challenge & { spotName: string })[]>([]);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, ChallengeSubmission[]>>({});
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingSubmission, setViewingSubmission] = useState<ChallengeSubmission | null>(null);
  const [uploadingChallenge, setUploadingChallenge] = useState<(Challenge & { spotName: string }) | null>(null);
  const [unlockedItem, setUnlockedItem] = useState<Collectible | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [u, allChallenges, spots] = await Promise.all([
      backend.getUser(),
      backend.getAllChallenges(),
      backend.getSpots()
    ]);
    
    // Enrich challenges with spot names
    const enriched = allChallenges.map(c => {
      const spot = spots.find(s => s.id === c.spotId);
      return { ...c, spotName: spot ? spot.name : 'Unknown Spot' };
    });

    setChallenges(enriched);
    setUser(u);

    // Load submissions for all challenges
    const map: Record<string, ChallengeSubmission[]> = {};
    for (const c of enriched) {
      map[c.id] = await backend.getChallengeSubmissions(c.id);
    }
    setSubmissionsMap(map);
    setLoading(false);
  };

  const handleUploadComplete = async (file: File) => {
    if (!uploadingChallenge) return;
    const challengeId = uploadingChallenge.id;
    
    try {
      const { newUnlocks, user: updatedUser } = await backend.completeChallenge(challengeId);
      
      setUser(updatedUser);
      
      // Refresh local challenge state to show completion + 1
      setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, completions: c.completions + 1 } : c));
      
      // Refresh submissions
      const newSubs = await backend.getChallengeSubmissions(challengeId);
      setSubmissionsMap(prev => ({ ...prev, [challengeId]: newSubs }));
      
      setUploadingChallenge(null);
      playSound('unlock');

      if (newUnlocks.length > 0) {
         const item = COLLECTIBLES_DATABASE.find(c => c.id === newUnlocks[0]);
         if (item) setUnlockedItem(item);
      }
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  return (
    <div className="pb-32 pt-6 md:pb-10 space-y-6 px-4 animate-view relative min-h-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Battles</h1>
          <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase">
            Global Challenge Feed
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
           <Trophy size={16} className="text-amber-500" />
           <span className="text-xs font-black text-white">{user?.completedChallengeIds.length || 0}</span>
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
           {[...Array(3)].map((_, i) => <ChallengeCardSkeleton key={i} />)}
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState 
           icon={Swords} 
           title="No Battles Active" 
           description="The arena is quiet. Be the first to create a challenge at a spot." 
        />
      ) : (
        <div className="space-y-4">
          {challenges.map(challenge => {
            const isCompleted = user?.completedChallengeIds.includes(challenge.id);
            const submissions = submissionsMap[challenge.id] || [];

            return (
              <div key={challenge.id} className={`border p-5 rounded-[2rem] relative overflow-hidden group transition-all ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-900 border-slate-800'}`}>
                 <div className="flex justify-between items-start relative z-10">
                   <div className="space-y-1 flex-1 pr-4">
                     <div className="flex items-center gap-2">
                       {isCompleted && <div className="bg-green-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest flex items-center gap-1"><Check size={8} strokeWidth={4} /> Completed</div>}
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest border ${
                         challenge.difficulty === Difficulty.ADVANCED ? 'border-red-500/30 text-red-400' :
                         challenge.difficulty === Difficulty.INTERMEDIATE ? 'border-amber-500/30 text-amber-400' : 'border-green-500/30 text-green-400'
                       }`}>{challenge.difficulty}</span>
                     </div>
                     <h3 className="text-lg font-black italic uppercase text-white tracking-tight leading-none">{challenge.title}</h3>
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       <MapPin size={10} className="text-indigo-500" /> {challenge.spotName}
                     </div>
                     <p className="text-xs text-slate-400 font-medium pt-1 leading-relaxed">{challenge.description}</p>
                   </div>
                   <div className="flex flex-col items-end">
                     <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">+{challenge.xpReward} XP</span>
                     <span className="text-[8px] text-slate-600 font-bold uppercase mt-1">{challenge.completions} Clears</span>
                   </div>
                 </div>

                 {/* COMMUNITY REEL */}
                 {submissions.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                     <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                       <PlayCircle size={10} /> Community Reel
                     </p>
                     <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                       {submissions.map(sub => (
                         <button 
                           key={sub.id}
                           onClick={() => setViewingSubmission(sub)}
                           className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-800 overflow-hidden relative shrink-0 group/sub hover:border-amber-500 transition-all active:scale-95"
                         >
                           <img src={sub.thumbnailUrl || sub.userAvatar} alt={sub.userName} className="w-full h-full object-cover opacity-80 group-hover/sub:opacity-100 transition-opacity" />
                           <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/sub:bg-transparent">
                             <Play size={12} className="text-white fill-white drop-shadow-md" />
                           </div>
                         </button>
                       ))}
                     </div>
                   </div>
                 )}

                 <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                       <span className="text-[8px] font-black text-slate-500">{challenge.creatorName.charAt(0)}</span>
                     </div>
                     <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Set by {challenge.creatorName}</span>
                   </div>
                   
                   {!isCompleted && (
                     <button 
                       onClick={() => setUploadingChallenge(challenge)}
                       className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                     >
                       <Video size={12} /> Prove It
                     </button>
                   )}
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {uploadingChallenge && (
          <VideoUploadModal 
              title={uploadingChallenge.title}
              description={`Prove you completed this challenge at ${uploadingChallenge.spotName || 'the spot'}.`}
              onClose={() => setUploadingChallenge(null)}
              onUpload={handleUploadComplete}
          />
      )}

      {/* Video Submission Viewer Modal */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4">
           <div className="relative w-full max-w-lg aspect-[9/16] md:aspect-video bg-black rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl animate-view">
              <button 
                onClick={() => setViewingSubmission(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
                    <img src={viewingSubmission.userAvatar} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="text-white text-xs font-black italic uppercase shadow-black drop-shadow-md">{viewingSubmission.userName}</p>
                    <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest drop-shadow-md">{viewingSubmission.date}</p>
                 </div>
              </div>

              <video 
                src={viewingSubmission.videoUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
                loop
              />
           </div>
        </div>
      )}

      {/* Unlock Celebration Modal */}
      {unlockedItem && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-6">
           <div className="flex flex-col items-center text-center space-y-6 animate-view">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-50 animate-pulse"></div>
               <img src={unlockedItem.imageUrl} className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl" alt="Unlocked" />
             </div>
             
             <div className="space-y-2 relative z-10">
               <h2 className="text-sm font-black uppercase tracking-[0.5em] text-indigo-400">Challenge Crushed!</h2>
               <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">{unlockedItem.name}</h1>
               <p className="text-slate-400 text-sm max-w-xs mx-auto">{unlockedItem.description}</p>
             </div>

             <button 
               onClick={() => setUnlockedItem(null)}
               className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
             >
               Collect Reward
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesView;
