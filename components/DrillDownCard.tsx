
import React, { useState } from 'react';

interface DrillDownCardProps {
  title: string;
  count: number;
  imageUrl: string;
  type: 'state' | 'city';
  onClick: () => void;
  // Deprecated/Unused props for cleaner UI but kept in interface to prevent breakage if passed
  onGenerate?: (e: React.MouseEvent) => void;
  isGenerating?: boolean;
}

const DrillDownCard: React.FC<DrillDownCardProps> = ({ title, count, imageUrl, type, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      onClick={onClick}
      className="relative aspect-[3/2] bg-slate-900 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-md group border border-slate-800 hover:border-slate-700"
    >
      {/* Background Image with Lazy Load & Smooth Fade In */}
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={title}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
      )}

      {/* Fallback Gradient (Visible while loading or if no image) */}
      <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
      
      {/* Consistent Text Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90" />

      {/* Hover Selection Ring (Subtle) */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/10 rounded-2xl pointer-events-none transition-colors duration-300" />

      {/* Content - Bottom Aligned, Minimal */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end items-start">
        <h3 className="text-white font-black uppercase text-base leading-none tracking-tight shadow-black drop-shadow-md break-words w-full">
          {title}
        </h3>
        
        <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest mt-1.5 opacity-90 drop-shadow-md flex items-center gap-1">
          {count} {count === 1 ? 'Spot' : 'Spots'}
        </p>
      </div>
    </div>
  );
};

export default DrillDownCard;
