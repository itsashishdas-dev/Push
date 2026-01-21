
import React from 'react';
import { LucideIcon, RefreshCw, AlertTriangle, Ghost } from 'lucide-react';

// --- SKELETONS ---

export const SpotCardSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-[2rem] aspect-square flex flex-col p-5 animate-pulse shadow-xl">
    <div className="flex justify-between mb-4">
      <div className="w-16 h-4 bg-slate-800 rounded-full" />
      <div className="w-10 h-4 bg-slate-800 rounded-full" />
    </div>
    <div className="mt-auto space-y-3">
      <div className="w-3/4 h-6 bg-slate-800 rounded-lg" />
      <div className="w-1/2 h-4 bg-slate-800 rounded-lg" />
    </div>
  </div>
);

export const ChallengeCardSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 animate-pulse h-40 w-full shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-3 w-2/3">
        <div className="w-20 h-4 bg-slate-800 rounded-full" />
        <div className="w-48 h-6 bg-slate-800 rounded-lg" />
        <div className="w-full h-4 bg-slate-800 rounded-lg" />
      </div>
      <div className="w-16 h-8 bg-slate-800 rounded-lg" />
    </div>
  </div>
);

export const MentorCardSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 animate-pulse shadow-xl">
    <div className="flex gap-4 items-center mb-4">
      <div className="w-14 h-14 bg-slate-800 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="w-32 h-5 bg-slate-800 rounded-lg" />
        <div className="w-24 h-4 bg-slate-800 rounded-lg" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="w-full h-4 bg-slate-800 rounded-lg" />
      <div className="w-2/3 h-4 bg-slate-800 rounded-lg" />
    </div>
    <div className="w-full h-10 bg-slate-800 rounded-xl" />
  </div>
);

export const SkillCardSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 h-44 animate-pulse flex flex-col justify-between shadow-lg">
    <div className="space-y-3">
        <div className="w-10 h-4 bg-slate-800 rounded-full" />
        <div className="w-3/4 h-6 bg-slate-800 rounded-lg" />
    </div>
    <div className="w-full h-10 bg-slate-800 rounded-xl" />
  </div>
);

export const JourneySkeleton = () => (
  <div className="pl-4 relative space-y-8 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="relative pl-8">
        <div className="absolute left-[13px] top-5 w-3.5 h-3.5 rounded-full bg-slate-800" />
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 h-48 w-full" />
      </div>
    ))}
  </div>
);

// --- STATES ---

export const EmptyState: React.FC<{ 
  icon: LucideIcon, 
  title: string, 
  description: string, 
  actionLabel?: string, 
  onAction?: () => void 
}> = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-view">
    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 shadow-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/0 to-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Icon size={32} className="text-slate-600 relative z-10" />
    </div>
    <div className="space-y-2 max-w-xs mx-auto px-4">
      <h3 className="text-white font-black italic uppercase tracking-tight text-xl">{title}</h3>
      <p className="text-slate-500 text-xs font-medium leading-relaxed">{description}</p>
    </div>
    {actionLabel && onAction && (
      <button 
        onClick={onAction}
        className="mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const ErrorState: React.FC<{ message?: string, onRetry: () => void }> = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-view">
    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
       <AlertTriangle size={32} className="text-red-500" />
    </div>
    <div className="space-y-2">
       <h3 className="text-white font-black italic uppercase tracking-tight text-lg">Connection Error</h3>
       <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{message}</p>
    </div>
    <button 
      onClick={onRetry}
      className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2 shadow-xl active:scale-95"
    >
      <RefreshCw size={14} strokeWidth={3} /> Retry
    </button>
  </div>
);
