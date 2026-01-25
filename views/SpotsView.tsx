
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Search, SlidersHorizontal, Grid, Map as MapIcon, Plus, LocateFixed, Minus, Globe, Sun, Layers, Sunset, CloudSun } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { Discipline, SpotCategory } from '../types';

// --- MAP ICONS ---
const MAP_ICONS = {
    street: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`, 
    downhill: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`, 
    park: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z"/></svg>`, 
    diy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    flat: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20M2 12l2 2M22 12l-2 2"/></svg>`
};

const LEGEND_ITEMS = [
    { id: 'street', color: '#6366f1', svg: MAP_ICONS.street },
    { id: 'downhill', color: '#a855f7', svg: MAP_ICONS.downhill },
    { id: 'park', color: '#f59e0b', svg: MAP_ICONS.park },
    { id: 'diy', color: '#10b981', svg: MAP_ICONS.diy },
    { id: 'flat', color: '#3b82f6', svg: MAP_ICONS.flat },
];

const SpotsView: React.FC = () => {
  const { 
    user, 
    setView, 
    location, 
    setUserLocation,
    spots,
    selectedSpot,
    selectSpot,
    openModal
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [weather, setWeather] = useState({ 
    temp: 28, 
    condition: 'Clear', 
    icon: CloudSun,
    uv: 4,
    sunset: '18:45'
  });
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(false);
  
  // Map References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // --- MAP INITIALIZATION ---
  useEffect(() => {
    const L = (window as any).L;
    if (mapContainerRef.current && L && !mapInstanceRef.current) {
        // Init Map
        const map = L.map(mapContainerRef.current, { 
            zoomControl: false, 
            attributionControl: false,
            zoomAnimation: true,
            fadeAnimation: true,
            inertia: true,
        }).setView([20.5937, 78.9629], 5); // Default to India center

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            opacity: 1,
            subdomains: 'abcd'
        }).addTo(map);

        map.on('click', () => {
            selectSpot(null);
        });

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
        setIsMapReady(true);
    }
    
    // Cleanup
    return () => {
       if (mapInstanceRef.current) {
           mapInstanceRef.current.remove();
           mapInstanceRef.current = null;
       }
    };
  }, []);

  // --- MARKER LOGIC (POIs) ---
  useEffect(() => {
      const L = (window as any).L;
      if (isMapReady && mapInstanceRef.current && markersLayerRef.current && L) {
          markersLayerRef.current.clearLayers();

          spots.slice(0, 50).forEach(spot => {
            const isSelected = spot.id === selectedSpot?.id;
            
            let config = LEGEND_ITEMS.find(item => item.id === 'street');
            if (spot.type === Discipline.DOWNHILL) config = LEGEND_ITEMS.find(item => item.id === 'downhill');
            else if (spot.category === SpotCategory.PARK) config = LEGEND_ITEMS.find(item => item.id === 'park');
            else if (spot.category === SpotCategory.DIY) config = LEGEND_ITEMS.find(item => item.id === 'diy');
            
            const color = config?.color || '#6366f1';
            const svg = config?.svg || MAP_ICONS.street;
            
            const html = `
               <div class="relative w-8 h-8 flex items-center justify-center group transition-transform duration-300 ${isSelected ? 'scale-150 z-50' : 'hover:scale-125 z-40'}">
                  <div class="absolute inset-0 rounded-full animate-pulse opacity-50" style="background-color: ${color}"></div>
                  <div class="relative w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white z-10" style="background-color: ${color}">
                      ${svg}
                  </div>
               </div>
            `;

            const marker = L.marker([spot.location.lat, spot.location.lng], {
              icon: L.divIcon({ className: 'bg-transparent', html: html, iconSize: [32, 32], iconAnchor: [16, 16] }),
              zIndexOffset: isSelected ? 1000 : 100
            });

            marker.on('click', (e: any) => {
                L.DomEvent.stopPropagation(e);
                triggerHaptic('medium');
                selectSpot(spot);
                openModal('SPOT_DETAIL');
                mapInstanceRef.current?.flyTo([spot.location.lat - 0.002, spot.location.lng], 16, { duration: 1 });
            });
            
            marker.addTo(markersLayerRef.current);
          });
      }
  }, [spots, selectedSpot, isMapReady]);

  // --- USER LOCATION MARKER (GAME-INSPIRED) ---
  useEffect(() => {
      const L = (window as any).L;
      if (isMapReady && mapInstanceRef.current && L && location) {
          if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([location.lat, location.lng]);
          } else {
              // Custom Sci-Fi Aura Marker
              const userIcon = L.divIcon({
                  className: 'bg-transparent',
                  html: `
                    <div class="relative w-12 h-12 flex items-center justify-center">
                      <div class="absolute inset-0 bg-indigo-500/40 rounded-full blur-lg animate-pulse"></div>
                      <div class="absolute inset-3 border-2 border-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)] opacity-90"></div>
                      <div class="relative w-3 h-3 bg-white rounded-full shadow-[0_0_20px_white] z-10"></div>
                    </div>
                  `,
                  iconSize: [48, 48],
                  iconAnchor: [24, 24]
              });
              userMarkerRef.current = L.marker([location.lat, location.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
              
              mapInstanceRef.current.flyTo([location.lat, location.lng], 12, { duration: 1.5 });
          }
      }
  }, [location, isMapReady]);


  // --- ACTIONS ---
  const handleLocate = () => {
    triggerHaptic('medium');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation(pos.coords.latitude, pos.coords.longitude),
        () => alert("GPS Access Denied")
      );
    }
  };
  
  const handleWorldView = () => {
      triggerHaptic('light');
      mapInstanceRef.current?.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
  };

  const handleZoomIn = () => {
      triggerHaptic('light');
      mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
      triggerHaptic('light');
      mapInstanceRef.current?.zoomOut();
  };

  const toggleView = () => {
    triggerHaptic('medium');
    setView('LIST');
  };

  return (
    <div className="relative h-full w-full bg-[#020202]">
      
      {/* 1. MAP CONTAINER */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

      {/* 2. OVERLAY HUD */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col h-full">
        
        {/* TOP HUD */}
        <div className="pt-safe-top px-4 pb-2 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto">
             <div className="flex items-center gap-3 mb-3">
                {/* Avatar */}
                <button onClick={() => setView('PROFILE')} className="w-10 h-10 rounded-full border border-white/10 bg-slate-900 overflow-hidden shadow-lg shrink-0 active:scale-95 transition-transform z-30 relative">
                   <img src={user?.avatar} className="w-full h-full object-cover" />
                </button>
                
                {/* Search Bar */}
                <div className="flex-1 relative h-10 group z-30">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl flex items-center px-4 shadow-lg focus-within:border-indigo-500/50 transition-colors">
                        <Search size={14} className="text-slate-500 mr-2" />
                        <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            placeholder="SEARCH SECTOR..." 
                            className="bg-transparent border-none outline-none text-[10px] font-bold text-white uppercase tracking-wider w-full placeholder:text-slate-600" 
                        />
                    </div>
                </div>

                {/* Grid View Toggle */}
                <button onClick={toggleView} className="w-10 h-10 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all shadow-lg z-30 relative">
                    <Grid size={18} />
                </button>
             </div>

             {/* QUICK FILTERS */}
             <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pl-1 items-center relative z-20">
                 {/* Weather Widget */}
                 <button 
                    onClick={() => { triggerHaptic('light'); setIsWeatherExpanded(!isWeatherExpanded); }}
                    className={`
                        relative h-9 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md shadow-lg
                        transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden
                        flex items-center shrink-0 z-30
                        ${isWeatherExpanded ? 'w-48 pl-3 pr-4' : 'w-9 justify-center'}
                    `}
                 >
                     {/* Icon */}
                     <div className={`relative z-10 transition-all duration-300 ${isWeatherExpanded ? 'mr-3' : 'mr-0'}`}>
                        <weather.icon size={16} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                     </div>
                     
                     {/* Expanded Content */}
                     <div className={`
                         flex items-center gap-3 transition-all duration-300 absolute left-9
                         ${isWeatherExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}
                     `}>
                          <div className="flex flex-col">
                              <span className="text-xs font-black text-white leading-none">{weather.temp}°</span>
                              <span className="text-[8px] font-bold text-slate-400 leading-none mt-0.5">{weather.condition}</span>
                          </div>
                          
                          <div className="w-px h-5 bg-white/10" />
                          
                          <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-300 whitespace-nowrap">
                                  <Sun size={8} className="text-orange-400" /> UV {weather.uv}
                              </div>
                              <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-300 whitespace-nowrap">
                                  <Sunset size={8} className="text-indigo-400" /> {weather.sunset}
                              </div>
                          </div>
                     </div>
                 </button>
                 
                 {/* Filter Chips */}
                 {['ALL', Discipline.SKATE, Discipline.DOWNHILL, 'VERIFIED'].map((f) => (
                     <button key={f} className="px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wide bg-black/60 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md whitespace-nowrap h-9 flex items-center">
                         {f}
                     </button>
                 ))}
             </div>
        </div>

        {/* MAP CONTROLS (RIGHT SIDE) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-end gap-6">
             
             {/* Main Toolset - Vertical Pill */}
             <div className="flex flex-col bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl gap-2">
                  <button onClick={handleLocate} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                      <LocateFixed size={18} />
                  </button>
                  <div className="h-px w-4 bg-white/10 mx-auto" />
                  <button onClick={handleWorldView} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                      <Globe size={18} />
                  </button>
                  <div className="h-px w-4 bg-white/10 mx-auto" />
                  <button onClick={handleZoomIn} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                      <Plus size={18} />
                  </button>
                  <button onClick={handleZoomOut} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                      <Minus size={18} />
                  </button>
             </div>
             
             {/* Floating Add Action */}
             <button onClick={() => openModal('ADD_SPOT')} className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400 active:scale-90 transition-all hover:bg-indigo-500">
                <Plus size={24} strokeWidth={3} />
             </button>
        </div>

      </div>
    </div>
  );
};

export default SpotsView;
