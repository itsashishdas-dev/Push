
import React, { useEffect, useState } from 'react';
import { Spot, ExtendedSession, Challenge, Crew, SpotStatus } from '../types';
import { MapPin, Navigation, Clock, Zap, Shield, X, Users, Droplets, Wind, Activity } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { useAppStore } from '../store';

interface SpotPreviewCardProps {
  spot: Spot;
  sessions: ExtendedSession[];
  challenges: Challenge[];
  crew?: Crew;
  onClose: () => void;
  onCheckIn: () => void;
}

const SpotPreviewCard: React.FC<SpotPreviewCardProps> = ({ spot, sessions, challenges, crew, onClose, onCheckIn }) => {
  const { location } = useAppStore();
  const [distance, setDistance] = useState<string>('? KM');

  useEffect(() => {
    if (location && spot.location) {
      const dist = getDistanceFromLatLonInKm(location.lat, location.lng, spot.location.lat, spot.location.lng);
      setDistance(`${dist.toFixed(1)} KM`);
    }
  }, [location, spot]);

  // Helper for distance
  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; 
    const dLat = deg2rad(lat2-lat1);
    const dLon = deg2rad(lon2-lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI/180)
  }
  
  const statusConfig = {
    [SpotStatus.WET]: { color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', label: 'Wet Surface', icon: Droplets },
    [SpotStatus.CROWDED]: { color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', label: 'High Traffic', icon: Users },
    [SpotStatus.DRY]: { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', label: 'Prime Conds', icon: Wind },
    [SpotStatus.MAINTENANCE]: { color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10', label: 'Maintenance', icon: Activity },
  };

  const status = statusConfig[spot.status || SpotStatus.DRY];
  const StatusIcon = status.icon;

  const activeSessionsCount = sessions.length;
  const activeChallengesCount = challenges.length;

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 flex flex-col justify-end pointer-events-none">
        
        {/* Card Container */}
        <div 
            className="w-full bg-[#0b0c10] rounded-t-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col pointer-events-auto border-t border-white/10 animate-[enter-sheet_0.3s_ease-out_forwards]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Drag Handle Indicator */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full z-20" />

            {/* Header Image Area */}
            <div className="relative h-48 w-full shrink-0">
                <img src={spot.images?.[0] || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent opacity-60" />
                
                {/* Top Actions */}
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/40 rounded-full text-white backdrop-blur-md border border-white/10 hover:bg-white/10 active:scale-95 transition-all z-20">
                    <X size={20} />
                </button>

                {/* Status Badge */}
                <div className="absolute top-6 left-6 z-20">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border ${status.bg} ${status.border}`}>
                        <StatusIcon size={12} className={status.color} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                    </div>
                </div>

                {/* Title Block */}
                <div className="absolute bottom-4 left-6 right-6 z-20">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1 opacity-80">
                                <span className="text-indigo-400">{spot.type}</span>
                                <span className="w-1 h-1 bg-slate-500 rounded-full" />
                                <span>{distance} Away</span>
                            </div>
                            <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-[0.9] drop-shadow-xl w-[90%]">
                                {spot.name}
                            </h3>
                        </div>
                        {crew && (
                            <div className="flex flex-col items-center">
                                <div className="text-[30px] shadow-xl drop-shadow-lg">{crew.avatar}</div>
                                <div className="text-[7px] font-black text-white uppercase tracking-widest bg-indigo-600 px-1.5 py-0.5 rounded mt-1">HQ</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tactical Data Grid */}
            <div className="px-6 pt-2 pb-6 space-y-5 bg-[#0b0c10]">
                
                {/* Stats Modules */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Active Units Module */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between group active:scale-95 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5"><Users size={40} /></div>
                        <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2 flex items-center gap-2">
                            Active Units <span className={`w-1.5 h-1.5 rounded-full ${activeSessionsCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`} />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {activeSessionsCount > 0 ? (
                                <>
                                    <div className="flex -space-x-2">
                                        {sessions.slice(0,3).map((s, i) => (
                                            <div key={i} className="w-7 h-7 rounded-full bg-slate-800 border-2 border-[#0b0c10] overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${s.userId}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm font-black text-white ml-1">+{activeSessionsCount}</span>
                                </>
                            ) : (
                                <span className="text-xs font-bold text-slate-500 italic">Sector Clear</span>
                            )}
                        </div>
                    </div>

                    {/* Bounties Module */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between group active:scale-95 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5"><Zap size={40} /></div>
                        <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2 flex items-center gap-2">
                            Bounties <Activity size={10} className="text-indigo-500" />
                        </div>
                        
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-white leading-none italic">{activeChallengesCount}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Available</span>
                        </div>
                    </div>
                </div>

                {/* Intel Box */}
                <div className="bg-[#121214] rounded-2xl p-4 border border-white/5 flex gap-3">
                    <div className="mt-1 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <MapPin size={14} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase text-white tracking-widest">{spot.location.address}</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                            {spot.notes}
                        </p>
                    </div>
                </div>

                {/* Action Deck */}
                <div className="grid grid-cols-[1fr_1.5fr] gap-3 pt-2">
                    <button 
                        onClick={() => { triggerHaptic('success'); onCheckIn(); }}
                        className="py-4 bg-[#1a1a1a] text-white border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-[#252525] transition-all active:scale-95 shadow-lg"
                    >
                        <Clock size={16} /> Check In
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('medium'); window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.location.lat},${spot.location.lng}`, '_blank'); }}
                        className="py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        <Navigation size={16} strokeWidth={2.5} /> Navigate
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SpotPreviewCard;
