
import React, { memo } from 'react';
import { MapPin, Zap, Activity, Navigation, Star, Layers, Mountain, ShieldCheck } from 'lucide-react';
import { Spot, Discipline, SpotStatus } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface SpotCardProps {
  spot: Spot;
  onClick: () => void;
}

const SpotCard: React.FC<SpotCardProps> = memo(({ spot, onClick }) => {
  const isSkate = spot.type === Discipline.SKATE;
  
  const handleClick = () => {
    triggerHaptic('medium');
    onClick();
  };

  const mainImage = spot.images?.[0] || `https://picsum.photos/seed/${spot.id}/400/400`;
  
  const statusConfig = {
    [SpotStatus.WET]: { color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-950/90', label: 'CAUTION: WET' },
    [SpotStatus.CROWDED]: { color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-950/90', label: 'ALERT: HIGH TRAFFIC' },
    [SpotStatus.DRY]: { color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-950/90', label: 'STATUS: OPTIMAL' },
    [SpotStatus.MAINTENANCE]: { color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-950/90', label: 'ERROR: CLOSED' },
  };

  const status = statusConfig[spot.status || SpotStatus.DRY];

  return (
    <div 
      className="group relative w-full aspect-[4/5] bg-[#050505] rounded-[1.5rem] overflow-hidden cursor-pointer flex flex-col shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-white/10 hover:border-indigo-500/50"
      onClick={handleClick}
    >
      {/* 1. Image Section (Top 60%) - Surveillance Style */}
      <div className="h-[60%] relative overflow-hidden bg-slate-900">
          {/* Base Image with Grayscale Filter */}
          <img 
            src={mainImage} 
            alt={spot.name} 
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 mix-blend-overlay md:mix-blend-normal"
          />
          
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_3px,3px_100%] opacity-40 group-hover:opacity-20 transition-opacity" />
          
          {/* Status Tag - Floating Top Left */}
          <div className="absolute top-3 left-3 z-30">
              <div className={`px-2 py-1 rounded-sm border backdrop-blur-md flex items-center gap-1.5 shadow-lg ${status.border} ${status.bg}`}>
                  <div className={`w-1 h-1 rounded-full ${status.color.replace('text-', 'bg-')} animate-pulse`} />
                  <span className={`text-[7px] font-mono font-bold uppercase tracking-widest ${status.color}`}>{status.label}</span>
              </div>
          </div>

          {/* Type Icon - Floating Top Right */}
          <div className="absolute top-3 right-3 z-30">
              <div className="w-8 h-8 bg-black/80 border border-white/10 rounded-lg flex items-center justify-center text-white/80 backdrop-blur-sm">
                  {isSkate ? <Zap size={14} /> : <Mountain size={14} />}
              </div>
          </div>

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-4 z-20">
              <div className="flex items-center gap-1.5 mb-1 opacity-70">
                  {spot.isVerified && <ShieldCheck size={10} className="text-indigo-400" />}
                  <span className="text-[8px] font-mono text-indigo-300 font-bold uppercase tracking-widest">
                      SECTOR: {spot.state?.toUpperCase().slice(0, 3) || 'UNK'}
                  </span>
              </div>
              <h3 className="text-2xl font-black italic uppercase text-white leading-[0.85] tracking-tighter truncate w-full group-hover:text-indigo-400 transition-colors">
                  {spot.name}
              </h3>
          </div>
      </div>

      {/* 2. Data HUD (Bottom 40%) */}
      <div className="h-[40%] bg-[#050505] p-4 flex flex-col justify-between relative border-t border-white/5">
          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-px bg-white/5 rounded-lg overflow-hidden border border-white/5">
              <div className="bg-[#0a0a0a] p-2 flex flex-col justify-center">
                  <span className="text-[7px] text-slate-600 font-black uppercase tracking-widest mb-0.5 flex items-center gap-1"><Layers size={8} /> Surface</span>
                  <span className="text-[9px] font-mono font-bold text-slate-300 uppercase truncate">{spot.surface}</span>
              </div>
              <div className="bg-[#0a0a0a] p-2 flex flex-col justify-center">
                  <span className="text-[7px] text-slate-600 font-black uppercase tracking-widest mb-0.5 flex items-center gap-1"><Star size={8} /> Rating</span>
                  <span className="text-[9px] font-mono font-bold text-yellow-500 uppercase">{spot.rating.toFixed(1)} / 5.0</span>
              </div>
          </div>

          {/* Location & Action */}
          <div className="flex items-end justify-between mt-2">
              <div className="flex flex-col gap-1">
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={10} className="text-slate-600" />
                      {spot.location.address ? spot.location.address.split(',')[0] : 'Unknown Coords'}
                  </div>
              </div>
              
              <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:bg-indigo-500 transition-all active:scale-95 group-hover:rotate-0 rotate-45">
                  <Navigation size={14} strokeWidth={2.5} className="group-hover:rotate-0 -rotate-45 transition-transform" />
              </button>
          </div>

          {/* Corner Brackets (Tactical Decoration) */}
          <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-slate-700 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-slate-700 pointer-events-none" />
      </div>
    </div>
  );
});

export default SpotCard;
