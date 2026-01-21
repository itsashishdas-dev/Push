
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
  // Check if navigator and vibrate are available (browser support)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10); // Light tap for standard buttons
          break;
        case 'medium':
          navigator.vibrate(40); // Firmer press for actions
          break;
        case 'heavy':
          navigator.vibrate(80); // Heavy impact
          break;
        case 'success':
          navigator.vibrate([50, 50, 100]); // Da-da-DA pattern for achievements
          break;
        case 'error':
          navigator.vibrate([50, 100, 50, 100]); // Buzz-buzz for errors/warnings
          break;
      }
    } catch (e) {
      // Fail silently if vibration is blocked or unsupported
    }
  }
};
