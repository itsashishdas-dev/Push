
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus, Map as MapIcon, Layers, Info, Target, Trophy, X, Calendar, Clock, MessageSquare, UserPlus, Check, MapPin, ShieldCheck, AlertCircle, Camera, Trash2, Loader2, ExternalLink, Globe, ChevronDown, Sparkles, CloudSun, Wind, Thermometer, Star, Activity, ImagePlus, UserCheck, Send, ShieldAlert, Filter, Navigation as NavIcon, Edit2, MessageCircle, Grid, RefreshCw, CalendarDays, ChevronRight, Home, Zap, Mountain, BookOpen, Video, Award, PlayCircle, Play, MessageCircleMore, Locate, Swords } from 'lucide-react';
import { Discipline, Spot, Session, Difficulty, VerificationStatus, Collectible, ChatMessage, DailyNote, Challenge, ChallengeSubmission, User } from '../types';
import SpotCard from '../components/SpotCard';
import SessionCard from '../components/SessionCard';
import DrillDownCard from '../components/DrillDownCard';
import { searchPlaces, getMotivationalQuote, generateStateCover } from '../services/geminiService';
import { backend, ExtendedSession } from '../services/mockBackend';
import { COLLECTIBLES_DATABASE, STATE_LANDMARKS, STATE_IMAGES } from '../constants';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

