
import { useState, useEffect } from 'react';

export type LayoutMode = 'compact' | 'regular';

export const useLayoutMode = (): LayoutMode => {
  // default to compact to prioritize mobile-first loading
  const [mode, setMode] = useState<LayoutMode>('compact');

  useEffect(() => {
    // 768px is the standard breakpoint for iPad Portrait / Tablets
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMode(e.matches ? 'regular' : 'compact');
    };

    // Initial check
    handleChange(mediaQuery);

    // Listener
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return mode;
};
