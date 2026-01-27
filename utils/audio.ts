
// Retro-Tactical Audio Engine
// Uses Web Audio API to synthesize sounds in real-time (No external files)

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  // Pre-generate noise buffer (Pink noise approximation for softer texture)
  if (audioCtx && !noiseBuffer) {
      const bufferSize = audioCtx.sampleRate * 2; 
      noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; 
      }
  }
};

let lastOut = 0;

const getAudioContext = () => {
  if (!audioCtx) initAudio();
  return audioCtx;
};

export type SoundType = 
  'click' | 'success' | 'error' | 'unlock' | 
  'ollie' | 'grind' | 'land' | 'roll' | 
  'boot' | 'map_zoom' | 'log_click' |
  'uplink_init' | 'skate_pop' | 'longboard_roll' | 'stance_select' | 'radar_scan' | 'radar_complete' | 'terminate' | 'data_stream' | 'tactile_select' | 'goodbye' | 'glitch';

export const playSound = (type: SoundType) => {
  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
  }

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  // Helper for Noise
  const playNoise = (duration: number, volume: number, filterFreq?: number, filterType: BiquadFilterType = 'lowpass', delay: number = 0) => {
      if (!noiseBuffer) return;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;
      const nGain = ctx.createGain();
      
      if (filterFreq) {
          const filter = ctx.createBiquadFilter();
          filter.type = filterType;
          filter.frequency.setValueAtTime(filterFreq, t + delay);
          src.connect(filter);
          filter.connect(nGain);
      } else {
          src.connect(nGain);
      }
      
      nGain.connect(ctx.destination);
      nGain.gain.setValueAtTime(0, t + delay);
      nGain.gain.linearRampToValueAtTime(volume, t + delay + 0.02);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + delay + duration);
      
      src.start(t + delay);
      src.stop(t + delay + duration);
  };

  switch (type) {
    case 'click':
      // Sharper UI Click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
      break;

    case 'tactile_select':
      // Soft mechanical thud
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
      break;

    case 'data_stream':
      // Subtle computing chatter
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200 + Math.random() * 200, t);
      gain.gain.setValueAtTime(0.005, t); // Very quiet
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      osc.start(t);
      osc.stop(t + 0.02);
      break;

    case 'success':
      // Smooth ethereal chord
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(880, t + 0.3);
      gain.gain.setValueAtTime(0.0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
      
      // Harmonics
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(554, t); // C#
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(0.03, t + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc2.start(t);
      osc2.stop(t + 0.5);
      break;

    case 'error':
      // Low, soft buzz
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.2);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
      break;

    case 'unlock':
      // Airy high ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
      break;

    // --- IMMERSIVE SOUNDS ---

    case 'boot':
      // Slow capacitor charge - KEPT FOR REFERENCE BUT REMOVED FROM ONBOARDING
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 1.5);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, t);
      filter.frequency.linearRampToValueAtTime(1000, t + 1.0);
      
      osc.disconnect();
      osc.connect(filter);
      filter.connect(gain);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.03, t + 0.5);
      gain.gain.linearRampToValueAtTime(0, t + 1.5);
      
      osc.start(t);
      osc.stop(t + 1.5);
      break;

    case 'uplink_init':
        // Modified to be cleaner (no noise burst)
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.setValueAtTime(1200, t + 0.1);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;

    case 'map_zoom':
      // Woosh
      playNoise(0.3, 0.05, 400, 'lowpass');
      break;

    case 'log_click':
      // Mechanical key press
      playNoise(0.05, 0.08, 1500, 'bandpass');
      break;

    case 'radar_scan':
        // Sonar ping (Ping only, very minimal)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;

    case 'goodbye':
        // Power down
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;

    case 'glitch':
        // Tech Glitch: Static Burst + Digital Tear
        // 1. Static Texture (High pass noise)
        playNoise(0.12, 0.12, 3000, 'highpass'); 
        
        // 2. Digital Tearing (Square wave modulation)
        osc.type = 'square';
        // Randomize base frequency for variety
        const glFreq = Math.random() > 0.5 ? 120 : 60; 
        osc.frequency.setValueAtTime(glFreq, t);
        osc.frequency.linearRampToValueAtTime(glFreq * 0.5, t + 0.1);
        
        gain.gain.setValueAtTime(0.1, t); // Louder for visibility
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      
    // Game Sounds (Keep slightly punchier but reasonable)
    case 'ollie':
      playNoise(0.1, 0.2, 1000, 'lowpass');
      break;
    case 'land':
      playNoise(0.15, 0.25, 400, 'lowpass');
      break;
    case 'grind':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
      playNoise(0.3, 0.1, 2000, 'bandpass');
      break;
  }
};
