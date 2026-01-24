import React, { useState } from 'react';
import { Challenge, ChallengeSubmission, Difficulty, Collectible } from '../types';
import { backend } from '../services/mockBackend';
import { Swords, Check, Video, Play, X, Crosshair } from 'lucide-react';
import { playSound } from '../utils/audio';
import { COLLECTIBLES_DATABASE } from '../constants';
import { ChallengeCardSkeleton, EmptyState } from '../components/States';
import VideoUploadModal from '../components/VideoUploadModal';
import { useAppStore } from '../store';

const ChallengesView: React.FC = () => {
  const { challenges, user, isLoading, updateUser } = useAppStore();
  const [viewingSubmission, setViewingSubmission] = useState<ChallengeSubmission | null>(null);
  const [uploadingChallenge, setUploadingChallenge] = useState<(Challenge & { spotName: string }) | null>(null);
  const [unlockedItem, setUnlockedItem] = useState<Collectible | null>(null);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, ChallengeSubmission[]>>({});

  React.useEffect(() => {
    const fetchSubs = async () => {
        const map: Record<string, ChallengeSubmission[]> = {};
        for (const c of challenges) {
            map[c.id] = await backend.getChallengeSubmissions(c.id);
        }
        setSubmissionsMap(map);
    };
    if (challenges.length > 0) fetchSubs();
  }, [challenges]);

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

  return (
    <div className="pb-32 pt-8 px-6 animate-view relative min-h-full space-y-8">
      <header>
          <h1 className="text-3xl font-bold text-white mb-2">Challenges</h1>
          <p className="text-slate-400 font-medium">Complete objectives to earn XP and gear.</p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
           {[...Array(3)].map((_, i) => <ChallengeCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.length === 0 ? (
            <EmptyState icon={Swords} title="No Challenges" description="Check back later for new ops." />
          ) : (
            challenges.map(challenge => {
               const isCompleted = user?.completedChallengeIds.includes(challenge.id);
               const submissions = submissionsMap[challenge.id] || [];
               
               return (
                 <div key={challenge.id} className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                                    challenge.difficulty === Difficulty.ADVANCED ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'
                                }`}>
                                    {challenge.difficulty}
                                </span>
                                {isCompleted && <span className="text-[10px] font-bold text-green-400 flex items-center gap-1"><Check size={12} /> Complete</span>}
                            </div>
                            <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                        </div>
                        <div className="font-bold text-indigo-400">+{challenge.xpReward} XP</div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <Crosshair size={14} /> 
                            <span>{challenge.spotName}</span>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed">
                            {challenge.description}
                        </p>

                        {submissions.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2">
                                {submissions.map(sub => (
                                    <button key={sub.id} onClick={() => setViewingSubmission(sub)} className="w-16 h-16 rounded-xl bg-black overflow-hidden relative shrink-0">
                                        <img src={sub.thumbnailUrl} className="w-full h-full object-cover opacity-70" />
                                        <div className="absolute inset-0 flex items-center justify-center"><Play size={12} className="text-white fill-white" /></div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="pt-2">
                            {isCompleted ? (
                                 <button disabled className="w-full py-3 bg-slate-800 text-slate-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                                    <Check size={16} /> Completed
                                 </button>
                            ) : (
                                 <button 
                                    onClick={() => setUploadingChallenge(challenge)} 
                                    className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                                 >
                                    <Video size={16} /> Upload Clip
                                 </button>
                            )}
                        </div>
                    </div>
                 </div>
               );
            })
          )}
        </div>
      )}

      {/* Reused components like VideoUploadModal remain functional but style-neutral */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-4">
             <div className="relative w-full max-w-lg aspect-[9/16] md:aspect-video bg-black rounded-3xl overflow-hidden">
                <button onClick={() => setViewingSubmission(null)} className="absolute top-4 right-4 text-white z-10"><X size={24} /></button>
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
        <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-6 animate-view">
             <div className="flex flex-col items-center text-center space-y-6 max-w-sm w-full bg-slate-900 rounded-[2.5rem] p-8">
                  <div className="w-32 h-32 relative flex items-center justify-center">
                      <img src={unlockedItem.imageUrl} className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Unlocked</p>
                      <h2 className="text-2xl font-bold text-white">{unlockedItem.name}</h2>
                  </div>
                  <button onClick={() => setUnlockedItem(null)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm">Collect</button>
             </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesView;