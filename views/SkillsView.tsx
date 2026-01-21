
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Discipline, SkillState, Difficulty, Skill, Collectible, DailyNote } from '../types';
import { SKILL_LIBRARY, COLLECTIBLES_DATABASE } from '../constants';
import { backend } from '../services/mockBackend';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';
import { 
  Youtube, 
  X, 
  Upload, 
  Search,
  Plus,
  Filter,
  Target,
  Maximize2,
  Minimize2,
  TrendingUp,
  Circle,
  Triangle,
  Square,
  Trophy,
  BookOpen,
  Save,
  Loader2,
  Zap,
  Timer,
  ShieldAlert,
  Lock,
  Sparkles,
  ArrowRight,
  Star,
  Check,
  History,
  Calendar,
  Brain
} from 'lucide-react';

// --- NEW COMPONENTS ---

const DifficultyIcon: React.FC<{ difficulty: Difficulty, size?: number }> = ({ difficulty, size = 12 }) => {
  switch (difficulty) {
    case Difficulty.BEGINNER:
      return <Circle size={size} className="text-green-500" />;
    case Difficulty.INTERMEDIATE:
      return <Square size={size} className="text-amber-500" />;
    case Difficulty.ADVANCED:
      return <Triangle size={size} className="text-red-500 fill-current" />;
    default:
      return <Circle size={size} className="text-slate-500" />;
  }
};

interface SkillCardProps {
  skill: Skill & { state: SkillState, isOnBoard: boolean, isVisible: boolean };
  isActive: boolean;
  onUpdateState: (id: string, state: SkillState) => void;
  onWatchTutorial: (url: string) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, isActive, onUpdateState, onWatchTutorial }) => {
  const isSkate = skill.category === Discipline.SKATE;
  
  return (
    <div className={`bg-slate-900 border ${isActive ? 'border-indigo-500' : 'border-slate-800'} rounded-[2rem] p-5 relative overflow-hidden group transition-all duration-300 hover:border-slate-700`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <DifficultyIcon difficulty={skill.difficulty} size={10} />
             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest border ${
               skill.difficulty === Difficulty.ADVANCED ? 'border-red-500/30 text-red-400' :
               skill.difficulty === Difficulty.INTERMEDIATE ? 'border-amber-500/30 text-amber-400' : 'border-green-500/30 text-green-400'
             }`}>{skill.difficulty}</span>
          </div>
          <h3 className="text-lg font-black uppercase italic tracking-tight text-white leading-none">{skill.name}</h3>
        </div>
        
        {skill.state === SkillState.MASTERED && (
           <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <Trophy size={14} fill="currentColor" />
           </div>
        )}
      </div>

      <div className="space-y-3 relative z-10">
         {/* Status Toggle */}
         <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
            {[SkillState.LEARNING, SkillState.LANDED, SkillState.MASTERED].map((s) => {
               const active = skill.state === s;
               let activeColor = 'bg-slate-700 text-white';
               if (s === SkillState.LEARNING) activeColor = 'bg-blue-600 text-white';
               if (s === SkillState.LANDED) activeColor = 'bg-green-600 text-white';
               if (s === SkillState.MASTERED) activeColor = 'bg-amber-500 text-black';

               return (
                  <button
                    key={s}
                    onClick={() => onUpdateState(skill.id, s)}
                    className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${active ? activeColor : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    {s === SkillState.LEARNING ? 'Learn' : s}
                  </button>
               )
            })}
         </div>

         {skill.tutorialUrl && (
            <button 
              onClick={() => onWatchTutorial(skill.tutorialUrl)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group/btn"
            >
               <Youtube size={14} className="text-red-500 group-hover/btn:scale-110 transition-transform" /> Watch Tutorial
            </button>
         )}
      </div>
      
      {/* Decorative BG */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-5 pointer-events-none -mr-10 -mt-10 ${isSkate ? 'bg-indigo-500' : 'bg-amber-500'}`} />
    </div>
  );
};

const SkillsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tree' | 'ranks'>('tree');
  
  // -- SKILLS TREE STATE --
  const [activeCategory, setActiveCategory] = useState<Discipline | 'all'>(Discipline.SKATE);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSoundEnabled, setUserSoundEnabled] = useState(true);
  const [userRetroMode, setUserRetroMode] = useState(false);
  
  // Local Library State (combines constants + user custom skills)
  const [localLibrary, setLocalLibrary] = useState<Skill[]>(SKILL_LIBRARY);
  
  const [userSkillIds, setUserSkillIds] = useState<Set<string>>(new Set(
    SKILL_LIBRARY.filter(s => s.state !== SkillState.LEARNING || Math.random() > 0.3).map(s => s.id)
  ));
  const [userSkillStates, setUserSkillStates] = useState<Record<string, SkillState>>(
    SKILL_LIBRARY.reduce((acc, s) => ({ ...acc, [s.id]: s.state }), {})
  );
  
  const [uploadingSkillId, setUploadingSkillId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const verificationSteps = ["Uploading...", "Extracting Skeletal Data...", "Analyzing Biomechanics...", "Checking Landing Stability...", "Verified!"];

  const [activeTutorial, setActiveTutorial] = useState<{url: string, name: string} | null>(null);
  const [unlockedItem, setUnlockedItem] = useState<Collectible | null>(null);
  
  // Daily Notes State
  const [todayNote, setTodayNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [noteHistory, setNoteHistory] = useState<DailyNote[]>([]);

  // -- ADD CUSTOM SKILL STATE --
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<Discipline>(Discipline.SKATE);
  const [newSkillDifficulty, setNewSkillDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);

  // -- LEADERBOARD STATE --
  const [rankDiscipline, setRankDiscipline] = useState<Discipline>(Discipline.SKATE);

  useEffect(() => {
    backend.getUser().then(u => {
      setUserSoundEnabled(u.soundEnabled);
      setUserRetroMode(u.retroModeEnabled);
    });
    
    // Load today's note
    const loadNote = async () => {
      const notes = await backend.getDailyNotes();
      const today = new Date().toISOString().split('T')[0];
      const note = notes.find(n => n.date === today);
      if (note) setTodayNote(note.text);
    };
    loadNote();
  }, []);

  useEffect(() => {
    if (showHistory) {
      backend.getDailyNotes().then(setNoteHistory);
    }
  }, [showHistory]);

  const handleSaveNote = async () => {
    if (!todayNote.trim()) return;
    setIsSavingNote(true);
    await backend.saveDailyNote(todayNote);
    setIsSavingNote(false);
    triggerHaptic('success');
    if (userSoundEnabled) playSound('success');
  };

  // --- DATA PROCESSING ---

  const processedSkills = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    return localLibrary.map(skill => {
      const isOnBoard = userSkillIds.has(skill.id);
      const currentState = userSkillStates[skill.id] || SkillState.LEARNING;
      
      const matchesName = skill.name.toLowerCase().includes(query);
      const matchesDifficultySearch = skill.difficulty.toLowerCase().includes(query);
      const matchesCategorySearch = skill.category.toLowerCase().includes(query);
      
      const queryMatch = matchesName || matchesDifficultySearch || matchesCategorySearch;
      
      const categoryFilterMatch = activeCategory === 'all' || skill.category === activeCategory;
      const difficultyFilterMatch = activeDifficulty === 'all' || skill.difficulty === activeDifficulty;

      return {
        ...skill,
        state: currentState,
        isOnBoard: isOnBoard,
        isVisible: queryMatch && categoryFilterMatch && difficultyFilterMatch
      };
    });
  }, [searchQuery, activeCategory, activeDifficulty, userSkillIds, userSkillStates, localLibrary]);

  const visibleSkills = processedSkills.filter(s => s.isVisible);
  const activeBoardSkills = visibleSkills.filter(s => s.isOnBoard);
  const discoverySkills = visibleSkills.filter(s => !s.isOnBoard);
  const masteredSkills = processedSkills.filter(s => s.state === SkillState.MASTERED && userSkillIds.has(s.id));

  // --- RECOMMENDATION ENGINE ---
  const nextTrickRecommendation = useMemo(() => {
    // 1. Find matched skills that are currently active (Learning or Landed)
    const activeLearning = activeBoardSkills.filter(s => s.state === SkillState.LEARNING);
    
    if (activeLearning.length > 0) {
      // Prioritize the easiest one currently in learning
      const beginner = activeLearning.find(s => s.difficulty === Difficulty.BEGINNER);
      if (beginner) return { skill: beginner, reason: "Finish what you started! Master the basics." };
      return { skill: activeLearning[0], reason: "You're working on this. Keep pushing!" };
    }

    // 2. If nothing active, find the next logical step from Discovery
    // Filter discovery skills that match current category filter (or default to Skate if 'All')
    const targetCategory = activeCategory === 'all' ? Discipline.SKATE : activeCategory;
    const candidates = discoverySkills.filter(s => s.category === targetCategory);
    
    // Sort candidates by difficulty order
    const difficultyOrder = { [Difficulty.BEGINNER]: 1, [Difficulty.INTERMEDIATE]: 2, [Difficulty.ADVANCED]: 3 };
    candidates.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

    if (candidates.length > 0) {
      return { skill: candidates[0], reason: "Ready for something new? Try this next." };
    }

    return null;
  }, [activeBoardSkills, discoverySkills, activeCategory]);

  const updateSkillState = async (id: string, newState: SkillState) => {
    if (newState === SkillState.MASTERED) {
      // Mandatory Verification Flow
      setUploadingSkillId(id);
      setIsVerifying(false);
      setVerificationStep(0);
    } else {
      // Landed or Learning - Immediate Update
      if (userSoundEnabled) playSound('click');
      triggerHaptic('light');
      setUserSkillStates(prev => ({ ...prev, [id]: newState }));
      // Sync with backend to update XP/Level
      await backend.updateSkillState(id, newState);
    }
  };

  const addSkillToBoard = (id: string) => {
    if (userSoundEnabled) playSound('click');
    triggerHaptic('medium');
    setUserSkillIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleAddCustomSkill = () => {
    if (!newSkillName.trim()) return;
    
    const newId = `custom-${Math.random().toString(36).substr(2, 9)}`;
    const newSkill: Skill = {
      id: newId,
      name: newSkillName,
      category: newSkillCategory,
      difficulty: newSkillDifficulty,
      state: SkillState.LEARNING,
      tutorialUrl: '', // No tutorial for custom skill
      unlockableCollectibleId: undefined
    };

    setLocalLibrary(prev => [...prev, newSkill]);
    setUserSkillStates(prev => ({ ...prev, [newId]: SkillState.LEARNING }));
    setUserSkillIds(prev => {
      const next = new Set(prev);
      next.add(newId);
      return next;
    });

    setShowAddSkillModal(false);
    setNewSkillName('');
    triggerHaptic('success');
    if (userSoundEnabled) playSound('success');
  };

  const simulateVerification = async (id: string) => {
    setIsVerifying(true);
    
    // Simulate AI Steps
    for (let i = 0; i < verificationSteps.length; i++) {
        setVerificationStep(i);
        // Play subtle processing ticks
        if(i < verificationSteps.length - 1) {
            triggerHaptic('light');
            await new Promise(resolve => setTimeout(resolve, 800));
        } else {
            await new Promise(resolve => setTimeout(resolve, 400));
        }
    }

    // Success
    triggerHaptic('success');
    if (userSoundEnabled) playSound(userRetroMode ? 'retro_unlock' : 'success');
    
    setUserSkillStates(prev => ({ ...prev, [id]: SkillState.MASTERED }));
    
    // Cleanup Modal
    setTimeout(() => {
        setUploadingSkillId(null);
        setIsVerifying(false);
    }, 1000);

    try {
      const { newUnlocks } = await backend.masterSkill(id);
      
      // Fallback: If backend doesn't return (mock issue), look up local DB
      if (!newUnlocks || newUnlocks.length === 0) {
         const skill = localLibrary.find(s => s.id === id);
         if (skill && skill.unlockableCollectibleId) {
            const item = COLLECTIBLES_DATABASE.find(c => c.id === skill.unlockableCollectibleId);
            if (item) {
               setUnlockedItem(item);
               if (userSoundEnabled) playSound('unlock');
               return;
            }
         }
      }

      if (newUnlocks && newUnlocks.length > 0) {
        const item = COLLECTIBLES_DATABASE.find(c => c.id === newUnlocks[0]);
        if (item) {
          setTimeout(() => {
            setUnlockedItem(item);
            if (userSoundEnabled) playSound('unlock');
            triggerHaptic('success');
          }, 500); 
        }
      }
    } catch (e) {
      console.error("Mastery sync failed", e);
    }
  };

  const handleUploadFinish = (id: string) => {
      // Instead of immediate finish, trigger verification flow
      simulateVerification(id);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1` : null;
  };

  const categoryStats = useMemo(() => {
    const relevant = localLibrary.filter(s => activeCategory === 'all' || s.category === activeCategory);
    const mastered = relevant.filter(s => userSkillIds.has(s.id) && userSkillStates[s.id] === SkillState.MASTERED).length;
    const total = relevant.length;
    return { mastered, total, percent: total > 0 ? Math.round((mastered / total) * 100) : 0 };
  }, [activeCategory, userSkillIds, userSkillStates, localLibrary]);

  // -- LEADERBOARD DATA --
  const getDeckImage = (deckId?: string) => {
    return COLLECTIBLES_DATABASE.find(c => c.id === deckId)?.imageUrl || 'https://via.placeholder.com/50';
  };

  const skateRanks = [
    { rank: 1, name: 'Rahul V.', xp: 14500, streak: 45, badge: 'Skater of Year', deckId: 'deck_champion', trophies: 3 },
    { rank: 2, name: 'Simran K.', xp: 12200, streak: 12, badge: 'Street King', deckId: 'deck_flow_state', trophies: 1 },
    { rank: 3, name: 'Anish G.', xp: 9800, streak: 8, badge: 'Ollie Master', deckId: 'deck_first_push', trophies: 0 },
    { rank: 4, name: 'Vikram S.', xp: 7500, streak: 21, badge: '', deckId: 'deck_street_soldier', trophies: 0 },
    { rank: 5, name: 'Priya M.', xp: 7200, streak: 5, badge: '', deckId: 'deck_first_push', trophies: 0 }
  ];

  const downhillRanks = [
    { rank: 1, name: 'Kabir B.', time: '01:42.5', speed: '68 km/h', spot: 'Nandi Hills', deckId: 'deck_hill_runner', trophies: 2 },
    { rank: 2, name: 'Zoya F.', time: '01:45.2', speed: '65 km/h', spot: 'Nandi Hills', deckId: 'deck_first_push', trophies: 0 },
    { rank: 3, name: 'Dev R.', time: '01:50.1', speed: '62 km/h', spot: 'Nandi Hills', deckId: 'deck_street_soldier', trophies: 0 }
  ];

  return (
    <div className="pb-40 pt-6 md:pb-10 space-y-6 px-4 animate-view relative">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Skills</h1>
            <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase">
              Mastery & Rankings
            </p>
          </div>
          {activeTab === 'tree' && (
            <div className="text-right">
              <div className={`text-2xl font-black italic ${activeCategory === Discipline.DOWNHILL ? 'text-amber-400' : 'text-indigo-400'}`}>
                {categoryStats.percent}%
              </div>
              <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Mastery</div>
            </div>
          )}
        </div>

        {/* TOP LEVEL NAV */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
           <button onClick={() => setActiveTab('tree')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'tree' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>My Tree</button>
           <button onClick={() => setActiveTab('ranks')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'ranks' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Leaderboard</button>
        </div>
      </header>
      
      {/* ----------------- SKILL TREE VIEW ----------------- */}
      {activeTab === 'tree' && (
        <div className="space-y-6 animate-view">
          
          {/* DAILY LOG SECTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 space-y-3 relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-10 -mt-10" />
             <div className="flex justify-between items-center relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                   <BookOpen size={12} className="text-indigo-500" /> Daily Log
                </h3>
                <button 
                  onClick={() => setShowHistory(true)} 
                  className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50"
                >
                   <History size={10} /> History
                </button>
             </div>
             
             <textarea
               value={todayNote}
               onChange={(e) => setTodayNote(e.target.value)}
               placeholder="What did you learn today? Landed a new trick? Found a new spot?"
               className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-xs font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all min-h-[100px] resize-none relative z-10"
             />
             
             <div className="flex justify-between items-center relative z-10">
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                   {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <button 
                  onClick={handleSaveNote} 
                  disabled={isSavingNote || !todayNote.trim()}
                  className="bg-white text-black px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg active:scale-95"
                >
                  {isSavingNote ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Log
                </button>
             </div>
          </div>

          {/* MASTERED GALLERY (TROPHY CASE) */}
          {masteredSkills.length > 0 && (
            <div className="space-y-2">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-2 px-1">
                 <Trophy size={14} className="text-amber-500" /> Mastered Tricks
               </h2>
               <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 pt-1 px-1">
                  {masteredSkills.map(skill => {
                    const sticker = COLLECTIBLES_DATABASE.find(c => c.id === skill.unlockableCollectibleId);
                    return (
                      <div key={skill.id} className="shrink-0 flex flex-col items-center gap-2 w-20">
                         <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center relative shadow-lg ${
                           skill.category === Discipline.SKATE 
                             ? 'bg-indigo-500/10 border-indigo-500/30' 
                             : 'bg-amber-500/10 border-amber-500/30'
                         }`}>
                            {sticker ? (
                              <img src={sticker.imageUrl} alt={skill.name} className="w-12 h-12 object-contain drop-shadow-md" />
                            ) : (
                              <Check size={24} className={skill.category === Discipline.SKATE ? 'text-indigo-400' : 'text-amber-400'} strokeWidth={3} />
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                              MAX
                            </div>
                         </div>
                         <span className="text-[9px] font-bold text-center leading-tight text-slate-400 line-clamp-2 w-full">{skill.name}</span>
                      </div>
                    );
                  })}
               </div>
            </div>
          )}

          {/* NEXT TRICK RECOMMENDATION */}
          {nextTrickRecommendation && (
            <div className="relative overflow-hidden rounded-3xl border border-slate-700 shadow-2xl group cursor-pointer" onClick={() => addSkillToBoard(nextTrickRecommendation.skill.id)}>
               {/* Dynamic Background */}
               <div className={`absolute inset-0 opacity-20 ${
                 nextTrickRecommendation.skill.category === Discipline.SKATE 
                   ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
                   : 'bg-gradient-to-r from-amber-600 to-orange-600'
               }`} />
               
               <div className="relative z-10 p-6 flex items-center justify-between">
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80">Coach's Pick</span>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none mb-1">
                          {nextTrickRecommendation.skill.name}
                        </h3>
                        <p className="text-xs text-white/70 font-medium max-w-[200px] leading-relaxed">
                          {nextTrickRecommendation.reason}
                        </p>
                     </div>
                     <div className="flex gap-2 pt-1">
                        <span className="text-[8px] font-black uppercase bg-black/30 px-2 py-1 rounded backdrop-blur-sm border border-white/10 text-white">
                          {nextTrickRecommendation.skill.difficulty}
                        </span>
                     </div>
                  </div>
                  
                  <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg group-active:scale-90 transition-transform">
                     {nextTrickRecommendation.skill.isOnBoard ? <Target size={24} /> : <Plus size={24} />}
                  </div>
               </div>
            </div>
          )}

          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'all', label: 'All' },
              { id: Discipline.SKATE, label: 'Street' },
              { id: Discipline.DOWNHILL, label: 'Hill' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat.id 
                  ? (cat.id === Discipline.DOWNHILL ? 'bg-amber-500 text-white shadow-lg' : 'bg-indigo-500 text-white shadow-lg') 
                  : 'text-slate-500'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Find tricks..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowAddSkillModal(true)}
                className="bg-slate-900 border border-slate-800 text-slate-300 px-4 rounded-2xl flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <Plus size={16} /> <span className="hidden sm:inline">Add Custom</span>
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
              <div className="flex items-center gap-2 pr-2 border-r border-slate-800 mr-2">
                <Filter size={14} className="text-slate-600" />
              </div>
              {['all', Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED].map(d => (
                <button
                  key={d}
                  onClick={() => setActiveDifficulty(d as any)}
                  className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                    activeDifficulty === d 
                      ? 'bg-slate-100 text-black border-white shadow-md' 
                      : 'bg-slate-900/50 text-slate-500 border-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${activeCategory === Discipline.DOWNHILL ? 'bg-amber-500' : 'bg-indigo-500'}`}
              style={{ width: `${categoryStats.percent}%` }}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-2 px-1">
              <Target size={14} /> My Board ({activeBoardSkills.length})
            </h2>
            
            {activeBoardSkills.length === 0 ? (
              <div className="py-8 text-center bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">No active tricks in this view.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {activeBoardSkills.map(skill => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    isActive={activeTutorial?.name === skill.name}
                    onUpdateState={updateSkillState} 
                    onWatchTutorial={(url) => setActiveTutorial({url, name: skill.name})}
                  />
                ))}
              </div>
            )}
          </div>

          {discoverySkills.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-2 px-1">
                <Plus size={14} /> Database Discoveries ({discoverySkills.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {discoverySkills.map(skill => (
                  <div key={skill.id} className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 flex items-center justify-between group hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <DifficultyIcon difficulty={skill.difficulty} size={14} />
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-black uppercase italic text-slate-300 group-hover:text-white transition-colors">{skill.name}</h4>
                        <div className="flex gap-2">
                          <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">{skill.category}</span>
                          <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">•</span>
                          <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">{skill.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => addSkillToBoard(skill.id)}
                      className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all active:scale-90 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <span className="hidden sm:inline">Add To Board</span> <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- LEADERBOARD VIEW ----------------- */}
      {activeTab === 'ranks' && (
        <div className="space-y-6 animate-view">
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setRankDiscipline(Discipline.SKATE)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                rankDiscipline === Discipline.SKATE ? 'bg-indigo-500 text-white' : 'text-slate-500'
              }`}
            >
              Skateboarding
            </button>
            <button
              onClick={() => setRankDiscipline(Discipline.DOWNHILL)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                rankDiscipline === Discipline.DOWNHILL ? 'bg-amber-500 text-white' : 'text-slate-500'
              }`}
            >
              Downhill
            </button>
          </div>

          {rankDiscipline === Discipline.DOWNHILL && (
            <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-200 leading-normal">
                <strong>SAFETY NOTICE:</strong> Downhill rankings require full safety gear. Ensure spot is cleared. Speed tracking requires verified GPS logs.
              </p>
            </div>
          )}

          {/* Top 3 Spotlight */}
          <div className="flex items-end justify-center gap-4 pt-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 mb-2 overflow-hidden ring-4 ring-slate-800">
                 <img src="https://picsum.photos/seed/p2/100" alt="Rank 2" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400">#2</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-24 h-24 rounded-full border-4 mb-2 overflow-hidden ring-8 ${rankDiscipline === Discipline.SKATE ? 'border-indigo-500 ring-indigo-500/10' : 'border-amber-500 ring-amber-500/10'}`}>
                 <img src="https://picsum.photos/seed/p1/100" alt="Rank 1" />
              </div>
              <span className={`text-[12px] font-black uppercase ${rankDiscipline === Discipline.SKATE ? 'text-indigo-400' : 'text-amber-400'}`}>Champion</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 mb-2 overflow-hidden ring-4 ring-slate-800">
                 <img src="https://picsum.photos/seed/p3/100" alt="Rank 3" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400">#3</span>
            </div>
          </div>

          <div className="space-y-2">
            {(rankDiscipline === Discipline.SKATE ? skateRanks : downhillRanks).map(user => (
                <div key={user.rank} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-xl">
                  <span className="w-6 text-sm font-black text-slate-500 italic">#{user.rank}</span>
                  
                  {/* Equipped Deck Icon - Visual representation of Identity */}
                  <div 
                    className="w-10 h-14 bg-black/40 rounded-lg overflow-hidden border border-slate-700/50 shrink-0 shadow-lg"
                  >
                    <img src={getDeckImage(user.deckId)} alt="Deck" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      {user.name}
                      {(user as any).badge && <span className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-500 text-white font-black italic">{(user as any).badge}</span>}
                      
                      {/* Trophies Display */}
                      {user.trophies > 0 && (
                        <div className="flex gap-0.5">
                          {[...Array(user.trophies)].map((_, i) => (
                            <Trophy key={i} size={10} className="text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]" fill="currentColor" />
                          ))}
                        </div>
                      )}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                       {rankDiscipline === Discipline.SKATE ? (
                         <>
                           <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                             <Zap size={10} className="text-amber-400" /> {(user as any).xp} XP
                           </div>
                           <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                             <Target size={10} className="text-indigo-400" /> {(user as any).streak} DAY STREAK
                           </div>
                         </>
                       ) : (
                         <>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                             <Timer size={10} className="text-amber-400" /> {(user as any).time}
                           </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                             <Zap size={10} className="text-indigo-400" /> {(user as any).speed}
                           </div>
                         </>
                       )}
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}

      {/* Tutorial Video Player - Centered Modal */}
      {activeTutorial && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-view">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <header className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <Youtube size={20} className="text-red-500 shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest italic text-white truncate">{activeTutorial.name}</span>
              </div>
              <button 
                onClick={() => setActiveTutorial(null)}
                className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </header>
            
            <div className="relative bg-black w-full aspect-video">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src={getEmbedUrl(activeTutorial.url) || ''} 
                frameBorder="0" 
                allow="autoplay; encrypted-media" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Verification / Upload Modal */}
      {uploadingSkillId && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-6 animate-view">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Mastery Proof Required</span>
                <h2 className="text-2xl font-black italic uppercase">Verify with AI</h2>
              </div>
              <button onClick={() => setUploadingSkillId(null)} className="p-2 text-slate-500"><X size={24} /></button>
            </div>

            {isVerifying ? (
                <div className="w-full aspect-video bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
                    <Brain size={48} className="text-indigo-500 animate-bounce" />
                    <div className="text-center z-10 space-y-2">
                        <span className="text-xs font-black uppercase tracking-widest text-white">{verificationSteps[verificationStep]}</span>
                        <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{width: `${((verificationStep + 1) / verificationSteps.length) * 100}%`}} />
                        </div>
                    </div>
                </div>
            ) : (
                <label className="block">
                  <div className="w-full border-2 border-dashed border-slate-700 rounded-2xl aspect-video flex flex-col items-center justify-center gap-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <Upload size={32} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <span className="text-[11px] font-black uppercase text-white block tracking-widest">Select Video File</span>
                      <span className="text-[8px] text-slate-600 font-bold uppercase mt-1 block">AI analyzes landing & style</span>
                    </div>
                  </div>
                  <input type="file" className="hidden" accept="video/*" onChange={() => handleUploadFinish(uploadingSkillId)} />
                </label>
            )}
            
            {!isVerifying && (
                <button onClick={() => setUploadingSkillId(null)} className="w-full py-4 text-slate-600 text-[10px] font-black uppercase tracking-widest">Cancel</button>
            )}
          </div>
        </div>
      )}

      {/* Daily Notes History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view h-[80vh] flex flex-col">
             <div className="flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Log History</h2>
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Your progression journal</p>
               </div>
               <button onClick={() => setShowHistory(false)} className="p-2 -mr-2 text-slate-500 hover:text-white"><X size={20} /></button>
             </div>

             <div className="flex-1 overflow-y-auto pr-1 space-y-3 hide-scrollbar">
                {noteHistory.length === 0 ? (
                  <div className="py-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">No logs recorded yet.</div>
                ) : (
                  noteHistory.map(note => (
                    <div key={note.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                       <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                          <Calendar size={12} /> {note.date}
                       </div>
                       <p className="text-sm font-medium text-slate-300 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      )}

      {/* Add Custom Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view">
             <div className="flex justify-between items-start">
               <div>
                 <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Add Custom Trick</h2>
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Track your personal goals</p>
               </div>
               <button onClick={() => setShowAddSkillModal(false)} className="p-2 -mr-2 text-slate-500"><X size={20} /></button>
             </div>

             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Trick Name</label>
                 <input 
                   type="text" 
                   value={newSkillName}
                   onChange={(e) => setNewSkillName(e.target.value)}
                   className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                   placeholder="e.g. Impossible, Pressure Flip"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Discipline</label>
                 <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1">
                    {[Discipline.SKATE, Discipline.DOWNHILL].map(d => (
                      <button 
                        key={d}
                        onClick={() => setNewSkillCategory(d)}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${newSkillCategory === d ? 'bg-white text-black shadow-md' : 'text-slate-500'}`}
                      >
                        {d}
                      </button>
                    ))}
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Difficulty</label>
                 <select 
                   value={newSkillDifficulty}
                   onChange={(e) => setNewSkillDifficulty(e.target.value as Difficulty)}
                   className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                 >
                   <option value={Difficulty.BEGINNER}>Beginner</option>
                   <option value={Difficulty.INTERMEDIATE}>Intermediate</option>
                   <option value={Difficulty.ADVANCED}>Advanced</option>
                 </select>
               </div>
             </div>

             <button 
               onClick={handleAddCustomSkill}
               disabled={!newSkillName.trim()}
               className="w-full py-3 bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-400 active:scale-95 transition-all shadow-lg disabled:opacity-50"
             >
               Add to Board
             </button>
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
               <h2 className="text-sm font-black uppercase tracking-[0.5em] text-indigo-400">Skill Mastered!</h2>
               <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">{unlockedItem.name}</h1>
               <p className="text-slate-400 text-sm max-w-xs mx-auto">{unlockedItem.description}</p>
             </div>

             <button 
               onClick={() => setUnlockedItem(null)}
               className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
             >
               Collect & Continue
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SkillsView;
