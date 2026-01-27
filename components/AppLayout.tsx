
import React from 'react';
import Navigation from './Navigation';
import { useLayoutMode } from '../hooks/useLayoutMode';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const mode = useLayoutMode();

  return (
    <div className={`flex h-full w-full bg-[#020202] overflow-hidden ${mode === 'regular' ? 'flex-row' : 'flex-col'}`}>
      
      {/* 
        NAVIGATION
        - Compact: Rendered at bottom (via fixed positioning in Nav component)
        - Regular: Rendered as left rail
      */}
      {mode === 'regular' && (
        <aside className="w-24 shrink-0 h-full border-r border-white/5 bg-[#050505] z-50 pl-[env(safe-area-inset-left)]">
          <Navigation mode="rail" />
        </aside>
      )}

      {/* 
        MAIN CONTENT AREA 
        - Flex-1 to fill remaining space
        - Relative positioning to contain absolute children (maps, overlays)
        - Added padding-bottom in compact mode to ensure content isn't hidden behind the fixed nav
        - Added safe area padding for right side (landscape notch)
      */}
      <main className={`flex-1 relative h-full overflow-hidden flex flex-col pr-[env(safe-area-inset-right)] ${mode === 'compact' ? 'pb-16 pl-[env(safe-area-inset-left)]' : ''}`}>
        {children}
      </main>

      {/* BOTTOM NAVIGATION (Compact Only) */}
      {mode === 'compact' && (
        <Navigation mode="bottom" />
      )}
    </div>
  );
};

export default AppLayout;
