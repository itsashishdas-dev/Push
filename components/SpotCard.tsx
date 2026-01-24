
import React from 'react';
import { MapPin, Users, Info, Star, Droplets, AlertTriangle } from 'lucide-react';
import { Spot, Discipline, VerificationStatus, SpotStatus } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface SpotCardProps {
  spot: Spot;
  onClick: () => void;
}

const SpotCard: React.FC<SpotCardProps> = ({ spot, onClick }) => {
  const isSkate = spot.type === Discipline.SKATE;
  
  const handleClick = () => {
    triggerHaptic('light');
    onClick();
  };

  const mainImage = spot.images?.[0] || `https://picsum.photos/seed/${spot.id}/400/400`;
  
  // Status Colors
  const statusColor = 
    spot.status === SpotStatus.WET ? 'text-blue-400' :
    spot.status === SpotStatus.CROWDED ? 'text-amber-400' :
    'text-green-400';

  const statusIcon = 
    spot.status === SpotStatus.WET ? <Droplets size={10} className={statusColor} /> :
    spot.status === SpotStatus.CROWDED ? <Users size={10} className={statusColor} /> :
    <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`} />;

  const statusText = 
    spot.status === SpotStatus.WET ? 'Wet Surfaces' :
    spot.status === SpotStatus.CROWDED ? 'High Activity' :
    'Prime Conditions';

  return (
    <div 
      className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-row h-32 active:scale-[0.98] transition-all duration-200 shadow-lg cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image Thumb */}
      <div className="w-32 h-full relative shrink-0">
        <img 
          src={mainImage} 
          alt={spot.name} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900" />
        <div className="absolute top-2 left-2">
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wide backdrop-blur-md ${isSkate ? 'bg-indigo-500/90 text-white' : 'bg-purple-500/90 text-white'}`}>
                {spot.type}
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
               <h3 className="text-sm font-black text-white leading-tight line-clamp-1 uppercase italic tracking-tight">
                  {spot.name}
               </h3>
               {spot.distance && <span className="text-[9px] font-bold text-slate-500">{(spot.distance / 1000).toFixed(1)}km</span>}
            </div>
            
            <div className="flex items-center gap-1 mt-1">
                <MapPin size={10} className="text-slate-500" />
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{spot.location.address}</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
              <div className="flex items-center gap-2 bg-slate-950/50 px-2 py-1 rounded-lg border border-white/5">
                 {statusIcon}
                 <span className={`text-[9px] font-bold uppercase tracking-wide ${statusColor}`}>
                    {statusText}
                 </span>
              </div>
              
              <div className="flex gap-1">
                 {spot.rating > 4.5 && (
                    <div className="w-6 h-6 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    </div>
                 )}
                 <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 border border-slate-700">
                    <Info size={12} />
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default SpotCard;
