
import React, { useEffect, useState, useRef } from 'react';
import { Spot, ExtendedSession, Challenge, Crew, SpotStatus, SpotPrivacy } from '../types';
import { MapPin, Navigation, Clock, Zap, X, Users, Droplets, Wind, Activity, Crosshair, ChevronRight, AlertTriangle, Plus, Swords, Calendar, Share2, Lock, EyeOff, Play, Video, Image as ImageIcon } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { useAppStore } from '../store';
import { useLayoutMode } from '../hooks/useLayoutMode';
import { playSound } from '../utils/audio';

interface SpotPreviewCardProps {
  spot: Spot;
  sessions: ExtendedSession[];
  challenges: Challenge[];
  crew?: Crew;
  onClose: () => void;
  onCheckIn: () => void;
}

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  source: 'spot' | 'challenge' | 'session' | 'crew';
  author?: string;
}

const SpotPreviewCard: React.FC<SpotPreviewCardProps> = ({ spot, sessions, challenges, crew, onClose, onCheckIn }) => {
  const { location, openModal, user } = useAppStore();
  const layoutMode = useLayoutMode();
  const [distance, setDistance] = useState<string>('CALCULATING...');
  const [isLiveOpsExpanded, setIsLiveOpsExpanded] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location && spot.location) {
      const dist = getDistanceFromLatLonInKm(location.lat, location.lng, spot.location.lat, spot.location.lng);
      setDistance(`${dist.toFixed(1)} KM`);
    }
  }, [location, spot]);

  // Aggregate Media
  useEffect(() => {
      const items: MediaItem[] = [];
      
      // 1. Spot Images (Official)
      if (spot.images && spot.images.length > 0) {
          spot.images.forEach(img => items.push({ type: 'image', url: img, source: 'spot' }));
      }

      // 2. Spot Video
      if (spot.videoUrl) {
          items.push({ type: 'video', url: spot.videoUrl, source: 'spot', thumbnail: spot.images?.[0] });
      }

      // 3. User Uploads (Challenges)
      challenges.forEach((c, i) => {
          // In a real app, these would come from specific submissions. 
          // We use placeholder videos to represent user content for the "mini player" feature.
          items.push({
              type: 'video',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 
              thumbnail: `https://picsum.photos/seed/${c.id}/400/300`,
              source: 'challenge',
              author: `Rider${i}`
          });
      });

      // 4. Crew Content
      if (crew) {
           items.push({ type: 'image', url: `https://picsum.photos/seed/crew-${crew.id}/400/300`, source: 'crew', author: crew.name });
      }

      // Fallback
      if (items.length === 0) {
          items.push({ type: 'image', url: `https://picsum.photos/seed/${spot.id}/400/300`, source: 'spot' });
      }

      setMediaItems(items);
  }, [spot, challenges, crew]);

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; 
    const dLat = (lat2-lat1) * (Math.PI/180);
    const dLon = (lon2-lon1) * (Math.PI/180); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  }
  
  const handleReportSession = (sessionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      triggerHaptic('medium');
      playSound('error');
      alert(`Report filed for session ID: ${sessionId}. Moderators notified.`);
  };

  const handleInvite = () => {
      if (!user) return;
      const inviteCode = `${spot.id.slice(0,6)}-${user.shareId || user.id.slice(0,4)}`;
      navigator.clipboard.writeText(`Join me at ${spot.name}. Secure Uplink: ${inviteCode}`);
      triggerHaptic('success');
      playSound('success');
      alert(`Secure Invite Copied: ${inviteCode}`);
  };

  const statusConfig = {
    [SpotStatus.WET]: { color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-950/90', label: 'CONDITION: WET', icon: Droplets },
    [SpotStatus.CROWDED]: { color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-950/90', label: 'CONDITION: BUSY', icon: Users },
    [SpotStatus.DRY]: { color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-950/90', label: 'CONDITION: PRIME', icon: Wind },
    [SpotStatus.MAINTENANCE]: { color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-950/90', label: 'STATUS: CLOSED', icon: Activity },
  };

  const status = statusConfig[spot.status || SpotStatus.DRY];
  const StatusIcon = status.icon;

  const containerClasses = layoutMode === 'compact'
    ? 'absolute inset-x-0 bottom-0 z-50 flex flex-col justify-end pointer-events-none h-[100%]'
    : 'absolute left-4 top-4 bottom-4 z-50 flex flex-col justify-start pointer-events-none w-[400px]';

  const cardClasses = layoutMode === 'compact'
    ? 'w-full bg-[#050505] rounded-t-[2rem] shadow-2xl relative flex flex-col pointer-events-auto border-t border-white/20 animate-[enter-sheet_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] max-h-[85vh]'
    : 'w-full h-auto max-h-full bg-[#050505] rounded-[2rem] shadow-2xl relative flex flex-col pointer-events-auto border border-white/20 animate-[enter-panel-left_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]';

  // Permissions
  const canInvite = user && (spot.ownerId === user.id || (spot.privacy === SpotPrivacy.CREW && user.crewId && crew?.id === user.crewId));

  return (
    <div className={containerClasses}>
        <div className={cardClasses}>
            
            {/* MINI MEDIA PLAYER HEADER */}
            <div className="relative w-full h-64 shrink-0 bg-black rounded-t-[2rem] overflow-hidden group">
                
                {/* Floating Controls (Inside Container) */}
                <div className="absolute top-4 left-4 z-30 pointer-events-auto">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-lg ${status.border} ${status.bg}`}>
                        <StatusIcon size={12} className={status.color} />
                        <span className={`text-[9px] font-mono font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                    </div>
                </div>
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-30 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center shadow-lg pointer-events-auto"
                >
                    <X size={16} />
                </button>

                {/* Media Carousel */}
                <div 
                    ref={scrollContainerRef}
                    className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
                >
                    {mediaItems.map((item, idx) => (
                        <div key={idx} className="w-full h-full shrink-0 snap-center relative bg-slate-900 flex items-center justify-center">
                            {item.type === 'video' ? (
                                <>
                                    <img src={item.thumbnail || item.url} className="w-full h-full object-cover opacity-90" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-2xl group-hover:scale-110 transition-transform cursor-pointer">
                                            <Play size={24} className="fill-white text-white ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-500/20 backdrop-blur rounded text-[8px] font-bold uppercase text-red-100 border border-red-500/30">
                                            <Video size={10} /> {item.source} Upload
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <img src={item.url} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur rounded text-[8px] font-bold uppercase text-white border border-white/10">
                                            <ImageIcon size={10} /> {item.source === 'spot' ? 'Intel Photo' : 'Crew Media'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Pagination Indicators */}
                {mediaItems.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                        {mediaItems.map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full bg-white/80 shadow-sm" /> 
                        ))}
                    </div>
                )}
            </div>

            {/* CONTENT CONTAINER */}
            <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#050505] relative z-20 -mt-6 rounded-t-[2rem] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="px-6 pt-8 pb-32 space-y-6">
                    
                    {/* Title Section */}
                    <div className="border-b border-white/10 pb-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-[0.9] mb-1">
                                {spot.name}
                            </h3>
                            {spot.privacy !== SpotPrivacy.PUBLIC && (
                                <div className="bg-red-900/20 border border-red-500/30 p-1.5 rounded-lg">
                                    {spot.privacy === SpotPrivacy.CREW ? <Users size={12} className="text-red-400" /> : <EyeOff size={12} className="text-red-400" />}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-indigo-400 font-bold tracking-widest uppercase">
                                SECTOR: {spot.state}
                            </span>
                            {crew && (
                                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5">
                                    <span className="text-[10px]">{crew.avatar}</span>
                                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wide">Crew Turf</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-2 border border-white/10 rounded-2xl bg-[#0b0c10]">
                        <div className="p-4 border-r border-b border-white/10 flex flex-col gap-1">
                            <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Distance</span>
                            <span className="text-sm text-white font-mono font-bold tracking-tight">{distance}</span>
                        </div>
                        <div className="p-4 border-b border-white/10 flex flex-col gap-1">
                            <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Type</span>
                            <span className="text-sm text-white font-mono font-bold uppercase tracking-tight">{spot.type}</span>
                        </div>
                        <div className="p-4 border-r border-white/10 flex flex-col gap-1">
                            <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Surface</span>
                            <span className="text-sm text-white font-mono font-bold uppercase tracking-tight">{spot.surface}</span>
                        </div>
                        <div className="p-4 flex flex-col gap-1">
                            <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Rating</span>
                            <span className="text-sm text-yellow-400 font-mono font-bold flex items-center gap-1">
                                {spot.rating} <span className="text-[8px] text-slate-600">/ 5.0</span>
                            </span>
                        </div>
                    </div>

                    {/* Briefing */}
                    <div>
                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <Activity size={12} className="animate-pulse" /> Intel Brief
                        </h4>
                        <div className="pl-3 border-l-2 border-indigo-500/30">
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                {spot.notes}
                            </p>
                        </div>
                    </div>

                    {/* Community Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => { triggerHaptic('medium'); openModal('CREATE_SESSION'); }}
                            className="bg-[#111] border border-white/10 p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 active:scale-95 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                                <Calendar size={14} />
                            </div>
                            <div className="text-left">
                                <div className="text-[9px] font-black uppercase text-white tracking-wide">Host Session</div>
                                <div className="text-[7px] font-bold text-slate-500 uppercase">Schedule Meet</div>
                            </div>
                        </button>

                        <button 
                            onClick={() => { triggerHaptic('medium'); openModal('CREATE_CHALLENGE'); }}
                            className="bg-[#111] border border-white/10 p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 active:scale-95 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center group-hover:text-white group-hover:bg-red-600 transition-colors">
                                <Swords size={14} />
                            </div>
                            <div className="text-left">
                                <div className="text-[9px] font-black uppercase text-white tracking-wide">Drop Bounty</div>
                                <div className="text-[7px] font-bold text-slate-500 uppercase">Create Challenge</div>
                            </div>
                        </button>
                    </div>

                    {/* Invite System (Only for Private/Crew) */}
                    {canInvite && spot.privacy !== SpotPrivacy.PUBLIC && (
                        <button 
                            onClick={handleInvite}
                            className="w-full bg-slate-900 border border-slate-700 border-dashed rounded-xl p-3 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-slate-500 transition-all active:scale-95"
                        >
                            <Share2 size={12} /> Generate Secure Invite
                        </button>
                    )}

                    {/* Live Ops (Interactive) */}
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Live Ops</h4>
                            <span className="text-[8px] font-mono text-slate-500">{sessions.length} ACTIVE</span>
                        </div>
                        
                        <div className="bg-[#0b0c10] border border-white/10 rounded-xl overflow-hidden transition-all">
                            <button 
                                onClick={() => { setIsLiveOpsExpanded(!isLiveOpsExpanded); triggerHaptic('light'); }}
                                className="w-full p-4 flex items-center justify-between group active:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                                        {sessions.length > 0 ? (
                                            <>
                                                <Users size={14} className="text-indigo-400" />
                                                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse border border-black" />
                                            </>
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-slate-800" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                                            {sessions.length > 0 ? `${sessions.length} Riders On-Site` : 'Area Clear'}
                                        </span>
                                        {sessions.length === 0 ? (
                                            <span className="text-[8px] text-slate-600 font-mono">No active signals</span>
                                        ) : (
                                            <span className="text-[8px] text-indigo-400 font-mono font-bold">TAP TO EXPAND</span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight size={14} className={`text-slate-700 group-hover:text-white transition-transform ${isLiveOpsExpanded ? 'rotate-90' : ''}`} />
                            </button>

                            {/* Expanded Active Sessions List */}
                            {isLiveOpsExpanded && sessions.length > 0 && (
                                <div className="border-t border-white/5 p-2 space-y-2 bg-[#080808]">
                                    {sessions.map(sess => (
                                        <div key={sess.id} className="bg-[#111] rounded-lg p-3 flex justify-between items-center border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${sess.userId}`} className="w-8 h-8 rounded-lg bg-slate-800" />
                                                <div>
                                                    <div className="text-[9px] font-black text-white uppercase">{sess.userName}</div>
                                                    <div className="text-[8px] text-slate-500 uppercase tracking-wider">{sess.title}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => handleReportSession(sess.id, e)}
                                                className="p-2 text-slate-600 hover:text-red-500 transition-colors active:scale-90"
                                            >
                                                <AlertTriangle size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="grid grid-cols-[1fr_1.5fr] gap-3 pt-2">
                        <button 
                            onClick={() => { triggerHaptic('success'); onCheckIn(); }}
                            className="py-4 bg-[#111] text-white border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all active:scale-95 group"
                        >
                            <Clock size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" /> 
                            Check In
                        </button>
                        
                        <button 
                            onClick={() => { triggerHaptic('medium'); window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.location.lat},${spot.location.lng}`, '_blank'); }}
                            className="py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.3)] group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <Navigation size={14} strokeWidth={2.5} /> Navigate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SpotPreviewCard;
