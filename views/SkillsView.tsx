
import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Discipline, Skill, Difficulty } from '../types.ts';
import { SKILL_LIBRARY } from '../constants.tsx';
import { backend } from '../services/mockBackend.ts';
import { triggerHaptic } from '../utils/haptics.ts';
import { playSound } from '../utils/audio.ts';
import { useAppStore } from '../store.ts';
import { Play, Check, Lock, ChevronRight, Zap, Trophy, Video, X, Upload, Swords, ExternalLink } from 'lucide-react';
import VideoUploadModal from '../components/VideoUploadModal';

const TIER_NAMES = {
    1: 'Fundamentals',
    2: 'Core Tech',
    3: 'Advanced',
    4: 'Pro Mastery'
};

const SkillsView: React.FC = () => {
  const { user, skills, updateUser } = useAppStore();
  const [activeDiscipline, setActiveDiscipline] = useState<Discipline>(Discipline.SKATE);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
      if (user?.disciplines && user.disciplines.length > 0) {
          setActiveDiscipline(user.disciplines[0]);
      }
  }, [user]);

  const tieredSkills = useMemo(() => {
      const filtered = skills.filter(s => s.category === activeDiscipline);
      const tiers: Record<number, Skill[]> = { 1: [], 2: [], 3: [], 4: [] };
      filtered.forEach(s => {
          if (tiers[s.tier]) tiers[s.tier].push(s);
      });
      return tiers;
  }, [skills, activeDiscipline]);

  const totalSkillsInDisc = skills.filter(s => s.category === activeDiscipline).length;
  const masteredInDisc = skills.filter(s => s.category === activeDiscipline && user?.masteredSkills.includes(s.id)).length;
  const progressPercent = Math.round((masteredInDisc / totalSkillsInDisc) * 100) || 0;

  const handleSkillClick = (skill: Skill) => {
      triggerHaptic('medium');
      playSound('click');
      setSelectedSkill(skill);
  };

  const handleMarkLanded = async () => {
      if (!selectedSkill || !user) return;
      if (user.landedSkills.includes(selectedSkill.id)) return;
      
      triggerHaptic('success');
      playSound('success');
      
      const updatedUser = await backend.markSkillLanded(selectedSkill.id);
      updateUser(updatedUser);
  };

  const handleUploadSuccess = async (file: File) => {
      if (!selectedSkill || !user) return;
      
      const updatedUser = await backend.masterSkill(selectedSkill.id);
      updateUser(updatedUser);
      
      setIsUploadOpen(false);
      triggerHaptic('success');
      playSound('unlock'); 
  };

  return (
    <div className="h-full bg-[#020202] relative overflow-hidden flex flex-col">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

      {/* --- HEADER --- */}
      <div className="pt-safe-top px-6 pb-4 relative z-10 bg-gradient-to-b from-[#020202] via-[#020202]/90 to-transparent">
          <div className="flex justify-between items-end mb-4">
              <div>
                  <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-[0.85] drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">Tech<br/>Tree</h1>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">Skill Database</p>
              </div>
              <div className="text-right">
                  <div className="text-3xl font-black text-white italic leading-none">{progressPercent}%</div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Completed</div>
              </div>
          </div>

          {/* Discipline Switcher */}
          <div className="flex bg-[#0b0c10]/80 p-1 rounded-xl border border-white/10 backdrop-blur-md overflow-x-auto hide-scrollbar">
              {[Discipline.SKATE, Discipline.DOWNHILL, Discipline.FREESTYLE].map((d) => (
                  <button 
                    key={d}
                    onClick={() => { setActiveDiscipline(d); triggerHaptic('light'); }}
                    className={`flex-1 min-w-[80px] py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeDiscipline === d 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                      {d}
                  </button>
              ))}
          </div>
      </div>

      {/* --- TREE CONTENT --- */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-32 relative z-10">
          <div className="flex flex-col gap-8 py-4 relative">
              {/* Vertical Connecting Line */}
              <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-slate-800 z-0" />

              {[1, 2, 3, 4].map((tier) => {
                  const skillsInTier = tieredSkills[tier as 1|2|3|4] || [];
                  if (skillsInTier.length === 0) return null;

                  return (
                      <div key={tier} className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-xl bg-black border border-slate-800 flex items-center justify-center text-slate-500 shadow-xl z-10 font-black text-lg">
                                  {tier}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-[#020202] px-2">{TIER_NAMES[tier as 1|2|3|4]}</span>
                          </div>

                          <div className="pl-6 ml-6 space-y-3 border-l border-slate-800/0"> 
                              {skillsInTier.map(skill => {
                                  // Determine Status
                                  const isMastered = user?.masteredSkills.includes(skill.id);
                                  const isLanded = user?.landedSkills.includes(skill.id);
                                  const isLocked = skill.prerequisiteId && !user?.landedSkills.includes(skill.prerequisiteId) && !user?.masteredSkills.includes(skill.prerequisiteId);
                                  
                                  return (
                                      <button
                                          key={skill.id}
                                          onClick={() => !isLocked && handleSkillClick(skill)}
                                          disabled={isLocked}
                                          className={`w-full relative group overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.98] ${
                                              isMastered 
                                              ? 'bg-indigo-900/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                                              : isLanded 
                                                  ? 'bg-[#0b0c10] border-slate-700'
                                                  : isLocked 
                                                      ? 'bg-black/50 border-slate-900 opacity-60 cursor-not-allowed'
                                                      : 'bg-[#0b0c10]/50 border-slate-800 hover:border-slate-600'
                                          }`}
                                      >
                                          {/* Scanline for mastered */}
                                          {isMastered && <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none z-0" />}

                                          <div className="flex justify-between items-start relative z-10">
                                              <div>
                                                  <div className="flex items-center gap-2 mb-1">
                                                      <h3 className={`text-sm font-black uppercase italic tracking-tight ${isMastered ? 'text-white' : isLocked ? 'text-slate-600' : 'text-slate-300'}`}>
                                                          {skill.name}
                                                      </h3>
                                                      {isMastered && <Trophy size={12} className="text-yellow-500 fill-yellow-500 animate-pulse" />}
                                                      {isLanded && !isMastered && <Check size={12} className="text-green-500" />}
                                                      {isLocked && <Lock size={12} className="text-slate-600" />}
                                                  </div>
                                                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide line-clamp-1">{skill.description}</p>
                                              </div>
                                              <div className="text-[9px] font-mono text-slate-600 group-hover:text-indigo-400 transition-colors">
                                                  +{skill.xpReward} XP
                                              </div>
                                          </div>
                                      </button>
                                  )
                              })}
                          </div>
                      </div>
                  )
              })}
          </div>
      </div>

      {/* --- SKILL DETAIL MODAL --- */}
      {selectedSkill && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-end md:items-center justify-center animate-view">
              <div className="w-full max-w-md bg-[#0b0c10] border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] p-0 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
                  
                  {/* CRT Overlay on Modal */}
                  <div className="absolute inset-0 pointer-events-none z-50 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/3/3a/Gray_scale_scan_line_pattern.png')] bg-repeat" />

                  {/* Header */}
                  <div className="p-6 pb-0 relative z-10">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded mb-2 inline-block">
                                  {activeDiscipline} // Tier {selectedSkill.tier}
                              </span>
                              <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">{selectedSkill.name}</h2>
                          </div>
                          <button onClick={() => setSelectedSkill(null)} className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white border border-slate-800">
                              <X size={20} />
                          </button>
                      </div>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed border-l-2 border-slate-700 pl-3">
                          "{selectedSkill.description}"
                      </p>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 hide-scrollbar">
                      
                      {/* Tutorial Deck */}
                      <div className="space-y-3">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                              <Play size={12} /> Data Tape
                          </h3>
                          <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-slate-800 relative group cursor-pointer">
                              <img src={`https://img.youtube.com/vi/${selectedSkill.tutorialUrl}/hqdefault.jpg`} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                      <Play size={20} className="text-white fill-white ml-1" />
                                  </div>
                              </div>
                              <a href={`https://www.youtube.com/watch?v=${selectedSkill.tutorialUrl}`} target="_blank" rel="noreferrer" className="absolute inset-0 z-20" />
                          </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="space-y-3">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                              <Swords size={12} /> Proficiency Status
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-3">
                              {/* Mark Landed Button */}
                              <button 
                                onClick={handleMarkLanded}
                                disabled={user?.landedSkills.includes(selectedSkill.id) || user?.masteredSkills.includes(selectedSkill.id)}
                                className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all active:scale-95 ${
                                    user?.landedSkills.includes(selectedSkill.id) || user?.masteredSkills.includes(selectedSkill.id)
                                    ? 'bg-green-900/20 border-green-500/50' 
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user?.landedSkills.includes(selectedSkill.id) ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                      <Check size={16} strokeWidth={3} />
                                  </div>
                                  <div className="text-left">
                                      <div className={`text-xs font-black uppercase ${user?.landedSkills.includes(selectedSkill.id) ? 'text-green-400' : 'text-white'}`}>Landed</div>
                                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">+150 XP</div>
                                  </div>
                              </button>

                              {/* Master / Upload Button */}
                              <button 
                                onClick={() => setIsUploadOpen(true)}
                                disabled={user?.masteredSkills.includes(selectedSkill.id)}
                                className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all active:scale-95 ${
                                    user?.masteredSkills.includes(selectedSkill.id)
                                    ? 'bg-yellow-900/20 border-yellow-500/50' 
                                    : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50'
                                }`}
                              >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user?.masteredSkills.includes(selectedSkill.id) ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                      {user?.masteredSkills.includes(selectedSkill.id) ? <Trophy size={16} fill="currentColor" /> : <Upload size={16} />}
                                  </div>
                                  <div className="text-left">
                                      <div className={`text-xs font-black uppercase ${user?.masteredSkills.includes(selectedSkill.id) ? 'text-yellow-500' : 'text-white'}`}>Mastery</div>
                                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                                          {user?.masteredSkills.includes(selectedSkill.id) ? 'Verified' : 'Upload Clip'}
                                      </div>
                                  </div>
                              </button>
                          </div>
                      </div>

                      {/* Community Clips (Social Proof) */}
                      <div className="pt-2">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                              <Video size={12} /> Recent Clears
                          </h3>
                          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                              {[1,2,3,4].map(i => (
                                  <div key={i} className="w-20 h-28 rounded-xl bg-slate-800 shrink-0 border border-slate-700 relative overflow-hidden">
                                      <img src={`https://picsum.photos/seed/${selectedSkill.id}${i}/200/300`} className="w-full h-full object-cover opacity-60" />
                                      <div className="absolute bottom-1 left-1 right-1 flex justify-between items-end">
                                          <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                                              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i}`} className="w-full h-full rounded-full" />
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {selectedSkill && isUploadOpen && (
          <VideoUploadModal 
            title={`Verify: ${selectedSkill.name}`}
            description="Upload a clear clip of you landing this trick. Our moderators (or AI) will verify it for the Mastery Badge."
            onClose={() => setIsUploadOpen(false)}
            onUpload={handleUploadSuccess}
          />
      )}
    </div>
  );
};

export default SkillsView;
