
import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Map as MapIcon, 
  Plus, 
  Minus, 
  TrendingUp,
  Zap,
  Cloud,
  MapPin,
  ChevronRight,
  Navigation,
  Calendar,
  Clock,
  Trophy,
  Users,
  Star,
  MessageSquare,
  Share2,
  X,
  Wind,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Grid,
  Bell,
  Play
} from 'lucide-react';
import { Spot, SpotStatus, SpotCategory, ExtendedSession, Challenge, Review, Difficulty } from '../types.ts';
import { ErrorState } from '../components/States.tsx';
import { triggerHaptic } from '../utils/haptics.ts';
import { playSound } from '../utils/audio.ts';
import { useAppStore } from '../store.ts';
import { backend } from '../services/mockBackend.ts';

// --- GEOLOCATION UTILS ---
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

// --- TYPES ---
type ViewMode = 'map' | 'grid';
type SheetMode = 'none' | 'quick-info' | 'full-detail';
type ModalType = 'none' | 'create-session' | 'create-challenge' | 'add-intel';

const SpotsView: React.FC = () => {
  const { 
    user,
    location: userCoords, 
    spots: allSpots, 
    sessions: allSessions,
    challenges: allChallenges,
    error: isError,
    refreshSessions
  } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [activeSheet, setActiveSheet] = useState<SheetMode>('none');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local State for UI updates
  const [localSessions, setLocalSessions] = useState<ExtendedSession[]>([]);
  const [localChallenges, setLocalChallenges] = useState<Challenge[]>([]);
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>('none');

  // Form States
  const [sessionForm, setSessionForm] = useState({ title: '', date: '', time: '', notes: '' });
  const [challengeForm, setChallengeForm] = useState({ title: '', desc: '', difficulty: Difficulty.INTERMEDIATE });
  const [intelForm, setIntelForm] = useState({ rating: 5, text: '' });

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  // Weather Mock
  const [weather] = useState({ temp: 24, wind: 12, condition: 'Clear', humidity: 65 });

  // Sync global store to local state when spot is selected
  useEffect(() => {
      setLocalSessions(allSessions);
      setLocalChallenges(allChallenges);
  }, [allSessions, allChallenges]);

  const filteredSpots = useMemo(() => {
    let result = allSpots;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.state.toLowerCase().includes(q)
      );
    }
    return result.map(s => ({...s, distance: s.distance || Math.random() * 5000 + 500}));
  }, [allSpots, searchQuery]);

  // --- MAP SETUP ---
  useEffect(() => {
    const L = (window as any).L;
    if (mapContainerRef.current && L && !mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, { 
            zoomControl: false, 
            attributionControl: false,
            zoomAnimation: true,
            fadeAnimation: true,
            inertia: true,
        }).setView([20.5937, 78.9629], 5);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            opacity: 1,
            subdomains: 'abcd'
        }).addTo(map);

        map.on('click', () => {
            setActiveSheet('none');
            setSelectedSpot(null);
            setIsCheckedIn(false);
        });

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
        
        if (userCoords) {
             map.flyTo([userCoords.lat, userCoords.lng], 14, { duration: 1.5 });
        }
    }
  }, []);

  // --- MARKER UPDATES ---
  useEffect(() => {
      const L = (window as any).L;
      if (mapInstanceRef.current && L && userCoords) {
          if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
          } else {
              const userIcon = L.divIcon({
                  className: 'bg-transparent',
                  html: `
                    <div class="relative w-4 h-4 flex items-center justify-center">
                      <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                      <div class="relative w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                    </div>
                  `,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
              });
              userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
          }
      }
  }, [userCoords]);

  useEffect(() => {
      const L = (window as any).L;
      if (mapInstanceRef.current && markersLayerRef.current && L) {
          markersLayerRef.current.clearLayers();

          filteredSpots.forEach(spot => {
            const isSelected = spot.id === selectedSpot?.id;
            const colorMap = {
                [SpotCategory.STREET]: 'indigo',
                [SpotCategory.DOWNHILL]: 'purple',
                [SpotCategory.PARK]: 'amber',
                [SpotCategory.DIY]: 'emerald',
            };
            const color = colorMap[spot.category || SpotCategory.STREET] || 'indigo';
            
            const html = `
               <div class="relative w-6 h-6 flex items-center justify-center group transition-transform duration-300 ${isSelected ? 'scale-150' : 'hover:scale-125'}">
                  <div class="absolute inset-0 bg-${color}-500 rounded-full animate-breathe"></div>
                  <div class="relative w-3 h-3 bg-${color}-500 rounded-full border border-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
               </div>
            `;

            const marker = L.marker([spot.location.lat, spot.location.lng], {
              icon: L.divIcon({ className: 'bg-transparent', html: html, iconSize: [24, 24], iconAnchor: [12, 12] })
            });

            marker.on('click', (e: any) => {
                L.DomEvent.stopPropagation(e);
                triggerHaptic('medium');
                playSound('click');
                setSelectedSpot(spot);
                setActiveSheet('quick-info');
                setIsCheckedIn(false); 
                const targetLat = spot.location.lat - (0.002); 
                mapInstanceRef.current?.flyTo([targetLat, spot.location.lng], 16, { duration: 0.8 });
            });
            
            marker.addTo(markersLayerRef.current);
          });
      }
  }, [filteredSpots, selectedSpot]);

  // --- ACTIONS ---

  const handleZoomIn = (e: React.MouseEvent) => { e.stopPropagation(); triggerHaptic('light'); mapInstanceRef.current?.zoomIn(); };
  const handleZoomOut = (e: React.MouseEvent) => { e.stopPropagation(); triggerHaptic('light'); mapInstanceRef.current?.zoomOut(); };

  const handleRecenter = (e: React.MouseEvent) => {
      e.stopPropagation();
      triggerHaptic('medium');
      if (!mapInstanceRef.current || !userCoords) return;
      mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lng], 15, { duration: 1.5 });
  };

  const toggleViewMode = () => {
      triggerHaptic('medium');
      setViewMode(prev => prev === 'map' ? 'grid' : 'map');
  };

  const handleCheckIn = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!userCoords || !selectedSpot) {
          triggerHaptic('error');
          alert("GPS signal lost. Cannot verify location.");
          return;
      }

      const distance = getDistanceFromLatLonInKm(
          userCoords.lat, userCoords.lng,
          selectedSpot.location.lat, selectedSpot.location.lng
      );

      // Threshold: 0.5km (500 meters)
      if (distance > 0.5) {
          triggerHaptic('error');
          playSound('error');
          alert(`You are too far away to check in!\nDistance: ${distance.toFixed(2)}km\nRequired: < 0.5km`);
          return;
      }

      triggerHaptic('success');
      playSound('success');
      setIsCheckedIn(true);
  };

  // --- FORM HANDLERS ---

  const submitSession = async () => {
      if (!selectedSpot || !sessionForm.title) return;
      triggerHaptic('medium');
      
      const newSession = await backend.createSession({
          title: sessionForm.title,
          date: sessionForm.date || new Date().toISOString().split('T')[0],
          time: sessionForm.time || '10:00',
          spotId: selectedSpot.id,
          spotName: selectedSpot.name,
          spotType: selectedSpot.type,
          notes: sessionForm.notes // Pass the notes to backend
      });

      // Optimistic Update
      setLocalSessions(prev => [...prev, newSession]);
      refreshSessions(); // Sync global
      setActiveModal('none');
      playSound('success');
      setSessionForm({ title: '', date: '', time: '', notes: '' });
  };

  const submitChallenge = () => {
      if (!selectedSpot || !challengeForm.title) return;
      triggerHaptic('medium');

      const newChallenge: Challenge = {
          id: `c-${Date.now()}`,
          spotId: selectedSpot.id,
          creatorId: user?.id || 'u-1',
          creatorName: user?.name || 'You',
          title: challengeForm.title,
          description: challengeForm.desc,
          difficulty: challengeForm.difficulty,
          xpReward: 500,
          completions: 0
      };

      setLocalChallenges(prev => [...prev, newChallenge]);
      setActiveModal('none');
      playSound('success');
      setChallengeForm({ title: '', desc: '', difficulty: Difficulty.INTERMEDIATE });
  };

  const submitIntel = () => {
      if (!selectedSpot || !intelForm.text) return;
      triggerHaptic('medium');
      
      const newReview: Review = {
          id: `r-${Date.now()}`,
          userId: user?.id || 'u-1',
          userName: user?.name || 'You',
          rating: intelForm.rating,
          text: intelForm.text,
          date: 'Just now'
      };

      setLocalReviews(prev => [newReview, ...prev]);
      setActiveModal('none');
      playSound('success');
      setIntelForm({ rating: 5, text: '' });
  };

  if (isError) return <ErrorState onRetry={() => window.location.reload()} message={isError} />;

  const spotSessions = localSessions.filter(s => s.spotId === selectedSpot?.id);
  const spotChallenges = localChallenges.filter(c => c.spotId === selectedSpot?.id);

  return (
    <div className="relative h-full w-full bg-black overflow-hidden isolate">
      
      {/* ----------------- MAP LAYER ----------------- */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${viewMode === 'map' ? 'opacity-100' : 'opacity-0'}`}>
          <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>

      {/* ----------------- HUD LAYER ----------------- */}
      <div className="absolute top-0 left-0 w-full z-30 p-4 pt-safe-top flex flex-col gap-3 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
         <div className="flex justify-between items-start pointer-events-auto">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full border border-white/10 bg-slate-900 overflow-hidden">
                   <img src={user?.avatar} className="w-full h-full object-cover" />
               </div>
               <div>
                  <div className="flex items-center gap-2">
                     <span className="text-white font-black uppercase text-sm">{user?.name}</span>
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                      <Cloud size={10} />
                      <span className="text-[9px] font-mono">{weather.temp}°C</span>
                  </div>
               </div>
            </div>
            
            <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all">
                    <Bell size={18} />
                </button>
                <button 
                    onClick={toggleViewMode}
                    className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all ${viewMode === 'grid' ? 'bg-indigo-600' : 'bg-slate-900/80'}`}
                >
                    {viewMode === 'grid' ? <MapIcon size={18} /> : <Grid size={18} />}
                </button>
            </div>
         </div>

         <div className="w-full pointer-events-auto flex items-center gap-3">
            <div className="relative flex-1">
               <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search size={14} className="text-slate-400" />
               </div>
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="SEARCH SPOTS..." 
                 className="w-full bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 uppercase tracking-wide shadow-lg"
               />
            </div>
         </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute left-0 w-full z-50 px-4 pb-4 flex flex-col justify-end pointer-events-none gap-4 transition-all duration-500 ${viewMode === 'grid' ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'} ${activeSheet === 'quick-info' ? 'bottom-40' : 'bottom-24'}`}>
          <div className="flex justify-between items-end">
              <div className="flex flex-col gap-3 pointer-events-auto">
                   <button className="w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-slate-300 shadow-xl active:scale-95">
                      <TrendingUp size={20} />
                   </button>
                   <button className="w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-slate-300 shadow-xl active:scale-95">
                      <Zap size={20} />
                   </button>
              </div>

              <div className="flex flex-col gap-3 pointer-events-auto items-end">
                   <div className="flex flex-col gap-2 bg-slate-900 border border-white/10 rounded-2xl p-1.5 shadow-2xl">
                       <button onClick={handleZoomIn} className="w-10 h-10 flex items-center justify-center text-white active:bg-white/10 rounded-xl hover:bg-slate-800 transition-colors">
                          <Plus size={20} />
                       </button>
                       <div className="h-px w-6 bg-white/10 mx-auto" />
                       <button onClick={handleZoomOut} className="w-10 h-10 flex items-center justify-center text-white active:bg-white/10 rounded-xl hover:bg-slate-800 transition-colors">
                          <Minus size={20} />
                       </button>
                   </div>

                   <button 
                      onClick={handleRecenter} 
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border ${userCoords ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-white/10 text-slate-400'}`}
                   >
                      <Navigation size={24} fill={userCoords ? "currentColor" : "none"} />
                   </button>
              </div>
          </div>
      </div>

      {/* ----------------- GRID VIEW LAYER ----------------- */}
      <div className={`absolute inset-0 z-40 bg-black pt-32 px-4 pb-24 overflow-y-auto transition-transform duration-300 ${viewMode === 'grid' ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="grid grid-cols-2 gap-3 pb-8">
              {filteredSpots.map(spot => (
                  <div 
                    key={spot.id} 
                    onClick={() => { setSelectedSpot(spot); setActiveSheet('full-detail'); }} 
                    className="bg-[#0e1015] border border-white/5 rounded-3xl p-4 flex flex-col justify-between h-44 relative group active:scale-95 transition-all shadow-lg overflow-hidden"
                  >
                     <div className="absolute top-4 right-4 bg-slate-900/80 px-2 py-1 rounded-md border border-white/5 backdrop-blur-sm z-10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{spot.type}</span>
                     </div>
                     <div className={`absolute bottom-4 right-4 w-2 h-2 rounded-full ${spot.status === SpotStatus.WET ? 'bg-blue-500' : spot.status === SpotStatus.CROWDED ? 'bg-amber-500' : 'bg-green-500'} shadow-[0_0_8px_currentColor] z-10`} />
                     <div className="mt-auto z-10 space-y-2">
                        <h3 className="text-sm font-black italic uppercase text-white leading-tight pr-6 break-words">{spot.name}</h3>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                           <MapPin size={10} className="text-indigo-400" /> 
                           {(spot.distance! / 1000).toFixed(1)}KM
                        </div>
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/10 to-transparent opacity-50 pointer-events-none" />
                  </div>
              ))}
          </div>
      </div>

      {/* ----------------- QUICK INFO SHEET ----------------- */}
      {activeSheet === 'quick-info' && selectedSpot && (
        <div className="absolute bottom-[5.5rem] left-0 w-full z-[60] px-4 flex justify-center pointer-events-none animate-view-up">
           <div 
             onClick={() => setActiveSheet('full-detail')}
             className="pointer-events-auto w-full max-w-md bg-[#09090b] border border-white/10 rounded-[2rem] p-3 shadow-2xl relative overflow-hidden cursor-pointer active:scale-[0.99] transition-all flex items-center gap-3 ring-1 ring-white/5"
           >
              {/* Image */}
              <div className="w-20 h-20 rounded-2xl bg-slate-800 overflow-hidden shrink-0 relative border border-white/5">
                  <img src={selectedSpot.images?.[0]} className="w-full h-full object-cover opacity-90" />
              </div>
              
              {/* Middle */}
              <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                  <div className="flex justify-between items-start">
                       <h3 className="text-base font-black italic text-white uppercase truncate leading-none mt-1 pr-1">{selectedSpot.name}</h3>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mr-1 shrink-0">{selectedSpot.type}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                       <div className={`w-1.5 h-1.5 rounded-full ${selectedSpot.status === SpotStatus.WET ? 'bg-blue-500' : 'bg-green-500'} shadow-[0_0_5px_currentColor]`} />
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide truncate">{selectedSpot.location.address}</p>
                  </div>

                  <button 
                      onClick={(e) => { e.stopPropagation(); handleCheckIn(e); }}
                      disabled={isCheckedIn}
                      className={`w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all mt-1 ${isCheckedIn ? 'bg-green-500/20 text-green-400' : 'bg-white/10 hover:bg-white/20 text-slate-300'}`}
                  >
                      {isCheckedIn ? <CheckCircle2 size={12} /> : <MapPin size={12} />}
                      {isCheckedIn ? 'Checked In' : 'Check In'}
                  </button>
              </div>

              {/* Right Arrow */}
              <div className="h-10 w-10 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-slate-800 transition-colors">
                  <ChevronRight size={20} className="text-slate-400" />
              </div>
           </div>
        </div>
      )}

      {/* ----------------- FULL DETAIL SHEET ----------------- */}
      {activeSheet === 'full-detail' && selectedSpot && (
        <div className="absolute inset-0 z-[100] bg-[#050505] overflow-y-auto animate-view">
           {/* Modal Overlays */}
           {activeModal === 'create-session' && (
             <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-view">
                 <div className="bg-[#0e1015] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm space-y-6 shadow-2xl relative">
                     <div className="flex justify-between items-center mb-2">
                         <h3 className="text-xl font-black uppercase italic text-white tracking-tight">Plan Meet</h3>
                         <button onClick={() => setActiveModal('none')} className="p-2 -mr-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                     </div>
                     <div className="space-y-4">
                         <div className="space-y-1">
                             <input type="text" placeholder="Session Title" className="w-full bg-black rounded-2xl p-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/5" 
                               value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <input type="date" className="w-full bg-black rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/5"
                               value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} />
                             <input type="time" className="w-full bg-black rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/5"
                               value={sessionForm.time} onChange={e => setSessionForm({...sessionForm, time: e.target.value})} />
                         </div>
                         <div className="space-y-1">
                              <textarea 
                                  placeholder="Notes & Details (e.g. 'Bring your helmet', 'Filming session')" 
                                  rows={3}
                                  className="w-full bg-black rounded-2xl p-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/5 resize-none"
                                  value={sessionForm.notes} 
                                  onChange={e => setSessionForm({...sessionForm, notes: e.target.value})} 
                              />
                         </div>
                         <button onClick={submitSession} className="w-full bg-indigo-600 py-4 rounded-2xl text-xs font-black uppercase text-white tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all mt-2 hover:bg-indigo-500">Create Session</button>
                     </div>
                 </div>
             </div>
           )}

           {activeModal === 'create-challenge' && (
             <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-view">
                 <div className="bg-[#0e1015] border border-white/10 rounded-[2rem] p-6 w-full max-w-xs space-y-4">
                     <div className="flex justify-between items-center">
                         <h3 className="text-lg font-black uppercase italic text-white">Create Challenge</h3>
                         <button onClick={() => setActiveModal('none')}><X size={20} className="text-slate-500" /></button>
                     </div>
                     <div className="space-y-3">
                         <input type="text" placeholder="Challenge Title" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white" 
                           value={challengeForm.title} onChange={e => setChallengeForm({...challengeForm, title: e.target.value})} />
                         <textarea placeholder="Description" rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white"
                           value={challengeForm.desc} onChange={e => setChallengeForm({...challengeForm, desc: e.target.value})} />
                         <button onClick={submitChallenge} className="w-full bg-green-600 py-3 rounded-xl text-xs font-black uppercase text-white tracking-widest mt-2">Publish Challenge</button>
                     </div>
                 </div>
             </div>
           )}

           {activeModal === 'add-intel' && (
             <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-view">
                 <div className="bg-[#0e1015] border border-white/10 rounded-[2rem] p-6 w-full max-w-xs space-y-4">
                     <div className="flex justify-between items-center">
                         <h3 className="text-lg font-black uppercase italic text-white">Add Intel</h3>
                         <button onClick={() => setActiveModal('none')}><X size={20} className="text-slate-500" /></button>
                     </div>
                     <div className="space-y-3">
                         <div className="flex justify-center gap-2">
                             {[1,2,3,4,5].map(star => (
                                 <button key={star} onClick={() => setIntelForm({...intelForm, rating: star})} className={star <= intelForm.rating ? 'text-yellow-500' : 'text-slate-700'}>
                                     <Star size={24} fill="currentColor" />
                                 </button>
                             ))}
                         </div>
                         <textarea placeholder="Share local tips..." rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white"
                           value={intelForm.text} onChange={e => setIntelForm({...intelForm, text: e.target.value})} />
                         <button onClick={submitIntel} className="w-full bg-blue-600 py-3 rounded-xl text-xs font-black uppercase text-white tracking-widest mt-2">Post Intel</button>
                     </div>
                 </div>
             </div>
           )}

           {/* Header Image */}
           <div className="h-64 w-full relative">
               <img src={selectedSpot.images?.[0] || 'https://images.unsplash.com/photo-1520156584189-1e4529f8c9b3?w=800'} className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
               <button onClick={() => setActiveSheet('none')} className="absolute top-6 right-4 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/10 z-20 active:scale-90"><X size={20} /></button>
               
               <div className="absolute bottom-4 left-6 right-6 z-10">
                   <div className="flex gap-2 mb-2">
                       <span className="bg-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-white">{selectedSpot.type}</span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1 ${selectedSpot.status === SpotStatus.WET ? 'bg-blue-500' : 'bg-green-500'}`}>
                           {selectedSpot.status === SpotStatus.WET ? <Droplets size={10} /> : <Zap size={10} />}
                           {selectedSpot.status || 'Active'}
                       </span>
                   </div>
                   <h1 className="text-3xl font-black italic uppercase text-white leading-none mb-2">{selectedSpot.name}</h1>
                   <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                       <span className="flex items-center gap-1"><MapPin size={12} className="text-indigo-400" /> {(selectedSpot.distance! / 1000).toFixed(1)} KM Away</span>
                       <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" /> {selectedSpot.rating}</span>
                   </div>
               </div>
           </div>

           <div className="p-6 space-y-8">
               <div className="grid grid-cols-2 gap-3">
                   <button className="py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"><Navigation size={14} /> Navigate</button>
                   <button 
                        onClick={handleCheckIn}
                        disabled={isCheckedIn}
                        className={`py-3 border rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform ${isCheckedIn ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-slate-900 border-slate-800 text-white'}`}
                   >
                       {isCheckedIn ? <CheckCircle2 size={14} /> : <MapPin size={14} />} {isCheckedIn ? 'Checked In' : 'Check In'}
                   </button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div className="bg-[#0e1015] border border-white/10 rounded-2xl p-4 space-y-2">
                       <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest"><Cloud size={12} /> Live Conditions</div>
                       <div className="flex items-end gap-2"><span className="text-2xl font-black text-white">{weather.temp}°</span><span className="text-xs font-bold text-slate-500 mb-1">{weather.condition}</span></div>
                       <div className="flex gap-3 text-[9px] font-bold text-slate-500">
                           <span className="flex items-center gap-1"><Wind size={10} /> {weather.wind}km/h</span>
                           <span className="flex items-center gap-1"><Droplets size={10} /> {weather.humidity}%</span>
                       </div>
                   </div>
                   <div className="bg-[#0e1015] border border-white/10 rounded-2xl p-4 space-y-2">
                       <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest"><Users size={12} /> Active Now</div>
                       <div className="flex -space-x-2 pt-1">
                           {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] text-white font-bold"><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i}`} className="w-full h-full rounded-full" /></div>)}
                           <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] text-slate-400 font-bold">+12</div>
                       </div>
                   </div>
               </div>

               <div className="space-y-6">
                   <section className="space-y-3">
                       <div className="flex justify-between items-center">
                           <h3 className="text-sm font-black uppercase italic text-white tracking-widest">Active Sessions</h3>
                           <button onClick={() => setActiveModal('create-session')} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white flex items-center gap-1"><Plus size={12} /> Plan Meet</button>
                       </div>
                       {spotSessions.length > 0 ? (
                           spotSessions.map(session => (
                               <div key={session.id} className="bg-[#0e1015] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                                   <div className="flex justify-between items-start mb-3">
                                       <div>
                                            <h4 className="text-xs font-black uppercase text-white italic">{session.title}</h4>
                                            <div className="flex gap-2 text-[9px] font-bold text-slate-500 uppercase mt-1">
                                                <span className="flex items-center gap-1"><Clock size={10} /> {session.time}</span>
                                                <span className="flex items-center gap-1"><Calendar size={10} /> {session.date}</span>
                                            </div>
                                       </div>
                                       <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-[9px] font-black uppercase text-white">Join</button>
                                   </div>
                                   {session.notes && (
                                       <div className="pt-2 border-t border-white/5 mt-1">
                                           <p className="text-[9px] text-slate-400 italic">"{session.notes}"</p>
                                       </div>
                                   )}
                               </div>
                           ))
                       ) : (
                           <div className="text-center py-6 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                               <p className="text-[10px] font-bold text-slate-600 uppercase">No active sessions.</p>
                           </div>
                       )}
                   </section>

                   <section className="space-y-3">
                       <div className="flex justify-between items-center">
                           <h3 className="text-sm font-black uppercase italic text-white tracking-widest">Challenges</h3>
                           <button onClick={() => setActiveModal('create-challenge')} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white flex items-center gap-1"><Plus size={12} /> Create</button>
                       </div>
                       <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                           {spotChallenges.map(challenge => (
                               <div key={challenge.id} className="min-w-[200px] bg-[#0e1015] border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                                   <div className="absolute top-0 right-0 p-2 opacity-10"><Trophy size={48} /></div>
                                   <h4 className="text-xs font-black uppercase text-white italic mb-1">{challenge.title}</h4>
                                   <p className="text-[9px] text-slate-400 font-medium line-clamp-2 mb-3">{challenge.description}</p>
                                   <div className="flex justify-between items-center">
                                       <span className="text-[9px] font-black text-yellow-500 uppercase">{challenge.xpReward} XP</span>
                                       <button className="p-1.5 bg-slate-800 rounded-lg text-white"><ArrowRight size={12} /></button>
                                   </div>
                               </div>
                           ))}
                           {spotChallenges.length === 0 && (
                               <div className="w-full text-center py-6 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                                   <p className="text-[10px] font-bold text-slate-600 uppercase">No active challenges.</p>
                               </div>
                           )}
                       </div>
                   </section>

                   <section className="space-y-3 pb-8">
                       <div className="flex justify-between items-center">
                           <h3 className="text-sm font-black uppercase italic text-white tracking-widest">Intel</h3>
                           <button onClick={() => setActiveModal('add-intel')} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white flex items-center gap-1"><MessageSquare size={12} /> Add Intel</button>
                       </div>
                       <div className="space-y-3">
                           {localReviews.length > 0 ? localReviews.map((review) => (
                               <div key={review.id} className="bg-[#0e1015] border border-white/10 rounded-2xl p-4">
                                   <div className="flex justify-between items-start mb-2">
                                       <div className="flex items-center gap-2">
                                           <div className="w-6 h-6 rounded-full bg-slate-800"><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${review.userId}`} className="rounded-full" /></div>
                                           <span className="text-[10px] font-black uppercase text-white">{review.userName}</span>
                                       </div>
                                       <div className="flex text-yellow-500">
                                           {[...Array(review.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                                       </div>
                                   </div>
                                   <p className="text-[10px] text-slate-400 leading-relaxed">"{review.text}"</p>
                               </div>
                           )) : (
                                <div className="text-center py-6 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-600 uppercase">No intel yet. Be the first.</p>
                                </div>
                           )}
                       </div>
                   </section>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SpotsView;
