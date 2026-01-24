import React, { useState } from 'react';
import { Discipline } from '../types';

const LeaderboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Discipline>(Discipline.SKATE);

  const users = [
    { rank: 1, name: 'Rahul V.', score: '14,500 XP' },
    { rank: 2, name: 'Simran K.', score: '12,200 XP' },
    { rank: 3, name: 'Anish G.', score: '9,800 XP' },
    { rank: 4, name: 'Vikram S.', score: '7,500 XP' },
    { rank: 5, name: 'Priya M.', score: '7,200 XP' }
  ];

  return (
    <div className="pb-32 pt-8 px-6 animate-view w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Rankings</h1>
        <p className="text-slate-400 font-medium">Top riders this season.</p>
      </header>

      <div className="flex bg-slate-900 p-1 rounded-2xl mb-6 border border-white/5">
        <button onClick={() => setActiveTab(Discipline.SKATE)} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${activeTab === Discipline.SKATE ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}>Street</button>
        <button onClick={() => setActiveTab(Discipline.DOWNHILL)} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${activeTab === Discipline.DOWNHILL ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}>Downhill</button>
      </div>

      <div className="space-y-3">
          {users.map((u) => (
              <div key={u.rank} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-lg ${u.rank === 1 ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                      {u.rank}
                  </div>
                  <div className="flex-1 font-bold text-white">{u.name}</div>
                  <div className="text-sm font-medium text-indigo-400">{u.score}</div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default LeaderboardView;