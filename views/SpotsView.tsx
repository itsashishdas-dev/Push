
import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Map as MapIcon, X, MapPin, Grid, Zap, MessageCircle, Send } from 'lucide-react';
import { Discipline, Spot, ExtendedSession, ChatMessage, User } from '../types.ts';
import SpotCard from '../components/SpotCard.tsx';
import DrillDownCard from '../components/DrillDownCard.tsx';
import { SpotCardSkeleton, ErrorState, EmptyState } from '../components/States.tsx';
import { getMotivationalQuote, getSpotRecommendations } from '../services/geminiService.ts';
import { backend } from '../services/mockBackend.ts';
import { STATE_IMAGES } from '../constants.tsx';
import { triggerHaptic } from '../utils/haptics.ts';
import { playSound } from '../utils/audio.ts';

const SpotsView: React.FC = () => {
  // State 1: Identity & Location
  const [user, setUser] = useState<User | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);

  // State 2: Raw Data
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [allSessions, setAllSessions] = useState<ExtendedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // State 3: View Settings
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  
  // State 4: Interactions
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [activeSpotTab, setActiveSpotTab] = useState<'info' | 'sessions'>('info');
  const [activeSession, setActiveSession] = useState<ExtendedSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Map Ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [u, spots, sessions] = await Promise.all([
        backend.getUser(),
        backend.getSpots(),
        backend.getAllSessions()
      ]);

      setUser(u);
      setAllSpots(spots);
      setAllSessions(sessions);
    } catch (e) {
      console.error("Data fetch failed", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Phase 1: Resolve Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserCoords({ lat: 20.5937, lng: 78.9629 }) // Fallback to center of India
      );
    } else {
      setUserCoords({ lat: 20.5937, lng: 78.9629 });
    }

    // Phase 2: Fetch Data
    loadData();
  }, []);

  // Filter Logic: Deterministic and unified
  const filteredSpots = useMemo(() => {
    let result = allSpots;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.state.toLowerCase().includes(q));
    } else if (navigationPath.length > 0) {
      result = result.filter(s => s.state === navigationPath[0]);
    }

    return result;
  }, [allSpots, searchQuery, navigationPath]);

  // Map Synchronization
  useEffect(() => {
    const L = (window as any).L;
    if (viewMode === 'map' && mapContainerRef.current && L && !isLoading) {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false })
          .setView(userCoords ? [userCoords.lat, userCoords.lng] : [20.5937, 78.9629], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
      }
      
      const map = mapInstanceRef.current;
      const layer = markersLayerRef.current;
      layer.clearLayers();

      filteredSpots.forEach(spot => {
        const color = spot.type === Discipline.SKATE ? '#818cf8' : '#fbbf24';
        const marker = L.marker([spot.location.lat, spot.location.lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px ${color}"></div>`
          })
        });
        marker.on('click', () => { setSelectedSpot(spot); triggerHaptic('light'); });
        marker.addTo(layer);
      });

      if (filteredSpots.length > 0 && searchQuery) {
        const group = L.featureGroup(filteredSpots.map(s => L.marker([s.location.lat, s.location.lng])));
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [viewMode, filteredSpots, isLoading, userCoords, searchQuery]);

  // Session & Chat Logic
  useEffect(() => {
    let interval: any;
    if (activeSession) {
      const fetchMsgs = async () => {
        const msgs = await backend.getSessionMessages(activeSession.id);
        setChatMessages(msgs);
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      };
      fetchMsgs();
      interval = setInterval(fetchMsgs, 3000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleSendChat = async () => {
    if (!activeSession || !chatInput.trim()) return;
    await backend.sendSessionMessage(activeSession.id, chatInput);
    setChatInput('');
    triggerHaptic('light');
  };

  if (isError) return <ErrorState onRetry={loadData} message="Database Connection Failure" />;
  if (isLoading) return <div className="p-8 grid grid-cols-2 gap-4">{[...Array(6)].map((_, i) => <SpotCardSkeleton key={i} />)}</div>;

  return (
    <div className="relative min-h-full">
      <div className="pb-32 pt-8 px-4 space-y-6 max-w-4xl mx-auto">
        
        {/* Header Stats */}
        <header className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 overflow-hidden">
                <img src={user?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=user`} className="w-full h-full object-cover" />
            </div>
            <div>
                <h2 className="text-white text-lg font-black uppercase italic tracking-tight">{user?.name}</h2>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{filteredSpots.length} Active Spots nearby</p>
            </div>
          </div>
        </header>

        {/* Global Search & Toggle */}
        <section className="sticky top-0 z-[100] bg-black/80 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 border-b border-slate-800">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search the network..." 
                className="w-full h-12 bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-12 bg-slate-900 border border-slate-800 rounded-2xl flex overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`px-4 transition-colors ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}><Grid size={18} /></button>
              <button onClick={() => setViewMode('map')} className={`px-4 transition-colors ${viewMode === 'map' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}><MapIcon size={18} /></button>
            </div>
          </div>
        </section>

        {/* Dynamic Display Logic */}
        {viewMode === 'grid' ? (
          <div className="animate-view">
            {!searchQuery && navigationPath.length === 0 ? (
                // State-based grouping if no search
                <div className="grid grid-cols-2 gap-4">
                  {/* FIX: Explicitly typing the Set as string to ensure index safety when accessing STATE_IMAGES */}
                  {Array.from(new Set<string>(allSpots.map(s => s.state))).map(state => {
                    const count = allSpots.filter(s => s.state === state).length;
                    return (
                        <DrillDownCard 
                            key={state} 
                            title={state} 
                            count={count} 
                            imageUrl={STATE_IMAGES[state] || ''} 
                            type="state" 
                            onClick={() => { setNavigationPath([state]); triggerHaptic('light'); }} 
                        />
                    );
                  })}
                </div>
            ) : (
                // Spot list for search or state drill-down
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {navigationPath.length > 0 && (
                        <button onClick={() => setNavigationPath([])} className="col-span-full py-2 text-[10px] font-black uppercase text-indigo-400 text-left flex items-center gap-1">
                            <X size={12} /> Clear State: {navigationPath[0]}
                        </button>
                    )}
                    {filteredSpots.length === 0 ? (
                        <div className="col-span-full"><EmptyState title="No Spots Found" description="Try broadening your search." icon={MapPin} /></div>
                    ) : (
                        filteredSpots.map(spot => <SpotCard key={spot.id} spot={spot} onClick={() => setSelectedSpot(spot)} />)
                    )}
                </div>
            )}
          </div>
        ) : (
          <div className="w-full h-[60vh] bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl">
              <div ref={mapContainerRef} className="w-full h-full z-10" />
          </div>
        )}
      </div>

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
           <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-view flex flex-col max-h-[90vh]">
              <div className="relative h-48 shrink-0">
                  <img src={selectedSpot.images?.[0] || `https://picsum.photos/seed/${selectedSpot.id}/800/400`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                  <button onClick={() => setSelectedSpot(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"><X size={20} /></button>
                  <div className="absolute bottom-4 left-6">
                      <h2 className="text-3xl font-black italic uppercase text-white">{selectedSpot.name}</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedSpot.location.address}</p>
                  </div>
              </div>

              <div className="flex border-b border-slate-800">
                  <button onClick={() => setActiveSpotTab('info')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeSpotTab === 'info' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500'}`}>Spot Intel</button>
                  <button onClick={() => setActiveSpotTab('sessions')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeSpotTab === 'sessions' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500'}`}>Active Sessions</button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                  {activeSpotTab === 'info' ? (
                      <div className="space-y-4">
                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Surface Quality</span>
                              <p className="text-sm font-bold text-white mt-1">{selectedSpot.surface}</p>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Faculty Notes</span>
                              <p className="text-xs text-slate-300 italic mt-1">"{selectedSpot.notes}"</p>
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-2">
                          {allSessions.filter(s => s.spotId === selectedSpot.id).length === 0 ? (
                              <p className="text-center py-8 text-slate-600 text-xs font-bold uppercase tracking-widest">No planned sessions here.</p>
                          ) : (
                              allSessions.filter(s => s.spotId === selectedSpot.id).map(sess => (
                                  <button 
                                    key={sess.id} 
                                    onClick={() => { setActiveSession(sess); triggerHaptic('medium'); }}
                                    className="w-full bg-slate-800 p-4 rounded-2xl border border-slate-700 flex justify-between items-center group"
                                  >
                                      <div className="text-left">
                                          <p className="font-black text-white text-sm uppercase italic">{sess.title}</p>
                                          <p className="text-[9px] text-slate-400 uppercase font-bold">{sess.date} @ {sess.time}</p>
                                      </div>
                                      <MessageCircle size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                  </button>
                              ))
                          )}
                      </div>
                  )}
              </div>
           </div>
        </div>
      )}

      {/* Chat Session Modal */}
      {activeSession && (
          <div className="fixed inset-0 z-[250] bg-black/95 flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col h-[80vh] overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                      <div>
                        <h3 className="text-lg font-black italic uppercase text-white">{activeSession.title}</h3>
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Session Net Active</p>
                      </div>
                      <button onClick={() => setActiveSession(null)} className="p-2 bg-slate-800 rounded-full text-white"><X size={18} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatMessages.length === 0 && <p className="text-center py-20 text-[10px] font-black uppercase text-slate-700">Comms are silent...</p>}
                      {chatMessages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
                              <span className="text-[8px] font-black text-slate-600 uppercase mb-1">{msg.userName}</span>
                              <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium ${msg.userId === user?.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>{msg.text}</div>
                              <span className="text-[7px] text-slate-700 mt-1 uppercase font-bold">{msg.timestamp}</span>
                          </div>
                      ))}
                      <div ref={chatEndRef} />
                  </div>
                  <div className="p-4 bg-slate-950 border-t border-slate-800">
                      <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500" 
                            placeholder="Message crew..." 
                            value={chatInput} 
                            onChange={e => setChatInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSendChat()} 
                          />
                          <button onClick={handleSendChat} className="bg-indigo-500 text-white p-3 rounded-xl shadow-lg active:scale-95"><Send size={18} /></button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SpotsView;
