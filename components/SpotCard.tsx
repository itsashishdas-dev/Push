
import React, { memo } from 'react';
import { MapPin, Users, Info, Star, Droplets, Zap, Activity, ChevronRight } from 'lucide-react';
import { Spot, Discipline, SpotStatus } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface SpotCardProps {
  spot: Spot;
  onClick: () => void;
}

const SpotCard: React.FC<SpotCardProps> = memo(({ spot, onClick }) => {
  const isSkate = spot.type === Discipline.SKATE;
  const hasActiveSessions = spot.sessions && spot.sessions.length > 0;
  
  const handleClick = () => {
    triggerHaptic('medium');
    onClick();
  };

  const mainImage = spot.images?.[0] || `https://picsum.photos/seed/${spot.id}/400/400`;
  
  // Status Logic
  const statusColor = 
    spot.status === SpotStatus.WET ? 'text-blue-400' :
    spot.status === SpotStatus.CROWDED ? 'text-amber-400' :
    'text-green-400';

  const statusBorder = 
    spot.status === SpotStatus.WET ? 'border-blue-500/20' :
    spot.status === SpotStatus.CROWDED ? 'border-amber-500/20' :
    'border-green-500/20';

  const statusIcon = 
    spot.status === SpotStatus.WET ? <Droplets size={10} className={statusColor} /> :
    spot.status === SpotStatus.CROWDED ? <Users size={10} className={statusColor} /> :
    <Zap size={10} className={statusColor} />;

  const statusText = 
    spot.status === SpotStatus.WET ? 'WET' :
    spot.status === SpotStatus.CROWDED ? 'HIGH TRAFFIC' :
    'PRIME';

  return (
    <div 
      className="group relative w-full h-40 bg-[#0e0e0e] border border-white/5 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/30 hover:shadow-[0_0_25px_rgba(99,102,241,0.1)] active:scale-95 cursor-pointer flex flex-col shadow-2xl"
      onClick={handleClick}
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
          <img 
            src={mainImage} 
            alt={spot.name} 
            loading="lazy"
            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-500 grayscale group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
      </div>

      {/* Top Badge Layer */}
      <div className="relative z-10 px-4 pt-3 flex justify-between items-start">
          <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border backdrop-blur-md flex items-center gap-1.5 ${statusBorder} bg-black/40`}>
              {statusIcon}
              <span className={statusColor}>{statusText}</span>
          </div>
          
          {hasActiveSessions && (
             <div className="flex items-center justify-center w-5 h-5 bg-green-500/20 rounded-full border border-green-500/30 shrink-0 animate-pulse backdrop-blur-sm">
                 <Users size={10} className="text-green-400" />
             </div>
          )}
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex-1 p-4 flex flex-col justify-end">
          <div className="space-y-1.5">
            <h3 className="text-sm font-black italic text-white uppercase leading-none tracking-tight group-hover:text-indigo-400 transition-colors line-clamp-1 pr-4">
                {spot.name}
            </h3>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                       <MapPin size={10} className="text-indigo-500" /> 
                       {(spot.distance ? (spot.distance / 1000).toFixed(1) : '?.?')} KM
                    </span>
                    <span className="w-0.5 h-2 bg-slate-700" />
                    <span className="truncate max-w-[80px] text-slate-500">
                       {spot.state}
                    </span>
                </div>
            </div>
          </div>
      </div>
      
      {/* Selection Highlight */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
});

export default SpotCard;
