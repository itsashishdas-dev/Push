
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
  onShowPrivacy: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onShowPrivacy }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuth = () => {
    setIsAuthenticating(true);
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-black animate-view overflow-y-auto relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      
      <div className="w-full max-w-sm flex flex-col items-center justify-between space-y-16 py-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.08)]">
             <span className="text-black text-4xl font-black italic tracking-tighter">P</span>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none text-white">PUSH</h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] opacity-80">India's Core Skate Network</p>
          </div>
        </div>

        {/* Main Copy */}
        <div className="text-center space-y-2">
          <p className="text-slate-200 text-lg font-bold italic">Find your spot. Track your progression.</p>
          <p className="text-slate-500 text-sm font-medium">No noise. Just skating.</p>
        </div>

        {/* Secure Auth Actions */}
        <div className="w-full space-y-4 px-2">
          {isAuthenticating ? (
            <div className="w-full h-16 flex flex-col items-center justify-center gap-4 bg-slate-900/50 rounded-full border border-slate-800">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Securing Session...</span>
            </div>
          ) : (
            <>
              <button 
                onClick={handleAuth}
                className="w-full py-5 bg-[#C7C7CC] hover:bg-[#BABABC] text-black rounded-full flex items-center justify-center gap-3 active:scale-[0.98] transition-all font-black uppercase tracking-widest text-xs shadow-lg"
              >
                <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.62 4.37-1.54 1.85.08 3.2.74 4.14 1.95-3.51 1.76-2.9 6.22 1.14 7.9-.59 1.74-1.78 3.52-2.85 4.79-.69.83-1.43 1.54-1.88 1.13zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.54 4.5-3.74 4.25z"/>
                </svg>
                Sign in with Apple
              </button>
              
              <button 
                onClick={handleAuth}
                className="w-full py-5 bg-[#1C1C1E] border border-slate-800/50 text-white rounded-full flex items-center justify-center gap-3 active:scale-[0.98] transition-all font-black uppercase tracking-widest text-xs shadow-lg hover:bg-slate-900"
              >
                <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                Sign in with Google
              </button>

              <button 
                onClick={handleAuth}
                className="w-full py-4 text-slate-600 font-black uppercase tracking-[0.2em] text-[10px] hover:text-white transition-colors mt-2"
              >
                Continue with Email
              </button>
            </>
          )}
        </div>

        {/* Trust & Policy Footer */}
        <div className="w-full">
          <p className="text-[10px] text-slate-700 text-center font-bold leading-relaxed max-w-[280px] mx-auto uppercase tracking-tighter">
            By signing in you agree to our <button onClick={onShowPrivacy} className="text-slate-400 underline decoration-indigo-500/50 underline-offset-4">Privacy Terms</button> and <button onClick={onShowPrivacy} className="text-slate-400 underline decoration-indigo-500/50 underline-offset-4">Safety Guide</button>.
          </p>
        </div>
      </div>

      <div className="fixed -bottom-48 -left-48 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -top-48 -right-48 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};

export default LoginView;
