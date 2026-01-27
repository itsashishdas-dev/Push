
import React from 'react';
import { Map, Swords, Users, User, Film } from 'lucide-react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface NavigationProps {
  mode?: 'bottom' | 'rail';
}

const Navigation: React.FC<NavigationProps> = ({ mode = 'bottom' }) => {
  const { currentView, setView } = useAppStore();

  const tabs: { id: AppView; label: string; icon: any }[] = [
    { id: 'MAP', label: 'Map', icon: Map },
    { id: 'CHALLENGES', label: 'Play', icon: Swords },
    { id: 'MENTORSHIP', label: 'Mentor', icon: Users },
    { id: 'JOURNEY', label: 'Logs', icon: Film },
    { id: 'PROFILE', label: 'Me', icon: User },
  ];

  const handleTabClick = (id: AppView) => {
    triggerHaptic('light');
    setView(id);
  };

  // Map 'LIST' view to 'MAP' tab for UI highlighting
  const activeTabId = currentView === 'LIST' ? 'MAP' : currentView;

  if (mode === 'rail') {
    return (
      <nav className="h-full flex flex-col items-center py-8 gap-8">
        {/* Branding Icon */}
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
           <div className="text-white font-black italic">S</div>
        </div>

        <div className="flex flex-col gap-6 flex-1 w-full px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all duration-300 group
                  ${isActive ? 'bg-white/5 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_8px_#6366f1]" />
                )}
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                />
                <span className="text-[9px] font-bold tracking-widest uppercase opacity-80">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Default: Bottom Navigation
  // Changed from absolute to fixed bottom-0 to prevent being hidden on mobile browsers with address bars
  return (
    <nav className="w-full pb-[env(safe-area-inset-bottom)] pt-2 border-t border-white/5 bg-black/90 backdrop-blur-xl fixed bottom-0 left-0 z-[100]">
      <div className="flex justify-around items-center h-14 w-full max-w-2xl mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 w-14 ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
              />
              <span className="text-[10px] font-medium tracking-wide">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
