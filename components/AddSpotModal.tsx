
import React, { useState, useRef } from 'react';
import { X, MapPin, CheckCircle2, Loader2, Camera, AlignLeft, LocateFixed, Signal, Eye, EyeOff, Users, Video, ChevronDown } from 'lucide-react';
import { Discipline, SpotCategory, Difficulty, SpotPrivacy } from '../types';
import { useAppStore } from '../store';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';

const AddSpotModal: React.FC = () => {
  const { closeModal, addNewSpot, user } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  // Media State
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
      name: '',
      type: Discipline.SKATE,
      difficulty: Difficulty.BEGINNER,
      description: '',
      privacy: SpotPrivacy.PUBLIC
  });

  const handleAcquireGPS = () => {
      setIsLocating(true);
      setGpsError(null);
      triggerHaptic('medium');
      playSound('radar_scan');

      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  setCoords({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                  });
                  setIsLocating(false);
                  triggerHaptic('success');
                  playSound('radar_complete');
              },
              (err) => {
                  console.error(err);
                  setGpsError("SIGNAL LOST");
                  setIsLocating(false);
                  triggerHaptic('error');
                  playSound('error');
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
      } else {
          setGpsError("GPS HARDWARE MISSING");
          setIsLocating(false);
      }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const newFiles = Array.from(e.target.files).slice(0, 3 - images.length);
          setImages([...images, ...newFiles]);
          triggerHaptic('light');
      }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setVideo(e.target.files[0]);
          triggerHaptic('light');
      }
  };

  const handleSubmit = async () => {
      if (!form.name || !coords || images.length === 0 || !video) return;
      setIsLoading(true);
      triggerHaptic('medium');
      
      try {
          // In a real app, upload files here and get URLs
          const mockImageUrls = images.map(() => `https://picsum.photos/seed/${Date.now()}/400/400`);
          const mockVideoUrl = "https://example.com/spot-clip.mp4";

          await addNewSpot({
              name: form.name,
              type: form.type,
              difficulty: form.difficulty,
              notes: form.description,
              privacy: form.privacy,
              images: mockImageUrls,
              videoUrl: mockVideoUrl,
              location: { 
                  lat: coords.lat, 
                  lng: coords.lng, 
                  address: 'Unknown Sector' 
              },
              ownerId: user?.id
          });
          triggerHaptic('success');
          closeModal();
      } catch (e) {
          triggerHaptic('error');
      } finally {
          setIsLoading(false);
      }
  };

  const isFormValid = form.name && coords && images.length > 0 && video && !isLoading;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-view">
        <div className="w-full max-w-sm bg-[#0b0c10] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-[0.85]">Drop<br/>Signal</h2>
                    <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                        <MapPin size={10} /> Mark New Territory
                    </p>
                </div>
                <button 
                    onClick={closeModal} 
                    className="w-8 h-8 bg-[#151515] border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-5 relative z-10 pb-6">
                
                {/* GPS Acquisition Module */}
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-1">
                        <LocateFixed size={10} /> Target Coordinates <span className="text-red-500">*</span>
                    </label>
                    
                    <div className={`relative p-1 rounded-xl border-2 transition-all ${coords ? 'border-emerald-500/50 bg-emerald-950/10' : gpsError ? 'border-red-500/50 bg-red-950/10' : 'border-dashed border-slate-700 bg-[#050505]'}`}>
                        {coords ? (
                            <div className="flex items-center justify-between p-3">
                                <div>
                                    <div className="text-[10px] font-mono font-bold text-emerald-400">LAT: {coords.lat.toFixed(6)}</div>
                                    <div className="text-[10px] font-mono font-bold text-emerald-400">LNG: {coords.lng.toFixed(6)}</div>
                                </div>
                                <div className="bg-emerald-500 text-black p-2 rounded-lg">
                                    <CheckCircle2 size={16} />
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={handleAcquireGPS}
                                disabled={isLocating}
                                className="w-full py-4 flex flex-col items-center justify-center gap-2 group"
                            >
                                {isLocating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin text-indigo-400" />
                                        <span className="text-[9px] font-bold text-indigo-300 animate-pulse">TRIANGULATING POSITION...</span>
                                    </>
                                ) : gpsError ? (
                                    <>
                                        <Signal size={18} className="text-red-500" />
                                        <span className="text-[9px] font-bold text-red-400">{gpsError} - RETRY</span>
                                    </>
                                ) : (
                                    <>
                                        <LocateFixed size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                                        <span className="text-[9px] font-bold text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">Acquire GPS Lock</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Name */}
                <div className="space-y-2 group">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-1 group-focus-within:text-white transition-colors">
                        <MapPin size={10} /> Spot Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 uppercase placeholder:text-slate-700 tracking-wider font-mono transition-colors"
                        placeholder="ENTER DESIGNATION"
                    />
                </div>

                {/* Compact Details (Discipline & Threat Level) */}
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Discipline</label>
                        <div className="relative">
                            <select 
                                value={form.type}
                                onChange={e => setForm({...form, type: e.target.value as Discipline})}
                                className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-[10px] font-black text-white uppercase focus:outline-none focus:border-indigo-500 appearance-none"
                            >
                                <option value={Discipline.SKATE}>Skate</option>
                                <option value={Discipline.DOWNHILL}>Downhill</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Threat Level</label>
                        <div className="relative">
                            <select 
                                value={form.difficulty}
                                onChange={e => setForm({...form, difficulty: e.target.value as Difficulty})}
                                className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-[10px] font-black text-white uppercase focus:outline-none focus:border-indigo-500 appearance-none"
                            >
                                <option value={Difficulty.BEGINNER}>Beginner</option>
                                <option value={Difficulty.INTERMEDIATE}>Intermediate</option>
                                <option value={Difficulty.ADVANCED}>Advanced</option>
                                <option value={Difficulty.PRO}>Pro</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Media Uploads (Mandatory) */}
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Visual Intel <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => imageInputRef.current?.click()}
                            className={`flex-1 py-4 border border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all group ${images.length > 0 ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-700 bg-[#050505]/50 hover:text-white hover:border-slate-500'}`}
                        >
                            <Camera size={16} className={images.length > 0 ? "text-emerald-400" : "text-slate-500 group-hover:scale-110 transition-transform"} /> 
                            <span className={`text-[8px] font-black uppercase tracking-widest ${images.length > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {images.length > 0 ? `${images.length} Photos` : 'Add Photos'}
                            </span>
                        </button>
                        <input type="file" multiple accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageChange} />

                        <button 
                            onClick={() => videoInputRef.current?.click()}
                            className={`flex-1 py-4 border border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all group ${video ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-700 bg-[#050505]/50 hover:text-white hover:border-slate-500'}`}
                        >
                            <Video size={16} className={video ? "text-emerald-400" : "text-slate-500 group-hover:scale-110 transition-transform"} /> 
                            <span className={`text-[8px] font-black uppercase tracking-widest ${video ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {video ? 'Clip Added' : 'Recon Clip'}
                            </span>
                        </button>
                        <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={handleVideoChange} />
                    </div>
                </div>

                {/* Privacy Protocol */}
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Visibility Protocol</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => setForm({...form, privacy: SpotPrivacy.PUBLIC})}
                            className={`py-3 rounded-lg flex flex-col items-center gap-1 border transition-all ${form.privacy === SpotPrivacy.PUBLIC ? 'bg-white text-black border-white' : 'bg-[#050505] text-slate-500 border-white/10'}`}
                        >
                            <Eye size={14} />
                            <span className="text-[7px] font-black uppercase tracking-widest">Public</span>
                        </button>
                        <button 
                            onClick={() => setForm({...form, privacy: SpotPrivacy.CREW})}
                            className={`py-3 rounded-lg flex flex-col items-center gap-1 border transition-all ${form.privacy === SpotPrivacy.CREW ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-[#050505] text-slate-500 border-white/10'}`}
                        >
                            <Users size={14} />
                            <span className="text-[7px] font-black uppercase tracking-widest">Crew</span>
                        </button>
                        <button 
                            onClick={() => setForm({...form, privacy: SpotPrivacy.PRIVATE})}
                            className={`py-3 rounded-lg flex flex-col items-center gap-1 border transition-all ${form.privacy === SpotPrivacy.PRIVATE ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#050505] text-slate-500 border-white/10'}`}
                        >
                            <EyeOff size={14} />
                            <span className="text-[7px] font-black uppercase tracking-widest">Ghost</span>
                        </button>
                    </div>
                    {form.privacy !== SpotPrivacy.PUBLIC && (
                        <p className="text-[8px] text-slate-500 font-mono text-center">
                            {form.privacy === SpotPrivacy.CREW ? 'Visible only to your unit.' : 'Visible only to you and invitees.'}
                        </p>
                    )}
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none relative overflow-hidden group disabled:bg-slate-800 disabled:text-slate-500 mt-2"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isLoading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                    {isLoading ? 'ENCRYPTING...' : 'CONFIRM DROP'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default AddSpotModal;
