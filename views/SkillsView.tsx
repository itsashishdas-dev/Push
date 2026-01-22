
import React, { useState, useMemo, useEffect } from 'react';
import { Discipline, SkillState, Difficulty, Skill } from '../types';
import { SKILL_LIBRARY } from '../constants';
import { backend } from '../services/mockBackend';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';
import { SkillCardSkeleton, EmptyState } from '../components/States';
import LeaderboardView from './LeaderboardView';
import { 
  Youtube, 
  X, 
  Search,
  Triangle,
  Square,
  Trophy,
  Circle,
  Zap,
  Mountain,
  Check,
  SearchX,
  Filter,
  PlayCircle,
  Award
} from 'lucide-react';

// --- SUB-COMPONENTS ---

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
  skill: Skill & { state: SkillState };
  isActive: boolean;
  onUpdateState: (id: string, state: SkillState) => void;
  onWatchTutorial: (url: string) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, isActive, onUpdateState, onWatchTutorial }) => {
  const isSkate = skill.category === Discipline.SKATE;
  
  return (
    <div className={`bg-slate-900 border ${isActive ? 'border-indigo-500 shadow-indigo-500/10 shadow-lg' : 'border-slate-800'} rounded-[2rem] p-5 relative overflow-hidden group transition-all duration-300 hover:border-slate-700`}>
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
                    {s === SkillState.LEARNING ? 'Learn' : s === SkillState.LANDED ? 'Landed' : 'Mastered'}
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
  const [activeTab, setActiveTab] = useState<'tree' | 'community'>('tree');
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(1);
  const [dailyRec, setDailyRec] = useState<Skill | null>(null);
  
  // -- SKILLS TREE STATE --
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Discipline | 'all'>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Map of skill ID to user's state (learning/landed/mastered)
  const [skillStates, setSkillStates] = useState<Record<string, SkillState>>({});
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const user = await backend.getUser();
    setUserLevel(user.level);
    
    // Initialize skill states based on user progression (mock)
    const initialStates: Record<string, SkillState> = {};
    SKILL_LIBRARY.forEach(skill => {
        initialStates[skill.id] = SkillState.LEARNING;
    });
    
    // Randomly populate some data if empty for demo
    if(user.masteredCount > 0) {
        const keys = Object.keys(initialStates);
        for(let i=0; i<user.masteredCount; i++) {
            initialStates[keys[i]] = SkillState.MASTERED;
        }
    }

    setSkillStates(initialStates);

    // Determine Daily Focus: First skill not mastered
    // Priority: Learning > Beginner Unlocked
    const focusSkill = SKILL_LIBRARY.find(s => initialStates[s.id] === SkillState.LEARNING) || SKILL_LIBRARY[0];
    setDailyRec(focusSkill);

    setLoading(false);
  };

  const handleUpdateState = async (skillId: string, newState: SkillState) => {
    triggerHaptic('medium');
    playSound(newState === SkillState.MASTERED ? 'unlock' : 'click');
    
    setSkillStates(prev => ({ ...prev, [skillId]: newState }));
    
    // Update backend
    await backend.updateSkillState(skillId, newState);
    
    if (newState === SkillState.MASTERED) {
       await backend.masterSkill(skillId);
    }
  };

  const filteredSkills = useMemo(() => {
    let skills = SKILL_LIBRARY;

    if (activeCategory !== 'all') {
      skills = skills.filter(s => s.category === activeCategory);
    }

    if (activeDifficulty !== 'all') {
      skills = skills.filter(s => s.difficulty === activeDifficulty);
    }

    if (searchQuery.trim()) {
      skills = skills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Map current state
    return skills.map(s => ({
      ...s,
      state: skillStates[s.id] || SkillState.LEARNING
    }));
  }, [activeCategory, activeDifficulty, searchQuery, skillStates]);

  const masteredCount = Object.values(skillStates).filter(s => s === SkillState.MASTERED).length;

  return (
    <div className="pb-32 pt-6 md:pb-10 space-y-6 px-4 animate-view relative min-h-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Skills</h1>
          <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase">
             Build Your Bag
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
           <Trophy size={16} className="text-indigo-500" />
           <span className="text-xs font-black text-white">{masteredCount} Mastered</span>
        </div>
      </header>

      {/* TABS */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button 
          onClick={() => setActiveTab('tree')} 
          className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'tree' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}
        >
          Progression
        </button>
        <button 
          onClick={() => setActiveTab('community')} 
          className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'community' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}
        >
          Community
        </button>
      </div>

      {activeTab === 'tree' && (
        <div className="space-y-6 animate-view">
           {/* Daily Focus Hero */}
           {dailyRec && (
             <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 p-6 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full" />
                <div className="relative z-10 space-y-4">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-1 flex items-center gap-1"><Zap size={10} fill="currentColor" /> Daily Focus</p>
                         <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">{dailyRec.name}</h2>
                      </div>
                      <div className="bg-indigo-500 text-white p-2 rounded-xl shadow-lg">
                         <PlayCircle size={20} />
                      </div>
                   </div>
                   
                   <p className="text-xs text-indigo-100/80 font-medium max-w-[80%]">
                      Perfect your {dailyRec.name} today. You're close to mastering the basics.
                   </p>

                   <button 
                     onClick={() => setActiveVideo(dailyRec.tutorialUrl)}
                     className="w-full bg-white text-indigo-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                   >
                      Watch Tutorial
                   </button>
                </div>
             </div>
           )}

           {/* Controls */}
           <div className="flex items-center gap-2">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input 
                   type="text" 
                   placeholder="Find a trick..."
                   className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-medium"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl border transition-all ${showFilters ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
              >
                 <Filter size={18} />
              </button>
           </div>

           {/* Advanced Filters (Collapsible) */}
           {showFilters && (
             <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-3 animate-view">
                <div className="space-y-2">
                   <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Discipline</p>
                   <div className="flex gap-2">
                      <button onClick={() => setActiveCategory('all')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border ${activeCategory === 'all' ? 'bg-white text-black border-white' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>All</button>
                      <button onClick={() => setActiveCategory(Discipline.SKATE)} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border ${activeCategory === Discipline.SKATE ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>Street</button>
                      <button onClick={() => setActiveCategory(Discipline.DOWNHILL)} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border ${activeCategory === Discipline.DOWNHILL ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>Downhill</button>
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Difficulty</p>
                   <div className="flex gap-2">
                      {[Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED].map(d => (
                          <button
                              key={d}
                              onClick={() => setActiveDifficulty(activeDifficulty === d ? 'all' : d)}
                              className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                                  activeDifficulty === d ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-900 text-slate-600 border-slate-800'
                              }`}
                          >
                              {d}
                          </button>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {/* List */}
           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[...Array(4)].map((_, i) => <SkillCardSkeleton key={i} />)}
             </div>
           ) : filteredSkills.length === 0 ? (
             <EmptyState icon={SearchX} title="No Tricks Found" description="Try adjusting your filters." />
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map(skill => (
                   <SkillCard 
                     key={skill.id}
                     skill={skill}
                     isActive={false}
                     onUpdateState={handleUpdateState}
                     onWatchTutorial={(url) => setActiveVideo(url)}
                   />
                ))}
             </div>
           )}
        </div>
      )}

      {activeTab === 'community' && (
         <LeaderboardView />
      )}

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
           <div className="relative w-full max-w-2xl bg-black rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl animate-view">
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="aspect-video">
                 <iframe 
                   src={activeVideo.replace('watch?v=', 'embed/')} 
                   title="Tutorial"
                   className="w-full h-full"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SkillsView;
