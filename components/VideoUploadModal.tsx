
import React, { useState, useRef } from 'react';
import { Upload, X, Film, CheckCircle2, Loader2, Video } from 'lucide-react';
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
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2 mb-6 mt-2">
           <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border-2 border-slate-700 mb-4 shadow-lg">
              <Video size={32} className="text-indigo-500" />
           </div>
           <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">{title}</h3>
           <p className="text-xs text-slate-400 font-medium px-4">{description}</p>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto hide-scrollbar">
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video w-full rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group"
            >
               <Upload size={32} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tap to Select Clip</p>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="video/*" 
                 onChange={handleFileChange} 
               />
            </div>
          ) : (
            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-slate-700">
               <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
               <button 
                 onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                 className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-[9px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md hover:bg-red-500/80 transition-colors"
               >
                 Change
               </button>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
             <Film size={20} className="text-amber-500 shrink-0" />
             <p className="text-[10px] text-amber-200 leading-relaxed">
                <strong>Proof Required:</strong> Moderators will review this clip. Ensure the trick is landed clean and the spot is visible.
             </p>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
          className="w-full py-4 mt-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          {isUploading ? 'Uploading Proof...' : 'Submit for Review'}
        </button>
      </div>
    </div>
  );
};

export default VideoUploadModal;
