
import React, { useState } from 'react';
import { Discipline } from '../types';
import { ShieldAlert, Zap, Timer, Award, Target, Trophy } from 'lucide-react';
import { COLLECTIBLES_DATABASE } from '../constants';

const LeaderboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Discipline>(Discipline.SKATE);

  const getDeckImage = (deckId?: string) => {
    return COLLECTIBLES_DATABASE.find(c => c.id === deckId)?.imageUrl || 'https://via.placeholder.com/50';
  };

  const skateRanks = [
    { rank: 1, name: 'Rahul V.', xp: 14500, streak: 45, badge: 'Skater of Year', deckId: 'deck_champion', trophies: 3 },
    { rank: 2, name: 'Simran K.', xp: 12200, streak: 12, badge: 'Street King', deckId: 'deck_flow_state', trophies: 1 },
    { rank: 3, name: 'Anish G.', xp: 9800, streak: 8, badge: 'Ollie Master', deckId: 'deck_first_push', trophies: 0 },
    { rank: 4, name: 'Vikram S.', xp: 7500, streak: 21, badge: '', deckId: 'deck_street_soldier', trophies: 0 },
    { rank: 5, name: 'Priya M.', xp: 7200, streak: 5, badge: '', deckId: 'deck_first_push', trophies: 0 }
  ];

  const downhillRanks = [
    { rank: 1, name: 'Kabir B.', time: '01:42.5', speed: '68 km/h', spot: 'Nandi Hills', deckId: 'deck_hill_runner', trophies: 2 },
    { rank: 2, name: 'Zoya F.', time: '01:45.2', speed: '65 km/h', spot: 'Nandi Hills', deckId: 'deck_first_push', trophies: 0 },
    { rank: 3, name: 'Dev R.', time: '01:50.1', speed: '62 km/h', spot: 'Nandi Hills', deckId: 'deck_street_soldier', trophies: 0 }
  ];

  return (
    <div className="pb-24 pt-6 md:pb-10 space-y-6 px-4 animate-view max-w-4xl mx-auto w-full">
      <header>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Leaderboards</h1>
        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Community Rankings</p>
      </header>

      {/* Discipline Toggle */}
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab(Discipline.SKATE)}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === Discipline.SKATE ? 'bg-indigo-500 text-white' : 'text-slate-500'
          }`}
        >
          Skateboarding
        </button>
        <button
          onClick={() => setActiveTab(Discipline.DOWNHILL)}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === Discipline.DOWNHILL ? 'bg-amber-500 text-white' : 'text-slate-500'
          }`}
        >
          Downhill
        </button>
      </div>

      {activeTab === Discipline.DOWNHILL && (
        <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-200 leading-normal">
            <strong>SAFETY NOTICE:</strong> Downhill rankings require full safety gear. Ensure spot is cleared. Speed tracking requires verified GPS logs.
          </p>
        </div>
      )}

      {/* Top 3 Spotlight */}
      <div className="flex items-end justify-center gap-4 pt-4">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 mb-2 overflow-hidden ring-4 ring-slate-800">
             <img src="https://picsum.photos/seed/p2/100" alt="Rank 2" />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-400">#2</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full border-4 mb-2 overflow-hidden ring-8 ${activeTab === Discipline.SKATE ? 'border-indigo-500 ring-indigo-500/10' : 'border-amber-500 ring-amber-500/10'}`}>
             <img src="https://picsum.photos/seed/p1/100" alt="Rank 1" />
          </div>
          <span className={`text-[12px] font-black uppercase ${activeTab === Discipline.SKATE ? 'text-indigo-400' : 'text-amber-400'}`}>Champion</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 mb-2 overflow-hidden ring-4 ring-slate-800">
             <img src="https://picsum.photos/seed/p3/100" alt="Rank 3" />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-400">#3</span>
        </div>
      </div>

      <div className="space-y-2">
        {(activeTab === Discipline.SKATE ? skateRanks : downhillRanks).map(user => (
            <div key={user.rank} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-xl">
              <span className="w-6 text-sm font-black text-slate-500 italic">#{user.rank}</span>
              
              {/* Equipped Deck Icon - Visual representation of Identity */}
              <div 
                className="w-10 h-14 bg-black/40 rounded-lg overflow-hidden border border-slate-700/50 shrink-0 shadow-lg"
              >
                <img src={getDeckImage(user.deckId)} alt="Deck" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  {user.name}
                  {(user as any).badge && <span className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-500 text-white font-black italic">{(user as any).badge}</span>}
                  
                  {/* Trophies Display */}
                  {user.trophies > 0 && (
                    <div className="flex gap-0.5">
                      {[...Array(user.trophies)].map((_, i) => (
                        <Trophy key={i} size={10} className="text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]" fill="currentColor" />
                      ))}
                    </div>
                  )}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                   {activeTab === Discipline.SKATE ? (
                     <>
                       <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                         <Zap size={10} className="text-amber-400" /> {(user as any).xp} XP
                       </div>
                       <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                         <Target size={10} className="text-indigo-400" /> {(user as any).streak} DAY STREAK
                       </div>
                     </>
                   ) : (
                     <>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                         <Timer size={10} className="text-amber-400" /> {(user as any).time}
                       </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                         <Zap size={10} className="text-indigo-400" /> {(user as any).speed}
                       </div>
                     </>
                   )}
                </div>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardView;
