
import React from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Crosshair, X, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface LocationPermissionModalProps {
  onAllow: () => void;
  onDeny: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ onAllow, onDeny }) => {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 pointer-events-none animate-pop">
      <div className="bg-[#0b0c10] border border-white/20 rounded-2xl shadow-2xl p-4 w-full max-w-xs pointer-events-auto relative overflow-hidden group">
        {/* Scanline BG */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] opacity-20 pointer-events-none" />
        
        <div className="flex gap-4 relative z-10">
            {/* Icon Block */}
            <div className="w-12 h-12 bg-indigo-900/20 rounded-xl border border-indigo-500/30 flex items-center justify-center shrink-0 animate-pulse">
                <Crosshair size={24} className="text-indigo-400" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">System Alert</h3>
                    <button onClick={onDeny} className="text-slate-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>
                
                <p className="text-xs font-bold text-slate-300 uppercase leading-none mb-3 font-mono tracking-tight">
                    GPS Signal Required
                </p>

                <div className="flex gap-2">
                    <button 
                        onClick={() => { triggerHaptic('medium'); onAllow(); }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95 flex items-center justify-center gap-1.5"
                    >
                        <MapPin size={10} /> Enable
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('light'); onDeny(); }}
                        className="px-3 bg-slate-900 border border-white/10 text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-lg transition-all active:scale-95"
                    >
                        Ignore
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LocationPermissionModal;
