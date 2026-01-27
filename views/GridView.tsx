
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Search, Map as MapIcon, X, Terminal, Database, ChevronRight, Activity, Zap, Mountain } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { Discipline, Spot, SpotStatus } from '../types';
import { playSound } from '../utils/audio';

const GridView: React.FC = () => {
  const { spots, selectSpot, openModal, setView } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Filter Logic
  const filteredSpots = useMemo(() => {
    return spots.filter(spot => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || 
                              (spot.name && spot.name.toLowerCase().includes(q)) || 
                              (spot.state && spot.state.toLowerCase().includes(q)) ||
                              (spot.location?.address && spot.location.address.toLowerCase().includes(q));
        
        const matchesFilter = activeFilter === 'ALL' || spot.type === activeFilter;
        
        return matchesSearch && matchesFilter;
    });
  }, [spots, searchQuery, activeFilter]);

  // Group by State for "Database" feel
  const groupedSpots = useMemo(() => {
      const groups: Record<string, Spot[]> = {};
      filteredSpots.forEach(spot => {
          const state = spot.state || 'UNKNOWN SECTOR';
          if (!groups[state]) groups[state] = [];
          groups[state].push(spot);
      });
      // Sort states alphabetically
      return Object.keys(groups).sort().reduce((acc, key) => {
          acc[key] = groups[key];
          return acc;
      }, {} as Record<string, Spot[]>);
  }, [filteredSpots]);

  const toggleView = () => {
    triggerHaptic('medium');
    playSound('map_zoom');
    setView('MAP');
  };

  const handleFilterChange = (filter: string) => {
      triggerHaptic('light');
      playSound('tactile_select');
      setActiveFilter(filter);
  };

  const handleSpotClick = (spot: Spot) => {
      triggerHaptic('medium');
      playSound('click'); // Subtle click
      selectSpot(spot);
      openModal('SPOT_DETAIL');
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] pt-safe-top font-mono relative">
       {/* Background Grid Texture */}
       <div className="absolute inset-0 z-0 pointer-events-none opacity-10" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
              backgroundSize: '20px 20px' 
            }}>
       </div>

       <div className="max-w-5xl mx-auto w-full h-full flex flex-col relative border-x border-white/5">
           {/* HEADER */}
           <div className="px-4 pb-4 pt-4 shrink-0 space-y-4 relative z-10 bg-[#020202] border-b border-white/10">
              <div className="flex justify-between items-start">
                 <div>
                     <div className="flex items-center gap-2 mb-1">
                         <Database size={10} className="text-emerald-500 animate-pulse" />
                         <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500">Secure Database</span>
                     </div>
                     <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">Spot Grid</h1>
                 </div>
                 <button onClick={toggleView} className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 bg-[#0b0c10] active:scale-95 transition-all hover:text-white hover:border-white/30 shadow-lg">
                    <MapIcon size={16} />
                 </button>
              </div>

              {/* TACTICAL SEARCH */}
              <div className="relative group">
                 <div className="relative bg-[#080808] border border-white/10 rounded-lg flex items-center px-3 py-2.5 shadow-inner focus-within:border-emerald-500/50 transition-all">
                     <Terminal size={12} className="text-slate-600 mr-2 group-focus-within:text-emerald-500" />
                     <input 
                       type="text" 
                       placeholder="SEARCH SECTOR DATA..." 
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                       className="bg-transparent border-none outline-none text-[10px] font-bold text-white uppercase tracking-widest w-full placeholder:text-slate-700" 
                     />
                     {searchQuery && (
                         <button onClick={() => setSearchQuery('')} className="p-1 rounded hover:bg-white/10 text-slate-500 active:scale-90 transition-transform">
                             <X size={12} />
                         </button>
                     )}
                 </div>
              </div>

              {/* FILTER TABS */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {['ALL', Discipline.SKATE, Discipline.DOWNHILL].map(filter => {
                      const isActive = activeFilter === filter;
                      return (
                          <button 
                            key={filter}
                            onClick={() => handleFilterChange(filter)}
                            className={`
                                px-3 py-1.5 rounded text-[8px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap
                                ${isActive 
                                    ? 'bg-white text-black border-white' 
                                    : 'bg-transparent text-slate-500 border-white/10 hover:text-slate-300'
                                }
                            `}
                          >
                              {filter}
                          </button>
                      );
                  })}
              </div>
           </div>

           {/* DATABASE CONTENT */}
           <div className="flex-1 overflow-y-auto px-4 pb-32 hide-scrollbar relative z-10 pt-4">
               
               {/* Loop Groups */}
               {Object.entries(groupedSpots).map(([state, stateSpots]: [string, Spot[]]) => (
                   <div key={state} className="mb-6 animate-view">
                       {/* Sector Header */}
                       <div className="flex items-center gap-3 mb-3 opacity-80">
                           <div className="h-px bg-slate-800 flex-1" />
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">
                               {state} SECTOR [{stateSpots.length.toString().padStart(2, '0')}]
                           </span>
                           <div className="h-px bg-slate-800 w-4" />
                       </div>

                       {/* Compact Grid */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                           {stateSpots.map(spot => {
                               const isSkate = spot.type === Discipline.SKATE;
                               const statusColor = spot.status === SpotStatus.WET ? 'bg-cyan-500' : spot.status === SpotStatus.MAINTENANCE ? 'bg-red-500' : 'bg-emerald-500';
                               
                               return (
                                   <button 
                                     key={spot.id} 
                                     onClick={() => handleSpotClick(spot)}
                                     className="group w-full bg-[#080808] border border-white/5 hover:border-indigo-500/40 rounded-lg p-2 flex items-center gap-3 transition-all active:scale-[0.99] relative overflow-hidden"
                                   >
                                       {/* Hover Scanline */}
                                       <div className="absolute inset-0 bg-indigo-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 pointer-events-none" />

                                       {/* Tiny Thumb */}
                                       <div className="w-12 h-12 bg-slate-900 rounded border border-white/10 overflow-hidden shrink-0 relative">
                                           <img src={spot.images?.[0]} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 transition-opacity" loading="lazy" />
                                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                           <div className="absolute bottom-0.5 right-0.5">
                                               {isSkate ? <Zap size={8} className="text-white" /> : <Mountain size={8} className="text-white" />}
                                           </div>
                                       </div>

                                       {/* Data */}
                                       <div className="flex-1 min-w-0 text-left flex flex-col justify-center h-full">
                                           <div className="flex justify-between items-center mb-0.5">
                                               <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate pr-2 group-hover:text-indigo-400 transition-colors">
                                                   {spot.name}
                                               </span>
                                               <div className="flex items-center gap-1.5">
                                                   <span className="text-[8px] font-mono text-yellow-500">{spot.rating.toFixed(1)}</span>
                                                   <div className={`w-1 h-1 rounded-full ${statusColor} shadow-[0_0_4px_currentColor]`} />
                                               </div>
                                           </div>
                                           
                                           <div className="flex items-center gap-2 text-[8px] font-mono text-slate-500 uppercase tracking-wide">
                                               <span className="truncate max-w-[120px]">{spot.location.address?.split(',')[0] || spot.state}</span>
                                               <span className="text-slate-800">|</span>
                                               <span className={isSkate ? 'text-indigo-900 group-hover:text-indigo-500' : 'text-purple-900 group-hover:text-purple-500'}>{spot.type.slice(0,3)}</span>
                                           </div>
                                       </div>

                                       {/* Action Arrow */}
                                       <ChevronRight size={12} className="text-slate-800 group-hover:text-white transition-colors" />
                                   </button>
                               );
                           })}
                       </div>
                   </div>
               ))}
               
               {filteredSpots.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-16 border border-white/5 rounded-xl bg-slate-900/10 border-dashed m-4">
                       <Activity size={20} className="text-slate-700 mb-2" />
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No Signals Found</p>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default GridView;
