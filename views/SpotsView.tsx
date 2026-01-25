
import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Map as MapIcon, 
  Plus, 
  Minus, 
  Zap, 
  Cloud, 
  MapPin, 
  ChevronLeft, 
  Navigation, 
  Calendar, 
  Clock, 
  Trophy, 
  Users, 
  Star, 
  MessageSquare, 
  X, 
  Wind, 
  Droplets, 
  ArrowRight, 
  CheckCircle2, 
  Grid, 
  Bell, 
  SlidersHorizontal, 
  ShieldCheck, 
  Target,     
  Scan,       
  Minimize2, 
  LocateFixed,
  Coffee,
  TrendingUp,
  Video,
  Swords,
  Sun,
  Globe,
  Cross,
  Shield,
  ShoppingBag,
  Siren,
  ChevronUp,
  ChevronDown,
  Activity,
  Info,
  Layers,
  Wrench,
  Mountain,
  Landmark,
  Footprints
} from 'lucide-react';
import { Spot, SpotStatus, SpotCategory, ExtendedSession, Challenge, Review, Difficulty, Discipline } from '../types.ts';
import { ErrorState } from '../components/States.tsx';
import SpotCard from '../components/SpotCard.tsx';
import { triggerHaptic } from '../utils/haptics.ts';
import { playSound } from '../utils/audio.ts';
import { useAppStore } from '../store.ts';
import { backend } from '../services/mockBackend.ts';

// --- GEOLOCATION UTILS ---
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

// Generate consistent mock UV index based on ID
function getMockUV(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 12); // UV 0-11
}

