
import React, { useState, useRef } from 'react';
import { Upload, X, Film, CheckCircle2, Loader2, Video, AlertTriangle } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface VideoUploadModalProps {
  title: string;
  description: string;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ title, description, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      triggerHaptic('light');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    triggerHaptic('medium');
    try {
      await onUpload(selectedFile);
      triggerHaptic('success');
      onClose(); // Parent handles success UI
    } catch (e) {
      console.error(e);
      triggerHaptic('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-view">
      
      {/* Card Container */}
      <div className="w-full max-w-sm bg-[#0b0c10] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Background Noise/Scanlines to match onboarding */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>
        
        {/* Decorative Protocol ID */}
        <div className="absolute top-6 right-6 text-[9px] font-black uppercase tracking-widest text-slate-700 z-20 pointer-events-none">
            UPLOAD_SEQ_01
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-30 p-2 bg-black/40 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5 active:scale-90"
        >
          <X size={18} />
        </button>

        {/* Header Section */}
        <div className="relative z-10 mt-4 mb-6">
           <div className="w-12 h-0.5 bg-indigo-500 mb-4 shadow-[0_0_10px_#6366f1]"></div>
           
           <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter mb-2 leading-[0.85] drop-shadow-xl w-[90%]">
               {title}
           </h3>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed border-l-2 border-slate-800 pl-3">
               {description}
           </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto hide-scrollbar relative z-10">
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video w-full rounded-2xl border border-white/10 bg-slate-900/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-900/50 hover:border-indigo-500/50 transition-all group relative overflow-hidden"
            >
               {/* Animated icon background */}
               <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                   <Video size={80} />
               </div>

               <div className="w-14 h-14 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10">
                   <Upload size={24} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
               </div>
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors relative z-10">Tap to Select Clip</p>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="video/*" 
                 onChange={handleFileChange} 
               />
            </div>
          ) : (
            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-white/10 shadow-lg">
               <video src={previewUrl} className="w-full h-full object-cover opacity-80" autoPlay muted loop playsInline />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
               
               <button 
                 onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                 className="absolute bottom-4 right-4 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl backdrop-blur-md hover:bg-red-500/30 transition-colors"
               >
                 Remove
               </button>
            </div>
          )}

          {/* Warning Box */}
          <div className="bg-[#121214] border-l-2 border-amber-500 p-4 rounded-r-xl flex gap-3 items-start">
             <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
             <div className="space-y-1">
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Proof Required</p>
                 <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                    Moderators will review this clip. Ensure the trick is landed clean and the spot is visible.
                 </p>
             </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 relative z-10">
            <button 
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className={`w-full h-16 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 relative overflow-hidden group ${
                !selectedFile || isUploading 
                ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-white/5' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400/50'
            }`}
            >
                {/* Shine Effect */}
                {selectedFile && !isUploading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}

                {isUploading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Transmitting...</span>
                    </>
                ) : (
                    <>
                        <CheckCircle2 size={16} />
                        <span>Submit For Review</span>
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
