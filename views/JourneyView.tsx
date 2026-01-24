import React, { useState, useEffect } from 'react';
import { backend } from '../services/mockBackend';
import { User } from '../types';
import { FileText, MapPin, Calendar } from 'lucide-react';

const JourneyView: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    // Mock data population
    setEntries([
        { id: '1', title: 'Kickflip Challenge', date: 'Today', location: 'Carter Road', type: 'challenge' },
        { id: '2', title: 'Sunday Session', date: 'Yesterday', location: 'Pune Skatepark', type: 'session' }
    ]);
  }, []);

  return (
    <div className="pb-32 pt-8 px-6 animate-view min-h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Journal</h1>
        <p className="text-slate-400 font-medium">Your ride history.</p>
      </header>

      <div className="space-y-8 relative pl-4 border-l-2 border-slate-800">
          {entries.map((entry, i) => (
              <div key={i} className="pl-6 relative">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 bg-black border-2 border-indigo-500 rounded-full"></div>
                  
                  <div className="bg-slate-900 rounded-3xl p-6 border border-white/5">
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2">{entry.date}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{entry.title}</h3>
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                          <MapPin size={14} /> {entry.location}
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default JourneyView;