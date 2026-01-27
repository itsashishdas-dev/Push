
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '../store';
import { Search, Grid, LocateFixed, Plus, Minus, Globe, Sun, Sunset, Sunrise, CloudSun, MapPin, ChevronRight, Database, X, Wind, Droplets, Eye, Thermometer, CloudRain, CloudLightning, Radio, Signal, Compass, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { Discipline, SpotCategory, Spot, SpotStatus } from '../types';
import { playSound } from '../utils/audio';
import { useLayoutMode } from '../hooks/useLayoutMode';

const MIN_DISCOVERY_ZOOM = 4;

// --- TACTICAL MAP ICONS ---
// Fixed geometry shapes with proper viewboxes and fill
const MARKER_SHAPES = {
    street: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full filter drop-shadow-md"><path d="M12 0L24 12L12 24L0 12L12 0Z"/></svg>`, // Diamond
    park: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full filter drop-shadow-md"><path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"/></svg>`, // Hexagon
    downhill: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full filter drop-shadow-md"><path d="M2 2h20L12 22 2 2z"/></svg>`, // Inverted Triangle
    diy: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full filter drop-shadow-md"><rect x="3" y="3" width="18" height="18" rx="3" /></svg>`, // Square
    flat: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full filter drop-shadow-md"><circle cx="12" cy="12" r="11"/></svg>` // Circle
};

// High contrast inner icons, centered
const INNER_ICONS = {
    street: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-[60%] h-[60%]"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`, // Zig-Zag (Dash/Flash)
    park: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-[60%] h-[60%]"><path d="M2 16c0-6 4-10 10-10s10 4 10 10" /></svg>`, // Half Circle (Bowl)
    downhill: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-[60%] h-[60%]"><path d="M12 3v14M19 12l-7 7-7-7"/></svg>`, // Down Arrow
    diy: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-[60%] h-[60%]"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`, // Tool
    flat: `<svg viewBox="0 0 24 24" fill="white" stroke="none" class="w-[40%] h-[40%]"><circle cx="12" cy="12" r="12"/></svg>` // Dot
};

const LEGEND_ITEMS = [
    { id: 'street', label: 'Street', color: '#6366f1', shape: MARKER_SHAPES.street, icon: INNER_ICONS.street },
    { id: 'downhill', label: 'Downhill', color: '#a855f7', shape: MARKER_SHAPES.downhill, icon: INNER_ICONS.downhill },
    { id: 'park', label: 'Skatepark', color: '#f59e0b', shape: MARKER_SHAPES.park, icon: INNER_ICONS.park },
    { id: 'diy', label: 'DIY Spot', color: '#10b981', shape: MARKER_SHAPES.diy, icon: INNER_ICONS.diy },
    { id: 'flat', label: 'Flatground', color: '#3b82f6', shape: MARKER_SHAPES.flat, icon: INNER_ICONS.flat },
];

const getLegendId = (spot: Spot) => {
    if (spot.type === Discipline.DOWNHILL) return 'downhill';
    if (spot.category === SpotCategory.PARK) return 'park';
    if (spot.category === SpotCategory.DIY) return 'diy';
    if (spot.category === SpotCategory.FLATGROUND) return 'flat';
    return 'street';
};

function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

const SpotsView: React.FC = () => {
  const { 
    user, 
    setView, 
    location, 
    setUserLocation,
    spots,
    selectedSpot,
    selectSpot,
    openModal,
    mapViewSettings,
    setMapViewSettings
  } = useAppStore();

  const layoutMode = useLayoutMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [suggestions, setSuggestions] = useState<{type: 'spot' | 'state', label: string, id?: string, data?: any}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);
  
  // Discovery System
  const [revealedSpotIds, setRevealedSpotIds] = useState<Set<string>>(new Set());
  const [discoveryQueue, setDiscoveryQueue] = useState<Spot[]>([]);
  const discoveredRef = useRef<Set<string>>(new Set()); 
  
  // Weather System
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isScanningWeather, setIsScanningWeather] = useState(false);
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(false);
  
  // Map References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // --- WEATHER SIMULATION ---
  useEffect(() => {
    if (location) {
        setIsScanningWeather(true);
        // Simulate network/sensor delay
        const timer = setTimeout(() => {
            // Generate deterministic but location-varied data
            const baseTemp = 30 - Math.floor((location.lat - 8) * 0.4); 
            const randomFactor = (location.lat + location.lng) % 10;
            
            let condition = { text: 'CLEAR', icon: Sun, color: 'text-amber-400' };
            let calculatedUV = 8; 

            if (randomFactor > 7) {
                condition = { text: 'HAZE', icon: CloudSun, color: 'text-orange-300' };
                calculatedUV = 5;
            } else if (randomFactor > 8.5) {
                condition = { text: 'OVCST', icon: CloudSun, color: 'text-slate-300' };
                calculatedUV = 2;
            } else if (randomFactor < 1) {
                condition = { text: 'RAIN', icon: CloudRain, color: 'text-blue-400' };
                calculatedUV = 1;
            }

            const uvIndex = Math.max(0, calculatedUV + Math.floor((Math.random() - 0.5) * 2));

            // Solar Cycle Calculation
            // Base for India Center (approx)
            const baseSunrise = 6 * 60; // 6:00 AM
            const baseSunset = 18 * 60 + 30; // 6:30 PM
            // 4 minutes per degree longitude difference from IST meridian (82.5)
            const offset = (82.5 - location.lng) * 4; 
            
            const formatTime = (mins: number) => {
                let h = Math.floor(mins / 60);
                let m = Math.floor(mins % 60);
                if (m < 0) { m += 60; h -= 1; }
                if (h >= 24) h -= 24;
                if (h < 0) h += 24;
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
            };

            setWeatherData({
                temp: baseTemp,
                condition: condition,
                humidity: 40 + Math.floor(randomFactor * 4), 
                wind: 5 + Math.floor(randomFactor * 1.5), 
                uvIndex: uvIndex,
                aqi: 80 + Math.floor(randomFactor * 15), 
                sunrise: formatTime(baseSunrise + offset),
                sunset: formatTime(baseSunset + offset),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setIsScanningWeather(false);
        }, 1200);
        return () => clearTimeout(timer);
    }
  }, [location]);

  // --- SEARCH LOGIC ---
  useEffect(() => {
      if (searchQuery.length > 1) {
          const lowerQ = searchQuery.toLowerCase();
          
          const spotMatches = spots
              .filter(s => s.name.toLowerCase().includes(lowerQ) || s.location.address.toLowerCase().includes(lowerQ))
              .slice(0, 3)
              .map(s => ({ type: 'spot' as const, label: s.name, id: s.id, data: s }));

          const uniqueStates = Array.from(new Set(spots.map(s => s.state)))
              .filter((state: string) => state.toLowerCase().includes(lowerQ))
              .slice(0, 2)
              .map(state => ({ type: 'state' as const, label: state, data: state }));

          setSuggestions([...spotMatches, ...uniqueStates]);
          setShowSuggestions(true);
      } else {
          setSuggestions([]);
          setShowSuggestions(false);
      }
  }, [searchQuery, spots]);

  const handleSuggestionClick = (item: typeof suggestions[0]) => {
      triggerHaptic('medium');
      playSound('map_zoom');
      setSearchQuery('');
      setShowSuggestions(false);

      if (item.type === 'spot' && item.data) {
          const spot = item.data as Spot;
          mapInstanceRef.current?.flyTo([spot.location.lat, spot.location.lng], 16, { duration: 1.5 });
          if (!revealedSpotIds.has(spot.id)) {
              setRevealedSpotIds(prev => new Set(prev).add(spot.id));
              discoveredRef.current.add(spot.id);
          }
          selectSpot(spot);
          openModal('SPOT_DETAIL');
      } else if (item.type === 'state') {
          const stateSpot = spots.find(s => s.state === item.data);
          if (stateSpot) {
              mapInstanceRef.current?.flyTo([stateSpot.location.lat, stateSpot.location.lng], 8, { duration: 1.5 });
          }
      }
  };

  // --- MAP INITIALIZATION & EVENT BINDING ---
  useEffect(() => {
    const L = (window as any).L;
    if (mapContainerRef.current && L && !mapInstanceRef.current) {
        
        // Determine Start Position
        let initialCenter: [number, number] = [20.5937, 78.9629]; // Default India
        let initialZoom = 5;

        if (mapViewSettings) {
            // Restore last view if available
            initialCenter = [mapViewSettings.center.lat, mapViewSettings.center.lng];
            initialZoom = mapViewSettings.zoom;
        } else if (location) {
            // Fallback to user location if no saved state
            initialCenter = [location.lat, location.lng];
            initialZoom = 12;
        }

        // Init Map
        const map = L.map(mapContainerRef.current, { 
            zoomControl: false, 
            attributionControl: false,
            zoomAnimation: true,
            fadeAnimation: true,
            inertia: true,
        }).setView(initialCenter, initialZoom);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            opacity: 1,
            subdomains: 'abcd'
        }).addTo(map);

        map.on('click', () => {
            selectSpot(null);
            setShowSuggestions(false);
        });

        // Dynamic Discovery Logic
        const checkVisibility = () => {
            const currentZoom = map.getZoom();
            if (currentZoom < MIN_DISCOVERY_ZOOM) return;

            const bounds = map.getBounds();
            const visibleSpots = spots.filter(s => {
                const latLng = L.latLng(s.location.lat, s.location.lng);
                return bounds.contains(latLng);
            });

            const newDiscoveries = visibleSpots.filter(s => !discoveredRef.current.has(s.id));
            
            if (newDiscoveries.length > 0) {
                const shuffled = shuffleArray(newDiscoveries);
                setDiscoveryQueue(prev => [...prev, ...shuffled]);
                newDiscoveries.forEach(s => discoveredRef.current.add(s.id));
            }
        };

        map.on('moveend', () => {
            checkVisibility();
            // Save state on move
            const center = map.getCenter();
            setMapViewSettings({ center: { lat: center.lat, lng: center.lng }, zoom: map.getZoom() });
        });
        map.on('zoomend', checkVisibility);

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
        setIsMapReady(true);
        
        // Initial check immediately to reveal spots in view
        setTimeout(checkVisibility, 200);
    }
    
    if (mapInstanceRef.current) {
        setTimeout(() => {
            mapInstanceRef.current.invalidateSize();
        }, 200);
    }

    // CLEANUP TO PREVENT LEAKS
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
            markersLayerRef.current = null;
            markersMapRef.current.clear();
            userMarkerRef.current = null;
            setIsMapReady(false);
        }
    };
  }, [layoutMode, spots]); 

  // --- DISCOVERY QUEUE PROCESSOR ---
  useEffect(() => {
      if (discoveryQueue.length === 0) return;

      const processQueue = () => {
          const nextSpot = discoveryQueue[0];
          const remaining = discoveryQueue.slice(1);
          
          setRevealedSpotIds(prev => new Set(prev).add(nextSpot.id));
          setDiscoveryQueue(remaining);
          triggerHaptic('light');
      };

      const delay = Math.random() * 300 + 100;
      const timer = setTimeout(processQueue, delay);

      return () => clearTimeout(timer);
  }, [discoveryQueue]);

  // --- MARKER RENDERING (DIFFING) ---
  useEffect(() => {
      const L = (window as any).L;
      if (isMapReady && mapInstanceRef.current && markersLayerRef.current && L) {
          
          const spotsToShow = spots.filter(spot => {
              const matchesFilter = activeFilter === 'ALL' 
                  ? true 
                  : activeFilter === 'VERIFIED' 
                      ? spot.isVerified 
                      : spot.type === activeFilter;
              
              const isRevealed = revealedSpotIds.has(spot.id);
              
              return matchesFilter && isRevealed;
          });

          const currentIds = new Set(spotsToShow.map(s => s.id));

          markersMapRef.current.forEach((marker, id) => {
              if (!currentIds.has(id)) {
                  markersLayerRef.current.removeLayer(marker);
                  markersMapRef.current.delete(id);
              }
          });

          spotsToShow.forEach(spot => {
              const isSelected = spot.id === selectedSpot?.id;
              const isBuzzing = spot.status === SpotStatus.CROWDED || (spot.sessions && spot.sessions.length > 0);

              if (!markersMapRef.current.has(spot.id)) {
                  const legendId = getLegendId(spot);
                  const config = LEGEND_ITEMS.find(item => item.id === legendId) || LEGEND_ITEMS[0];
                  
                  const color = config.color;
                  const shapeSvg = config.shape;
                  const innerSvg = config.icon;

                  const pulseHtml = isBuzzing 
                    ? `<div class="absolute inset-0 rounded-full animate-breathe-out opacity-50" style="background-color: ${color}"></div>` 
                    : '';

                  // TACTICAL MARKER CONSTRUCTION
                  // Using strict positioning and dimensions to avoid rendering issues
                  const html = `
                     <div class="relative w-6 h-6 flex items-center justify-center group transition-transform duration-300 animate-pop ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-40'}">
                        ${pulseHtml}
                        <div class="relative w-full h-full flex items-center justify-center" style="color: ${color}">
                            <div class="absolute inset-0 w-full h-full">${shapeSvg}</div>
                            <div class="absolute inset-0 flex items-center justify-center">${innerSvg}</div>
                        </div>
                     </div>
                  `;

                  const marker = L.marker([spot.location.lat, spot.location.lng], {
                    icon: L.divIcon({ className: 'bg-transparent border-none', html: html, iconSize: [24, 24], iconAnchor: [12, 12] }),
                    zIndexOffset: isSelected ? 1000 : 100
                  });

                  marker.on('click', (e: any) => {
                      L.DomEvent.stopPropagation(e);
                      triggerHaptic('medium');
                      playSound('map_zoom');
                      selectSpot(spot);
                      openModal('SPOT_DETAIL');
                      mapInstanceRef.current?.flyTo([spot.location.lat - 0.002, spot.location.lng], 16, { duration: 1 });
                  });
                  
                  marker.addTo(markersLayerRef.current);
                  markersMapRef.current.set(spot.id, marker);
              } else {
                  const marker = markersMapRef.current.get(spot.id);
                  marker.setZIndexOffset(isSelected ? 1000 : 100);
                  
                  const el = marker.getElement();
                  if (el) {
                      const container = el.querySelector('.group');
                      if (container) {
                          if (isSelected) {
                              container.classList.add('scale-125', 'z-50');
                              container.classList.remove('hover:scale-110', 'z-40');
                          } else {
                              container.classList.remove('scale-125', 'z-50');
                              container.classList.add('hover:scale-110', 'z-40');
                          }
                      }
                  }
              }
          });
      }
  }, [spots, selectedSpot, isMapReady, activeFilter, revealedSpotIds]);

  // --- USER LOCATION MARKER ---
  useEffect(() => {
      const L = (window as any).L;
      if (isMapReady && mapInstanceRef.current && L && location) {
          if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([location.lat, location.lng]);
          } else {
              const userIcon = L.divIcon({
                  className: 'bg-transparent border-none',
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
          }
      }
  }, [location, isMapReady]);

  // --- DERIVED LEGEND STATE ---
  const revealedLegendIds = useMemo(() => {
      const ids = new Set<string>();
      revealedSpotIds.forEach(id => {
          const spot = spots.find(s => s.id === id);
          if (spot) {
              ids.add(getLegendId(spot));
          }
      });
      return ids;
  }, [revealedSpotIds, spots]);


  // --- ACTIONS ---
  const handleLocate = () => {
    triggerHaptic('medium');
    playSound('map_zoom');
    
    const L = (window as any).L;
    
    const executeLocate = (lat: number, lng: number) => {
        if (!mapInstanceRef.current || !L) return;

        const userLatLng = L.latLng(lat, lng);
        let nearestSpot: Spot | null = null;
        let minDist = Infinity;

        spots.forEach(spot => {
            const spotLatLng = L.latLng(spot.location.lat, spot.location.lng);
            const d = userLatLng.distanceTo(spotLatLng);
            if (d < minDist) {
                minDist = d;
                nearestSpot = spot;
            }
        });

        if (nearestSpot) {
            const bounds = L.latLngBounds([
                [lat, lng],
                [nearestSpot.location.lat, nearestSpot.location.lng]
            ]);
            mapInstanceRef.current.fitBounds(bounds, { 
                padding: [80, 80], 
                maxZoom: 15, 
                animate: true, 
                duration: 1.5 
            });
        } else {
            mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.5 });
        }
    };

    if (location) {
        executeLocate(location.lat, location.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
            setUserLocation(pos.coords.latitude, pos.coords.longitude);
            executeLocate(pos.coords.latitude, pos.coords.longitude);
        },
        () => alert("GPS Access Denied")
      );
    }
  };
  
  const handleWorldView = () => {
      triggerHaptic('light');
      playSound('map_zoom');
      mapInstanceRef.current?.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
  };

  const handleZoomIn = () => { triggerHaptic('light'); playSound('click'); mapInstanceRef.current?.zoomIn(); };
  const handleZoomOut = () => { triggerHaptic('light'); playSound('click'); mapInstanceRef.current?.zoomOut(); };
  const toggleView = () => { triggerHaptic('medium'); playSound('click'); setView('LIST'); };
  const toggleWeather = () => { triggerHaptic('light'); playSound('data_stream'); setIsWeatherExpanded(!isWeatherExpanded); };
  const toggleLegend = () => { triggerHaptic('light'); playSound('click'); setIsLegendExpanded(!isLegendExpanded); };

  return (
    <div className="flex-1 relative h-full w-full bg-[#020202] overflow-hidden font-sans">
      
      {/* 1. MAP CONTAINER */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

      {/* 2. OVERLAY HUD */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col h-full">
        
        {/* TOP HUD */}
        <div className="pt-safe-top px-4 pb-2 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto w-full max-w-lg relative">
             <div className="flex items-center gap-3 mb-3 relative">
                {/* Avatar (Colored) */}
                <button onClick={() => setView('PROFILE')} className="w-10 h-10 rounded-xl border border-white/10 bg-slate-900 overflow-hidden shadow-lg shrink-0 active:scale-95 transition-transform z-30 relative group">
                   <div className="absolute inset-0 bg-indigo-500/20 hidden group-hover:block animate-pulse"></div>
                   <img src={user?.avatar} className="w-full h-full object-cover transition-all" />
                </button>
                
                {/* Search Bar */}
                <div className="flex-1 relative h-10 z-40 group">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl flex items-center px-4 shadow-lg focus-within:border-indigo-500 transition-colors">
                        <Search size={14} className="text-slate-500 mr-2 group-focus-within:text-indigo-400" />
                        <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                            placeholder="SEARCH DATABASE..." 
                            className="bg-transparent border-none outline-none text-[10px] font-bold text-white uppercase tracking-widest w-full placeholder:text-slate-600 font-mono" 
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-white/10 text-slate-500">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Auto-Suggestion Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-12 left-0 right-0 bg-[#0b0c10] border border-white/20 rounded-xl overflow-hidden shadow-2xl animate-[fadeIn_0.1s_ease-out]">
                            <div className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-500 border-b border-white/10 bg-black/50">
                                Search Results
                            </div>
                            {suggestions.map((item, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSuggestionClick(item)}
                                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-indigo-900/20 hover:text-white transition-colors border-b border-white/5 last:border-0 group"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-indigo-500/50 group-hover:text-indigo-400">
                                        {item.type === 'spot' ? <MapPin size={12} /> : <Globe size={12} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-200">{item.label}</div>
                                        <div className="text-[8px] font-mono text-slate-500">{item.type === 'spot' ? 'COORDINATES FOUND' : 'SECTOR REGION'}</div>
                                    </div>
                                    <ChevronRight size={12} className="text-slate-700 group-hover:text-indigo-500" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grid View Toggle */}
                <button onClick={toggleView} className="w-10 h-10 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 active:scale-95 transition-all shadow-lg z-30 relative">
                    <Grid size={18} />
                </button>
             </div>

             {/* QUICK FILTERS / WEATHER SENSOR */}
             <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pl-1 items-start relative z-20">
                 
                 {/* ATMOS SENSOR WIDGET */}
                 <button 
                    onClick={toggleWeather}
                    className={`
                        relative rounded-xl border border-white/10 bg-[#0b0c10]/90 backdrop-blur-xl shadow-lg
                        transition-all duration-300 ease-out overflow-hidden flex flex-col shrink-0 z-30
                        ${isWeatherExpanded ? 'w-48 p-3' : 'w-9 h-9 items-center justify-center'}
                    `}
                 >
                     {/* Collapsed State */}
                     {!isWeatherExpanded && (
                         <div className={`transition-all duration-300 ${isScanningWeather ? 'animate-pulse text-indigo-400' : 'text-amber-400'}`}>
                            {isScanningWeather ? <Radio size={14} /> : <Sun size={16} />}
                         </div>
                     )}

                     {/* Expanded State */}
                     {isWeatherExpanded && (
                         <div className="w-full animate-[fadeIn_0.2s_ease-out]">
                             <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                                 <div className="flex items-center gap-1.5">
                                     <Signal size={10} className={`text-red-500 ${isScanningWeather ? 'animate-pulse' : ''}`} />
                                     <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">Atmos Sensor</span>
                                 </div>
                                 <span className="text-[7px] font-mono text-emerald-500 bg-emerald-500/10 px-1 rounded">{isScanningWeather ? 'SCANNING' : 'ONLINE'}</span>
                             </div>

                             {isScanningWeather ? (
                                 <div className="space-y-2 py-2">
                                     <div className="h-1 w-full bg-slate-800 rounded overflow-hidden">
                                         <div className="h-full bg-indigo-500 animate-[shimmer_1s_infinite] w-2/3"></div>
                                     </div>
                                     <div className="flex justify-between text-[7px] font-mono text-slate-500">
                                         <span>CALIBRATING SENSORS...</span>
                                         <span>98%</span>
                                     </div>
                                 </div>
                             ) : weatherData ? (
                                 <div className="space-y-3">
                                     {/* Main Temp & Condition */}
                                     <div className="flex justify-between items-center">
                                         <div className="flex items-baseline gap-1">
                                             <span className="text-3xl font-black text-white italic leading-none font-mono">{weatherData.temp}°</span>
                                             <span className="text-[8px] font-bold text-slate-500">C</span>
                                         </div>
                                         <div className="flex flex-col items-end">
                                             <weatherData.condition.icon size={18} className={weatherData.condition.color} />
                                             <span className="text-[7px] font-black text-white uppercase tracking-widest mt-1 bg-white/10 px-1.5 py-0.5 rounded">{weatherData.condition.text}</span>
                                         </div>
                                     </div>

                                     {/* Data Grid */}
                                     <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/5 rounded-lg overflow-hidden">
                                         <div className="bg-[#111] p-1.5 flex flex-col justify-center">
                                             <span className="text-[6px] text-slate-500 uppercase tracking-widest mb-0.5 flex items-center gap-1"><Droplets size={6} /> Humidity</span>
                                             <span className="text-[9px] font-mono font-bold text-cyan-400">{weatherData.humidity}%</span>
                                         </div>
                                         <div className="bg-[#111] p-1.5 flex flex-col justify-center">
                                             <span className="text-[6px] text-slate-500 uppercase tracking-widest mb-0.5 flex items-center gap-1"><Wind size={6} /> Wind</span>
                                             <span className="text-[9px] font-mono font-bold text-emerald-400">{weatherData.wind} KM/H</span>
                                         </div>
                                         <div className="bg-[#111] p-1.5 flex flex-col justify-center">
                                             <span className="text-[6px] text-slate-500 uppercase tracking-widest mb-0.5 flex items-center gap-1"><Thermometer size={6} /> AQI</span>
                                             <span className="text-[9px] font-mono font-bold text-yellow-400">{weatherData.aqi}</span>
                                         </div>
                                         <div className="bg-[#111] p-1.5 flex flex-col justify-center">
                                             <span className="text-[6px] text-slate-500 uppercase tracking-widest mb-0.5 flex items-center gap-1"><Sun size={6} /> UV</span>
                                             <span className={`text-[9px] font-mono font-bold ${weatherData.uvIndex > 7 ? 'text-red-400' : weatherData.uvIndex > 4 ? 'text-yellow-400' : 'text-emerald-400'}`}>{weatherData.uvIndex}</span>
                                         </div>
                                     </div>

                                     {/* Solar Cycle */}
                                     <div className="flex justify-between items-center bg-[#111] p-2 rounded-lg border border-white/5 mt-2">
                                         <div className="flex items-center gap-2">
                                             <Sunrise size={12} className="text-amber-500" />
                                             <div className="flex flex-col">
                                                 <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Sunrise</span>
                                                 <span className="text-[9px] font-mono text-white leading-none">{weatherData.sunrise}</span>
                                             </div>
                                         </div>
                                         <div className="h-4 w-px bg-white/5" />
                                         <div className="flex items-center gap-2">
                                             <div className="flex flex-col items-end">
                                                 <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Sunset</span>
                                                 <span className="text-[9px] font-mono text-white leading-none">{weatherData.sunset}</span>
                                             </div>
                                             <Sunset size={12} className="text-indigo-400" />
                                         </div>
                                     </div>

                                     {/* Footer Coords */}
                                     <div className="border-t border-white/5 pt-2 mt-1">
                                         <div className="text-[6px] font-mono text-slate-600 uppercase tracking-widest flex justify-between">
                                             <span>LAT: {location?.lat.toFixed(4)}</span>
                                             <span>LNG: {location?.lng.toFixed(4)}</span>
                                         </div>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="py-4 text-center">
                                     <span className="text-[8px] font-mono text-red-500 animate-pulse">NO SATELLITE LINK</span>
                                 </div>
                             )}
                         </div>
                     )}
                 </button>
                 
                 {['ALL', Discipline.SKATE, Discipline.DOWNHILL, 'VERIFIED'].map((f) => {
                     const isActive = activeFilter === f;
                     return (
                         <button 
                            key={f} 
                            onClick={() => { setActiveFilter(f); playSound('click'); triggerHaptic('light'); }}
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all backdrop-blur-md whitespace-nowrap h-9 flex items-center ${
                                isActive 
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                                : 'bg-black/60 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                         >
                             {f}
                         </button>
                     );
                 })}
             </div>
        </div>

        {/* MAP CONTROLS & COMPASS */}
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-end gap-6 ${layoutMode === 'compact' ? 'top-1/2' : 'top-32'}`}>
             
             {/* TACTICAL HUD COMPASS WIDGET (SVG) */}
             <div 
                className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl relative group cursor-pointer hover:border-white/40 transition-colors"
                onClick={() => { triggerHaptic('light'); mapInstanceRef.current?.setBearing(0); }}
             >
                 <svg width="40" height="40" viewBox="0 0 40 40" className="absolute inset-0">
                    {/* Ring */}
                    <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
                    {/* North Needle (Red) */}
                    <path d="M20 4 L23 18 L20 20 L17 18 Z" fill="#ef4444" />
                    {/* South Needle (Ghost) */}
                    <path d="M20 36 L17 22 L20 20 L23 22 Z" fill="rgba(255,255,255,0.2)" />
                    {/* Center Point */}
                    <circle cx="20" cy="20" r="2" fill="white" />
                    {/* Ticks */}
                    <line x1="20" y1="2" x2="20" y2="6" stroke="white" strokeWidth="2" />
                    <line x1="38" y1="20" x2="34" y2="20" stroke="white" strokeWidth="1" opacity="0.5" />
                    <line x1="20" y1="38" x2="20" y2="34" stroke="white" strokeWidth="1" opacity="0.5" />
                    <line x1="2" y1="20" x2="6" y2="20" stroke="white" strokeWidth="1" opacity="0.5" />
                 </svg>
                 <div className="absolute top-1 text-[6px] font-black text-white">N</div>
             </div>

             <div className="flex flex-col bg-black/80 backdrop-blur-xl border border-white/20 rounded-full p-1.5 shadow-2xl gap-2">
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
             
             {/* Smaller Drop Signal Button */}
             <button onClick={() => openModal('ADD_SPOT')} className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400 active:scale-90 transition-all hover:bg-indigo-500 group">
                <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
             </button>
        </div>

        {/* DYNAMIC LEGEND PANEL (COLLAPSIBLE) */}
        {revealedLegendIds.size > 0 && (
            <div className="absolute bottom-24 left-4 z-20 pointer-events-auto">
                <div 
                    className={`
                        bg-[#0b0c10]/95 backdrop-blur-md border border-white/20 shadow-2xl 
                        transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col
                        ${isLegendExpanded ? 'w-48 rounded-[1.5rem]' : 'w-10 h-10 rounded-xl'}
                    `}
                >
                    {/* Header / Toggle */}
                    <button 
                        onClick={toggleLegend} 
                        className={`
                            flex items-center gap-3 w-full transition-all hover:bg-white/5
                            ${isLegendExpanded ? 'p-4 border-b border-white/10' : 'h-full justify-center'}
                        `}
                    >
                        <div className={`transition-colors ${isLegendExpanded ? 'text-indigo-400' : 'text-slate-400'}`}>
                            <MapIcon size={16} />
                        </div>
                        
                        {isLegendExpanded && (
                            <>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex-1 text-left">
                                    Map Key
                                </span>
                                <ChevronDown size={14} className="text-slate-500" />
                            </>
                        )}
                    </button>

                    {/* List */}
                    <div className={`
                        flex-1 overflow-y-auto transition-all duration-300 hide-scrollbar
                        ${isLegendExpanded ? 'opacity-100 max-h-60 p-4 space-y-3' : 'opacity-0 max-h-0'}
                    `}>
                        {LEGEND_ITEMS.map((item) => {
                            if (!revealedLegendIds.has(item.id)) return null;
                            return (
                                <div key={item.id} className="flex items-center gap-3">
                                    {/* Icon Container matching map marker style roughly */}
                                    <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                                        <div className="relative w-full h-full flex items-center justify-center text-white drop-shadow-md" style={{ color: item.color }}>
                                            {/* Shape */}
                                            <div className="absolute inset-0 w-full h-full" dangerouslySetInnerHTML={{ __html: item.shape }} />
                                            {/* Inner Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: item.icon }} />
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest truncate">{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default SpotsView;
