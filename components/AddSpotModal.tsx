
import React, { useState } from 'react';
import { X, MapPin, CheckCircle2, Loader2, Camera } from 'lucide-react';
import { Discipline, SpotCategory, Difficulty } from '../types';
import { useAppStore } from '../store';
import { triggerHaptic } from '../utils/haptics';

const AddSpotModal: React.FC = () => {
  const { closeModal, addNewSpot, location } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
      name: '',
      type: Discipline.SKATE,
      difficulty: Difficulty.BEGINNER,
      description: ''
  });

  const handleSubmit = async () => {
      if (!form.name) return;
      setIsLoading(true);
      triggerHaptic('medium');
      
      try {
          await addNewSpot({
              name: form.name,
              type: form.type,
              difficulty: form.difficulty,
              notes: form.description,
              location: location ? { ...location, address: 'Pinned Location' } : undefined
          });
          triggerHaptic('success');
          closeModal();
      } catch (e) {
          triggerHaptic('error');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end md:items-center justify-center p-4 animate-view">
        <div className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative mb-safe-bottom md:mb-0">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">Drop Pin</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mark New Territory</p>
                </div>
                <button onClick={closeModal} className="p-2 bg-black/40 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1">Spot Name</label>
                    <input 
                        type="text"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 uppercase placeholder:text-slate-700"
                        placeholder="E.g. NEHRU PLACE LEDGES"
                    />
                </div>

                {/* Type */}
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1">Discipline</label>
                    <div className="flex bg-[#0b0c10] p-1 rounded-xl border border-white/10">
                        {[Discipline.SKATE, Discipline.DOWNHILL].map(d => (
                            <button
                                key={d}
                                onClick={() => setForm({...form, type: d})}
                                className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    form.type === d ? 'bg-white text-black shadow-lg' : 'text-slate-500'
                                }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1">Difficulty</label>
                    <div className="grid grid-cols-4 gap-1">
                        {[Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED, Difficulty.PRO].map(d => (
                            <button
                                key={d}
                                onClick={() => setForm({...form, difficulty: d})}
                                className={`py-2 rounded-lg text-[7px] font-black uppercase tracking-widest border transition-all ${
                                    form.difficulty === d 
                                    ? 'bg-indigo-600 text-white border-indigo-500' 
                                    : 'bg-[#0b0c10] text-slate-500 border-slate-800'
                                }`}
                            >
                                {d.slice(0,3)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Photo Placeholder */}
                <button className="w-full py-4 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:text-white hover:border-slate-600 transition-colors">
                    <Camera size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
                </button>

                <button 
                    onClick={handleSubmit}
                    disabled={!form.name || isLoading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                    {isLoading ? 'UPLOADING...' : 'CONFIRM DROP'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default AddSpotModal;
