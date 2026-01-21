
import React from 'react';
import { Calendar, Clock, MapPin, Check, UserPlus } from 'lucide-react';
import { ExtendedSession } from '../services/mockBackend';
import { Discipline } from '../types';

interface SessionCardProps {
  session: ExtendedSession;
  isJoined: boolean;
  onJoin: (e: React.MouseEvent) => void;
  onClick: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, isJoined, onJoin, onClick }) => {
  const isSkate = session.spotType === Discipline.SKATE;

  return (
    <div 
      onClick={onClick}
      className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] h-full flex flex-col justify-between group cursor-pointer hover:border-slate-700 transition-colors shadow-xl relative overflow-hidden w-full"
    >
      {/* Decorative gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-10 pointer-events-none -mr-10 -mt-10 ${isSkate ? 'bg-indigo-500' : 'bg-amber-500'}`} />

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-start">
           <div className="flex gap-2">
             <div className="bg-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
               <Calendar size={12} className="text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{session.date}</span>
             </div>
             <div className="bg-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
               <Clock size={12} className={isSkate ? "text-indigo-400" : "text-amber-400"} />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{session.time}</span>
             </div>
           </div>
        </div>

        <div>
          <h3 className="text-lg font-black uppercase italic tracking-tight text-white leading-tight line-clamp-2 mb-1">
            {session.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            <MapPin size={10} />
            <span className="truncate max-w-[180px]">{session.spotName}</span>
          </div>
        </div>
      </div>

      <div className="pt-6 flex items-center justify-between gap-3 relative z-10">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${session.userId}`} alt={session.userName} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Hosted by</span>
              <span className="text-[10px] text-slate-300 font-black uppercase italic">{session.userName}</span>
            </div>
         </div>

         <button 
           onClick={onJoin}
           className={`h-10 px-5 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all active:scale-90 ${
             isJoined 
             ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
             : 'bg-white text-black hover:bg-slate-200 shadow-lg'
           }`}
         >
           {isJoined ? <Check size={14} strokeWidth={3} /> : <UserPlus size={14} strokeWidth={3} />}
           {isJoined ? 'In' : 'Join'}
         </button>
      </div>
    </div>
  );
};

export default SessionCard;