const SpotsView: React.FC = () => {
  // 1. Single Source of Truth
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<ExtendedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stateCovers, setStateCovers] = useState<Record<string, string>>({});
  const [generatingStates, setGeneratingStates] = useState<Set<string>>(new Set());
  
  // Navigation State (Drill Down)
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  
  // Unified Filter State
  const [disciplineFilter, setDisciplineFilter] = useState<Discipline | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [activeSessionsOnly, setActiveSessionsOnly] = useState<boolean>(false);
  
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map');
  const [libLoaded, setLibLoaded] = useState(false); 

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [spotDetailTab, setSpotDetailTab] = useState<'intel' | 'challenges' | 'sessions'>('intel');
  const [spotChallenges, setSpotChallenges] = useState<Challenge[]>([]);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, ChallengeSubmission[]>>({});
  const [userCompletedChallenges, setUserCompletedChallenges] = useState<string[]>([]);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState<ChallengeSubmission | null>(null);
  
  // Create Challenge State
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', difficulty: Difficulty.INTERMEDIATE });
  const [uploadingChallengeId, setUploadingChallengeId] = useState<string | null>(null);

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showAddSpotForm, setShowAddSpotForm] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [spotLimit, setSpotLimit] = useState(10);
  const [quote, setQuote] = useState<string>("Loading vibes...");
  const [latestNote, setLatestNote] = useState<DailyNote | null>(null);
  
  const [unlockedItem, setUnlockedItem] = useState<Collectible | null>(null);

  const [weather] = useState({ temp: 31, condition: 'Sunny', location: 'Pune' });
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [fullUser, setFullUser] = useState<User | null>(null);

  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<{ title: string; uri: string }[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const searchTimeout = useRef<number | null>(null);
  
  // Header Message Rotation
  const [headerMsgIndex, setHeaderMsgIndex] = useState(0);

  // Review State
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [isPostingReview, setIsPostingReview] = useState(false);

  // Session Chat State
  const [activeSessionChat, setActiveSessionChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  const [newSession, setNewSession] = useState({ title: '', date: currentDate, time: currentTime, note: '' });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newSpotData, setNewSpotData] = useState({
    name: '', type: Discipline.SKATE, difficulty: Difficulty.BEGINNER, address: '', state: '', notes: '', images: [] as string[]
  });

  // Check for Leaflet
  useEffect(() => {
    const checkL = setInterval(() => {
      if ((window as any).L) {
        setLibLoaded(true);
        clearInterval(checkL);
      }
    }, 100);
    setTimeout(() => clearInterval(checkL), 10000);
    return () => clearInterval(checkL);
  }, []);

  // Initialization Effect
  useEffect(() => {
    const init = async () => {
      const user = await backend.getUser();
      setCurrentUser(user.name);
      setFullUser(user);
      
      const spots = await backend.getSpots();
      setAllSpots(spots);
      setIsLoading(false);
      
      const sessions = await backend.getAllSessions();
      setUpcomingSessions(sessions.slice(0, 5));

      const savedCovers = await backend.getStateCovers();
      setStateCovers(savedCovers);
      
      // Get Quote
      const q = await getMotivationalQuote();
      setQuote(q);

      // Get Notes
      const notes = await backend.getDailyNotes();
      if (notes.length > 0) setLatestNote(notes[0]);

      // Get Completed Challenges
      setUserCompletedChallenges(user.completedChallengeIds);
    };
    init();

    // Geolocate - Silent update of coords, map view stays on default until requested
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(pos => {
         setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
       });
    }
  }, []);

  // Header Messages Rotation Logic
  const headerMessages = useMemo(() => {
    const msgs = [];
    // 1. Motivational Quote
    if (quote) msgs.push(`"${quote}"`);
    
    // 2. Weather Forecast (Mock)
    const forecasts = [
        "Forecast: Clear skies expected later. Go skate.",
        "Weather Alert: Perfect conditions currently.",
        "Outlook: No rain expected this evening.",
        "Update: Wind speeds are low, ideal for downhill."
    ];
    msgs.push(forecasts[new Date().getHours() % forecasts.length]);

    // 3. Upcoming Session
    if (upcomingSessions.length > 0) {
        const next = upcomingSessions[0];
        msgs.push(`Next: ${next.title} @ ${next.time}`);
    }

    return msgs;
  }, [quote, upcomingSessions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeaderMsgIndex(prev => (prev + 1) % headerMessages.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, [headerMessages]);

  const currentHeaderMessage = headerMessages.length > 0 ? headerMessages[headerMsgIndex % headerMessages.length] : "Loading...";

  useEffect(() => {
    if (selectedSpot) {
      const loadSpotData = async () => {
         const challenges = await backend.getChallenges(selectedSpot.id);
         setSpotChallenges(challenges);
         
         const submissionPromises = challenges.map(c => backend.getChallengeSubmissions(c.id));
         const submissions = await Promise.all(submissionPromises);
         const subMap: Record<string, ChallengeSubmission[]> = {};
         challenges.forEach((c, i) => { subMap[c.id] = submissions[i]; });
         setSubmissionsMap(subMap);
      };
      loadSpotData();
    }
  }, [selectedSpot]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Filters and Data Logic
  const filteredSpots = useMemo(() => {
    if (!allSpots) return [];
    let result = allSpots;
    if (disciplineFilter !== 'all') result = result.filter(s => s.type === disciplineFilter);
    if (difficultyFilter !== 'all') result = result.filter(s => s.difficulty === difficultyFilter);
    if (ratingFilter > 0) result = result.filter(s => s.rating >= ratingFilter);
    if (activeSessionsOnly) {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(s => s.sessions.some(sess => sess.date === today));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || (s.location.address || '').toLowerCase().includes(q) || (s.state || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [allSpots, disciplineFilter, difficultyFilter, ratingFilter, activeSessionsOnly, searchQuery]);

  // Map Initialization & Updates
  useEffect(() => {
    if (viewMode === 'map' && mapContainerRef.current && (window as any).L) {
      if (!mapInstanceRef.current) {
        // Default view set to India
        const map = (window as any).L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([20.5937, 78.9629], 5);
        (window as any).L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
        mapInstanceRef.current = map;
        markersLayerRef.current = (window as any).L.layerGroup().addTo(map);
      }
      
      const map = mapInstanceRef.current;
      const layer = markersLayerRef.current;
      if (layer) layer.clearLayers();
      
      if (userCoords) {
        const userIcon = (window as any).L.divIcon({
           className: 'custom-div-icon',
           html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #3b82f6;"></div>`
        });
        (window as any).L.marker([userCoords.lat, userCoords.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(layer);
      }

      filteredSpots.forEach((spot: Spot) => {
         if(spot.location.lat && spot.location.lng) {
             const color = spot.type === Discipline.SKATE ? '#6366f1' : '#f59e0b';
             const marker = (window as any).L.marker([spot.location.lat, spot.location.lng], {
               icon: (window as any).L.divIcon({
                 className: 'custom-div-icon',
                 html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid white; box-shadow: 0 0 8px ${color}; opacity: 0.9;"></div>`
               })
             });
             marker.bindPopup(`
               <div style="font-family: 'Inter', sans-serif; color: #0f172a; min-width: 150px;">
                 <strong style="text-transform: uppercase; font-size: 9px; letter-spacing: 1px; color: ${color};">${spot.type}</strong><br/>
                 <span style="font-weight: 800; font-style: italic; font-size: 13px; line-height: 1.2; display: block; margin-top: 2px;">${spot.name}</span>
                 <span style="font-size: 10px; color: #64748b; margin-top: 4px; display: block;">${spot.location.address}</span>
               </div>
             `);
             marker.on('click', () => setSelectedSpot(spot));
             marker.addTo(layer);
         }
      });
    }
  }, [viewMode, filteredSpots, userCoords]);

  const handleFindNearest = () => {
    setIsSearchingLocation(true);
    triggerHaptic('medium');
    playSound('click');
    
    const doZoom = (lat: number, lng: number) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 14);
            setIsSearchingLocation(false);
        }
    };

    if (userCoords) {
        doZoom(userCoords.lat, userCoords.lng);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                doZoom(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                setIsSearchingLocation(false);
                alert("Could not access your location. Please ensure location services are enabled.");
            }
        );
    } else {
        setIsSearchingLocation(false);
    }
  };

  const parseSpotNotes = (notes: string) => {
    const parts = notes.split('|').map(s => s.trim());
    return { 
      description: parts[0] || 'No detailed intel available.',
      surface: parts.find(p => p.startsWith('Surface:'))?.replace('Surface:', '').trim() || 'Unknown',
      risk: parts.find(p => p.startsWith('Risk:'))?.replace('Risk:', '').trim() || 'Unknown'
    };
  };

  const handleDrillDown = (name: string) => {
    setNavigationPath(prev => [...prev, name]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerHaptic('light');
  };

  const handleNavigateUp = (levelIndex: number) => {
    setNavigationPath(prev => prev.slice(0, levelIndex));
    setSearchQuery(''); 
    setIsSearchOpen(false);
    triggerHaptic('medium');
  };

  const resetFilters = () => {
    setDisciplineFilter('all'); setDifficultyFilter('all'); setRatingFilter(0); setActiveSessionsOnly(false);
    setNavigationPath([]); setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpot || !newSession.date || !newSession.time) return;
    let updatedSessions = [...selectedSpot.sessions];
    let sessionId = editingSessionId || Math.random().toString(36).substr(2, 9);
    if (editingSessionId) {
      updatedSessions = updatedSessions.map(s => s.id === editingSessionId ? { ...s, title: newSession.title || 'Untitled Session', date: newSession.date, time: newSession.time, note: newSession.note } : s);
    } else {
      const session: Session = { id: sessionId, userId: 'u-arjun', userName: 'Arjun S.', title: newSession.title || 'Untitled Session', date: newSession.date, time: newSession.time, note: newSession.note, attendees: ['Arjun S.'] };
      updatedSessions.push(session);
    }
    const updatedSpot = { ...selectedSpot, sessions: updatedSessions };
    const saved = await backend.saveSpot(updatedSpot);
    setAllSpots(prev => prev.map(s => s.id === saved.id ? saved : s));
    setSelectedSpot(saved);
    setShowScheduleForm(false);
    setEditingSessionId(null);
    const sessions = await backend.getAllSessions();
    setUpcomingSessions(sessions.slice(0, 5));
    const { newUnlocks } = await backend.logSession(sessionId);
    if (newUnlocks.length > 0) {
       const item = COLLECTIBLES_DATABASE.find(c => c.id === newUnlocks[0]);
       if (item) { setTimeout(() => { setUnlockedItem(item); playSound('unlock'); }, 600); }
    }
    const updatedNow = new Date();
    setNewSession({ title: '', date: updatedNow.toISOString().split('T')[0], time: updatedNow.toTimeString().split(' ')[0].substring(0, 5), note: '' });
  };

  const handleJoinSession = async (sessionId: string) => {
    if (!selectedSpot) return;
    triggerHaptic('medium');
    playSound('click');
    try {
      const updatedSpot = await backend.joinSession(selectedSpot.id, sessionId);
      const spotIndex = allSpots.findIndex(s => s.id === updatedSpot.id);
      const newSpots = [...allSpots];
      newSpots[spotIndex] = updatedSpot;
      setAllSpots(newSpots);
      setSelectedSpot(updatedSpot);
      const sessions = await backend.getAllSessions();
      setUpcomingSessions(sessions.slice(0, 5));
      playSound('success');
    } catch (e) {
      console.error("Join failed", e);
    }
  };

  const handleOpenChat = async (sessionId: string) => {
    setActiveSessionChat(sessionId);
    const msgs = await backend.getSessionMessages(sessionId);
    setChatMessages(msgs);
    setTimeout(() => chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !activeSessionChat) return;
    const txt = chatInput;
    setChatInput('');
    const tempMsg: ChatMessage = {
      id: Math.random().toString(),
      sessionId: activeSessionChat,
      userId: fullUser?.id || 'me',
      userName: currentUser,
      text: txt,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isSystem: false
    };
    setChatMessages(prev => [...prev, tempMsg]);
    await backend.sendSessionMessage(activeSessionChat, txt);
    const msgs = await backend.getSessionMessages(activeSessionChat);
    setChatMessages(msgs);
    setTimeout(() => chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpot || !newReview.text.trim()) return;
    setIsPostingReview(true);
    try {
      const updatedSpot = await backend.addReview(selectedSpot.id, {
        userId: fullUser?.id || 'anon',
        userName: currentUser || 'Skater',
        rating: newReview.rating,
        text: newReview.text
      });
      setAllSpots(prev => prev.map(s => s.id === updatedSpot.id ? updatedSpot : s));
      setSelectedSpot(updatedSpot);
      setNewReview({ rating: 5, text: '' });
      triggerHaptic('success');
      playSound('success');
    } catch (e) { console.error(e); } finally { setIsPostingReview(false); }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpot) return;
    const xpReward = newChallenge.difficulty === Difficulty.BEGINNER ? 150 : newChallenge.difficulty === Difficulty.INTERMEDIATE ? 300 : 500;
    const created = await backend.createChallenge({
      spotId: selectedSpot.id,
      title: newChallenge.title,
      description: newChallenge.description,
      difficulty: newChallenge.difficulty,
      xpReward
    });
    setSpotChallenges(prev => [...prev, created]);
    setShowCreateChallenge(false);
    setNewChallenge({ title: '', description: '', difficulty: Difficulty.INTERMEDIATE });
    triggerHaptic('success');
    playSound('success');
  };

  const handleUploadAttempt = async (e: React.ChangeEvent<HTMLInputElement>, challengeId: string) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingChallengeId(challengeId);
      triggerHaptic('medium');
      playSound('click');
      try {
        const { newUnlocks, user } = await backend.completeChallenge(challengeId);
        setUserCompletedChallenges(user.completedChallengeIds);
        setSpotChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, completions: c.completions + 1 } : c));
        const newSubs = await backend.getChallengeSubmissions(challengeId);
        setSubmissionsMap(prev => ({ ...prev, [challengeId]: newSubs }));
        setUploadingChallengeId(null);
        triggerHaptic('success');
        playSound('unlock');
        if (newUnlocks.length > 0) {
           const item = COLLECTIBLES_DATABASE.find(c => c.id === newUnlocks[0]);
           if (item) setUnlockedItem(item);
        }
      } catch (error) { console.error("Upload failed", error); setUploadingChallengeId(null); }
    }
  };

  const handleLocationSearch = async (val: string) => {
    setLocationQuery(val);
    setNewSpotData(prev => ({ ...prev, address: val }));
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    if (val.length < 3) { setLocationResults([]); setShowLocationDropdown(false); return; }
    searchTimeout.current = window.setTimeout(async () => {
      setIsSearchingLocation(true); setShowLocationDropdown(true);
      const res = await searchPlaces(val);
      setLocationResults(res); setIsSearchingLocation(false);
    }, 600);
  };

  const selectLocation = (loc: { title: string; uri: string }) => {
    setNewSpotData(prev => ({ ...prev, address: loc.title }));
    setLocationQuery(loc.title); setShowLocationDropdown(false);
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearchingLocation(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
          const lat = pos.coords.latitude; const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          const displayAddr = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          setLocationQuery(displayAddr);
          setNewSpotData(prev => ({ ...prev, address: displayAddr }));
          setIsSearchingLocation(false);
        },
        () => { setIsSearchingLocation(false); alert("Could not access your location. Please check your settings."); }
      );
    }
  };

  const handleAddSpotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const spot: Spot = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSpotData.name, type: newSpotData.type, difficulty: newSpotData.difficulty, state: newSpotData.state || 'Unknown',
      location: { lat: 0, lng: 0, address: newSpotData.address },
      notes: newSpotData.notes, images: newSpotData.images, isVerified: false, 
      verificationStatus: VerificationStatus.UNVERIFIED, rating: 0, sessions: []
    };
    const saved = await backend.saveSpot(spot);
    setAllSpots(prev => [saved, ...prev]);
    setShowAddSpotForm(false);
    setNewSpotData({ name: '', type: Discipline.SKATE, difficulty: Difficulty.BEGINNER, address: '', state: '', notes: '', images: [] });
    setLocationQuery('');
  };

  // Helper consts
  const activeFilterCount = [disciplineFilter !== 'all', difficultyFilter !== 'all', ratingFilter > 0, activeSessionsOnly].filter(Boolean).length;
  
  // Aggregated Data for Drill Down
  const allStatesData = useMemo(() => {
    if (!allSpots) return [];
    const uniqueStates = Array.from(new Set(allSpots.map(s => s.state).filter((s): s is string => !!s))) as string[];
    return uniqueStates.map(stateName => {
      const curated = STATE_IMAGES[stateName];
      const cover = stateCovers[stateName];
      const anySpot = allSpots.find(s => s.state === stateName && s.images?.[0]);
      const image = cover || curated || (anySpot?.images?.[0]) || '';
      const count = filteredSpots.filter(s => s.state === stateName).length;
      return { name: stateName, total: count, image };
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [allSpots, filteredSpots, stateCovers]);

  // Current View Data based on Navigation Path
  const currentViewData = useMemo(() => {
    // Search Mode
    if (searchQuery.trim()) {
      return { type: 'spots', data: filteredSpots };
    }

    // Level 0: States
    if (navigationPath.length === 0) {
      return { type: 'states', data: allStatesData };
    }

    // Level 1: Cities
    if (navigationPath.length === 1) {
      const selectedState = navigationPath[0];
      const spotsInState = filteredSpots.filter(s => s.state === selectedState);
      const citiesMap = new Map<string, { name: string, count: number, image: string }>();
      
      spotsInState.forEach(spot => {
        const city = spot.location.address || 'Unknown';
        if (!citiesMap.has(city)) {
          citiesMap.set(city, { name: city, count: 0, image: spot.images?.[0] || '' });
        }
        const entry = citiesMap.get(city)!;
        entry.count++;
      });
      
      return { type: 'cities', data: Array.from(citiesMap.values()) };
    }

    // Level 2: Spots
    if (navigationPath.length >= 2) {
      const [selectedState, selectedCity] = navigationPath;
      const citySpots = filteredSpots.filter(s => s.state === selectedState && s.location.address === selectedCity);
      return { type: 'spots', data: citySpots };
    }

    return { type: 'spots', data: [] };
  }, [navigationPath, filteredSpots, allStatesData, searchQuery]);

  const visibleSpots = (currentViewData.type === 'spots' ? currentViewData.data as Spot[] : []).slice(0, viewMode === 'map' ? 100 : spotLimit);
  const hasMore = currentViewData.type === 'spots' && (currentViewData.data as Spot[]).length > spotLimit;
  const spotIntel = selectedSpot ? parseSpotNotes(selectedSpot.notes) : null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center space-y-4 bg-black">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Connecting to PUSH Network...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <div className="pb-24 pt-3 md:pb-10 space-y-6 px-4 animate-view relative">
        {/* Header */}
        <header className="flex flex-col pt-12 pb-4">
          <div className="flex justify-center mb-8 relative">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none text-white select-none">PUSH</h1>
          </div>
          <div className="flex justify-between items-start px-2 min-h-[50px]">
             <div className="flex items-center gap-3 max-w-[70%]">
                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-900 overflow-hidden shrink-0">
                  <img src={fullUser?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser}`} className="w-full h-full object-cover" alt="User" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] italic flex items-center gap-2">
                     {currentUser} <Sparkles size={11} className="text-slate-500" />
                  </h2>
                  <div className="h-8 flex items-center">
                    <p key={headerMsgIndex} className="text-slate-600 text-[9px] font-medium italic leading-relaxed opacity-80 animate-view">
                      {currentHeaderMessage}
                    </p>
                  </div>
                </div>
             </div>
             <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-[8px] font-bold uppercase text-slate-600 tracking-widest">
                   <MapPin size={9} /> {weather.location}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                   <CloudSun size={14} />
                   <span>{weather.temp}°C</span>
                </div>
             </div>
          </div>
        </header>

        {/* Latest Note (Hero Section) */}
        {navigationPath.length === 0 && searchQuery === '' && latestNote && (
          <div className="mb-2">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
               <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={12} className="text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {latestNote.date === currentDate ? "Today's Focus" : "Last Log: " + latestNote.date}
                  </span>
               </div>
               <p className="text-sm font-medium italic text-slate-200 line-clamp-2">"{latestNote.text}"</p>
            </div>
          </div>
        )}

        {/* Happening Soon Section */}
        {upcomingSessions.length > 0 && navigationPath.length === 0 && searchQuery === '' && (
          <section className="space-y-3 min-h-[160px]">
             <div className="flex items-center justify-between px-1">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                 <CalendarDays size={14} className="text-indigo-500" /> Happening Soon
               </h3>
             </div>
             <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x snap-mandatory">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="min-w-[280px] snap-center">
                    <SessionCard 
                      session={session} 
                      isJoined={session.attendees.includes(currentUser)}
                      onJoin={(e) => { e.stopPropagation(); /* Logic handled elsewhere or add logic here */ }}
                      onClick={() => {
                        const spot = allSpots.find(s => s.id === session.spotId);
                        if(spot) setSelectedSpot(spot);
                      }}
                    />
                  </div>
                ))}
             </div>
          </section>
        )}
        
        {/* Controls Section */}
        <section className="sticky top-0 z-[100] bg-black/80 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 border-b border-transparent transition-all duration-300">
          <div className="space-y-3">
            <div className="flex gap-2 items-center relative h-14 w-full">
              {/* Search */}
              <div className={`transition-all duration-300 ease-in-out ${isSearchOpen || searchQuery ? 'flex-1' : 'w-14'}`}>
                 {isSearchOpen || searchQuery ? (
                    <div className="relative w-full h-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Find spots..." 
                        className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner font-medium placeholder:text-slate-600" 
                        value={searchQuery} 
                        onChange={(e) => { setSearchQuery(e.target.value); if(e.target.value) setNavigationPath([]); }} 
                      />
                      <button 
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white bg-slate-800/50 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                 ) : (
                    <button onClick={() => setIsSearchOpen(true)} className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center shadow-lg"><Search size={18} /></button>
                 )}
              </div>

              {/* View Toggle & Filters */}
              {(!isSearchOpen && !searchQuery) && (
                <>
                  <div className="flex-1" /> 
                  <div className="h-full bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 flex overflow-hidden shadow-lg">
                    <button onClick={() => setViewMode('grid')} className={`px-5 h-full transition-colors flex items-center ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-400'}`}><Grid size={18} /></button>
                    <div className="w-[1px] bg-slate-800 my-2"></div>
                    <button onClick={() => setViewMode('map')} className={`px-5 h-full transition-colors flex items-center ${viewMode === 'map' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-400'}`}><MapIcon size={18} /></button>
                  </div>
                  <button onClick={() => setShowFilterPanel(true)} className={`h-full w-14 border border-slate-800 rounded-2xl active:bg-slate-800 transition-all relative flex items-center justify-center shadow-lg ${activeFilterCount > 0 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 text-slate-500 hover:text-slate-400'}`}>
                    <SlidersHorizontal size={18} />
                    {activeFilterCount > 0 && (<div className="absolute top-3 right-3 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>)}
                  </button>
                </>
              )}
            </div>

            {/* Breadcrumbs */}
            {navigationPath.length > 0 && searchQuery === '' && (
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 animate-view">
                <button onClick={() => handleNavigateUp(0)} className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-white transition-colors whitespace-nowrap"><Home size={10} /> All</button>
                {navigationPath.map((item, i) => (
                  <React.Fragment key={i}>
                    <ChevronRight size={10} className="text-slate-600 shrink-0" />
                    <button onClick={() => handleNavigateUp(i + 1)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-colors border ${i === navigationPath.length - 1 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>{item}</button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </section>

        {viewMode === 'grid' ? (
          <div className="min-h-[300px] animate-view">
             {/* 1. STATES VIEW */}
             {currentViewData.type === 'states' && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                   {(currentViewData.data as any[]).length === 0 ? (
                      <div className="col-span-full py-12 text-center space-y-4">
                        <Info className="mx-auto text-slate-700" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No states available.</p>
                      </div>
                   ) : (
                     (currentViewData.data as any[]).map((state) => (
                        <DrillDownCard 
                          key={state.name}
                          title={state.name}
                          count={state.total}
                          imageUrl={state.image}
                          type="state"
                          onClick={() => handleDrillDown(state.name)}
                        />
                     ))
                   )}
                </div>
             )}

             {/* 2. CITIES VIEW */}
             {currentViewData.type === 'cities' && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                   {(currentViewData.data as any[]).length === 0 ? (
                      <div className="col-span-full py-12 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                        <Info className="mx-auto text-slate-700" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No cities found.</p>
                      </div>
                   ) : (
                     (currentViewData.data as any[]).map((city) => (
                        <DrillDownCard 
                          key={city.name}
                          title={city.name}
                          count={city.count}
                          imageUrl={city.image}
                          type="city"
                          onClick={() => handleDrillDown(city.name)}
                        />
                     ))
                   )}
                </div>
             )}

             {/* 3. SPOTS VIEW */}
             {currentViewData.type === 'spots' && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {visibleSpots.length === 0 ? (
                      <div className="col-span-full py-12 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                        <Info className="mx-auto text-slate-700" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No matching spots found for your filters.</p>
                        <button onClick={resetFilters} className="text-indigo-400 text-[10px] font-black uppercase tracking-widest underline">Reset Filters</button>
                      </div>
                    ) : (
                      visibleSpots.map(spot => (<SpotCard key={spot.id} spot={spot} onClick={() => setSelectedSpot(spot)} />))
                    )}
                  </div>
                  {hasMore && (<button onClick={() => setSpotLimit(prev => prev + 10)} className="w-full py-5 bg-slate-900 border border-slate-800 rounded-3xl text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors active:scale-95 shadow-xl mt-4">Show More <ChevronDown size={14} /></button>)}
                </>
             )}
          </div>
        ) : (
          <div className="w-full h-[60vh] md:h-[75vh] bg-slate-900 rounded-[2.5rem] border border-slate-800 relative overflow-hidden shadow-2xl animate-view z-0">
              {!libLoaded && (<div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-50"><Loader2 className="animate-spin text-indigo-500" /></div>)}
              <div ref={mapContainerRef} id="leaflet-map" className="w-full h-full z-10 bg-slate-900" style={{ touchAction: 'none' }} />
              
              <button
                onClick={handleFindNearest}
                className="absolute bottom-6 right-6 z-20 bg-indigo-500 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-400 active:scale-90 transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
              >
                <Locate size={20} /> <span className="hidden sm:inline">Nearest Spot</span>
              </button>
          </div>
        )}
        
        <button onClick={() => setShowAddSpotForm(true)} className="w-full py-5 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-900/50 transition-colors"><Plus size={16} /> Submit New Spot</button>
      </div>
      
      {/* Filter, Spot Modal, etc. continue... */}
      {/* FILTER PANEL */}
      {showFilterPanel && (
        <div className="fixed inset-0 z-[160] bg-black/95 backdrop-blur-xl flex items-end justify-center">
          <div className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-[3rem] p-8 pb-12 space-y-8 animate-view shadow-2xl">
            <div className="flex justify-between items-center"><h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3"><Filter size={24} className="text-indigo-500" /> Filters</h3><button onClick={() => setShowFilterPanel(false)} className="text-slate-500 active:scale-90 transition-transform"><X size={28} /></button></div>
            <div className="space-y-6">
              <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Discipline</label><div className="flex gap-2">{['all', Discipline.SKATE, Discipline.DOWNHILL].map(d => (<button key={d} onClick={() => setDisciplineFilter(d as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${disciplineFilter === d ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{d}</button>))}</div></div>
              <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Difficulty</label><div className="grid grid-cols-2 gap-2">{['all', Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED].map(d => (<button key={d} onClick={() => setDifficultyFilter(d as any)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${difficultyFilter === d ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{d}</button>))}</div></div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between"><div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Sessions Only</p><p className="text-[8px] text-slate-600 font-bold">Showing spots with pushes planned today</p></div><button onClick={() => setActiveSessionsOnly(!activeSessionsOnly)} className={`w-12 h-6 rounded-full p-1 transition-all ${activeSessionsOnly ? 'bg-indigo-500' : 'bg-slate-800'}`}><div className={`w-4 h-4 rounded-full bg-white transition-all transform ${activeSessionsOnly ? 'translate-x-6' : 'translate-x-0'}`} /></button></div>
            </div>
            <div className="flex gap-4"><button onClick={resetFilters} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-800 active:scale-95 transition-transform">Reset All</button><button onClick={() => setShowFilterPanel(false)} className="flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform">Apply Filters</button></div>
          </div>
        </div>
      )}

      {/* Spot Detail Modal - Responsive Split Layout */}
      {selectedSpot && spotIntel && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex flex-col items-center justify-center p-0 md:p-8 backdrop-blur-md">
          <div className="w-full h-full md:h-[90vh] md:max-w-6xl bg-black md:rounded-[3rem] md:overflow-hidden relative flex flex-col lg:flex-row shadow-2xl border border-white/5 animate-view">
            {/* Split Layout: Image Side */}
            <div className="h-[40vh] md:h-[45vh] lg:h-full lg:w-[45%] bg-slate-800 relative shrink-0">
               {selectedSpot.images && selectedSpot.images.length > 0 ? (
                 <img src={selectedSpot.images[0]} className="h-full w-full object-cover" alt="Spot" />
               ) : (<div className="h-full flex flex-col items-center justify-center bg-slate-900"><MapIcon size={48} className="text-slate-800 mb-2" /><span className="text-[8px] font-black uppercase text-slate-700 tracking-widest">No Media Provided</span></div>)}
               <div className="absolute top-8 left-6 flex gap-3 z-30"><button onClick={() => setSelectedSpot(null)} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white shadow-2xl active:scale-90 transition-transform"><X size={20} /></button></div>
               
               {/* Mobile/Tablet Title Overlay (Hidden on larger screens if desired, but good context) */}
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 lg:hidden">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-lg">{selectedSpot.name}</h2>
               </div>
            </div>
            
            {/* Split Layout: Content Side */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar bg-black lg:border-l lg:border-slate-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Desktop Title */}
                    <h2 className="hidden lg:block text-4xl font-black italic uppercase tracking-tighter leading-none">{selectedSpot.name}</h2>
                    {selectedSpot.verificationStatus === VerificationStatus.VERIFIED && (<div className="bg-indigo-500 text-white p-1 rounded-full shadow-lg"><ShieldCheck size={16} strokeWidth={3} /></div>)}
                  </div>
                  <div className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${selectedSpot.type === Discipline.SKATE ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-white'}`}>{selectedSpot.type}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><MapPin size={14} className="text-indigo-500" /> {selectedSpot.location.address}, {selectedSpot.state}</p>
                   
                   <a 
                     href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.location.lat},${selectedSpot.location.lng}`}
                     target="_blank" 
                     rel="noreferrer"
                     className="bg-white text-black hover:bg-slate-200 border border-transparent px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-white/10 w-full sm:w-auto group"
                   >
                     <NavIcon size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> Get Directions
                   </a>
                </div>
              </div>
              
              {/* TAB SELECTION */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto hide-scrollbar">
                <button onClick={() => setSpotDetailTab('intel')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-4 ${spotDetailTab === 'intel' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500'}`}>Intel</button>
                <button onClick={() => setSpotDetailTab('challenges')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-4 ${spotDetailTab === 'challenges' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500'}`}>Challenges</button>
                <button onClick={() => setSpotDetailTab('sessions')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-4 ${spotDetailTab === 'sessions' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500'}`}>Sessions</button>
              </div>

              {/* SPOT INTEL TAB (Merged Reviews Here) */}
              {spotDetailTab === 'intel' && (
                <div className="space-y-8 animate-view">
                  {/* Intel Content */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1"><div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-slate-500 tracking-widest"><Layers size={10} /> Surface</div><span className="text-xs font-bold text-white truncate" title={spotIntel.surface}>{spotIntel.surface}</span></div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1"><div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-slate-500 tracking-widest"><AlertCircle size={10} /> Risk</div><span className="text-xs font-bold text-white truncate" title={spotIntel.risk}>{spotIntel.risk}</span></div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1"><div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-slate-500 tracking-widest"><Zap size={10} /> Type</div><span className="text-xs font-bold text-white truncate">{selectedSpot.type}</span></div>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed italic opacity-90 border-l-2 border-slate-700 pl-4 py-1">{spotIntel.description}</p>
                  </div>

                  {/* Reviews Section Merged */}
                  <div className="space-y-6 pt-6 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-2"><MessageSquare size={12} className="text-pink-500" /> Community Reviews</h4>
                    </div>

                    {/* Add Review Form */}
                    <form onSubmit={handlePostReview} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rate Spot</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                className="focus:outline-none transition-transform active:scale-90"
                              >
                                <Star size={16} className={star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          value={newReview.text}
                          onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                          placeholder="How's the surface? Security guards? Lighting?"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors h-20 resize-none"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isPostingReview || !newReview.text.trim()}
                        className="w-full py-3 bg-pink-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isPostingReview ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Post Review
                      </button>
                    </form>

                    {/* Review List */}
                    <div className="space-y-4">
                      {(!selectedSpot.reviews || selectedSpot.reviews.length === 0) ? (
                        <div className="text-center py-8 text-slate-600 text-[10px] font-black uppercase tracking-widest">No reviews yet. Be the first!</div>
                      ) : (
                        selectedSpot.reviews.map(review => (
                          <div key={review.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                                  <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${review.userId}`} alt={review.userName} />
                                </div>
                                <div>
                                  <h5 className="text-xs font-black uppercase italic text-white">{review.userName}</h5>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={8} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-800'} />
                                    ))}
                                    <span className="text-[8px] text-slate-500 font-bold ml-1">{review.date}</span>
                                  </div>
                                </div>
                              </div>
                              {review.userDeckId && (
                                <div className="w-6 h-8 rounded bg-black/40 border border-slate-700 overflow-hidden" title="Equipped Deck">
                                   <img src={COLLECTIBLES_DATABASE.find(c => c.id === review.userDeckId)?.imageUrl || ''} className="w-full h-full object-cover" alt="deck" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{review.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* CHALLENGES TAB */}
              {spotDetailTab === 'challenges' && (
                <div className="space-y-6 animate-view">
                   <div className="flex justify-between items-center">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-2"><Trophy size={12} className="text-amber-500" /> Active Challenges</h4>
                     <button onClick={() => setShowCreateChallenge(true)} className="text-[9px] font-black uppercase text-amber-500 hover:text-white transition-colors tracking-widest flex items-center gap-1"><Plus size={12} /> Create</button>
                   </div>

                   {spotChallenges.length === 0 ? (
                     <div className="bg-amber-950/20 border border-amber-900/50 rounded-[2rem] p-8 text-center space-y-4">
                       <Trophy size={32} className="mx-auto text-amber-500/50" />
                       <div className="space-y-1">
                         <h5 className="text-white font-black italic uppercase">No Legends Yet</h5>
                         <p className="text-[10px] text-amber-200/60 font-bold uppercase tracking-widest">Be the first to set the bar at this spot.</p>
                       </div>
                       <button onClick={() => setShowCreateChallenge(true)} className="bg-amber-500 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">Create Challenge</button>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       {spotChallenges.map(challenge => {
                         const isCompleted = userCompletedChallenges.includes(challenge.id);
                         const isUploading = uploadingChallengeId === challenge.id;
                         const submissions = submissionsMap[challenge.id] || [];
                         
                         return (
                           <div key={challenge.id} className={`border p-5 rounded-[2rem] relative overflow-hidden group ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-900 border-slate-800'}`}>
                              <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-1 flex-1 pr-4">
                                  <div className="flex items-center gap-2">
                                    {isCompleted && <div className="bg-green-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest flex items-center gap-1"><Check size={8} strokeWidth={4} /> Completed</div>}
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest border ${
                                      challenge.difficulty === Difficulty.ADVANCED ? 'border-red-500/30 text-red-400' :
                                      challenge.difficulty === Difficulty.INTERMEDIATE ? 'border-amber-500/30 text-amber-400' : 'border-green-500/30 text-green-400'
                                    }`}>{challenge.difficulty}</span>
                                  </div>
                                  <h3 className="text-lg font-black italic uppercase text-white tracking-tight">{challenge.title}</h3>
                                  <p className="text-xs text-slate-400 font-medium">{challenge.description}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">+{challenge.xpReward} XP</span>
                                  <span className="text-[8px] text-slate-600 font-bold uppercase mt-1">{challenge.completions} Completions</span>
                                </div>
                              </div>

                              {/* COMMUNITY REEL */}
                              {submissions.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                                    <PlayCircle size={10} /> Community Cam ({submissions.length})
                                  </p>
                                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                                    {submissions.map(sub => (
                                      <button 
                                        key={sub.id}
                                        onClick={() => setViewingSubmission(sub)}
                                        className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 overflow-hidden relative shrink-0 group/sub hover:border-amber-500 transition-colors"
                                      >
                                        <img src={sub.thumbnailUrl || sub.userAvatar} alt={sub.userName} className="w-full h-full object-cover opacity-80 group-hover/sub:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                          <Play size={10} className="text-white fill-white" />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                    <span className="text-[8px] font-black text-slate-500">{challenge.creatorName.charAt(0)}</span>
                                  </div>
                                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Set by {challenge.creatorName}</span>
                                </div>
                                
                                {!isCompleted && (
                                  <label className={`cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 ${isUploading ? 'opacity-50' : ''}`}>
                                    {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Swords size={12} />}
                                    {isUploading ? 'Uploading...' : 'Prove It'}
                                    <input type="file" accept="video/*" className="hidden" disabled={isUploading} onChange={(e) => handleUploadAttempt(e, challenge.id)} />
                                  </label>
                                )}
                              </div>
                           </div>
                         );
                       })}
                     </div>
                   )}
                </div>
              )}

              {/* SESSIONS TAB */}
              {spotDetailTab === 'sessions' && (
                <div className="space-y-6 animate-view">
                   <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-2"><Calendar size={12} className="text-indigo-500" /> Session Calls</h4><button onClick={() => { setEditingSessionId(null); setShowScheduleForm(true); }} className="bg-indigo-500 text-white p-3 rounded-2xl shadow-xl active:scale-90 transition-transform"><Plus size={20} /></button></div>
                   <div className="grid grid-cols-1 gap-4">
                     {selectedSpot.sessions.length === 0 ? (
                       <div className="col-span-full bg-slate-900/40 border border-slate-800 border-dashed p-8 rounded-[2rem] text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">No pushes planned.</div>
                     ) : (
                       selectedSpot.sessions.map(sess => {
                          const isJoined = sess.attendees.includes(currentUser);
                          return (
                            <div key={sess.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{sess.date}</span>
                                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">@ {sess.time}</span>
                                    </div>
                                    <h4 className="text-lg font-black uppercase italic tracking-tight text-white">{sess.title}</h4>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <div className="flex -space-x-2">
                                      {sess.attendees.slice(0, 3).map((attendee, i) => (
                                        <div key={i} className="w-6 h-6 rounded-full border border-slate-900 bg-slate-800 overflow-hidden">
                                          <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${attendee}`} alt={attendee} className="w-full h-full object-cover" />
                                        </div>
                                      ))}
                                      {sess.attendees.length > 3 && (
                                        <div className="w-6 h-6 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">+{sess.attendees.length - 3}</div>
                                      )}
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Hosted by {sess.userName}</span>
                                  </div>
                                </div>
                                <div className="relative z-10">
                                  {isJoined ? (
                                    <button 
                                      onClick={() => handleOpenChat(sess.id)}
                                      className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                      <MessageCircleMore size={14} /> Open Chat
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleJoinSession(sess.id)}
                                      className="w-full py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                      <UserPlus size={14} /> Join Squad
                                    </button>
                                  )}
                                </div>
                            </div>
                          );
                       })
                     )}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE CHALLENGE MODAL */}
      {showCreateChallenge && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">New Challenge</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Challenge the community</p>
              </div>
              <button onClick={() => setShowCreateChallenge(false)} className="p-2 -mr-2 text-slate-500"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Challenge Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-bold focus:border-amber-500 outline-none"
                  placeholder="e.g. Kickflip the 3-block"
                  value={newChallenge.title}
                  onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Difficulty</label>
                 <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1">
                    {[Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED].map(d => (
                      <button 
                        key={d}
                        type="button"
                        onClick={() => setNewChallenge({...newChallenge, difficulty: d})}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${newChallenge.difficulty === d ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500'}`}
                      >
                        {d}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Requirements / Rules</label>
                <textarea 
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none h-24 resize-none"
                  placeholder="Must land bolts. No toe drag."
                  value={newChallenge.description}
                  onChange={e => setNewChallenge({...newChallenge, description: e.target.value})}
                />
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                 <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">XP Reward:</p>
                 <div className="text-xl font-black italic text-amber-500">
                    {newChallenge.difficulty === Difficulty.BEGINNER ? '+150 XP' : newChallenge.difficulty === Difficulty.INTERMEDIATE ? '+300 XP' : '+500 XP'}
                 </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Swords size={16} /> Post Challenge
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Video Submission Viewer Modal */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4">
           <div className="relative w-full max-w-lg aspect-[9/16] md:aspect-video bg-black rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl animate-view">
              <button 
                onClick={() => setViewingSubmission(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
                    <img src={viewingSubmission.userAvatar} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="text-white text-xs font-black italic uppercase shadow-black drop-shadow-md">{viewingSubmission.userName}</p>
                    <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest drop-shadow-md">{viewingSubmission.date}</p>
                 </div>
              </div>

              <video 
                src={viewingSubmission.videoUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
                loop
              />
           </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Call Session</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Rally the crew at {selectedSpot?.name}</p>
              </div>
              <button onClick={() => setShowScheduleForm(false)} className="p-2 -mr-2 text-slate-500"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddSession} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Session Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-bold focus:border-indigo-500 outline-none"
                  placeholder="e.g. Sunday Morning Shred"
                  value={newSession.title}
                  onChange={e => setNewSession({...newSession, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-indigo-500 outline-none"
                    value={newSession.date}
                    onChange={e => setNewSession({...newSession, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Time</label>
                  <input 
                    type="time" 
                    required 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-indigo-500 outline-none"
                    value={newSession.time}
                    onChange={e => setNewSession({...newSession, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Note</label>
                <textarea 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none h-20 resize-none"
                  placeholder="Meet at the ledges..."
                  value={newSession.note}
                  onChange={e => setNewSession({...newSession, note: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Check size={16} /> Broadcast Call
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Spot Modal */}
      {showAddSpotForm && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view max-h-[90vh] overflow-y-auto hide-scrollbar">
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Drop Pin</h3>
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Share a new spot</p>
               </div>
               <button onClick={() => setShowAddSpotForm(false)} className="p-2 -mr-2 text-slate-500"><X size={20} /></button>
             </div>

             <form onSubmit={handleAddSpotSubmit} className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Spot Name</label>
                   <input 
                     type="text" 
                     required
                     className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-bold focus:border-indigo-500 outline-none"
                     placeholder="Name it something iconic"
                     value={newSpotData.name}
                     onChange={e => setNewSpotData({...newSpotData, name: e.target.value})}
                   />
                </div>

                {/* Location Search */}
                <div className="space-y-2 relative">
                   <div className="flex justify-between">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Location</label>
                      <button type="button" onClick={useCurrentLocation} className="text-[9px] font-bold text-indigo-400 flex items-center gap-1"><MapIcon size={10} /> Current GPS</button>
                   </div>
                   <input 
                     type="text" 
                     required
                     className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none"
                     placeholder="Search area or enter address..."
                     value={locationQuery}
                     onChange={e => handleLocationSearch(e.target.value)}
                   />
                   {showLocationDropdown && locationResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                         {locationResults.map((loc, i) => (
                            <button 
                              key={i} 
                              type="button" 
                              onClick={() => selectLocation(loc)}
                              className="w-full text-left p-3 hover:bg-slate-700 text-xs text-white border-b border-slate-700/50 last:border-0"
                            >
                               {loc.title}
                            </button>
                         ))}
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Type</label>
                      <select 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-indigo-500 outline-none"
                        value={newSpotData.type}
                        onChange={e => setNewSpotData({...newSpotData, type: e.target.value as Discipline})}
                      >
                         <option value={Discipline.SKATE}>Street/Park</option>
                         <option value={Discipline.DOWNHILL}>Downhill</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Difficulty</label>
                      <select 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-indigo-500 outline-none"
                        value={newSpotData.difficulty}
                        onChange={e => setNewSpotData({...newSpotData, difficulty: e.target.value as Difficulty})}
                      >
                         <option value={Difficulty.BEGINNER}>Beginner</option>
                         <option value={Difficulty.INTERMEDIATE}>Intermediate</option>
                         <option value={Difficulty.ADVANCED}>Advanced</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Intel (Surface, Guards, Lights)</label>
                   <textarea 
                     className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none h-24 resize-none"
                     placeholder="Smooth marble? Kicked out fast?..."
                     value={newSpotData.notes}
                     onChange={e => setNewSpotData({...newSpotData, notes: e.target.value})}
                   />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Submit Spot
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Unlock Celebration Modal */}
      {unlockedItem && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-6">
           <div className="flex flex-col items-center text-center space-y-6 animate-view">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-50 animate-pulse"></div>
               <img src={unlockedItem.imageUrl} className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl" alt="Unlocked" />
             </div>
             
             <div className="space-y-2 relative z-10">
               <h2 className="text-sm font-black uppercase tracking-[0.5em] text-indigo-400">Challenge Crushed!</h2>
               <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">{unlockedItem.name}</h1>
               <p className="text-slate-400 text-sm max-w-xs mx-auto">{unlockedItem.description}</p>
             </div>

             <button 
               onClick={() => setUnlockedItem(null)}
               className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
             >
               Collect Reward
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SpotsView;
