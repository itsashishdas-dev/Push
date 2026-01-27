
import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface SkaterGameProps {
  onClose?: () => void;
  isOverlay?: boolean;
}

// --- CONFIGURATION ---
const PIXEL_SIZE = 4; 
const GRAVITY = 0.7; 
const JUMP_FORCE = -10; 
const GROUND_Y_OFFSET = 40;
const INITIAL_SPEED = 5; // Slower start
const MAX_SPEED = 18;
const SPEED_INCREMENT = 0.2;

// --- ASSETS (Small Scale) ---

// Character: 12x14 Grid
// Body static, wheels animate
const SPRITE_SKATER_RUN_1 = [
  "000001100000",
  "000001100000", // Head
  "000001000000",
  "000011100000", // Arms
  "000001000000", // Torso
  "000001000000",
  "000010100000", // Legs (bent knees)
  "000010100000",
  "000000000000",
  "001111111100", // Board
  "000100001000", // Wheels A
  "000010000100"
];

const SPRITE_SKATER_RUN_2 = [
  "000001100000",
  "000001100000",
  "000001000000",
  "000011100000",
  "000001000000",
  "000001000000",
  "000010100000",
  "000010100000",
  "000000000000",
  "001111111100", 
  "000010000100", // Wheels B (Rotated visual)
  "000100001000"
];

const SPRITE_SKATER_JUMP = [
  "000001100000",
  "000001100000",
  "000001000000",
  "000111110000", // Arms Up
  "000001000000",
  "000010010000", // Legs tucked
  "000000000000",
  "000000000000",
  "000011111111", // Angled Board
  "000001000010",
  "000000000000"
];

const SPRITE_SKATER_DUCK = [
  "000000000000",
  "000000000000",
  "000000000000",
  "000000000000",
  "000001100000", // Head Low
  "000011110000", // Crouched
  "000010010000",
  "000000000000",
  "001111111100",
  "000100001000",
  "000010000100"
];

const SPRITE_SKATER_GRIND = [
  "000001100000",
  "000001100000",
  "000001000000",
  "000111110000", // Balance Arms
  "000001000000",
  "000010100000",
  "000010100000",
  "000000000000",
  "001111111100", // Flat Board
  "000100001000",
  "000010000100"
];

// --- OBSTACLES (Bigger & Clearer) ---

const SPRITE_HYDRANT = [
  "00001100",
  "00111111",
  "00011100",
  "00011100",
  "01111111",
  "01111111",
  "01111111",
  "01111111",
  "00011100",
  "00111110"
];

const SPRITE_RAIL = [
  "00000000000000",
  "11111111111111", // Top Bar
  "11111111111111", // Thick Bar
  "00001100110000",
  "00001100110000",
  "00001100110000",
  "00001100110000",
  "00111100111100"
];

const SPRITE_BOX = [
  "1111111111111111",
  "1111111111111111", // Top Surface
  "1100000000000011",
  "1100000000000011",
  "1100000000000011",
  "1100000000000011",
  "1100000000000011",
  "1111111111111111"
];

const SPRITE_DRONE = [
  "000110011000",
  "011111111110",
  "111011110111",
  "000011110000",
  "000001100000"
];

