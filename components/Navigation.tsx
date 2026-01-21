
import React from 'react';
import { Map, Swords, Users, TrendingUp, User, LayoutGrid } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'spots', label: 'Map', icon: Map },
    { id: 'challenges', label: 'Challenges', icon: Swords },
    { id: 'mentorship', label: 'Mentors', icon: Users },
    { id: 'skills', label: 'Journey', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 md:relative md:w-24 lg:w-28 md:h-full z-[100] bg-black/80 backdrop-blur-xl border-t md:border-t-0 md:border-r border-slate-800 flex md:flex-col justify-center md:justify-start pt-2 md:pt-12 transition-all duration-300 pb-[env(safe-area-inset-bottom)] md:pb-0"
    >
      <div className="flex md:flex-col justify-between md:justify-start items-center w-full max-w-lg md:max-w-none px-4 md:px-0 md:gap-8 lg:gap-10 h-[60px] md:h-auto">
        
        {/* Logo Mark for Desktop Sidebar */}
        <div className="hidden md:flex flex-col items-center mb-4 lg:mb-8">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
             <span className="text-black text-xl lg:text-2xl font-black italic tracking-tighter">P</span>
          </div>
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 md:gap-2 w-full md:w-full transition-all group relative active:scale-95 touch-manipulation ${
                isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`p-1 md:p-2.5 rounded-2xl transition-all duration-300 relative ${isActive ? 'bg-indigo-500/10 md:bg-transparent' : ''}`}>
                 <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'group-hover:scale-110'}`} 
                 />
                 {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full md:hidden" />
                 )}
              </div>
              <span className={`text-[9px] lg:text-[10px] font-black tracking-widest uppercase transition-all ${isActive ? 'opacity-100 text-white' : 'opacity-0 md:opacity-70 group-hover:opacity-100 hidden md:block'}`}>
                {tab.label}
              </span>
              
              {/* Active Indicator for Desktop */}
              {isActive && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-l-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
