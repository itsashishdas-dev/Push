
import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Discipline, SkillState, Difficulty, Skill, User } from '../types.ts';
import { SKILL_LIBRARY } from '../constants.tsx';
import { backend } from '../services/mockBackend.ts';
import { triggerHaptic } from '../utils/haptics.ts';
import { playSound } from '../utils/audio.ts';
import { SkillCardSkeleton } from '../components/States.tsx';
import VideoUploadModal from '../components/VideoUploadModal.tsx';
import { 
  Youtube, 
  X, 
  Search,
  Triangle,
  Square,
  Trophy,
  Circle,
  Plus,
  Sparkles,
  Lock,
  Clock
} from 'lucide-react';

const DifficultyIcon: React.FC<{ difficulty: Difficulty, size?: number }> = ({ difficulty, size = 12 }) => {
  switch (difficulty) {
    case Difficulty.BEGINNER: return <Circle size={size} className="text-green-500" />;
    case Difficulty.INTERMEDIATE: return <Square size={size} className="text-amber-500" />;
    case Difficulty.ADVANCED: return <Triangle size={size} className="text-red-500 fill-current" />;
    default: return <Circle size={size} className="text-slate-500" />;
  }
};

interface SkillCardProps {
  skill: Skill;
  isLocked: boolean;
  isJustUnlocked: boolean;
  isPending: boolean; // New prop for proof status
  onUpdateState: (id: string, state: SkillState) => void;
  onWatchTutorial: (url: string) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, isLocked, isJustUnlocked, isPending, onUpdateState, onWatchTutorial }) => {
  const isSkate = skill.category === Discipline.SKATE;
  const isMastered = skill.state === SkillState.MASTERED;

  return (
    <div className={`relative transition-all duration-500 ${isLocked ? 'opacity-50 grayscale' : 'opacity-100'} ${isJustUnlocked ? 'ring-4 ring-indigo-500 animate-pulse' : ''}`}>
      <div className={`bg-slate-900 border ${isMastered ? 'border-amber-500 shadow-amber-500/10' : (isPending ? 'border-yellow-500/50' : 'border-slate-800')} rounded-[2rem] p-5 relative overflow-hidden group`}>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <DifficultyIcon difficulty={skill.difficulty} size={10} />
               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest border ${
                 skill.difficulty === Difficulty.ADVANCED ? 'border-red-500/30 text-red-400' :
                 skill.difficulty === Difficulty.INTERMEDIATE ? 'border-amber-500/30 text-amber-400' : 'border-green-500/30 text-green-400'
               }`}>{skill.difficulty}</span>
               {skill.isCustom && <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[7px] font-black uppercase px-1.5 py-0.5 rounded">Custom</span>}
            </div>
            <h3 className="text-lg font-black uppercase italic tracking-tight text-white leading-none">{skill.name}</h3>
          </div>
          
          {isMastered && (
             <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black shadow-lg">
                <Trophy size={14} fill="currentColor" />
             </div>
          )}
          {isPending && (
             <div className="w-8 h-8 rounded-full bg-yellow-900/50 border border-yellow-500 text-yellow-500 flex items-center justify-center shadow-lg animate-pulse" title="Proof Pending Review">
                <Clock size={14} />
             </div>
          )}
        </div>

        <div className="space-y-3 relative z-10">
           <div className={`flex bg-slate-950 rounded-xl p-1 border border-slate-800 ${isLocked ? 'pointer-events-none' : ''}`}>
              {[SkillState.LEARNING, SkillState.LANDED, SkillState.MASTERED].map((s) => {
                 const active = skill.state === s;
                 let activeColor = 'bg-slate-700 text-white';
                 if (s === SkillState.LEARNING) activeColor = 'bg-blue-600 text-white';
                 if (s === SkillState.LANDED) activeColor = 'bg-green-600 text-white';
                 if (s === SkillState.MASTERED) activeColor = 'bg-amber-500 text-black';

                 // Disable Mastered button if pending
                 const disabled = s === SkillState.MASTERED && isPending;

                 return (
                    <button
                      key={s}
                      onClick={() => !disabled && onUpdateState(skill.id, s)}
                      disabled={disabled}
                      className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${active ? activeColor : 'text-slate-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {s === SkillState.MASTERED && isPending ? 'Reviewing' : s.charAt(0).toUpperCase() + s.slice(1, 4)}
                    </button>
                 )
              })}
           </div>

           {skill.tutorialUrl && !isLocked && (
              <button 
                onClick={() => onWatchTutorial(skill.tutorialUrl)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400"
              >
                 <Youtube size={14} className="text-red-500" /> Tutorial
              </button>
           )}
        </div>
        
        {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                <Lock size={24} className="text-slate-500" />
            </div>
        )}
        
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-5 pointer-events-none -mr-10 -mt-10 ${isSkate ? 'bg-indigo-500' : 'bg-amber-500'}`} />
      </div>
    </div>
  );
};

const SkillsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [customSkills, setCustomSkills] = useState<Skill[]>([]);
  const [skillStates, setSkillStates] = useState<Record<string, SkillState>>({});
  
  const [activeCategory, setActiveCategory] = useState<Discipline | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showCelebration, setShowCelebration] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Skill | null>(null);
  const [masteredSkill, setMasteredSkill] = useState<Skill | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [justUnlockedId, setJustUnlockedId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [provingSkill, setProvingSkill] = useState<Skill | null>(null);

  // Custom Form
  const [customName, setCustomName] = useState('');
  const [customCat, setCustomCat] = useState(Discipline.SKATE);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [u, cs] = await Promise.all([backend.getUser(), backend.getCustomSkills()]);
    setUser(u);
    setCustomSkills(cs);
    
    const states: Record<string, SkillState> = {};
    SKILL_LIBRARY.forEach(s => {
        states[s.id] = u.locker.includes(s.id) ? SkillState.MASTERED : SkillState.LEARNING;
    });
    cs.forEach(s => {
        states[s.id] = SkillState.LEARNING;
    });
    setSkillStates(states);
    setLoading(false);
  };

  const handleUpdateState = async (skillId: string, newState: SkillState) => {
    if (!user) return;
    
    // Intercept Mastery for Proof of Skate
    if (newState === SkillState.MASTERED) {
      const skill = [...SKILL_LIBRARY, ...customSkills].find(s => s.id === skillId);
      if (skill) {
        setProvingSkill(skill);
        setShowUploadModal(true);
      }
      return; 
    }

    // Normal state update (Learning -> Landed)
    triggerHaptic('medium');
    playSound('click');
    setSkillStates(prev => ({ ...prev, [skillId]: newState }));
    await backend.updateSkillState(skillId, newState);
  };

  const handleProofSubmit = async (file: File) => {
    if (!provingSkill || !user) return;
    
    // 1. Submit Proof to Backend (Mock)
    await backend.submitSkillProof(provingSkill.id);
    
    // 2. Update User State locally to reflect pending
    setUser({ ...user, pendingSkills: [...user.pendingSkills, provingSkill.id] });
    
    // 3. Update Quests (Upload type)
    await backend.updateQuestProgress('UPLOAD', 1);

    setProvingSkill(null);
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!customName.trim()) return;
      setLoading(true);
      const newSkill = await backend.saveCustomSkill({
          name: customName,
          category: customCat,
          difficulty: Difficulty.BEGINNER,
          tutorialUrl: ''
      });
      setCustomSkills(prev => [...prev, newSkill]);
      setSkillStates(prev => ({ ...prev, [newSkill.id]: SkillState.LEARNING }));
      setCustomName('');
      setShowCustomModal(false);
      setLoading(false);
      triggerHaptic('success');
  };

  const filteredSkills = useMemo(() => {
    let combined = [...SKILL_LIBRARY, ...customSkills];
    if (activeCategory !== 'all') combined = combined.filter(s => s.category === activeCategory);
    if (searchQuery.trim()) combined = combined.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return combined.map(s => ({
      ...s,
      state: skillStates[s.id] || SkillState.LEARNING
    }));
  }, [activeCategory, searchQuery, skillStates, customSkills]);

  const masteredCount = user?.masteredCount || 0;

  return (
    <div className="pb-32 pt-6 md:pb-10 space-y-6 px-4 animate-view relative min-h-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Tree</h1>
          <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase">Progression System</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
           <Trophy size={16} className="text-amber-500" />
           <span className="text-xs font-black text-white">{masteredCount} Mastered</span>
        </div>
      </header>

      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button onClick={() => setActiveCategory('all')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === 'all' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Global</button>
        <button onClick={() => setActiveCategory(Discipline.SKATE)} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === Discipline.SKATE ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Street</button>
        <button onClick={() => setActiveCategory(Discipline.DOWNHILL)} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === Discipline.DOWNHILL ? 'bg-amber-500 text-white' : 'text-slate-500'}`}>Hill</button>
      </div>

      <div className="flex items-center gap-2">
          <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input type="text" placeholder="Search progression..." className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 text-sm text-white focus:outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={() => setShowCustomModal(true)} className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg active:scale-95"><Plus size={20} /></button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkillCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredSkills.map(skill => {
             const isLocked = skill.prerequisiteId ? (skillStates[skill.prerequisiteId] !== SkillState.MASTERED) : false;
             const isPending = user?.pendingSkills?.includes(skill.id) || false;
             return (
                <SkillCard 
                  key={skill.id}
                  skill={skill}
                  isLocked={isLocked}
                  isJustUnlocked={justUnlockedId === skill.id}
                  isPending={isPending}
                  onUpdateState={handleUpdateState}
                  onWatchTutorial={(url) => window.open(url, '_blank')}
                />
             );
           })}
        </div>
      )}

      {/* Video Upload Modal */}
      {showUploadModal && provingSkill && (
         <VideoUploadModal 
            title={`Mastering ${provingSkill.name}`}
            description="Upload a clip of you landing this trick clean. Our mods will verify it within 24 hours."
            onClose={() => setShowUploadModal(false)}
            onUpload={handleProofSubmit}
         />
      )}

      {/* Celebration Modal (Existing) */}
      {showCelebration && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-6 animate-view">
           {/* ... existing celebration content ... */}
           <div className="flex flex-col items-center text-center space-y-8 max-w-sm">
              <div className="relative">
                 <div className="absolute inset-0 bg-amber-500 blur-[80px] opacity-30 animate-pulse" />
                 <div className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-2xl relative z-10">
                    <Trophy size={64} />
                 </div>
              </div>
              <div className="space-y-2">
                 <h2 className="text-sm font-black uppercase tracking-[0.4em] text-amber-500">Mastery Achieved</h2>
                 <h1 className="text-4xl font-black uppercase italic text-white tracking-tighter">{masteredSkill?.name}</h1>
                 <p className="text-slate-400 text-xs font-medium">You've unlocked a higher branch in the tree.</p>
              </div>
              {newlyUnlocked && (
                  <div className="bg-slate-900 border-2 border-indigo-500 p-6 rounded-[2rem] w-full space-y-3 shadow-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Next Logical Skill</p>
                      <h4 className="text-xl font-black uppercase italic text-white">{newlyUnlocked.name}</h4>
                      <div className="flex justify-center gap-1.5"><DifficultyIcon difficulty={newlyUnlocked.difficulty} /> <span className="text-[10px] text-slate-500 uppercase font-black">{newlyUnlocked.difficulty}</span></div>
                  </div>
              )}
              <button onClick={() => setShowCelebration(false)} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all">Continue Journey</button>
           </div>
        </div>
      )}

      {/* Custom Trick Modal (Existing) */}
      {showCustomModal && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-view">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-sm space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Manifest Trick</h2>
                 <button onClick={() => setShowCustomModal(false)} className="text-slate-500"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateCustom} className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Trick Name</label>
                    <input type="text" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-indigo-500 outline-none font-bold italic" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Switch Shove" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Discipline</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setCustomCat(Discipline.SKATE)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${customCat === Discipline.SKATE ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>Street</button>
                        <button type="button" onClick={() => setCustomCat(Discipline.DOWNHILL)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${customCat === Discipline.DOWNHILL ? 'bg-amber-500 border-amber-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>Hill</button>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2 mt-4"><Sparkles size={16} /> Add to Bag</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SkillsView;
