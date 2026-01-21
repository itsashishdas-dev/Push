
import React, { useState, useEffect, useRef } from 'react';
import { backend } from '../services/mockBackend';
import { Challenge, Spot, ChallengeSubmission, User } from '../types';
import { Map as MapIcon, List, Calendar, MapPin, PlayCircle, Loader2, Play, X, Film, Share2, Download, Instagram, MessageCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';
import { JourneySkeleton, EmptyState } from '../components/States'; // Import States

interface JourneyEntry {
  id: string; // Challenge ID
  date: string;
  timestamp: number;
  spotName: string;
  spotLocation: string;
  lat: number;
  lng: number;
  challengeTitle: string;
  videoUrl: string;
  thumbnailUrl: string;
}

const JourneyView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline');
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<JourneyEntry | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Share State
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [shareStats, setShareStats] = useState({ spots: 0, challenges: 0, badges: 0 });

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  // Share Map Refs
  const shareMapContainerRef = useRef<HTMLDivElement>(null);
  const shareMapInstanceRef = useRef<any>(null);

  useEffect(() => {
    loadJourney();
  }, []);

  const loadJourney = async () => {
    setIsLoading(true);
    const u = await backend.getUser();
    setUser(u);
    const spots = await backend.getSpots();
    const challenges = await backend.getAllChallenges();
    
    // Filter challenges completed by user
    const completedIds = new Set(u.completedChallengeIds);
    const myChallenges = challenges.filter(c => completedIds.has(c.id));
    
    const journeyEntries: JourneyEntry[] = [];
    const visitedSpotIds = new Set<string>();

    // For each completed challenge, find the user's submission to get date/video
    for (const challenge of myChallenges) {
        const spot = spots.find(s => s.id === challenge.spotId);
        // Get submissions for this challenge
        const submissions = await backend.getChallengeSubmissions(challenge.id);
        const mySubmission = submissions.find(s => s.userId === u.id);
        
        if (mySubmission && spot) {
            visitedSpotIds.add(spot.id);
            journeyEntries.push({
                id: challenge.id,
                date: mySubmission.date, // Note: This is currently "2 days ago" string in mock. Ideally ISO date.
                timestamp: new Date().getTime(), // In real app, parse ISO date. Mocking random sort for now if strings.
                spotName: spot.name,
                spotLocation: `${spot.location.address}, ${spot.state}`,
                lat: spot.location.lat,
                lng: spot.location.lng,
                challengeTitle: challenge.title,
                videoUrl: mySubmission.videoUrl,
                thumbnailUrl: mySubmission.thumbnailUrl
            });
        }
    }

    // Stats Calculation
    const badgeCount = u.locker.filter(id => id.includes('trophy') || id.includes('sticker') || id.includes('badge')).length;
    setShareStats({
        spots: visitedSpotIds.size,
        challenges: myChallenges.length,
        badges: badgeCount
    });

    setEntries(journeyEntries.reverse()); // Newest first
    setIsLoading(false);
  };

  // Main Map Initialization
  useEffect(() => {
    if (viewMode === 'map' && mapContainerRef.current && (window as any).L && !isLoading) {
      initMap(mapContainerRef.current, mapInstanceRef, markersLayerRef, polylineRef, true);
    }
  }, [viewMode, entries, isLoading]);

  // Share Map Initialization
  useEffect(() => {
    if (showShareModal && !isGeneratingShare && shareMapContainerRef.current && (window as any).L) {
       // Small delay to ensure modal DOM is ready
       setTimeout(() => {
           initMap(shareMapContainerRef.current!, shareMapInstanceRef, { current: null }, { current: null }, false);
       }, 100);
    }
  }, [showShareModal, isGeneratingShare]);

  const initMap = (
      container: HTMLElement, 
      instanceRef: React.MutableRefObject<any>, 
      markersRef: React.MutableRefObject<any>, 
      lineRef: React.MutableRefObject<any>,
      interactive: boolean
  ) => {
      if (!instanceRef.current) {
        const map = (window as any).L.map(container, {
          zoomControl: false,
          attributionControl: false,
          dragging: interactive,
          touchZoom: interactive,
          scrollWheelZoom: interactive,
          doubleClickZoom: interactive,
          boxZoom: interactive,
          keyboard: interactive
        }).setView([20.5937, 78.9629], 5);
        
        // Dark theme map
        (window as any).L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
        instanceRef.current = map;
        if (interactive) {
            markersRef.current = (window as any).L.layerGroup().addTo(map);
        }
      }

      const map = instanceRef.current;
      
      // Clear existing layers if interactive
      if (markersRef.current) markersRef.current.clearLayers();
      if (lineRef.current) lineRef.current.remove();

      // Add markers
      const latLngs: [number, number][] = [];
      entries.forEach(entry => {
          if (entry.lat && entry.lng) {
              latLngs.push([entry.lat, entry.lng]);
              if (interactive && markersRef.current) {
                const color = '#6366f1';
                const marker = (window as any).L.marker([entry.lat, entry.lng], {
                   icon: (window as any).L.divIcon({
                     className: 'custom-div-icon',
                     html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid white; box-shadow: 0 0 8px ${color}; opacity: 0.9;"></div>`
                   })
                });
                marker.bindPopup(`<b>${entry.spotName}</b><br/>${entry.challengeTitle}`);
                marker.addTo(markersRef.current);
              }
          }
      });

      // Fit bounds
      if (latLngs.length > 0) {
          const bounds = (window as any).L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [50, 50] });

          // Draw polyline connecting spots chronologically (if we sort by date)
          if (latLngs.length > 1) {
              const polyline = (window as any).L.polyline(latLngs, { color: '#6366f1', weight: 2, opacity: 0.5, dashArray: '5, 10' }).addTo(map);
              if (interactive) lineRef.current = polyline;
          }
      }
  };

  if (isLoading) {
      return (
        <div className="pb-32 pt-6 md:pb-10 space-y-6 px-4 animate-view relative min-h-full">
            <header className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Journey</h1>
                    <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase">Loading History...</p>
                </div>
            </header>
            <JourneySkeleton />
        </div>
      );
  }

  return (
    <div className="pb-32 pt-6 md:pb-10 space-y-6 px-4 animate-view relative min-h-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Journey</h1>
          <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase">
             My Skate Diary
          </p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto hide-scrollbar">
           <button onClick={() => setViewMode('timeline')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1 ${viewMode === 'timeline' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}><List size={12} /> Feed</button>
           <button onClick={() => setViewMode('map')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1 ${viewMode === 'map' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}><MapIcon size={12} /> Map</button>
        </div>
      </header>

      {/* SHARE BUTTON */}
      <div className="w-full">
         <button 
           onClick={() => setShowShareModal(true)}
           className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
         >
           <Share2 size={16} /> Share My Season Stats
         </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState 
           icon={Film} 
           title="Your Story Starts Now" 
           description="Complete challenges and record clips to build your personal skate journey." 
        />
      ) : (
        <>
            {viewMode === 'timeline' && (
                <div className="space-y-6 relative border-l-2 border-slate-800 ml-4 pl-8 py-2">
                    {entries.map((entry, idx) => (
                        <div key={idx} className="relative group">
                            {/* Timeline Node */}
                            <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-slate-900 border-2 border-indigo-500 z-10 flex items-center justify-center">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 space-y-4 hover:border-slate-700 transition-colors shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                                            <Calendar size={12} className="text-indigo-400" /> {entry.date}
                                        </div>
                                        <h3 className="text-lg font-black uppercase italic text-white tracking-tight leading-none">{entry.challengeTitle}</h3>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                            <MapPin size={10} /> {entry.spotName}
                                        </div>
                                    </div>
                                </div>

                                {/* Video Thumbnail */}
                                <div 
                                    className="relative w-full aspect-video bg-black rounded-xl overflow-hidden cursor-pointer group/video border border-slate-800"
                                    onClick={() => setActiveVideo(entry)}
                                >
                                    <img src={entry.thumbnailUrl} alt={entry.challengeTitle} className="w-full h-full object-cover opacity-80 group-hover/video:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/video:bg-transparent">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl group-hover/video:scale-110 transition-transform">
                                            <Play size={20} className="text-white fill-white ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === 'map' && (
                 <div className="w-full h-[60vh] bg-slate-900 rounded-[2.5rem] border border-slate-800 relative overflow-hidden shadow-2xl animate-view z-0">
                    <div ref={mapContainerRef} className="w-full h-full z-10" />
                 </div>
            )}
        </>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
           <div className="relative w-full max-w-lg aspect-[9/16] md:aspect-video bg-black rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl animate-view">
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="absolute top-4 left-4 z-20">
                 <p className="text-white text-xs font-black italic uppercase shadow-black drop-shadow-md">{activeVideo.challengeTitle}</p>
                 <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest drop-shadow-md flex items-center gap-1">
                    <MapPin size={10} /> {activeVideo.spotName}
                 </p>
              </div>

              <video 
                src={activeVideo.videoUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
                loop
              />
           </div>
        </div>
      )}

      {/* Share Stats Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view my-auto">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Share Card</span>
                        <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Season Stats</h3>
                    </div>
                    <button onClick={() => setShowShareModal(false)} className="p-2 -mr-2 text-slate-500"><X size={24} /></button>
                </div>

                {/* Shareable Card Preview */}
                <div id="share-card" className="bg-gradient-to-br from-slate-900 to-black border border-slate-700 rounded-3xl overflow-hidden relative aspect-[4/5] flex flex-col shadow-2xl">
                    {/* Background Map for Visual Interest */}
                    <div className="absolute inset-0 opacity-30 pointer-events-none">
                        <div ref={shareMapContainerRef} className="w-full h-full grayscale invert opacity-50" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 z-0" />

                    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 p-0.5">
                                <img src={user?.avatar} className="w-full h-full rounded-full object-cover" alt="User" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black italic uppercase text-white leading-none">{user?.name}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Level {user?.level} • {user?.location}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Spots Hit</span>
                                <span className="text-2xl font-black italic text-white">{shareStats.spots}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Battles Won</span>
                                <span className="text-2xl font-black italic text-white">{shareStats.challenges}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Badges</span>
                                <span className="text-2xl font-black italic text-white">{shareStats.badges}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-3xl font-black italic uppercase text-white tracking-tighter">PUSH</p>
                            <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-500">The Core Network</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="py-4 bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
                        <Instagram size={16} /> Story
                    </button>
                    <button className="py-4 bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <Download size={16} /> Save
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default JourneyView;
