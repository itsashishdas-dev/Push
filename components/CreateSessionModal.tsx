
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Loader2, Target } from 'lucide-react';
import { useAppStore } from '../store';
import { triggerHaptic } from '../utils/haptics';

const CreateSessionModal: React.FC = () => {
  const { closeModal, createSession, selectedSpot } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '16:00',
      intent: 'Chill'
  });

  const handleSubmit = async () => {
      if (!form.title || !selectedSpot) return;
      setIsLoading(true);
      triggerHaptic('medium');
      
      try {
          await createSession({
              title: form.title,
              date: form.date,
              time: form.time,
              intent: form.intent,
              spotId: selectedSpot.id,
              spotName: selectedSpot.name,
              spotType: selectedSpot.type
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
            
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-[0.85]">Init<br/>Session</h2>
                    <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                        <MapPin size={10} /> {selectedSpot.name}
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
                        Operation Title
                    </label>
                    <input 
                        type="text"
                        value={form.title}
                        onChange={e => setForm({...form, title: e.target.value})}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 uppercase placeholder:text-slate-700 tracking-wider font-mono transition-colors"
                        placeholder="E.G. SUNDAY SHRED"
                    />
                </div>

                {/* Timing */}
                <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-1">
                            <Calendar size={10} /> Date
                        </label>
                        <input 
                            type="date"
                            value={form.date}
                            onChange={e => setForm({...form, date: e.target.value})}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 uppercase tracking-widest"
                        />
                    </div>
                    <div className="space-y-2 flex-1">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-1">
                            <Clock size={10} /> Time
                        </label>
                        <input 
                            type="time"
                            value={form.time}
                            onChange={e => setForm({...form, time: e.target.value})}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 uppercase tracking-widest"
                        />
                    </div>
                </div>

                {/* Intent */}
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-1">
                        <Target size={10} /> Objective
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Chill', 'Training', 'Filming'].map(intent => (
                            <button
                                key={intent}
                                onClick={() => setForm({...form, intent})}
                                className={`py-3 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                                    form.intent === intent 
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                                    : 'bg-[#050505] text-slate-500 border-white/10 hover:border-white/30'
                                }`}
                            >
                                {intent}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={!form.title || isLoading}
                    className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none relative overflow-hidden group mt-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                    {isLoading ? 'BROADCASTING...' : 'LAUNCH SESSION'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default CreateSessionModal;
