
import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Discipline, Skill } from '../types.ts';
import { backend } from '../services/mockBackend.ts';
import { triggerHaptic } from '../utils/haptics.ts';
import { playSound } from '../utils/audio.ts';
import { useAppStore } from '../store.ts';
import { Play, Check, Lock, Trophy, Video, X, Upload, Swords, Hexagon, Sparkles } from 'lucide-react';
import VideoUploadModal from '../components/VideoUploadModal';

const TIER_NAMES = {
    1: 'Fundamentals',
    2: 'Core Tech',
    3: 'Advanced',
    4: 'Pro Mastery'
};

const SkillTree: React.FC = () => {
  const { user, skills, updateUser } = useAppStore();
  const [activeDiscipline, setActiveDiscipline] = useState<Discipline>(Discipline.SKATE);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Ref for tree container to calculate SVG coordinates
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
      if (user?.disciplines && user.disciplines.length > 0) {
          // If the user's primary discipline isn't set, default to first available
          // but allow switching freely
          if (!Object.values(Discipline).includes(activeDiscipline)) {
              setActiveDiscipline(user.disciplines[0]);
          }
      }
  }, [user]);

  // Recalculate positions on window resize or discipline change
  useEffect(() => {
      const calculatePositions = () => {
          if (!containerRef.current) return;
          const nodes = containerRef.current.querySelectorAll('[data-skill-id]');
          const newPositions: Record<string, { x: number, y: number }> = {};
          
          // Get container offset
          const containerRect = containerRef.current.getBoundingClientRect();

          nodes.forEach((node) => {
              const rect = node.getBoundingClientRect();
              const id = node.getAttribute('data-skill-id');
              if (id) {
                  // Calculate center relative to container
                  newPositions[id] = {
                      x: rect.left + rect.width / 2 - containerRect.left,
                      y: rect.top + rect.height / 2 - containerRect.top
                  };
              }
          });
          setNodePositions(newPositions);
      };

      // Slight delay to ensure DOM is rendered
      const timer = setTimeout(calculatePositions, 100);
      window.addEventListener('resize', calculatePositions);
      
      return () => {
          window.removeEventListener('resize', calculatePositions);
          clearTimeout(timer);
      };
  }, [activeDiscipline, skills]);

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

  // Helper to draw curves
  const renderConnections = () => {
      return skills
          .filter(s => s.category === activeDiscipline && s.prerequisiteId)
          .map(skill => {
              const start = nodePositions[skill.prerequisiteId!];
              const end = nodePositions[skill.id];
              
              if (!start || !end) return null;

              const isUnlocked = user?.landedSkills.includes(skill.prerequisiteId!) || user?.masteredSkills.includes(skill.prerequisiteId!);
              const isActive = isUnlocked && (user?.landedSkills.includes(skill.id) || user?.masteredSkills.includes(skill.id));

              // Bezier Curve Logic
              const midY = (start.y + end.y) / 2;
              
              // Slightly curving the line
              const path = `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;

              return (
                  <path 
                      key={`${skill.prerequisiteId}-${skill.id}`}
                      d={path}
                      fill="none"
                      stroke={isActive ? '#10b981' : isUnlocked ? '#4b5563' : '#1f2937'}
                      strokeWidth={isActive ? 2 : 1}
                      strokeDasharray={isActive ? 'none' : '4 4'}
                      className="transition-colors duration-500"
                  />
              );
          });
  };

  return (
    <div className="flex-col gap-6 pt-2 pb-6 animate-view relative">
      
      {/* --- HEADER CONTROLS --- */}
      <div className="flex justify-between items-center mb-6 px-1 relative z-20">
          <div className="bg-[#0b0c10] p-1 rounded-xl border border-white/10 overflow-x-auto hide-scrollbar flex">
              {[Discipline.SKATE, Discipline.DOWNHILL, Discipline.FREESTYLE].map((d) => (
                  <button 
                    key={d}
                    onClick={() => { setActiveDiscipline(d); triggerHaptic('light'); }}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1 ${
                        activeDiscipline === d 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                      {d === Discipline.FREESTYLE && <Sparkles size={10} />}
                      {d}
                  </button>
              ))}
          </div>
          
          <div className="text-right">
              <div className="text-2xl font-black text-white italic leading-none">{progressPercent}%</div>
              <div className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Complete</div>
          </div>
      </div>

      {/* --- NODE GRAPH --- */}
      <div ref={containerRef} className="relative min-h-[600px] pb-20">
          
          {/* SVG Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
              {renderConnections()}
          </svg>

          <div className="flex flex-col gap-12 relative z-10 px-1">
              {[1, 2, 3, 4].map((tier) => {
                  const skillsInTier = tieredSkills[tier as 1|2|3|4] || [];
                  if (skillsInTier.length === 0) return null;

                  return (
                      <div key={tier} className="relative">
                          {/* Tier Label */}
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[8px] font-black uppercase text-slate-700 tracking-[0.3em] whitespace-nowrap">
                              Tier 0{tier} // {TIER_NAMES[tier as 1|2|3|4]}
                          </div>

                          {/* Grid of Nodes */}
                          <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 pl-6">
                              {skillsInTier.map(skill => {
                                  // Determine Status
                                  const isMastered = user?.masteredSkills.includes(skill.id);
                                  const isLanded = user?.landedSkills.includes(skill.id);
                                  // Locked if it has a prerequisite that isn't landed/mastered
                                  const isLocked = skill.prerequisiteId && !user?.landedSkills.includes(skill.prerequisiteId) && !user?.masteredSkills.includes(skill.prerequisiteId);
                                  
                                  return (
                                      <div 
                                        key={skill.id} 
                                        data-skill-id={skill.id}
                                        className="flex flex-col items-center gap-2 w-24 relative group"
                                      >
                                          {/* Node Button */}
                                          <button
                                              onClick={() => !isLocked && handleSkillClick(skill)}
                                              disabled={isLocked}
                                              className={`
                                                  w-14 h-14 relative flex items-center justify-center transition-all duration-300 active:scale-90
                                                  ${isMastered 
                                                      ? 'text-black drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                                                      : isLanded 
                                                          ? 'text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                                          : isLocked 
                                                              ? 'text-slate-800' 
                                                              : 'text-slate-500 hover:text-white hover:scale-110'
                                                  }
                                              `}
                                          >
                                              {/* Hexagon Shape */}
                                              <Hexagon 
                                                  size={isMastered ? 56 : 48} 
                                                  strokeWidth={isMastered ? 0 : 2} 
                                                  className={`
                                                      ${isMastered 
                                                          ? 'fill-yellow-500' 
                                                          : isLanded 
                                                              ? 'fill-emerald-600 stroke-emerald-400' 
                                                              : isLocked 
                                                                  ? 'fill-[#0a0a0a] stroke-slate-800' 
                                                                  : 'fill-[#0b0c10] stroke-current animate-pulse'
                                                      }
                                                  `} 
                                              />
                                              
                                              {/* Icon Overlay */}
                                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                  {isMastered ? <Trophy size={20} className="text-black" /> :
                                                   isLanded ? <Check size={20} strokeWidth={3} /> :
                                                   isLocked ? <Lock size={16} /> :
                                                   <div className="w-2 h-2 bg-slate-500 rounded-full" />}
                                              </div>
                                          </button>

                                          {/* Label */}
                                          <div className={`text-center transition-opacity duration-300 ${isLocked ? 'opacity-30' : 'opacity-100'}`}>
                                              <div className="text-[9px] font-black uppercase leading-tight tracking-wide text-white max-w-[80px] truncate">
                                                  {skill.name}
                                              </div>
                                              {isMastered && <div className="text-[7px] font-bold text-yellow-500 uppercase tracking-wider">Mastered</div>}
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  )
              })}
          </div>
      </div>

      {/* --- SKILL DETAIL MODAL --- */}
      {selectedSkill && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-end md:items-center justify-center animate-view">
              <div 
                className="w-full max-w-md bg-[#0b0c10] border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] p-0 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                  
                  {/* CRT Overlay on Modal */}
                  <div className="absolute inset-0 pointer-events-none z-50 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/3/3a/Gray_scale_scan_line_pattern.png')] bg-repeat" />

                  {/* Header */}
                  <div className="p-6 pb-0 relative z-10 shrink-0">
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
                              {selectedSkill.tutorialUrl ? (
                                  <>
                                    <img src={`https://img.youtube.com/vi/${selectedSkill.tutorialUrl}/hqdefault.jpg`} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                            <Play size={20} className="text-white fill-white ml-1" />
                                        </div>
                                    </div>
                                    <a href={`https://www.youtube.com/watch?v=${selectedSkill.tutorialUrl}`} target="_blank" rel="noreferrer" className="absolute inset-0 z-20" />
                                  </>
                              ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                      <div className="w-10 h-10 border border-slate-700 rounded-full flex items-center justify-center mb-2">
                                          <X size={16} />
                                      </div>
                                      <span className="text-[9px] font-mono">NO DATA TAPE FOUND</span>
                                  </div>
                              )}
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
                                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">+{selectedSkill.xpReward} XP</div>
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
          </div>,
          document.body
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

export default SkillTree;