// --- MAP ICON CONFIGURATION ---
const MAP_ICONS = {
    // POIs
    hospital: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h5v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-6z"/></svg>`,
    police: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, 
    shop: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    food: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="8"/><line x1="10" x2="10" y1="2" y2="8"/><line x1="14" x2="14" y1="2" y2="8"/></svg>`,
    
    // SPOTS
    street: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`, 
    downhill: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`, 
    park: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z"/></svg>`, 
    diy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>` 
};

// Full Legend Config
const LEGEND_ITEMS = [
    { id: 'street', label: 'Street', color: '#6366f1', svg: MAP_ICONS.street, type: 'spot' },
    { id: 'downhill', label: 'Downhill', color: '#a855f7', svg: MAP_ICONS.downhill, type: 'spot' },
    { id: 'park', label: 'Skatepark', color: '#f59e0b', svg: MAP_ICONS.park, type: 'spot' },
    { id: 'diy', label: 'DIY Spot', color: '#10b981', svg: MAP_ICONS.diy, type: 'spot' },
    // POIs
    { id: 'hospital', label: 'Medi-Bay', color: '#ef4444', svg: MAP_ICONS.hospital, type: 'poi' },
    { id: 'police', label: 'Enforcers', color: '#3b82f6', svg: MAP_ICONS.police, type: 'poi' },
    { id: 'shop', label: 'Supply', color: '#10b981', svg: MAP_ICONS.shop, type: 'poi' },
    { id: 'food', label: 'Fuel', color: '#f59e0b', svg: MAP_ICONS.food, type: 'poi' },
];

function generateMockPOIs(centerLat: number, centerLng: number, count: number) {
    const poiTypes = LEGEND_ITEMS.filter(i => i.type === 'poi');
    return Array.from({ length: count }).map((_, i) => {
        const type = poiTypes[Math.floor(Math.random() * poiTypes.length)];
        const lat = centerLat + (Math.random() - 0.5) * 0.36;
        const lng = centerLng + (Math.random() - 0.5) * 0.36;
        return { id: `poi-${i}`, lat, lng, ...type };
    });
}

// --- TYPES ---
type ViewMode = 'map' | 'grid';
type SheetMode = 'none' | 'quick-info' | 'full-detail';
type ModalType = 'none' | 'create-session' | 'create-challenge' | 'add-intel' | 'add-spot';
type FilterType = 'ALL' | Discipline | 'VERIFIED' | 'UV_SAFE';

type SearchSuggestion = {
  type: 'spot' | 'location';
  text: string;
  data?: Spot;
};

const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'Spot Verified', desc: 'Carter Road is now verified.', time: '2h', read: false },
    { id: 2, title: 'New Challenger', desc: 'Rahul beat your high score.', time: '5h', read: false },
    { id: 3, title: 'Rain Alert', desc: 'Light showers reported near you.', time: '1d', read: true }
];

const SpotsView: React.FC = () => {
  const { 
    user,
    location: userCoords, 
    spots: allSpots, 
    sessions: allSessions,
    challenges: allChallenges,
    error: isError,
    refreshSessions,
    setUserLocation
  } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [activeSheet, setActiveSheet] = useState<SheetMode>('none');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(false);
  const [isLocating, setIsLocating] = useState(false); 
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  
  const [localSessions, setLocalSessions] = useState<ExtendedSession[]>([]);
  const [localChallenges, setLocalChallenges] = useState<Challenge[]>([]);
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  
  const [visibleCount, setVisibleCount] = useState(10); 
  const [pois, setPois] = useState<any[]>([]);
  
  // New States for Dock/Zoom
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(15);

  const [sessionForm, setSessionForm] = useState({ 
    title: '', 
    date: new Date().toISOString().split('T')[0], 
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
    notes: '',
    intent: 'Chill' 
  });
  const [challengeForm, setChallengeForm] = useState({ title: '', desc: '', difficulty: Difficulty.INTERMEDIATE });
  const [intelForm, setIntelForm] = useState({ rating: 5, text: '' });
  const [spotForm, setSpotForm] = useState({ name: '', type: Discipline.SKATE, description: '' });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const poisLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [weather] = useState({ temp: 24, wind: 12, condition: 'Clear', humidity: 65 });

  useEffect(() => {
      setLocalSessions(allSessions);
      setLocalChallenges(allChallenges);
  }, [allSessions, allChallenges]);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, activeFilter]);

  // Generate Mock POIs
  useEffect(() => {
      let center = userCoords || { lat: 20.5937, lng: 78.9629 };
      if (selectedSpot) {
          center = selectedSpot.location;
      }
      setPois(generateMockPOIs(center.lat, center.lng, 12));
  }, [userCoords, selectedSpot]);

  const filteredSpots = useMemo(() => {
    let result = allSpots;
    
    if (activeFilter === 'VERIFIED') {
        result = result.filter(s => s.isVerified);
    } else if (activeFilter === 'UV_SAFE') {
        result = result.filter(s => getMockUV(s.id) < 5);
    } else if (activeFilter !== 'ALL') {
        result = result.filter(s => s.type === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.state.toLowerCase().includes(q) ||
        s.location.address.toLowerCase().includes(q)
      );
    }
    
    const withDistance = result.map(s => {
        let dist = 0;
        if (userCoords) {
             dist = getDistanceFromLatLonInKm(userCoords.lat, userCoords.lng, s.location.lat, s.location.lng);
             dist = dist * 1000;
        } else {
             dist = s.distance || Math.random() * 5000 + 500;
        }
        return { ...s, distance: dist };
    });
    
    return withDistance.sort((a, b) => a.distance - b.distance);
  }, [allSpots, searchQuery, userCoords, activeFilter]);

  // Use mapSpots for markers (show more context on map) and drawerSpots for the list UI
  const mapSpots = useMemo(() => filteredSpots.slice(0, 50), [filteredSpots]);
  const drawerSpots = useMemo(() => filteredSpots.slice(0, visibleCount), [filteredSpots, visibleCount]);
  const hasMoreSpots = filteredSpots.length > visibleCount;

  useEffect(() => {
    if (searchQuery.length > 1) {
        const lowerQ = searchQuery.toLowerCase();
        const results: SearchSuggestion[] = [];
        const seen = new Set<string>();

        allSpots.forEach(s => {
            if (s.name.toLowerCase().includes(lowerQ) && !seen.has(s.name)) {
                results.push({ type: 'spot', text: s.name, data: s });
                seen.add(s.name);
            }
        });

        allSpots.forEach(s => {
            if (s.state.toLowerCase().includes(lowerQ) && !seen.has(s.state)) {
                results.push({ type: 'location', text: s.state });
                seen.add(s.state);
            }
            s.location.address.split(',').forEach(part => {
                const p = part.trim();
                if (p.toLowerCase().includes(lowerQ) && !seen.has(p)) {
                    results.push({ type: 'location', text: p });
                    seen.add(p);
                }
            });
        });

        setSuggestions(results.slice(0, 6));
        setShowSuggestions(true);
    } else {
        setSuggestions([]);
        setShowSuggestions(false);
    }
  }, [searchQuery, allSpots]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
      setSearchQuery(suggestion.text);
      setShowSuggestions(false);
      triggerHaptic('light');
      
      if (suggestion.type === 'spot' && suggestion.data) {
          handleSpotSelect(suggestion.data);
      }
  };

  const handleCloseCard = (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      triggerHaptic('light');
      setActiveSheet('none');
      setSelectedSpot(null);
      setIsCheckedIn(false);
      setShowFilters(false);
      setShowNotifications(false);
  };

  const handleSpotSelect = (spot: Spot) => {
    setSelectedSpot(spot);
    setActiveSheet('quick-info');
    triggerHaptic('medium');
    playSound('click');
    setIsCheckedIn(false);
    
    const targetLat = spot.location.lat - (0.0020); 
    mapInstanceRef.current?.flyTo([targetLat, spot.location.lng], 16, { 
        duration: 1.5,
        easeLinearity: 0.2
    });
  };

  const handleCloseCardRef = useRef(handleCloseCard);
  const handleSpotSelectRef = useRef(handleSpotSelect);
  
  useEffect(() => {
      handleCloseCardRef.current = handleCloseCard;
      handleSpotSelectRef.current = handleSpotSelect;
  });

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
            handleCloseCardRef.current(); 
            setShowSuggestions(false);
        });

        map.on('zoomend', () => {
            const z = map.getZoom();
            setZoomLevel(z);
        });

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
        poisLayerRef.current = L.layerGroup().addTo(map);
        
        if (userCoords) {
             map.flyTo([userCoords.lat, userCoords.lng], 12, { duration: 1.5 }); // City level zoom
        }
    }
  }, []);

  // Update User Marker
  useEffect(() => {
      const L = (window as any).L;
      if (mapInstanceRef.current && L && userCoords) {
          if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
          } else {
              const userIcon = L.divIcon({
                  className: 'bg-transparent',
                  html: `
                    <div class="relative w-10 h-10 flex items-center justify-center">
                      <div class="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-30"></div>
                      <div class="relative w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center z-10">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M4 12h16"/></svg>
                      </div>
                    </div>
                  `,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
              });
              userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
          }
      }
  }, [userCoords]);

  // Update POI Markers
  useEffect(() => {
      const L = (window as any).L;
      if (mapInstanceRef.current && poisLayerRef.current && L) {
          poisLayerRef.current.clearLayers();
          
          if (zoomLevel > 8) {
              pois.forEach(poi => {
                  const html = `
                    <div class="w-6 h-6 rounded-md flex items-center justify-center shadow-lg border border-black/50 text-white" style="background-color: ${poi.color}">
                        ${poi.svg}
                    </div>
                  `;
                  L.marker([poi.lat, poi.lng], {
                      icon: L.divIcon({ className: 'bg-transparent', html: html, iconSize: [24, 24], iconAnchor: [12, 12] }),
                      zIndexOffset: -10 
                  }).addTo(poisLayerRef.current);
              });
          }
      }
  }, [pois, zoomLevel]);

  // Update Spot Markers - Uses categorized icons
  useEffect(() => {
      const L = (window as any).L;
      if (mapInstanceRef.current && markersLayerRef.current && L) {
          markersLayerRef.current.clearLayers();

          mapSpots.forEach(spot => {
            const isSelected = spot.id === selectedSpot?.id;
            
            // Determine config based on category/type
            let config = LEGEND_ITEMS.find(item => item.id === 'street'); // default
            if (spot.type === Discipline.DOWNHILL) config = LEGEND_ITEMS.find(item => item.id === 'downhill');
            else if (spot.category === SpotCategory.PARK) config = LEGEND_ITEMS.find(item => item.id === 'park');
            else if (spot.category === SpotCategory.DIY) config = LEGEND_ITEMS.find(item => item.id === 'diy');
            
            const color = config?.color || '#6366f1';
            const svg = config?.svg || MAP_ICONS.street;
            
            const html = `
               <div class="relative w-8 h-8 flex items-center justify-center group transition-transform duration-300 ${isSelected ? 'scale-150' : 'hover:scale-125'}">
                  <div class="absolute inset-0 rounded-full animate-breathe opacity-50" style="background-color: ${color}"></div>
                  <div class="relative w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white" style="background-color: ${color}">
                      ${svg}
                  </div>
               </div>
            `;

            const marker = L.marker([spot.location.lat, spot.location.lng], {
              icon: L.divIcon({ className: 'bg-transparent', html: html, iconSize: [32, 32], iconAnchor: [16, 16] })
            });

            marker.on('click', (e: any) => {
                L.DomEvent.stopPropagation(e);
                handleSpotSelectRef.current(spot);
            });
            
            marker.addTo(markersLayerRef.current);
          });
      }
  }, [mapSpots, selectedSpot]);

  const handleZoomIn = (e: React.MouseEvent) => { e.stopPropagation(); triggerHaptic('light'); mapInstanceRef.current?.zoomIn(); };
  const handleZoomOut = (e: React.MouseEvent) => { e.stopPropagation(); triggerHaptic('light'); mapInstanceRef.current?.zoomOut(); };
  
  const handleCenterOnUser = (e: React.MouseEvent) => {
      e.stopPropagation();
      triggerHaptic('medium');
      const flyTo = (lat: number, lng: number) => {
           if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([lat, lng], 12, { duration: 1.5, easeLinearity: 0.25 }); // Changed to 12 for City Level
           }
      };
      if (userCoords) {
          flyTo(userCoords.lat, userCoords.lng);
      } else if (navigator.geolocation) {
          setIsLocating(true);
          navigator.geolocation.getCurrentPosition(
              (pos) => {
                  setIsLocating(false);
                  setUserLocation(pos.coords.latitude, pos.coords.longitude);
                  flyTo(pos.coords.latitude, pos.coords.longitude);
              },
              () => { setIsLocating(false); alert("GPS Signal Lost. Check permissions."); },
              { enableHighAccuracy: true }
          );
      } else { alert("GPS not supported on this device."); }
  };

  const handleCountryView = (e: React.MouseEvent) => {
      e.stopPropagation();
      triggerHaptic('heavy');
      playSound('retro_unlock');
      if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([20.5937, 78.9629], 5, { duration: 2.0, easeLinearity: 0.25 });
      }
  };

  const toggleViewMode = () => { triggerHaptic('medium'); setViewMode(prev => prev === 'map' ? 'grid' : 'map'); };
  const toggleNotifications = () => { triggerHaptic('medium'); setShowNotifications(!showNotifications); setShowFilters(false); };
  const toggleFilters = () => { triggerHaptic('light'); setShowFilters(!showFilters); setShowNotifications(false); };
  const toggleDrawer = (e: React.MouseEvent) => { e.stopPropagation(); setIsDrawerOpen(!isDrawerOpen); triggerHaptic('medium'); };
  const handleShowMore = (e: React.MouseEvent) => { e.stopPropagation(); triggerHaptic('medium'); setVisibleCount(prev => prev + 5); };
  const toggleWeather = () => { triggerHaptic('light'); setIsWeatherExpanded(!isWeatherExpanded); };

  const handleCheckIn = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!userCoords || !selectedSpot) { triggerHaptic('error'); alert("GPS signal lost. Cannot verify location."); return; }
      const distance = getDistanceFromLatLonInKm(userCoords.lat, userCoords.lng, selectedSpot.location.lat, selectedSpot.location.lng);
      if (distance > 0.5) { triggerHaptic('error'); playSound('error'); alert(`You are too far away to check in!\nDistance: ${distance.toFixed(2)}km\nRequired: < 0.5km`); return; }
      triggerHaptic('success'); playSound('success'); setIsCheckedIn(true);
  };

  const handleNavigate = () => { if (!selectedSpot) return; triggerHaptic('medium'); window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.location.lat},${selectedSpot.location.lng}`, '_blank'); };
  const handleJoinSession = async (sessionId: string) => { triggerHaptic('medium'); await backend.joinSession(sessionId); refreshSessions(); playSound('success'); };

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
          notes: sessionForm.notes,
          intent: sessionForm.intent
      });
      setLocalSessions(prev => [...prev, newSession]);
      refreshSessions();
      setActiveModal('none');
      playSound('success');
      setSessionForm({ title: '', date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), notes: '', intent: 'Chill' });
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

  const submitSpot = () => {
    if (!spotForm.name) return;
    triggerHaptic('success'); playSound('success'); setActiveModal('none'); alert(`Spot "${spotForm.name}" submitted for verification.`); setSpotForm({ name: '', type: Discipline.SKATE, description: '' });
  };

  if (isError) return <ErrorState onRetry={() => window.location.reload()} message={isError} />;

  const spotSessions = localSessions.filter(s => s.spotId === selectedSpot?.id);
  const spotChallenges = localChallenges.filter(c => c.spotId === selectedSpot?.id);

  return (
    <div className="relative h-full w-full bg-[#020202] overflow-hidden isolate">
      <style>{`
        @keyframes enter-sheet { 0% { transform: translateY(100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes enter-modal { 0% { opacity: 0; transform: scale(0.96) translateY(8px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes enter-pop { 0% { opacity: 0; transform: scale(0.9) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-sheet { animation: enter-sheet 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards; }
        .animate-modal { animation: enter-modal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop { animation: enter-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      {/* ----------------- MAP LAYER (FIXED z-0) ----------------- */}
      <div className="absolute inset-0 z-0 h-full w-full pointer-events-auto">
          <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* ----------------- MAP LEGEND (SECTOR KEY) ----------------- */}
      <div className={`absolute bottom-32 left-4 z-20 pointer-events-none transition-all duration-500 ${zoomLevel > 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
          <div className="pointer-events-auto flex flex-col items-start gap-2">
              <button 
                  onClick={() => { setIsLegendOpen(!isLegendOpen); triggerHaptic('light'); }}
                  className={`flex items-center gap-2 bg-[#050505]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden group ${isLegendOpen ? 'rounded-t-2xl rounded-b-none px-4 py-3 bg-[#0b0c10]' : 'h-12 w-12 rounded-full justify-center hover:bg-slate-900'}`}
              >
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${isLegendOpen ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                      {isLegendOpen ? <ChevronDown size={14} /> : <Layers size={16} />}
                  </div>
                  {isLegendOpen && (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap animate-view">
                          Sector Key
                      </span>
                  )}
              </button>

              {isLegendOpen && (
                  <div className="bg-[#050505]/90 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-2xl rounded-tr-2xl p-4 pt-2 shadow-2xl flex flex-col gap-3 min-w-[160px] animate-pop origin-top-left">
                      {LEGEND_ITEMS.map(item => (
                          <div key={item.id} className="flex items-center gap-3 group">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shadow-sm text-black relative overflow-hidden transition-transform group-hover:scale-110" style={{ backgroundColor: item.color }}>
                                  <div className="absolute inset-0 bg-white/20"></div>
                                  <div dangerouslySetInnerHTML={{ __html: item.svg }} className="relative z-10 w-3.5 h-3.5" />
                              </div>
                              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wide group-hover:text-white transition-colors">{item.label}</span>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* ----------------- TOP HUD (z-30) ----------------- */}
      <div className="absolute top-0 left-0 w-full z-30 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pointer-events-none bg-gradient-to-b from-[#020202] via-[#020202]/80 to-transparent pb-24">
         <div className="flex items-start gap-3 pointer-events-auto max-w-full">
            <div className="shrink-0 pt-1">
               <div className="w-10 h-10 rounded-full border border-white/10 bg-[#0b0c10] overflow-hidden shadow-lg relative z-10">
                   <img src={user?.avatar} className="w-full h-full object-cover" />
               </div>
               <div className="mt-2">
                   <button onClick={toggleWeather} className={`flex items-center gap-2 bg-[#0b0c10]/80 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 transition-all duration-300 overflow-hidden ${isWeatherExpanded ? 'pr-4 w-auto' : 'w-10'} shadow-lg`}>
                        <div className="flex items-center justify-center w-6 h-6 shrink-0 text-slate-400">{isWeatherExpanded ? <Cloud size={10} /> : <span className="text-[9px] font-mono font-bold text-white">{weather.temp}°</span>}</div>
                        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isWeatherExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}><span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{weather.condition}</span><span className="flex items-center gap-1 text-[9px] text-slate-500 whitespace-nowrap"><Wind size={8} /> {weather.wind}</span></div>
                    </button>
               </div>
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col gap-2 relative z-[60]">
               <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={14} className="text-slate-400 group-focus-within:text-indigo-400 transition-colors" /></div>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => { if (searchQuery.length > 1) setShowSuggestions(true); }} placeholder="SEARCH_SECTOR..." className="w-full bg-[#0b0c10]/90 backdrop-blur-xl border border-white/10 rounded-xl py-3 pl-9 pr-10 text-[10px] font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-black focus:ring-1 focus:ring-indigo-500/20 transition-all uppercase tracking-wide shadow-2xl font-mono" />
                  <div className="absolute inset-y-0 right-0 pr-1 flex items-center"><button onClick={toggleFilters} className={`p-2 rounded-lg transition-colors ${showFilters ? 'text-indigo-400 bg-white/5' : 'text-slate-500 hover:text-white'}`}><SlidersHorizontal size={14} /></button></div>
                  {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-[#0b0c10]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-pop">
                          <ul className="divide-y divide-white/5">
                              {suggestions.map((suggestion, idx) => (
                                  <li key={idx} onClick={() => handleSuggestionClick(suggestion)} className="px-4 py-3 text-[10px] font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer flex items-center gap-3 uppercase tracking-wide group">
                                      {suggestion.type === 'spot' ? <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors"><Target size={12} /></div> : <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-slate-700 group-hover:text-white transition-colors"><MapPin size={12} /></div>}
                                      <span className={suggestion.type === 'spot' ? 'text-white' : 'text-slate-400'}>{suggestion.text}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
               </div>

               {showFilters && (
                   <div className="flex gap-2 flex-wrap animate-modal bg-[#0b0c10]/90 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-xl origin-top">
                       {[{ id: 'ALL', label: 'All Spots' }, { id: Discipline.SKATE, label: 'Street' }, { id: Discipline.DOWNHILL, label: 'Downhill' }, { id: 'VERIFIED', label: 'Verified', icon: ShieldCheck }, { id: 'UV_SAFE', label: 'Sun Safe (Low UV)', icon: Sun }].map((f) => {
                           const isActive = activeFilter === f.id;
                           return <button key={f.id} onClick={() => { setActiveFilter(f.id as FilterType); triggerHaptic('light'); }} className={`px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-wide transition-all border flex items-center gap-1 ${isActive ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>{f.icon && <f.icon size={10} />}{f.label}</button>
                       })}
                   </div>
               )}
            </div>

            <div className="flex gap-2 shrink-0 relative">
                <div className="relative">
                    <button onClick={toggleNotifications} className={`w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg ${showNotifications ? 'bg-indigo-600' : 'bg-[#0b0c10]/80 backdrop-blur hover:bg-slate-800'}`}>
                        <Bell size={18} />
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-black"></div>
                    </button>
                    {showNotifications && (
                        <div className="absolute top-12 right-0 w-64 bg-[#0b0c10] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-modal origin-top-right z-50">
                            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-slate-900/50"><span className="text-[10px] font-black uppercase text-white tracking-widest">System Alerts</span><button onClick={() => setShowNotifications(false)}><X size={12} className="text-slate-500" /></button></div>
                            <div className="max-h-48 overflow-y-auto hide-scrollbar">
                                {MOCK_NOTIFICATIONS.map(n => (<div key={n.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors"><div className="flex justify-between items-start mb-1"><h4 className="text-[10px] font-bold text-white uppercase">{n.title}</h4><span className="text-[8px] text-slate-500">{n.time}</span></div><p className="text-[9px] text-slate-400 leading-tight">{n.desc}</p></div>))}
                            </div>
                        </div>
                    )}
                </div>
                <button onClick={toggleViewMode} className={`w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg ${viewMode === 'grid' ? 'bg-indigo-600' : 'bg-[#0b0c10]/80 backdrop-blur hover:bg-slate-800'}`}>{viewMode === 'grid' ? <MapIcon size={18} /> : <Grid size={18} />}</button>
            </div>
         </div>
      </div>

      <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 transition-all duration-500 pointer-events-none ${viewMode === 'grid' ? 'translate-x-20 opacity-0' : 'translate-x-0 opacity-100'}`}>
           <div className="pointer-events-auto bg-[#0b0c10]/90 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1">
                <button onClick={handleCenterOnUser} className="w-10 h-10 flex items-center justify-center text-white rounded-lg hover:bg-white/10 active:scale-95 transition-all"><LocateFixed size={20} className={isLocating ? "animate-pulse text-indigo-400" : ""} /></button>
                <div className="h-px w-6 bg-white/10 mx-auto" />
                <button onClick={handleZoomIn} className="w-10 h-10 flex items-center justify-center text-white rounded-lg hover:bg-white/10 active:scale-95 transition-all"><Plus size={20} /></button>
                <div className="h-px w-6 bg-white/10 mx-auto" />
                <button onClick={handleZoomOut} className="w-10 h-10 flex items-center justify-center text-white rounded-lg hover:bg-white/10 active:scale-95 transition-all"><Minus size={20} /></button>
           </div>
           
           <button onClick={handleCountryView} className={`pointer-events-auto mt-2 w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border backdrop-blur-md overflow-hidden relative bg-[#0b0c10]/90 border-white/10 text-indigo-400`}><Globe size={20} className="relative z-10" /></button>
           <button onClick={() => setActiveModal('add-spot')} className="pointer-events-auto mt-2 w-11 h-11 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border backdrop-blur-md overflow-hidden relative bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500"><Plus size={22} strokeWidth={3} /></button>
      </div>

      {viewMode === 'map' && activeSheet === 'none' && (
        <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+4rem)] left-0 w-full z-20 flex flex-col justify-end pointer-events-none pb-0">
             
             {/* Collapsible Dock Handle - Restyled */}
             <div className="pointer-events-auto flex justify-center mb-4">
                 <button 
                    onClick={(e) => toggleDrawer(e)}
                    className="bg-[#1a1a1a] border border-white/10 px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl active:scale-95 transition-all group hover:bg-[#252525] hover:border-white/20"
                 >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white group-hover:text-indigo-400 transition-colors">
                        {isDrawerOpen ? 'Close Scanner' : `Scan Nearby (${filteredSpots.length})`}
                    </span>
                    <div className={`bg-slate-800 rounded-full p-1 transition-transform duration-300 ${isDrawerOpen ? 'rotate-180' : ''}`}>
                        <ChevronUp size={12} className="text-slate-400" />
                    </div>
                 </button>
             </div>

             {/* Collapsible Cards Container using drawerSpots (limited count) */}
             <div className={`transition-all duration-500 ease-in-out origin-bottom ${isDrawerOpen ? 'max-h-64 opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-10'}`}>
                 <div className="w-full overflow-x-auto hide-scrollbar px-6 flex gap-4 snap-x snap-mandatory pointer-events-auto relative z-10 pb-4">
                     {drawerSpots.map(spot => (
                       <div className="snap-center shrink-0 w-48" key={spot.id}>
                            <SpotCard spot={spot} onClick={() => handleSpotSelect(spot)} />
                       </div>
                     ))}
                     
                     {hasMoreSpots && (
                        <button onClick={handleShowMore} className="snap-center shrink-0 w-16 bg-[#0b0c10]/50 backdrop-blur border border-white/10 rounded-2xl flex items-center justify-center active:scale-95"><ArrowRight size={20} className="text-slate-400" /></button>
                     )}
                 </div>
             </div>
        </div>
      )}

      {viewMode === 'grid' && (
          <div className="absolute inset-0 z-50 bg-[#020202]/95 backdrop-blur-xl flex flex-col animate-sheet h-full overflow-y-auto">
              <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
              
              <div className="pt-[calc(env(safe-area-inset-top)+1rem)] px-6 pb-6 flex justify-between items-end bg-gradient-to-b from-[#020202] via-[#020202] to-transparent z-20 shrink-0 border-b border-white/5 sticky top-0">
                 <div>
                    <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-[0.85] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Sector<br/>Grid</h1>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-2">{drawerSpots.length} Locations Active</p>
                 </div>
                 <button onClick={() => setViewMode('map')} className="w-10 h-10 rounded-full bg-[#0b0c10] border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-slate-800"><X size={20} /></button>
              </div>

              <div className="flex-1 px-4 pt-4 pb-32 hide-scrollbar relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                      {drawerSpots.map(spot => (
                          <div key={spot.id} onClick={() => { setSelectedSpot(spot); setActiveSheet('full-detail'); }} className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-4 flex flex-col justify-between h-48 relative group active:scale-95 transition-all shadow-lg overflow-hidden">
                             <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded border border-white/5 backdrop-blur-sm z-10"><span className="text-[8px] font-black uppercase tracking-widest text-slate-300">{spot.type}</span></div>
                             <div className={`absolute bottom-4 right-4 w-2 h-2 rounded-full ${spot.status === SpotStatus.WET ? 'bg-blue-500' : spot.status === SpotStatus.CROWDED ? 'bg-amber-500' : 'bg-green-500'} shadow-[0_0_8px_currentColor] z-10`} />
                             <div className="mt-auto z-10 space-y-1 relative">
                                <h3 className="text-sm font-black italic uppercase text-white leading-none pr-4 break-words">{spot.name}</h3>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest"><MapPin size={10} className="text-indigo-400" /> {(spot.distance! / 1000).toFixed(1)}KM</div>
                             </div>
                             <div className="absolute inset-0 z-0"><img src={spot.images?.[0] || `https://picsum.photos/seed/${spot.id}/200`} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" /><div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/50 to-transparent" /></div>
                          </div>
                      ))}
                      {hasMoreSpots && <button onClick={handleShowMore} className="col-span-2 py-6 rounded-[2rem] border border-white/10 bg-[#0b0c10] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95 group"><span className="group-hover:scale-105 transition-transform">Load More Sectors ({filteredSpots.length - visibleCount})</span></button>}
                  </div>
              </div>
          </div>
      )}

      {activeSheet === 'quick-info' && selectedSpot && (
        <div className="absolute bottom-0 left-0 w-full z-[60] pointer-events-none animate-sheet">
           <div className="pointer-events-auto w-full bg-[#0b0c10] border-t border-white/10 rounded-t-[2.5rem] p-6 pb-[calc(env(safe-area-inset-bottom)+5rem)] shadow-2xl relative">
              <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-6" />
              <div className="absolute -top-14 right-6 pointer-events-auto animate-modal"><button onClick={(e) => handleCloseCard(e)} className="w-12 h-12 bg-[#0b0c10]/90 backdrop-blur-md text-white rounded-full border border-white/10 flex items-center justify-center shadow-2xl active:scale-90 transition-all hover:bg-slate-800"><Minimize2 size={20} /></button></div>
              <div className="flex gap-5 items-start">
                  <div onClick={() => setActiveSheet('full-detail')} className="w-24 h-24 rounded-2xl bg-slate-800 overflow-hidden shrink-0 relative border border-white/5 group cursor-pointer"><img src={selectedSpot.images?.[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /></div>
                  <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-start mb-1"><h3 onClick={() => setActiveSheet('full-detail')} className="text-2xl font-black italic text-white uppercase truncate leading-none tracking-tight cursor-pointer hover:text-indigo-400 transition-colors">{selectedSpot.name}</h3><button onClick={(e) => handleCloseCard(e)} className="p-1 -mr-2 text-slate-600 hover:text-white"><X size={20} /></button></div>
                      <div className="flex items-center gap-3 mb-4"><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedSpot.type}</span><div className="w-1 h-1 bg-slate-700 rounded-full" /><span className={`text-[10px] font-black font-mono uppercase tracking-wide ${selectedSpot.status === SpotStatus.WET ? 'text-blue-400' : selectedSpot.status === SpotStatus.CROWDED ? 'text-amber-400' : 'text-green-400'}`}>{selectedSpot.status === SpotStatus.WET ? 'WET' : selectedSpot.status === SpotStatus.CROWDED ? 'HIGH_TRAFFIC' : 'PRIME'}</span><div className="w-1 h-1 bg-slate-700 rounded-full" /><div className="flex items-center gap-1.5"><MapPin size={10} className="text-slate-500" /><span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide truncate max-w-[120px]">{(selectedSpot.distance! / 1000).toFixed(1)} KM</span></div></div>
                      <div className="flex gap-2"><button onClick={() => setActiveSheet('full-detail')} className="flex-1 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-slate-200">View Intel</button><button onClick={handleCheckIn} disabled={isCheckedIn} className={`px-4 py-3 rounded-xl flex items-center justify-center active:scale-95 transition-all border ${isCheckedIn ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-700'}`}>{isCheckedIn ? <CheckCircle2 size={16} /> : <MapPin size={16} />}</button></div>
                  </div>
              </div>
           </div>
        </div>
      )}

      {activeSheet === 'full-detail' && selectedSpot && (
        <div className="absolute inset-0 z-[100] bg-[#020202] overflow-y-auto animate-sheet h-full">
           <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
           <div className="h-64 w-full relative z-10">
               <img src={selectedSpot.images?.[0] || 'https://images.unsplash.com/photo-1520156584189-1e4529f8c9b3?w=800'} className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent" />
               <button onClick={() => setActiveSheet('none')} className="absolute top-6 left-4 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/10 z-20 active:scale-90 transition-all"><ChevronLeft size={24} /></button>
               <button onClick={() => setActiveSheet('none')} className="absolute top-6 right-4 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/10 z-20 active:scale-90"><X size={20} /></button>
               <div className="absolute bottom-4 left-6 right-6 z-10">
                   <div className="flex gap-2 mb-2"><span className="bg-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-white">{selectedSpot.type}</span><span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1 ${selectedSpot.status === SpotStatus.WET ? 'bg-blue-500' : 'bg-green-500'}`}>{selectedSpot.status === SpotStatus.WET ? <Droplets size={10} /> : <Zap size={10} />}{selectedSpot.status || 'Active'}</span></div>
                   <h1 className="text-4xl font-black italic uppercase text-white leading-none mb-2 tracking-tight">{selectedSpot.name}</h1>
                   <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wide"><span className="flex items-center gap-1"><MapPin size={12} className="text-indigo-400" /> {(selectedSpot.distance! / 1000).toFixed(1)} KM Away</span><span className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" /> {selectedSpot.rating}</span></div>
               </div>
           </div>

           <div className="p-6 space-y-8 pb-32 relative z-10">
               <div className="grid grid-cols-2 gap-3">
                   <button onClick={handleNavigate} className="py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"><Navigation size={14} /> Navigate</button>
                   <button onClick={handleCheckIn} disabled={isCheckedIn} className={`py-3 border rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform ${isCheckedIn ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-[#0b0c10] border-slate-800 text-white'}`}>{isCheckedIn ? <CheckCircle2 size={14} /> : <MapPin size={14} />} {isCheckedIn ? 'Checked In' : 'Check In'}</button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-4 space-y-2">
                       <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest"><Cloud size={12} /> Live Conditions</div>
                       <div className="flex items-end gap-2"><span className="text-2xl font-black text-white">{weather.temp}°</span><span className="text-xs font-bold text-slate-500 mb-1">{weather.condition}</span></div>
                       <div className="flex gap-3 text-[9px] font-bold text-slate-500"><span className="flex items-center gap-1"><Wind size={10} /> {weather.wind}km/h</span><span className="flex items-center gap-1"><Droplets size={10} /> {weather.humidity}%</span></div>
                   </div>
                   <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-4 space-y-2">
                       <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest"><Users size={12} /> Active Now</div>
                       <div className="flex -space-x-2 pt-1">
                           {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0b0c10] bg-slate-800 flex items-center justify-center text-[8px] text-white font-bold"><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i}`} className="w-full h-full rounded-full" /></div>)}
                           <div className="w-8 h-8 rounded-full border-2 border-[#0b0c10] bg-slate-800 flex items-center justify-center text-[8px] text-slate-400 font-bold">+12</div>
                       </div>
                   </div>
               </div>

               <div className="space-y-6">
                   <section className="space-y-3">
                       <div className="flex justify-between items-center"><h3 className="text-sm font-black uppercase italic text-white tracking-widest">Active Sessions</h3><button onClick={() => setActiveModal('create-session')} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white flex items-center gap-1"><Plus size={12} /> Plan Meet</button></div>
                       {spotSessions.length > 0 ? (
                           spotSessions.map(session => {
                             const isJoined = session.participants?.includes(user?.id || '');
                             return (
                               <div key={session.id} className="bg-[#0b0c10] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                                   <div className="flex justify-between items-start mb-3">
                                       <div>
                                            <h4 className="text-xs font-black uppercase text-white italic">{session.title}</h4>
                                            <div className="flex gap-2 text-[9px] font-bold text-slate-500 uppercase mt-1"><span className="flex items-center gap-1"><Clock size={10} /> {session.time}</span><span className="flex items-center gap-1"><Calendar size={10} /> {session.date}</span></div>
                                       </div>
                                       <button onClick={() => handleJoinSession(session.id)} disabled={isJoined} className={`px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${isJoined ? 'bg-green-900/20 text-green-400' : 'bg-indigo-600 text-white'}`}>{isJoined ? 'Joined' : 'Join'}</button>
                                   </div>
                                   {session.notes && <div className="pt-2 border-t border-white/5 mt-1"><p className="text-[9px] text-slate-400 italic">"{session.notes}"</p></div>}
                                   {session.intent && <div className="mt-2 flex"><span className="text-[8px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">Vibe: {session.intent}</span></div>}
                               </div>
                             );
                           })
                       ) : <div className="text-center py-6 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800"><p className="text-[10px] font-bold text-slate-600 uppercase">No active sessions.</p></div>}
                   </section>

                   <section className="space-y-3">
                       <div className="flex justify-between items-center"><h3 className="text-sm font-black uppercase italic text-white tracking-widest">Challenges</h3><button onClick={() => setActiveModal('create-challenge')} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white flex items-center gap-1"><Plus size={12} /> Create</button></div>
                       <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                           {spotChallenges.map(challenge => (
                               <div key={challenge.id} className="min-w-[200px] bg-[#0b0c10] border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                                   <div className="absolute top-0 right-0 p-2 opacity-10"><Trophy size={48} /></div>
                                   <h4 className="text-xs font-black uppercase text-white italic mb-1">{challenge.title}</h4>
                                   <p className="text-[9px] text-slate-400 font-medium line-clamp-2 mb-3">{challenge.description}</p>
                                   <div className="flex justify-between items-center"><span className="text-[9px] font-black text-yellow-500 uppercase">{challenge.xpReward} XP</span><button className="p-1.5 bg-slate-800 rounded text-white"><ArrowRight size={12} /></button></div>
                               </div>
                           ))}
                           {spotChallenges.length === 0 && <div className="w-full text-center py-6 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800"><p className="text-[10px] font-bold text-slate-600 uppercase">No active challenges.</p></div>}
                       </div>
                   </section>

                   <section className="space-y-3 pb-8">
                       <div className="flex justify-between items-center"><h3 className="text-sm font-black uppercase italic text-white tracking-widest">Intel</h3><button onClick={() => setActiveModal('add-intel')} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white flex items-center gap-1"><MessageSquare size={12} /> Add Intel</button></div>
                       <div className="space-y-3">
                           {localReviews.length > 0 ? localReviews.map((review) => (
                               <div key={review.id} className="bg-[#0b0c10] border border-white/10 rounded-2xl p-4">
                                   <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-800"><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${review.userId}`} className="rounded-full" /></div><span className="text-[10px] font-black uppercase text-white">{review.userName}</span></div><div className="flex text-yellow-500">{[...Array(review.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}</div></div>
                                   <p className="text-[10px] text-slate-400 leading-relaxed">"{review.text}"</p>
                               </div>
                           )) : <div className="text-center py-6 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800"><p className="text-[10px] font-bold text-slate-600 uppercase">No intel yet. Be the first.</p></div>}
                       </div>
                   </section>
               </div>
           </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {activeModal === 'create-session' && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-modal">
            <div className="bg-[#0b0c10] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm space-y-6 shadow-2xl relative">
                <div className="flex justify-between items-center mb-2"><h3 className="text-xl font-black uppercase italic text-white tracking-tight">Plan Meet</h3><button onClick={() => setActiveModal('none')} className="p-2 -mr-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button></div>
                <div className="space-y-4">
                    <div className="space-y-1"><input type="text" placeholder="Session Title" className="w-full bg-black rounded-2xl p-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/5" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} /></div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1">Session Vibe</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[{ id: 'Chill', icon: Coffee, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50' }, { id: 'Practice', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' }, { id: 'Filming', icon: Video, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/50' }, { id: 'Battle', icon: Swords, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' }].map((item) => {
                                const isSelected = sessionForm.intent === item.id;
                                const Icon = item.icon;
                                return (
                                    <button key={item.id} onClick={() => setSessionForm({...sessionForm, intent: item.id})} className={`relative overflow-hidden flex flex-col items-center justify-center py-3 rounded-2xl border transition-all duration-300 group ${isSelected ? `bg-slate-800 ${item.border} shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-105 z-10` : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100 hover:bg-slate-800 hover:scale-105'}`}>{isSelected && <div className={`absolute inset-0 ${item.bg} opacity-20`} />}<div className={`transition-transform duration-300 ${isSelected ? 'scale-110 ' + item.color : 'text-slate-500 group-hover:text-slate-300'}`}><Icon size={20} strokeWidth={isSelected ? 3 : 2} /></div><span className={`text-[8px] font-black uppercase tracking-widest mt-2 transition-colors ${isSelected ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`}>{item.id}</span></button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 space-y-1"><label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1">Date</label><input type="date" className="w-full bg-black rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/5 uppercase" value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} /></div>
                        <div className="flex-1 space-y-1"><label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1">Time</label><input type="time" className="w-full bg-black rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/5 uppercase" value={sessionForm.time} onChange={e => setSessionForm({...sessionForm, time: e.target.value})} /></div>
                    </div>
                    <div className="space-y-1"><textarea placeholder="Notes & Details..." rows={3} className="w-full bg-black rounded-2xl p-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/5 resize-none" value={sessionForm.notes} onChange={e => setSessionForm({...sessionForm, notes: e.target.value})} /></div>
                    <button onClick={submitSession} className="w-full bg-indigo-600 py-4 rounded-2xl text-xs font-black uppercase text-white tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all mt-2 hover:bg-indigo-500">Create Session</button>
                </div>
            </div>
        </div>
      )}

      {activeModal === 'create-challenge' && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-modal">
            <div className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-6 w-full max-w-xs space-y-4">
                <div className="flex justify-between items-center"><h3 className="text-lg font-black uppercase italic text-white">Create Challenge</h3><button onClick={() => setActiveModal('none')}><X size={20} className="text-slate-500" /></button></div>
                <div className="space-y-3">
                    <input type="text" placeholder="Challenge Title" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white" value={challengeForm.title} onChange={e => setChallengeForm({...challengeForm, title: e.target.value})} />
                    <textarea placeholder="Description" rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white" value={challengeForm.desc} onChange={e => setChallengeForm({...challengeForm, desc: e.target.value})} />
                    <button onClick={submitChallenge} className="w-full bg-green-600 py-3 rounded-xl text-xs font-black uppercase text-white tracking-widest mt-2">Publish Challenge</button>
                </div>
            </div>
        </div>
      )}

      {activeModal === 'add-intel' && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-modal">
            <div className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-6 w-full max-w-xs space-y-4">
                <div className="flex justify-between items-center"><h3 className="text-lg font-black uppercase italic text-white">Add Intel</h3><button onClick={() => setActiveModal('none')}><X size={20} className="text-slate-500" /></button></div>
                <div className="space-y-3">
                    <div className="flex justify-center gap-2">{[1,2,3,4,5].map(star => (<button key={star} onClick={() => setIntelForm({...intelForm, rating: star})} className={star <= intelForm.rating ? 'text-yellow-500' : 'text-slate-700'}><Star size={24} fill="currentColor" /></button>))}</div>
                    <textarea placeholder="Share local tips..." rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white" value={intelForm.text} onChange={e => setIntelForm({...intelForm, text: e.target.value})} />
                    <button onClick={submitIntel} className="w-full bg-blue-600 py-3 rounded-xl text-xs font-black uppercase text-white tracking-widest mt-2">Post Intel</button>
                </div>
            </div>
        </div>
      )}

      {activeModal === 'add-spot' && (
           <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-modal">
               <div className="bg-[#0b0c10] border border-white/10 rounded-[2rem] p-6 w-full max-w-xs space-y-4 shadow-2xl">
                   <div className="flex justify-between items-center"><h3 className="text-lg font-black uppercase italic text-white">Add New Spot</h3><button onClick={() => setActiveModal('none')}><X size={20} className="text-slate-500" /></button></div>
                   <div className="space-y-3">
                       <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><MapPin size={20} /></div><div><p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Location</p><p className="text-xs font-bold text-white">Current GPS Position</p></div></div>
                       <input type="text" placeholder="Spot Name (e.g. 'The Ledges')" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500" value={spotForm.name} onChange={e => setSpotForm({...spotForm, name: e.target.value})} />
                       <div className="grid grid-cols-2 gap-2">{[Discipline.SKATE, Discipline.DOWNHILL].map(d => (<button key={d} onClick={() => setSpotForm({...spotForm, type: d})} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${spotForm.type === d ? 'bg-white text-black border-white' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>{d}</button>))}</div>
                       <textarea placeholder="Description / Hazards..." rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none" value={spotForm.description} onChange={e => setSpotForm({...spotForm, description: e.target.value})} />
                       <button onClick={submitSpot} className="w-full bg-indigo-600 py-3 rounded-xl text-xs font-black uppercase text-white tracking-widest mt-2 hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-500/20">Submit Spot</button>
                   </div>
               </div>
           </div>
      )}

    </div>
  );
};

export default SpotsView;
