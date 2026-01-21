
import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  return (
    <div className="h-screen bg-black flex flex-col animate-view">
      <header className="p-8 border-b border-slate-900 flex items-center gap-4 bg-black sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-transform"><ChevronLeft size={28} /></button>
        <h2 className="text-xl font-black uppercase italic tracking-tighter">Privacy Policy</h2>
      </header>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-8 text-slate-400 text-sm leading-relaxed hide-scrollbar pb-32">
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Last updated: Jan 2024</p>
          <p className="italic">PUSH respects your privacy and is committed to protecting your personal data.</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-white font-black uppercase italic tracking-tight">Information We Collect</h3>
          <p>We collect only what is necessary to operate the app:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Account information (username, email)</li>
            <li>City and general location (not precise tracking)</li>
            <li>Uploaded content (videos, spot submissions)</li>
            <li>App usage data (for performance and improvement)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-white font-black uppercase italic tracking-tight">How We Use Your Data</h3>
          <p>Your data is used to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Show nearby skate spots</li>
            <li>Track progress and sessions</li>
            <li>Maintain leaderboards</li>
            <li>Improve app performance</li>
          </ul>
          <p className="font-bold text-white uppercase text-xs">We do not sell personal data.</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-white font-black uppercase italic tracking-tight">Video & Content Uploads</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Videos are uploaded voluntarily</li>
            <li>You own your content</li>
            <li>You may delete your videos at any time</li>
            <li>Reported content may be reviewed by moderators</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-white font-black uppercase italic tracking-tight">Data Sharing</h3>
          <p>We only share data with essential service providers (cloud storage, authentication) to operate PUSH. No third-party advertising trackers.</p>
        </section>

        <section className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
          <h3 className="text-red-400 font-black uppercase italic tracking-tight mb-2">Safety Disclaimer</h3>
          <p className="text-[11px] text-red-200">Skateboarding and downhill longboarding involve risk. PUSH does not take responsibility for injuries or damages.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;
