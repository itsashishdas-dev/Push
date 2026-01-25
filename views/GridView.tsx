
import React, { useState } from 'react';
import { useAppStore } from '../store';
import SpotCard from '../components/SpotCard';
import { Search, SlidersHorizontal, Map as MapIcon, Grid as GridIcon } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { Discipline } from '../types';

const GridView: React.FC = () => {
  const { spots, selectSpot, openModal, currentView, setView } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const filteredSpots = spots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          spot.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'ALL' || spot.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleView = () => {
    triggerHaptic('medium');
    setView('MAP');
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] pt-safe-top">
       {/* HEADER */}
       <div className="px-4 pb-4 pt-2 shrink-0 space-y-4">
          <div className="flex justify-between items-center">
             <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">Spot Grid</h1>
             <button onClick={toggleView} className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white bg-[#0b0c10] active:scale-95 transition-transform">
                <MapIcon size={18} />
             </button>
          </div>

          {/* SEARCH & FILTER */}
          <div className="flex gap-2">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="SEARCH DATABASE..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 pl-9 pr-4 text-[10px] font-bold text-white focus:outline-none focus:border-indigo-500 uppercase tracking-wide"
                />
             </div>
             <button className="w-10 h-10 rounded-xl bg-[#0b0c10] border border-white/10 flex items-center justify-center text-slate-400">
                <SlidersHorizontal size={14} />
             </button>
          </div>

          {/* TABS */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {['ALL', Discipline.SKATE, Discipline.DOWNHILL].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                        activeFilter === filter 
                        ? 'bg-white text-black border-white' 
                        : 'bg-transparent text-slate-500 border-slate-800'
                    }`}
                  >
                      {filter}
                  </button>
              ))}
          </div>
       </div>

       {/* GRID CONTENT */}
       <div className="flex-1 overflow-y-auto px-4 pb-32 hide-scrollbar">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {filteredSpots.map(spot => (
                   <SpotCard 
                     key={spot.id} 
                     spot={spot} 
                     onClick={() => {
                        selectSpot(spot);
                        openModal('SPOT_DETAIL');
                     }} 
                   />
               ))}
           </div>
           {filteredSpots.length === 0 && (
               <div className="py-20 text-center">
                   <p className="text-xs text-slate-600 font-mono">NO SPOTS FOUND IN SECTOR.</p>
               </div>
           )}
       </div>
    </div>
  );
};

export default GridView;
