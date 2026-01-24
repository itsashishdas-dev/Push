import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Discipline, SkillState, Difficulty, Skill } from '../types.ts';
import { SKILL_LIBRARY } from '../constants.tsx';
import { backend } from '../services/mockBackend.ts';
import { triggerHaptic } from '../utils/haptics.ts';
import { Play, Check, Lock } from 'lucide-react';

const SkillsView: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userState, setUserState] = useState<any>(null);
  
  useEffect(() => {
    backend.getUser().then(u => {
        setUserState(u);
        setSkills(SKILL_LIBRARY); // Simplified for clean view
    });
  }, []);

  if (!userState) return null;

  return (
    <div className="pb-32 pt-8 px-6 animate-view min-h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Skill Tree</h1>
        <p className="text-slate-400 font-medium">Track your progression and unlock badges.</p>
      </header>

      <div className="space-y-4">
         {skills.map(skill => {
             const isMastered = userState.locker.includes(skill.id);
             return (
                <div key={skill.id} className={`bg-slate-900/50 rounded-3xl p-6 border border-white/5 relative overflow-hidden ${isMastered ? 'opacity-100' : 'opacity-80'}`}>
                    {isMastered && <div className="absolute top-0 right-0 p-4 text-green-500"><Check size={24} /></div>}
                    
                    <div className="mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                            skill.difficulty === Difficulty.BEGINNER ? 'bg-green-500/10 text-green-400' : 
                            skill.difficulty === Difficulty.INTERMEDIATE ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                            {skill.difficulty}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{skill.name}</h3>
                    <p className="text-slate-500 text-sm font-medium mb-6">Street Discipline</p>

                    <div className="flex gap-3">
                        <button className="flex-1 py-3 bg-white/5 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                            <Play size={14} fill="currentColor" /> Tutorial
                        </button>
                        {!isMastered && (
                            <button className="flex-1 py-3 bg-white text-black rounded-xl text-xs font-bold">
                                Mark Complete
                            </button>
                        )}
                    </div>
                </div>
             );
         })}
      </div>
    </div>
  );
};

export default SkillsView;