const SkaterGame: React.FC<SkaterGameProps> = ({ onClose, isOverlay = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<number>();
  
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('skater_highscore_pixel') || '0'));

  const state = useRef({
    skater: {
      y: 0,
      dy: 0,
      grounded: true,
      ducking: false,
      grinding: false,
      frameTick: 0
    },
    obstacles: [] as { 
        type: 'HYDRANT' | 'RAIL' | 'BOX' | 'DRONE', 
        x: number, 
        y: number, 
        w: number, 
        h: number, 
        grindable: boolean,
        grinded: boolean
    }[],
    speed: INITIAL_SPEED,
    distance: 0,
    groundY: 260
  });

  const drawPixelGrid = (ctx: CanvasRenderingContext2D, grid: string[], x: number, y: number, color: string = '#FFFFFF') => {
    ctx.fillStyle = color;
    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        if (row[c] === '1') {
          ctx.fillRect(Math.floor(x + c * PIXEL_SIZE), Math.floor(y + r * PIXEL_SIZE), PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    }
  };

  const initGame = () => {
    if (!canvasRef.current) return;
    const internalHeight = 300;
    const groundY = internalHeight - GROUND_Y_OFFSET;
    // Calculate start Y to be on the ground
    // Character is approx 12 units tall
    const startY = groundY - (12 * PIXEL_SIZE);

    state.current = {
      skater: { y: startY, dy: 0, grounded: true, ducking: false, grinding: false, frameTick: 0 },
      obstacles: [],
      speed: INITIAL_SPEED,
      distance: 0,
      groundY: groundY
    };
    setScore(0);
    setGameState('PLAYING');
    playSound('boot');
  };

  const handleJump = () => {
    if (gameState !== 'PLAYING') return;
    const s = state.current.skater;

    if (s.grounded || s.grinding) {
      s.dy = JUMP_FORCE;
      s.grounded = false;
      s.grinding = false;
      playSound('ollie');
      triggerHaptic('light');
    }
  };

  const handleDuck = (isDucking: boolean) => {
    if (gameState !== 'PLAYING') return;
    state.current.skater.ducking = isDucking;
    if (isDucking && !state.current.skater.grounded) {
      state.current.skater.dy += 4; // Fast drop
    }
  };

  const gameOver = () => {
    setGameState('GAME_OVER');
    playSound('error');
    triggerHaptic('heavy');
    const finalScore = Math.floor(state.current.distance / 10);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('skater_highscore_pixel', finalScore.toString());
    }
  };

  // --- LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const INTERNAL_WIDTH = 600;
    const INTERNAL_HEIGHT = 300;
    
    canvas.width = INTERNAL_WIDTH;
    canvas.height = INTERNAL_HEIGHT;
    
    if (gameState === 'IDLE') {
        state.current.groundY = INTERNAL_HEIGHT - GROUND_Y_OFFSET;
    }

    const loop = () => {
      if (gameState === 'PLAYING') update(canvas);
      if (gameState === 'PLAYING') draw(ctx, canvas);
      else renderStatic(ctx, canvas);
      reqRef.current = requestAnimationFrame(loop);
    };

    const update = (cvs: HTMLCanvasElement) => {
      const s = state.current;
      s.distance++;
      s.skater.frameTick++;
      setScore(Math.floor(s.distance / 10));

      // Gradual Acceleration
      if (s.distance % 200 === 0 && s.speed < MAX_SPEED) {
        s.speed += SPEED_INCREMENT;
      }

      // Physics
      if (!s.skater.grounded && !s.skater.grinding) {
        s.skater.dy += GRAVITY;
        s.skater.y += s.skater.dy;
      } else if (s.skater.grinding) {
          s.skater.dy = 0; // Stay on rail
      } else {
        s.skater.dy = 0;
      }

      // Ground Check
      // Skater sprite height is approx 12 blocks (48px)
      const skaterH = (s.skater.ducking ? 11 : 12) * PIXEL_SIZE;
      const floorY = s.groundY - skaterH;
      
      if (s.skater.y >= floorY && !s.skater.grinding) {
        if (!s.skater.grounded) {
            playSound('land');
        }
        s.skater.y = floorY;
        s.skater.grounded = true;
      }

      // Spawning
      const lastOb = s.obstacles[s.obstacles.length - 1];
      const minDistance = 250 + (Math.random() * 150) + (s.speed * 12);
      
      if (!lastOb || (cvs.width - (lastOb.x + lastOb.w) > minDistance)) {
        if (Math.random() < 0.6) {
          const r = Math.random();
          let type: any = 'HYDRANT';
          let w = PIXEL_SIZE * 8;
          let h = PIXEL_SIZE * 10; // Taller obstacles
          let grindable = false;

          if (r > 0.80) { // Drone (High)
             type = 'DRONE';
             w = PIXEL_SIZE * 12;
             h = PIXEL_SIZE * 5;
          } else if (r > 0.55) { // Rail (Grind)
             type = 'RAIL';
             w = PIXEL_SIZE * 14;
             h = PIXEL_SIZE * 8;
             grindable = true;
          } else if (r > 0.30) { // Box (Grind)
             type = 'BOX';
             w = PIXEL_SIZE * 16;
             h = PIXEL_SIZE * 8;
             grindable = true;
          } else { // Hydrant (Jump)
             type = 'HYDRANT';
             w = PIXEL_SIZE * 8;
             h = PIXEL_SIZE * 10;
          }

          s.obstacles.push({ type, x: cvs.width, y: 0, w, h, grindable, grinded: false });
        }
      }

      // Obstacle Logic
      let isCurrentlyGrinding = false;

      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const ob = s.obstacles[i];
        ob.x -= s.speed;

        // Player Hitbox (Tighter X, precise Y)
        const pPadding = PIXEL_SIZE * 2;
        const pRect = {
          x: 50 + pPadding,
          y: s.skater.y + pPadding,
          w: (12 * PIXEL_SIZE) - (pPadding * 2), // 12 blocks wide
          h: skaterH - (pPadding * 2)
        };

        // Obstacle Y Position
        let obY = s.groundY - ob.h;
        if (ob.type === 'DRONE') obY = s.groundY - (16 * PIXEL_SIZE); // Higher flying

        const obRect = {
          x: ob.x + PIXEL_SIZE,
          y: obY + PIXEL_SIZE,
          w: ob.w - (PIXEL_SIZE * 2),
          h: ob.h - (PIXEL_SIZE * 2)
        };

        // Collision Check (AABB)
        const colliding = 
          pRect.x < obRect.x + obRect.w &&
          pRect.x + pRect.w > obRect.x &&
          pRect.y < obRect.y + obRect.h &&
          pRect.y + pRect.h > obRect.y;

        if (colliding) {
            // GRIND LOGIC FIX
            // We check if the player's FEET (bottom of rect) are near the TOP of the obstacle
            // And player must be falling or level (dy >= 0)
            const playerBottom = pRect.y + pRect.h;
            const obstacleTop = obRect.y;
            const grindTolerance = PIXEL_SIZE * 4; // Generous window

            const canGrind = 
                ob.grindable && 
                s.skater.dy >= 0 && 
                playerBottom <= obstacleTop + grindTolerance;

            if (canGrind) {
                // Snap to grind
                s.skater.y = obstacleTop - skaterH; // Place on top
                s.skater.dy = 0;
                s.skater.grounded = false; 
                s.skater.grinding = true;
                isCurrentlyGrinding = true;
                
                if (!ob.grinded) {
                    playSound('grind');
                    triggerHaptic('light');
                    ob.grinded = true;
                }
            } else {
                // If not grinding, it's a crash
                if (!s.skater.grinding) {
                    gameOver();
                }
            }
        }

        if (ob.x + ob.w < -100) s.obstacles.splice(i, 1);
      }

      // If we were grinding but no longer colliding with ANY grindable, drop
      if (s.skater.grinding && !isCurrentlyGrinding) {
          s.skater.grinding = false;
          s.skater.grounded = false;
          // Add a little push off
          s.skater.dy = 2; 
      }
    };

    const draw = (ctx: CanvasRenderingContext2D, cvs: HTMLCanvasElement) => {
      const s = state.current;

      // 1. Background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, cvs.width, cvs.height);

      // 2. Ground
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, s.groundY, cvs.width, PIXEL_SIZE);

      // 3. Obstacles
      s.obstacles.forEach(ob => {
        let sprite = SPRITE_HYDRANT;
        let color = '#ef4444'; // Red Hydrant

        if (ob.type === 'RAIL') { sprite = SPRITE_RAIL; color = '#94a3b8'; } // Silver Rail
        else if (ob.type === 'BOX') { sprite = SPRITE_BOX; color = '#d97706'; } // Wood Box
        else if (ob.type === 'DRONE') { sprite = SPRITE_DRONE; color = '#ef4444'; } // Red Drone

        let drawY = s.groundY - ob.h;
        if (ob.type === 'DRONE') drawY = s.groundY - (16 * PIXEL_SIZE);

        drawPixelGrid(ctx, sprite, ob.x, drawY, color);
      });

      // 4. Skater
      let sprite = SPRITE_SKATER_RUN_1;
      if (s.skater.grinding) {
          sprite = SPRITE_SKATER_GRIND;
      } else if (!s.skater.grounded) {
          sprite = SPRITE_SKATER_JUMP;
      } else if (s.skater.ducking) {
          sprite = SPRITE_SKATER_DUCK;
      } else {
          // Animate wheels every 8 frames
          sprite = Math.floor(s.skater.frameTick / 8) % 2 === 0 ? SPRITE_SKATER_RUN_1 : SPRITE_SKATER_RUN_2;
      }

      drawPixelGrid(ctx, sprite, 50, s.skater.y, '#ffffff');
    };

    const renderStatic = (ctx: CanvasRenderingContext2D, cvs: HTMLCanvasElement) => {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, state.current.groundY, cvs.width, PIXEL_SIZE);
        drawPixelGrid(ctx, SPRITE_SKATER_RUN_1, 50, state.current.groundY - (12 * PIXEL_SIZE));
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
  }, [gameState]);

  // --- CONTROLS ---
  const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          if (gameState === 'IDLE' || gameState === 'GAME_OVER') initGame();
          else handleJump();
      } else if (e.code === 'ArrowDown') {
          e.preventDefault();
          handleDuck(true);
      }
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') handleDuck(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      if (gameState === 'IDLE' || gameState === 'GAME_OVER') initGame();
      else handleJump();
  };

  useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
      };
  }, [gameState]);

  // --- RENDER ---
  const content = (
    <div 
        ref={containerRef}
        onClick={(e) => e.stopPropagation()} 
        onTouchStart={handleTouchStart}
        className={`relative bg-black border-2 border-white/20 overflow-hidden shadow-2xl flex flex-col font-mono select-none ${isOverlay ? 'w-full max-w-lg aspect-[2/1] rounded-[2rem]' : 'w-full aspect-video rounded-xl'}`}
    >
      {/* CRT Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none z-30 opacity-50" />
      
      {/* HUD */}
      <div className="absolute top-4 right-6 flex gap-6 z-20 text-[10px] md:text-xs font-bold tracking-widest text-white mix-blend-difference pointer-events-none">
          <span className="opacity-50">HI {highScore.toString().padStart(5, '0')}</span>
          <span>{score.toString().padStart(5, '0')}</span>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block relative z-10" />

      {/* Start Screen */}
      {gameState === 'IDLE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40 bg-black/60 backdrop-blur-sm">
              <p className="text-white text-xl md:text-2xl font-black tracking-widest animate-pulse mb-2">PRESS START</p>
              <div className="text-[8px] text-slate-300 uppercase tracking-wider bg-black/50 px-3 py-1 rounded border border-white/20">Space/Tap to Jump • Down to Duck</div>
          </div>
      )}

      {/* Game Over */}
      {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40 backdrop-blur-sm">
              <div className="text-center">
                  <h2 className="text-white text-3xl font-black tracking-widest mb-4 italic">SLAMMED</h2>
                  <button 
                    onClick={(e) => { e.stopPropagation(); initGame(); }} 
                    className="px-6 py-3 border-2 border-white text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-2 mx-auto text-xs rounded-lg pointer-events-auto"
                  >
                      <RotateCcw size={14} /> Retry
                  </button>
              </div>
          </div>
      )}
    </div>
  );

  if (isOverlay) {
      return (
          <div 
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-view"
            onClick={onClose}
          >
              <div className="absolute top-6 right-6 z-50">
                  <button onClick={onClose} className="p-3 bg-black/50 text-white border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
                      <X size={20} />
                  </button>
              </div>
              
              <div className="w-full max-w-lg relative animate-pop">
                  {content}
                  <div className="mt-4 text-center">
                      <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
                          [SPACE] Jump • [DOWN] Duck
                      </p>
                  </div>
              </div>
          </div>
      );
  }

  return content;
};

export default SkaterGame;
