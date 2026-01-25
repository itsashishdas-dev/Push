
import React from 'react';
import { Map, Swords, Users, TrendingUp, User, Film } from 'lucide-react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { triggerHaptic } from '../utils/haptics';

const Navigation: React.FC = () => {
  const { currentView, setView } = useAppStore();

  const tabs: { id: AppView; label: string; icon: any }[] = [
    { id: 'MAP', label: 'Map', icon: Map },
    { id: 'CHALLENGES', label: 'Play', icon: Swords },
    { id: 'MENTORSHIP', label: 'Mentor', icon: Users },
    { id: 'SKILLS', label: 'Skills', icon: TrendingUp },
    { id: 'JOURNEY', label: 'Logs', icon: Film },
    { id: 'PROFILE', label: 'Me', icon: User },
  ];

  const handleTabClick = (id: AppView) => {
    triggerHaptic('light');
    setView(id);
  };

  // Map 'LIST' view to 'MAP' tab for UI highlighting
  const activeTabId = currentView === 'LIST' ? 'MAP' : currentView;

  return (
    <nav className="w-full pb-[env(safe-area-inset-bottom)] pt-2 border-t border-white/5 bg-black/80 backdrop-blur-xl absolute bottom-0 left-0 z-[100]">
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
