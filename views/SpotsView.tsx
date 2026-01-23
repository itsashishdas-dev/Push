
import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Map as MapIcon, X, MapPin, Grid, Zap, MessageCircle, Send, ChevronLeft, Calendar, Clock, Swords, Plus, Users, Loader2, Navigation, Target, Info, ArrowRight, CheckCircle2, Bell, BellRing, CloudSun, Quote, Car, Lock, StickyNote, Trophy, Compass, Check, Minus } from 'lucide-react';
import { Discipline, Spot, ExtendedSession, ChatMessage, User, Challenge, Quest } from '../types.ts';
import SpotCard from '../components/SpotCard.tsx';
import DrillDownCard from '../components/DrillDownCard.tsx';
import { SpotCardSkeleton, ErrorState, EmptyState } from '../components/States.tsx';
import { backend } from '../services/mockBackend.ts';
import { STATE_IMAGES, COLLECTIBLES_DATABASE } from '../constants.tsx';
import { triggerHaptic } from '../utils/haptics.ts';
import { playSound } from '../utils/audio.ts';
import { getMotivationalQuote } from '../services/geminiService.ts';

const SkateboardIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 11V13C18 15.7614 15.7614 18 13 18H11C8.23858 18 6 15.7614 6 13V11" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
    <path d="M4 11H20" />
  </svg>
);

interface FeedItem {
  id: string;
  type: 'QUOTE' | 'CHAT' | 'WEATHER' | 'NOTE' | 'CHALLENGE' | 'UNLOCK';
  label: string;
  meta?: string;
  content: string;
  icon: React.ReactNode;
  borderColor: string;
}

