
import React, { useState } from 'react';
import { X, Swords, CheckCircle2, Loader2, AlignLeft, BarChart3 } from 'lucide-react';
import { useAppStore } from '../store';
import { triggerHaptic } from '../utils/haptics';
import { Difficulty } from '../types';

const CreateChallengeModal: React.FC = () => {
  const { closeModal, createChallenge, selectedSpot } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
      title: '',
      description: '',
      difficulty: Difficulty.INTERMEDIATE
  });

  const handleSubmit = async () => {
      if (!form.title || !selectedSpot) return;
      setIsLoading(true);
      triggerHaptic('medium');
      
      try {
          await createChallenge({
              title: form.title,
              description: form.description,
              difficulty: form.difficulty,
              spotId: selectedSpot.id,
              spotName: selectedSpot.name,
              xpReward: form.difficulty === Difficulty.PRO ? 1000 : form.difficulty === Difficulty.ADVANCED ? 600 : 300
          });
          triggerHaptic('success');
          closeModal();
      } catch (e) {
          triggerHaptic('error');
      } finally {
          setIsLoading(false);
      }
  };

  if (!selectedSpot) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-view">
        <div className="w-full max-w-sm bg-[#0b0c10] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative flex flex-col overflow-hidden">
            
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-[0.85]">Post<br/>Bounty</h2>
                    <p className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                        <Swords size={10} /> {selectedSpot.name}
                    </p>
                </div>
                <button 
                    onClick={closeModal} 
                    className="w-8 h-8 bg-[#151515] border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="space-y-5 relative z-10">
                {/* Title */}
                <div className="space-y-2 group">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-1 group-focus-within:text-white transition-colors">
                        Challenge Title
                    </label>
                    <input 
                        type="text"
                        value={form.title}
                        onChange={e => setForm({...form, title: e.target.value})}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:outline-none focus:border-red-500 uppercase placeholder:text-slate-700 tracking-wider font-mono transition-colors"
                        placeholder="E.G. KICKFLIP THE GAP"
                    />
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-1">
                        <BarChart3 size={10} /> Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[Difficulty.INTERMEDIATE, Difficulty.ADVANCED, Difficulty.PRO].map(d => (
                            <button
                                key={d}
                                onClick={() => setForm({...form, difficulty: d})}
                                className={`py-3 rounded-lg text-[7px] font-black uppercase tracking-widest border transition-all ${
                                    form.difficulty === d 
                                    ? 'bg-red-600 text-white border-red-500 shadow-lg' 
                                    : 'bg-[#050505] text-slate-500 border-white/10 hover:border-white/30'
                                }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2 group">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-1 group-focus-within:text-white transition-colors">
                        <AlignLeft size={10} /> Conditions
                    </label>
                    <textarea 
                        rows={3}
                        value={form.description}
                        onChange={e => setForm({...form, description: e.target.value})}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-xs font-medium text-white focus:outline-none focus:border-red-500 resize-none placeholder:text-slate-700 transition-colors"
                        placeholder="Must land clean. No toe drag."
                    />
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={!form.title || isLoading}
                    className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none relative overflow-hidden group mt-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                    {isLoading ? 'POSTING...' : 'ACTIVATE BOUNTY'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default CreateChallengeModal;
