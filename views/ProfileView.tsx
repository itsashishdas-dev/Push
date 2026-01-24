import React, { useState, useEffect } from 'react';
import { Settings, Lock } from 'lucide-react';
import { backend } from '../services/mockBackend';
import { User as UserType } from '../types';
import { COLLECTIBLES_DATABASE } from '../constants';

const ProfileView: React.FC<any> = ({ onLogout }) => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    backend.getUser().then(setUser);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-full pb-32 pt-8 px-6 space-y-10 animate-view">
       {/* HEADER */}
       <header className="flex justify-end">
          <button onClick={onLogout} className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors">
              <Settings size={20} />
          </button>
       </header>

       {/* PROFILE INFO */}
       <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-28 h-28 rounded-full bg-slate-800 p-1">
              <img src={user.avatar} className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
              <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
              <p className="text-slate-500 font-medium text-sm">{user.location}</p>
          </div>
          
          <div className="flex gap-2 text-xs font-bold bg-slate-900 p-1.5 rounded-full px-4">
             <span className="text-indigo-400">Level {user.level}</span>
             <span className="text-slate-600">•</span>
             <span className="text-slate-300">{user.stance}</span>
          </div>
       </div>

       {/* STATS */}
       <div className="grid grid-cols-3 gap-4">
           {[
               { label: 'XP', value: user.xp.toLocaleString() },
               { label: 'Streak', value: user.streak },
               { label: 'Skills', value: user.masteredCount }
           ].map((stat, i) => (
               <div key={i} className="bg-slate-900/50 rounded-2xl p-4 text-center border border-white/5">
                   <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{stat.label}</div>
               </div>
           ))}
       </div>

       {/* THE VAULT */}
       <section className="space-y-4">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Collectibles</h3>
           
           <div className="grid grid-cols-4 gap-3">
               {COLLECTIBLES_DATABASE.map(item => {
                   const unlocked = user.locker.includes(item.id);
                   return (
                       <div key={item.id} className={`aspect-square bg-slate-900 rounded-2xl flex items-center justify-center relative border border-white/5 ${!unlocked && 'opacity-30'}`}>
                           <img src={item.imageUrl} className={`w-3/4 h-3/4 object-contain ${!unlocked && 'grayscale'}`} />
                           {!unlocked && <Lock size={12} className="absolute text-slate-500" />}
                       </div>
                   )
               })}
               {[...Array(4)].map((_, i) => (
                   <div key={i} className="aspect-square bg-slate-900/30 rounded-2xl border border-white/5" />
               ))}
           </div>
       </section>
    </div>
  );
};

export default ProfileView;