const SpotsView: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [allSessions, setAllSessions] = useState<ExtendedSession[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [activeSpotTab, setActiveSpotTab] = useState<'info' | 'sessions' | 'challenges'>('info');
  const [spotChallenges, setSpotChallenges] = useState<Challenge[]>([]);
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [showSpotDetailModal, setShowSpotDetailModal] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Session Creation State
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSessTitle, setNewSessTitle] = useState('');
  const [newSessDate, setNewSessDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSessTime, setNewSessTime] = useState('16:00');
  const [newSessReminder, setNewSessReminder] = useState(false);
  const [isSubmittingSess, setIsSubmittingSess] = useState(false);

  // Quests State
  const [quests, setQuests] = useState<Quest[]>([]);
  const [showQuestModal, setShowQuestModal] = useState(false);

  // Chat State
  const [activeSession, setActiveSession] = useState<ExtendedSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dashboard State
  const [dailyQuote, setDailyQuote] = useState('Loading inspiration...');
  const [weather, setWeather] = useState<{ temp: number; condition: string; isGood: boolean } | null>(null);
  
  // Live Feed State
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [activeFeedIndex, setActiveFeedIndex] = useState(0);
  const feedScrollRef = useRef<HTMLDivElement>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Haversine formula for distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  };

  const loadData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [u, spots, sessions, dailyQuests] = await Promise.all([
        backend.getUser(),
        backend.getSpots(),
        backend.getAllSessions(),
        backend.getDailyQuests()
      ]);

      setUser(u);
      setAllSpots(spots);
      setAllSessions(sessions);
      setQuests(dailyQuests);
      
      // Async fetch for lighter load
      getMotivationalQuote().then(setDailyQuote);
      
      // Mock Weather logic
      const isGoodTime = Math.random() > 0.3;
      setWeather({
          temp: Math.floor(Math.random() * (32 - 18) + 18),
          condition: isGoodTime ? 'Clear Sky' : 'Humid',
          isGood: isGoodTime
      });

    } catch (e) {
      console.error("Critical Failure: Data fetch logic broken.", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
        },
        () => {
          console.warn("Location permission denied.");
        }
      );
    }
    loadData();
  }, []);

  // Build Live Feed
  useEffect(() => {
      const buildFeed = async () => {
          if (!user) return;
          const items: FeedItem[] = [];

          // 1. Quote (Always present)
          items.push({
              id: 'quote',
              type: 'QUOTE',
              label: 'Daily Stoke',
              content: `"${dailyQuote}"`,
              icon: <Quote size={16} className="text-indigo-500 fill-indigo-500/20" />,
              borderColor: 'border-slate-800'
          });

          // 2. Session Updates (Chats & Weather)
          const mySessions = allSessions.filter(s => s.participants.includes(user.id));
          
          for (const s of mySessions) {
              // Latest Chat
              const msgs = await backend.getSessionMessages(s.id);
              if (msgs.length > 0) {
                  const lastMsg = msgs[msgs.length - 1];
                  items.push({
                      id: `chat-${s.id}`,
                      type: 'CHAT',
                      label: 'Squad Comms',
                      meta: s.title,
                      content: `${lastMsg.userName}: ${lastMsg.text}`,
                      icon: <MessageCircle size={16} className="text-green-500" />,
                      borderColor: 'border-green-500/40'
                  });
              }

              // Weather Alert (Simulated)
              items.push({
                  id: `weather-${s.id}`,
                  type: 'WEATHER',
                  label: 'Session Intel',
                  meta: s.title,
                  content: "Conditions optimal. Dry ground expected.",
                  icon: <CloudSun size={16} className="text-amber-500" />,
                  borderColor: 'border-amber-500/40'
              });
          }

          // 3. Notes
          const notes = await backend.getDailyNotes();
          if (notes.length > 0) {
              items.push({
                  id: `note-${notes[0].id}`,
                  type: 'NOTE',
                  label: 'Field Note',
                  meta: notes[0].date,
                  content: notes[0].text,
                  icon: <StickyNote size={16} className="text-blue-400" />,
                  borderColor: 'border-blue-500/40'
              });
          }

          setFeedItems(items);
      };

      if (!isLoading && user) {
          buildFeed();
      }
  }, [isLoading, user, allSessions, dailyQuote]);

  // Handle Scroll for Pagination Dots
  const handleFeedScroll = () => {
    if (feedScrollRef.current) {
        const scrollLeft = feedScrollRef.current.scrollLeft;
        const width = feedScrollRef.current.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setActiveFeedIndex(index);
    }
  };

  useEffect(() => {
    if (selectedSpot && activeSpotTab === 'challenges') {
        setIsLoadingTab(true);
        backend.getSpotChallenges(selectedSpot.id).then(c => {
          setSpotChallenges(c);
          setIsLoadingTab(false);
        });
    }
  }, [selectedSpot, activeSpotTab]);

  const filteredSpots = useMemo(() => {
    let result = allSpots;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.state.toLowerCase().includes(q) ||
        s.location.address.toLowerCase().includes(q)
      );
    } else if (navigationPath.length > 0) {
      result = result.filter(s => s.state === navigationPath[0]);
    }
    return result;
  }, [allSpots, searchQuery, navigationPath]);

  const recenterToUser = () => {
    if (!userCoords || !mapInstanceRef.current) {
        triggerHaptic('error');
        return;
    }
    mapInstanceRef.current.setView([userCoords.lat, userCoords.lng], 14);
    triggerHaptic('medium');
  };

  const jumpToNearest = () => {
    if (!userCoords || allSpots.length === 0 || !mapInstanceRef.current) {
        triggerHaptic('error');
        return;
    }
    
    let nearest = allSpots[0];
    let minDistance = calculateDistance(userCoords.lat, userCoords.lng, nearest.location.lat, nearest.location.lng);
    
    allSpots.forEach(s => {
      const d = calculateDistance(userCoords.lat, userCoords.lng, s.location.lat, s.location.lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = s;
      }
    });

    mapInstanceRef.current.setView([nearest.location.lat, nearest.location.lng], 15);
    setSelectedSpot(nearest);
    triggerHaptic('success');
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
      triggerHaptic('light');
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
      triggerHaptic('light');
    }
  };

  const handleCheckIn = async () => {
    if (!selectedSpot || isCheckingIn) return;
    
    // 1. Verify Location Access
    if (!userCoords) {
        triggerHaptic('error');
        playSound('error');
        alert("GPS Signal Lost. Please enable location to verify you are at the spot.");
        
        // Attempt to get location again
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.error(err)
        );
        return;
    }

    // 2. Verify Distance (e.g. within 2.5km)
    const distanceKm = calculateDistance(
        userCoords.lat, 
        userCoords.lng, 
        selectedSpot.location.lat, 
        selectedSpot.location.lng
    );

    const MAX_DISTANCE_KM = 2.5; // Threshold for check-in

    if (distanceKm > MAX_DISTANCE_KM) {
        triggerHaptic('error');
        playSound('error');
        alert(`Location Mismatch. You are ${distanceKm.toFixed(1)}km away from ${selectedSpot.name}. Get closer to log your visit.`);
        return;
    }

    // 3. Success
    setIsCheckingIn(true);
    triggerHaptic('success');
    playSound('success');
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Update Quests for Check-in
    const newQuests = await backend.updateQuestProgress('CHECK_IN', 1);
    setQuests(newQuests);

    const updatedUser = { ...user!, xp: user!.xp + 100 };
    await backend.updateUser(updatedUser);
    setUser(updatedUser);
    setIsCheckingIn(false);
    alert(`Verified! +100 XP added to your bag for hitting ${selectedSpot.name}.`);
  };

  useEffect(() => {
    const L = (window as any).L;
    if (viewMode === 'map' && mapContainerRef.current && L && !isLoading) {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false })
          .setView([20.5937, 78.9629], 5);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);

        if (allSpots.length > 0) {
           const group = L.featureGroup(allSpots.map(s => L.marker([s.location.lat, s.location.lng])));
           map.fitBounds(group.getBounds().pad(0.1));
        }
      }
      
      const map = mapInstanceRef.current;
      const layer = markersLayerRef.current;
      layer.clearLayers();

      if (userCoords) {
        L.circleMarker([userCoords.lat, userCoords.lng], {
          radius: 8,
          fillColor: "#3b82f6",
          color: "#fff",
          weight: 2,
          fillOpacity: 0.8
        }).addTo(layer);
      }

      filteredSpots.forEach(spot => {
        const isSelected = selectedSpot?.id === spot.id;
        const color = spot.type === Discipline.SKATE ? '#818cf8' : '#fbbf24';
        const marker = L.marker([spot.location.lat, spot.location.lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: ${isSelected ? '22px' : '16px'}; height: ${isSelected ? '22px' : '16px'}; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 15px ${color}; transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>`
          })
        });
        marker.on('click', () => { 
            setSelectedSpot(spot); 
            setActiveSpotTab('info'); 
            triggerHaptic('light');
            map.setView([spot.location.lat, spot.location.lng], 15, { animate: true });
        });
        marker.addTo(layer);
      });

      if (filteredSpots.length > 0 && searchQuery) {
        const group = L.featureGroup(filteredSpots.map(s => L.marker([s.location.lat, s.location.lng])));
        map.fitBounds(group.getBounds().pad(0.2));
      }
      
      // Fix for Leaflet initial size
      setTimeout(() => map.invalidateSize(), 100);
    }
  }, [viewMode, filteredSpots, isLoading, selectedSpot]);

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

  const handleCreateSession = async () => {
    if (!selectedSpot || !newSessTitle.trim()) return;
    setIsSubmittingSess(true);
    try {
      const newSess = await backend.createSession({
        title: newSessTitle,
        date: newSessDate,
        time: newSessTime,
        spotId: selectedSpot.id,
        spotName: selectedSpot.name,
        spotType: selectedSpot.type,
        reminderSet: newSessReminder
      });
      triggerHaptic('success');
      playSound('success');
      
      if (newSessReminder) {
          alert(`Alarm set for ${newSessTime} on ${newSessDate}. We'll notify you.`);
      }

      setShowCreateSession(false);
      setNewSessTitle('');
      setNewSessReminder(false);
      
      const sessions = await backend.getAllSessions();
      setAllSessions(sessions);
      setActiveSession(newSess);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingSess(false);
    }
  };

  if (isError) return <ErrorState onRetry={loadData} message="Network Handshake Failed." />;
  
  if (isLoading) return (
    <div className="p-8 space-y-6">
      <div className="h-24 bg-slate-900 rounded-[2rem] animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => <SpotCardSkeleton key={i} />)}
      </div>
    </div>
  );

  const activeFeedItem = feedItems[activeFeedIndex] || {
      id: 'loading', type: 'QUOTE', label: 'Loading...', content: '', icon: <Loader2 className="animate-spin" />, borderColor: 'border-slate-800'
  };

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden bg-black">
      <div className="flex-1 relative w-full h-full">
        {/* Background Map Content */}
        {viewMode === 'map' ? (
          <div className="absolute inset-0 z-0 bg-slate-950">
              <div ref={mapContainerRef} className="w-full h-full" style={{ height: '100%', width: '100%' }} />
              
              {/* Floating Controls (Top Right, shifted below mode toggle) - High Z-Index */}
              <div className="absolute top-32 right-6 z-[4000] flex flex-col gap-3">
                 <button 
                  onClick={() => setShowQuestModal(true)}
                  className="bg-black/60 backdrop-blur-md p-3.5 rounded-[1.25rem] border border-white/10 text-white shadow-2xl hover:bg-amber-500 transition-all active:scale-90 group relative"
                  title="Mission Control"
                 >
                   <Compass size={22} className="group-hover:rotate-45 transition-transform" />
                   {quests.some(q => !q.isCompleted) && <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                 </button>
                 <button 
                  onClick={jumpToNearest} 
                  className="bg-black/60 backdrop-blur-md p-3.5 rounded-[1.25rem] border border-white/10 text-white shadow-2xl hover:bg-indigo-600 transition-all active:scale-90 group"
                  title="Nearest Spot"
                 >
                   <Target size={22} className="group-hover:rotate-12 transition-transform" />
                 </button>
                 <button 
                  onClick={recenterToUser} 
                  className="bg-black/60 backdrop-blur-md p-3.5 rounded-[1.25rem] border border-white/10 text-white shadow-2xl hover:bg-indigo-600 transition-all active:scale-90 group"
                  title="My Location"
                 >
                   <Navigation size={22} className="group-hover:rotate-12 transition-transform" />
                 </button>

                 {/* New Zoom Controls */}
                 <div className="flex flex-col bg-black/60 backdrop-blur-md rounded-[1.25rem] border border-white/10 overflow-hidden shadow-2xl mt-1">
                    <button onClick={handleZoomIn} className="p-3.5 text-white hover:bg-slate-800 transition-colors border-b border-white/10 active:bg-slate-700">
                      <Plus size={22} />
                    </button>
                    <button onClick={handleZoomOut} className="p-3.5 text-white hover:bg-slate-800 transition-colors active:bg-slate-700">
                      <Minus size={22} />
                    </button>
                 </div>
              </div>

              {/* Status Indicator - High Z-Index */}
              <div className="absolute top-6 left-6 z-[4000] bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 text-[8px] font-black uppercase text-slate-300 tracking-[0.2em] flex items-center gap-2 shadow-xl">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" /> Spots Grid: Ready
              </div>

              {/* Spot Peek Card (Appears when marker clicked) */}
              {selectedSpot && !showSpotDetailModal && (
                 <div className="absolute bottom-24 left-4 right-4 z-[5000] animate-view mb-safe">
                    <div 
                        className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-5 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col gap-4 group transition-all"
                    >
                        <div className="flex items-center gap-5 cursor-pointer" onClick={() => setShowSpotDetailModal(true)}>
                          <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shrink-0 border border-white/5 bg-slate-800">
                              <img src={selectedSpot.images?.[0] || `https://picsum.photos/seed/${selectedSpot.id}/400/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 overflow-hidden text-left">
                              <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white`}>{selectedSpot.type}</span>
                                  <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">{selectedSpot.difficulty}</span>
                              </div>
                              <h3 className="text-xl font-black italic uppercase text-white truncate leading-tight group-hover:text-indigo-400 transition-colors">{selectedSpot.name}</h3>
                              <p className="text-[9px] text-slate-400 font-bold uppercase truncate flex items-center gap-1 mt-1"><MapPin size={8} /> {selectedSpot.location.address}</p>
                          </div>
                          <div className="bg-white/10 p-3 rounded-full text-white shadow-lg group-hover:bg-indigo-600 transition-colors">
                              <ArrowRight size={20} />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                           <button 
                             onClick={handleCheckIn}
                             disabled={isCheckingIn}
                             className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                           >
                             {isCheckingIn ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                             Check-In <span className="text-indigo-400 font-black">+100</span>
                           </button>
                           <button 
                             onClick={() => setShowCreateSession(true)}
                             className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-900/40"
                           >
                             <Users size={12} /> Join Squad
                           </button>
                        </div>
                    </div>
                 </div>
              )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto pt-32 px-4 space-y-6 pb-32 w-full">
             {/* Grid View Content */}
             
             {/* User Profile / Dashboard Header Card */}
             <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full border-2 border-indigo-500/50 overflow-hidden shrink-0 shadow-lg bg-slate-800">
                        <img src={user?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=user`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-white text-2xl font-black uppercase italic tracking-tighter leading-none">{user?.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <SkateboardIcon size={12} className="text-indigo-500" />
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">{filteredSpots.length} Local Spots Unlocked</p>
                        </div>
                    </div>
                </div>
             </div>

             {/* Widgets: Weather & Live Feed (Swipeable Widget) */}
             <div className="grid grid-cols-2 gap-4 h-48">
                 {/* Weather Widget */}
                 <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 flex flex-col justify-between relative overflow-hidden h-full">
                    <div className="flex justify-between items-start z-10">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Forecast</span>
                        <CloudSun size={16} className={weather?.isGood ? "text-amber-400" : "text-slate-600"} />
                    </div>
                    <div className="z-10 mt-2">
                        <div className="text-2xl font-black italic text-white">{weather?.temp}°C</div>
                        <div className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${weather?.isGood ? "text-green-400" : "text-slate-400"}`}>
                            {weather?.condition} • {weather?.isGood ? "Go Skate" : "Maybe Chill"}
                        </div>
                    </div>
                    {/* Background glow based on condition */}
                    <div className={`absolute -bottom-4 -right-4 w-20 h-20 blur-[40px] rounded-full opacity-20 ${weather?.isGood ? "bg-amber-500" : "bg-slate-500"}`} />
                 </div>

                 {/* Rotating Live Feed Widget - Converted to Scrollable/Swipeable */}
                 <div className="bg-slate-900 border border-slate-800 rounded-[2rem] relative overflow-hidden h-full flex flex-col">
                    {/* Scroll Container */}
                    <div 
                        ref={feedScrollRef}
                        onScroll={handleFeedScroll}
                        className="flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
                    >
                        {feedItems.length > 0 ? feedItems.map((item) => (
                            <div key={item.id} className={`w-full min-w-full shrink-0 snap-center p-5 flex flex-col justify-between relative ${item.borderColor ? item.borderColor.replace('border', 'border-l-0') : ''}`}> 
                                {/* Header */}
                                <div className="flex justify-between items-start z-10">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</span>
                                    <div className="">{item.icon}</div>
                                </div>
                                
                                {/* Content */}
                                <div className="z-10 mt-auto mb-2 pr-2"> 
                                    {item.meta && <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-1.5 leading-tight">{item.meta}</p>}
                                    <p className="text-[11px] font-bold text-slate-300 italic leading-relaxed line-clamp-3">
                                        {item.content}
                                    </p>
                                </div>
                            </div>
                        )) : (
                             <div className="w-full flex items-center justify-center p-5">
                                <Loader2 className="animate-spin text-slate-600" />
                             </div>
                        )}
                    </div>

                    {/* Progress dots - Overlay */}
                    {feedItems.length > 1 && (
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                            {feedItems.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === activeFeedIndex ? 'bg-indigo-500 w-3' : 'bg-slate-700 w-1'}`} />
                            ))}
                        </div>
                    )}
                 </div>
             </div>

              {/* MISSION CONTROL BUTTON (Visible in Grid Mode too) */}
              <button 
                  onClick={() => setShowQuestModal(true)}
                  className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between px-6 hover:bg-slate-800 transition-all shadow-lg group"
              >
                   <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                           <Compass size={20} />
                       </div>
                       <div className="text-left">
                           <h3 className="text-white font-black uppercase italic text-sm">Mission Control</h3>
                           <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{quests.filter(q => q.isCompleted).length}/{quests.length} Daily Objectives Complete</p>
                       </div>
                   </div>
                   <ChevronLeft size={16} className="rotate-180 text-slate-600" />
              </button>

              {!searchQuery && navigationPath.length === 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from(new Set<string>(allSpots.map(s => s.state))).map(state => {
                    const count = allSpots.filter(s => s.state === state).length;
                    return (
                        <DrillDownCard 
                            key={state} 
                            title={state} 
                            count={count} 
                            imageUrl={STATE_IMAGES[state] || `https://picsum.photos/seed/${state}/800/600`} 
                            type="state" 
                            onClick={() => { setNavigationPath([state]); triggerHaptic('medium'); }} 
                        />
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        {navigationPath.length > 0 ? `Zone: ${navigationPath[0]}` : 'Search Results'}
                      </h3>
                      {navigationPath.length > 0 && (
                        <button onClick={() => setNavigationPath([])} className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-400">
                          <ChevronLeft size={12} /> Back to Zones
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredSpots.length === 0 ? (
                            <div className="col-span-full"><EmptyState title="No Signal" description="No spots detected in this sector. Try broadening scan." icon={Search} /></div>
                        ) : (
                            filteredSpots.map(spot => <SpotCard key={spot.id} spot={spot} onClick={() => { setSelectedSpot(spot); setShowSpotDetailModal(true); setActiveSpotTab('info'); }} />)
                        )}
                    </div>
                </div>
              )}
          </div>
        )}

        {/* Floating Top Controls: Search (Left) and Mode Toggle (Right) - High Z-Index */}
        <section className="absolute top-8 left-0 right-0 z-[4000] px-6 flex justify-between items-center pointer-events-none">
          {/* Search Pill */}
          <div className="flex-1 max-w-xs relative pointer-events-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search spots..." 
              className="w-full h-12 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full pl-12 pr-6 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all shadow-2xl placeholder:text-slate-700 font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => {
                if (viewMode !== 'map') {
                  setViewMode('map');
                  triggerHaptic('light');
                }
              }}
            />
          </div>

          {/* Mode Toggle Pill: Map on the Left per request */}
          <div className="ml-4 h-12 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center p-1 shadow-2xl pointer-events-auto">
            <button 
              onClick={() => { setViewMode('map'); triggerHaptic('light'); }} 
              className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${viewMode === 'map' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <MapIcon size={18} />
            </button>
            <button 
              onClick={() => { setViewMode('grid'); triggerHaptic('light'); }} 
              className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Grid size={18} />
            </button>
          </div>
        </section>
      </div>

      {/* Spot Detail Modal - Very High Z-Index */}
      {showSpotDetailModal && selectedSpot && (
        <div className="fixed inset-0 z-[6000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
           {/* (Existing Modal Content - No changes needed here besides standard layout) */}
           <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl animate-view flex flex-col max-h-[90vh] relative">
              <button 
                 onClick={() => { setShowSpotDetailModal(false); setSelectedSpot(null); }} 
                 className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full text-white flex items-center justify-center hover:bg-white hover:text-black transition-all active:scale-95"
              >
                  <X size={20} />
              </button>

              <div className="relative h-64 shrink-0 bg-slate-800 group">
                  <img src={selectedSpot.images?.[0] || `https://picsum.photos/seed/${selectedSpot.id}/800/400`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-6 left-8 right-8 text-left space-y-2">
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-800/80 backdrop-blur border border-white/20 text-white tracking-widest">{selectedSpot.type}</span>
                         <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-500/80 backdrop-blur border border-indigo-400/50 text-white tracking-widest">{selectedSpot.difficulty}</span>
                      </div>
                      <div>
                          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-[0.9] drop-shadow-lg">{selectedSpot.name}</h2>
                          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-2">
                            <MapPin size={12} className="text-indigo-400" /> {selectedSpot.location.address}
                          </p>
                      </div>
                  </div>
              </div>

              {/* Custom Tab Bar */}
              <div className="flex border-b border-slate-800 bg-slate-900 px-2">
                  <button onClick={() => setActiveSpotTab('info')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeSpotTab === 'info' ? 'text-white' : 'text-slate-600'}`}>Spot Intel{activeSpotTab === 'info' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-500 rounded-t-full" />}</button>
                  <button onClick={() => setActiveSpotTab('sessions')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeSpotTab === 'sessions' ? 'text-white' : 'text-slate-600'}`}>Squad Comms{activeSpotTab === 'sessions' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-500 rounded-t-full" />}</button>
                  <button onClick={() => setActiveSpotTab('challenges')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeSpotTab === 'challenges' ? 'text-white' : 'text-slate-600'}`}>Spot Battles{activeSpotTab === 'challenges' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-500 rounded-t-full" />}</button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6 hide-scrollbar bg-slate-900">
                  {/* Spot Info Content (Shortened for brevity as logic is same as before) */}
                  {activeSpotTab === 'info' && (
                      <div className="space-y-4 animate-view">
                          <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 relative overflow-hidden shadow-2xl text-left min-h-[140px] flex flex-col justify-center">
                              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
                                <Zap size={140} className="text-indigo-500" strokeWidth={1} />
                              </div>
                              <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2 block relative z-10">Field Intel</span>
                              <p className="text-sm text-white italic font-bold leading-relaxed relative z-10">"{selectedSpot.notes}"</p>
                          </div>
                          <button 
                            onClick={handleCheckIn}
                            disabled={isCheckingIn}
                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                          >
                            {isCheckingIn ? <Loader2 size={16} className="animate-spin" /> : <Car size={18} />}
                            Log Visit & Earn 100 XP
                          </button>
                      </div>
                  )}
                  {/* ... other tabs ... */}
                  {activeSpotTab === 'sessions' && (
                     <div className="space-y-4 animate-view">
                          {allSessions.filter(s => s.spotId === selectedSpot.id).length === 0 ? (
                              <div className="py-12 text-center space-y-6"><div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto border border-slate-800 shadow-xl"><MessageCircle size={28} className="text-slate-700" /></div><p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Comms black-out.</p><button onClick={() => { setShowCreateSession(true); triggerHaptic('medium'); }} className="bg-white text-black px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2 mx-auto"><Plus size={14} strokeWidth={3} /> Initiate Gathering</button></div>
                          ) : (
                              allSessions.filter(s => s.spotId === selectedSpot.id).map(sess => (
                                    <button key={sess.id} onClick={() => { setActiveSession(sess); triggerHaptic('medium'); }} className="w-full bg-slate-800/50 hover:bg-slate-800 p-6 rounded-[2rem] border border-slate-700/50 flex justify-between items-center group active:scale-98 transition-all shadow-xl"><div className="text-left"><p className="font-black text-white text-base uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">{sess.title}</p><p className="text-[10px] text-slate-500 uppercase font-black mt-1.5 tracking-widest">{sess.date} @ {sess.time}</p></div><div className="bg-slate-900 p-4 rounded-full border border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg"><MessageCircle size={20} /></div></button>
                                ))
                          )}
                     </div>
                  )}
                  {activeSpotTab === 'challenges' && (
                     <div className="space-y-4 animate-view">
                        {spotChallenges.length === 0 ? (
                           <div className="py-12 text-center space-y-6"><div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto border border-slate-800 shadow-xl text-slate-700"><Swords size={28} /></div><p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">No active battles.</p></div>
                        ) : (
                           spotChallenges.map(c => (
                             <div key={c.id} className="bg-slate-950 border border-slate-800 p-6 rounded-[2rem] space-y-4 shadow-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-colors text-left">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
                                <div className="flex justify-between items-start relative z-10"><div><h4 className="text-lg font-black italic uppercase text-white tracking-tight leading-tight">{c.title}</h4><span className={`text-[8px] font-black uppercase tracking-widest mt-1.5 inline-block ${c.difficulty === 'beginner' ? 'text-green-500' : c.difficulty === 'intermediate' ? 'text-amber-500' : 'text-red-500'}`}>{c.difficulty}</span></div><div className="text-right"><div className="text-[12px] font-black text-indigo-400 italic">+{c.xpReward} XP</div></div></div><p className="text-[11px] text-slate-500 font-medium leading-relaxed italic relative z-10">"{c.description}"</p>
                             </div>
                           ))
                        )}
                     </div>
                  )}
              </div>
           </div>
        </div>
      )}

      {/* Quest Modal */}
      {showQuestModal && (
        <div className="fixed inset-0 z-[6000] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-view relative">
                <button onClick={() => setShowQuestModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={20} /></button>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">Mission Control</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Daily Objectives • Refresh in 14H</p>
                </div>

                <div className="space-y-4">
                    {quests.map(quest => (
                        <div key={quest.id} className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${quest.isCompleted ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-950 border-slate-800'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${quest.isCompleted ? 'bg-green-500 border-green-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-600'}`}>
                                {quest.isCompleted ? <Check size={20} strokeWidth={4} /> : (quest.type === 'CHECK_IN' ? <MapPin size={20} /> : quest.type === 'UPLOAD' ? <Zap size={20} /> : <Navigation size={20} />)}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-black uppercase italic leading-none ${quest.isCompleted ? 'text-green-400' : 'text-white'}`}>{quest.title}</h4>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{quest.description}</p>
                                {/* Progress Bar */}
                                <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(quest.current / quest.target) * 100}%` }} />
                                </div>
                                <div className="flex justify-between mt-1 text-[8px] font-bold text-slate-600 uppercase">
                                    <span>{quest.current} / {quest.target}</span>
                                    <span className="text-amber-500">+{quest.xpReward} XP</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Session Creation Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 z-[6000] bg-black/98 flex items-center justify-center p-4 backdrop-blur-xl">
           <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl animate-view relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full" />
              <div className="flex justify-between items-center relative z-10"><h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">Broadcast Session</h2><button onClick={() => setShowCreateSession(false)} className="text-slate-500 hover:text-white transition-colors p-2 -mr-2"><X size={28} /></button></div>
              <div className="space-y-6 relative z-10 text-left">
                 <div className="space-y-3"><label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Agenda</label><input type="text" placeholder="e.g. Sunset Tech Session" className="w-full bg-black/50 border border-slate-800 rounded-2xl p-5 text-white text-sm focus:border-indigo-500 outline-none font-black italic shadow-inner" value={newSessTitle} onChange={e => setNewSessTitle(e.target.value)} /></div>
                 <div className="grid grid-cols-2 gap-4"><div className="space-y-3"><label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 flex items-center gap-1.5"><Calendar size={12} className="text-indigo-400" /> Date</label><input type="date" className="w-full bg-black/50 border border-slate-800 rounded-2xl p-5 text-white text-[10px] font-black focus:border-indigo-500 outline-none" value={newSessDate} onChange={e => setNewSessDate(e.target.value)} /></div><div className="space-y-3"><label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 flex items-center gap-1.5"><Clock size={12} className="text-indigo-400" /> Time</label><input type="time" className="w-full bg-black/50 border border-slate-800 rounded-2xl p-5 text-white text-[10px] font-black focus:border-indigo-500 outline-none" value={newSessTime} onChange={e => setNewSessTime(e.target.value)} /></div></div>
                 <button onClick={() => setNewSessReminder(!newSessReminder)} className={`w-full p-4 rounded-[1.5rem] border flex items-center justify-between transition-all ${newSessReminder ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-950 border-slate-800'}`}><div className="flex items-center gap-3"><div className={`p-2 rounded-xl ${newSessReminder ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-600'}`}><BellRing size={18} /></div><div className="text-left"><span className={`text-xs font-black uppercase block ${newSessReminder ? 'text-white' : 'text-slate-500'}`}>Set Reminder</span><span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{newSessReminder ? 'Alarm Active' : 'Off'}</span></div></div><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${newSessReminder ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700'}`}>{newSessReminder && <CheckCircle2 size={12} />}</div></button>
                 <button onClick={handleCreateSession} disabled={isSubmittingSess || !newSessTitle.trim()} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">{isSubmittingSess ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />} {isSubmittingSess ? 'Transmitting...' : 'Ignite Channel'}</button>
              </div>
           </div>
        </div>
      )}

      {/* Chat Modal */}
      {activeSession && (
        <div className="fixed inset-0 z-[6000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
             {/* (Chat content remains same as previous version) */}
              <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] flex flex-col h-[85vh] overflow-hidden shadow-2xl animate-view relative">
                  <div className="p-7 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                      <div className="text-left">
                        <h3 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none">{activeSession.title}</h3>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-2">Frequency: {activeSession.spotName}</p>
                      </div>
                      <button onClick={() => setActiveSession(null)} className="p-2.5 bg-slate-800 rounded-full text-white hover:bg-white hover:text-black transition-all active:scale-90 shadow-lg"><X size={20} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-black/20 hide-scrollbar">
                      {chatMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                          <MessageCircle size={56} className="text-slate-600" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Channel Synchronizing...</p>
                        </div>
                      )}
                      {chatMessages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
                              <span className="text-[8px] font-black text-slate-600 uppercase mb-1.5 px-2 tracking-widest">{msg.userName}</span>
                              <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-xs font-medium leading-relaxed shadow-xl ${msg.userId === user?.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50 shadow-black'}`}>{msg.text}</div>
                              <span className="text-[8px] text-slate-700 mt-2 uppercase font-black tracking-widest px-2">{msg.timestamp}</span>
                          </div>
                      ))}
                      <div ref={chatEndRef} />
                  </div>
                  <div className="p-5 bg-slate-950 border-t border-slate-800">
                      <div className="flex gap-2.5">
                          <input 
                            type="text" 
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-medium placeholder:text-slate-700" 
                            placeholder="Signal the squad..." 
                            value={chatInput} 
                            onChange={e => setChatInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSendChat()} 
                          />
                          <button onClick={handleSendChat} disabled={!chatInput.trim()} className="bg-indigo-600 text-white p-5 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.2)] active:scale-90 transition-all disabled:opacity-50"><Send size={22} /></button>
                      </div>
                  </div>
              </div>
        </div>
      )}
    </div>
  );
};

export default SpotsView;
