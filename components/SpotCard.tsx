
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ShieldCheck, Users, Info, Star, Clock, Image as ImageIcon, Zap, Mountain, CalendarDays, Plus, UserPlus, ArrowRight } from 'lucide-react';
import { Spot, Discipline, VerificationStatus } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface SpotCardProps {
  spot: Spot;
  onClick: () => void;
}

const SpotCard: React.FC<SpotCardProps> = ({ spot, onClick }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const sessionCount = spot.sessions?.length || 0;
  const isSkate = spot.type === Discipline.SKATE;
  
  const today = new Date().toISOString().split('T')[0];
  const hasSessionToday = spot.sessions?.some(s => s.date === today);

  const actionConfig = sessionCount > 0
    ? { label: 'Join Session', icon: UserPlus, color: 'bg-green-500 text-white', iconColor: 'text-white' }
    : { label: 'Call Session', icon: Plus, color: isSkate ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-black', iconColor: isSkate ? 'text-white' : 'text-black' };

  const images = spot.images && spot.images.length > 0 
    ? spot.images 
    : [`https://picsum.photos/seed/${spot.id}/400/400`];

  const handleClick = (e: React.MouseEvent) => {
    triggerHaptic('light');
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);
    onClick();
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const index = Math.round(scrollContainerRef.current.scrollLeft / scrollContainerRef.current.clientWidth);
      setActiveIndex(index);
    }
  };

  return (
    <div 
      className={`bg-slate-900 border border-slate-800 rounded-[2rem] aspect-square flex flex-col transition-all duration-200 ease-out cursor-pointer overflow-hidden relative shadow-xl group touch-manipulation select-none
        ${isClicked 
          ? `scale-[0.95] ring-2 brightness-110 ${isSkate ? 'ring-indigo-500/50' : 'ring-amber-500/50'}` 
          : 'hover:scale-[1.02] active:scale-[0.95]'
        }
        ${hasSessionToday ? 'ring-1 ring-green-500/50 shadow-green-500/10' : ''}
        ${isSkate 
          ? 'hover:border-indigo-500/40 hover:shadow-indigo-500/20' 
          : 'hover:border-amber-500/40 hover:shadow-amber-500/20'
        }
      `}
      onClick={handleClick}
    >
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pointer-events-auto"
        >
          {images.map((img, i) => (
            <img 
              key={i}
              src={img} 
              alt={`${spot.name} ${i+1}`} 
              draggable={false}
              loading="lazy" 
              decoding="async"
              className="w-full h-full object-cover shrink-0 snap-center transition-transform duration-700 opacity-60 group-hover:opacity-80"
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
      </div>

      {/* Click Flash Effect Overlay */}
      <div className={`absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-150 ease-out mix-blend-overlay ${isClicked ? 'opacity-20' : 'opacity-0'}`} />

      {/* Touch/Active Overlay */}
      <div className={`absolute inset-0 opacity-0 active:opacity-20 transition-opacity duration-75 pointer-events-none z-20 ${isSkate ? 'bg-indigo-400' : 'bg-amber-400'}`} />

      {/* Session Badge */}
      {sessionCount > 0 && (
         <div className="absolute top-4 right-4 z-40 flex flex-col items-end gap-1">
           {hasSessionToday && (
             <div className="bg-green-500 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Live
             </div>
           )}
           <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg text-[9px] font-bold text-white shadow-lg flex items-center gap-1">
             <CalendarDays size={10} /> {sessionCount}
           </div>
         </div>
      )}

      {/* Content Overlay */}
      <div className="relative z-30 flex-1 flex flex-col justify-between p-5 pointer-events-none">
        <div>
          <div className="flex items-start justify-between mb-2">
             <div className="flex gap-1.5 items-center">
                <div className={`text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1 ${isSkate ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                  {isSkate ? <Zap size={8} strokeWidth={3} /> : <Mountain size={8} strokeWidth={3} />}
                  {spot.type}
                </div>
                {spot.verificationStatus === VerificationStatus.VERIFIED && (
                  <div className="bg-indigo-500 text-white p-0.5 rounded-full shadow-lg shadow-indigo-500/40">
                    <ShieldCheck size={8} strokeWidth={3} />
                  </div>
                )}
             </div>
             <div className="flex items-center gap-1 text-amber-400 text-[10px] font-black drop-shadow-md">
               <Star size={10} fill="currentColor" /> {spot.rating.toFixed(1)}
             </div>
          </div>
          
          <h3 className="font-black text-[14px] leading-[1.2] tracking-tight uppercase italic break-words line-clamp-2 text-white drop-shadow-lg group-hover:text-indigo-200 transition-colors">
            {spot.name}
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 text-[9px] font-bold uppercase tracking-wide drop-shadow-md">
            <MapPin size={9} className={`shrink-0 ${isSkate ? 'text-indigo-400' : 'text-amber-400'}`} />
            <span className="truncate">{spot.state}</span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2 transition-colors group-hover:border-white/20">
             <span className="text-[7px] uppercase font-black tracking-widest text-slate-400">
                {spot.difficulty}
             </span>
             
             <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-lg transition-transform group-hover:scale-105 ${actionConfig.color}`}>
                 <actionConfig.icon size={10} strokeWidth={3} className={actionConfig.iconColor} />
                 <span className="text-[8px] font-black uppercase tracking-widest">{actionConfig.label}</span>
             </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-1 justify-center pt-1 opacity-90">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 shadow-sm ${i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotCard;
