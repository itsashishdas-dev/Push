
import React, { useState } from 'react';

interface DrillDownCardProps {
  title: string;
  count: number;
  imageUrl: string;
  type: 'state' | 'city';
  onClick: () => void;
}

const DrillDownCard: React.FC<DrillDownCardProps> = ({ title, count, imageUrl, type, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      onClick={onClick}
      className="relative aspect-[3/2] bg-slate-900 overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-xl group rounded-3xl border border-slate-800 hover:border-indigo-500/40"
    >
      {/* Background Image */}
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={title}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-60' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
      )}

      {/* Fallback Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
      
      {/* Gradient Overlay for modern mode */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end items-start z-10">
           <h3 className="text-white font-black uppercase text-lg leading-none tracking-tight break-words w-full italic">
             {title}
           </h3>
           <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-1">
             {count} {count === 1 ? 'Spot' : 'Spots'} Unlocked
           </p>
      </div>
    </div>
  );
};

export default DrillDownCard;
