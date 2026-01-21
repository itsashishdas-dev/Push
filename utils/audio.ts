
// Simple Web Audio API synthesizer for Retro Sound Effects
// This avoids the need for external MP3 files and keeps the app lightweight

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playSound = (type: 'click' | 'success' | 'unlock' | 'retro_unlock' | 'error') => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        // Subtle high blip
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;

      case 'success':
        // Pleasant major 3rd
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, now); // A4
        oscillator.frequency.setValueAtTime(554.37, now + 0.1); // C#5
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case 'unlock':
        // Standard unlock sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
        oscillator.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        oscillator.start(now);
        oscillator.stop(now + 0.6);
        break;
      
      case 'retro_unlock':
        // Arcade style 8-bit jingle (Square wave)
        oscillator.type = 'square';
        
        // Arpeggio
        oscillator.frequency.setValueAtTime(220, now);
        oscillator.frequency.setValueAtTime(440, now + 0.1);
        oscillator.frequency.setValueAtTime(880, now + 0.2);
        oscillator.frequency.setValueAtTime(660, now + 0.3);
        oscillator.frequency.setValueAtTime(880, now + 0.4);
        
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.setValueAtTime(0.05, now + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        oscillator.start(now);
        oscillator.stop(now + 0.8);
        break;

      case 'error':
        // Low buzz
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.linearRampToValueAtTime(100, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};
