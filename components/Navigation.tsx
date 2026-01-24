import React from 'react';
import { Map, Swords, Users, TrendingUp, User, Film } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'spots', label: 'Map', icon: Map },
    { id: 'challenges', label: 'Play', icon: Swords },
    { id: 'mentorship', label: 'Mentor', icon: Users },
    { id: 'skills', label: 'Skills', icon: TrendingUp },
    { id: 'journey', label: 'Logs', icon: Film },
    { id: 'profile', label: 'Me', icon: User },
  ];

  return (
    <nav className="w-full pb-[env(safe-area-inset-bottom)] pt-2">
      <div className="flex justify-around items-center h-14 w-full max-w-2xl mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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