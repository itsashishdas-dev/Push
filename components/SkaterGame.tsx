
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface SkaterGameProps {
  onClose?: () => void;
  isOverlay?: boolean;
}

// --- CONFIGURATION ---
const WORLD_PIXEL_SIZE = 3; 
const SKATER_SCALE = 2; 
const GRAVITY = 0.9; // Slightly increased gravity from 0.85
const JUMP_FORCE = -16; // Decreased from -19 to keep character on screen
const GROUND_Y_OFFSET = 50;
// Difficulty Tuning
const INITIAL_SPEED = 6; 
const MAX_SPEED = 20;    
const SPEED_INCREMENT = 0.25; 

// --- SEPARATED ASSETS ---

const SPRITE_BODY_RUN_1 = [
  "00000000111100000000",
  "00000001111110000000",
  "00000001111110000000",
  "00000000111100000000",
  "00000011111111000000",
  "00000111111111100000",
  "00000111111111100000",
  "00000111111111100000",
  "00000011111111000000",
  "00000011100111000000",
  "00000011100111000000",
  "00000111000011100000",
  "00000111000011100000",
  "00000110000001100000",
  "00000110000001100000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000"
];

const SPRITE_BODY_JUMP = [
  "00000000111100000000",
  "00000001111110000000",
  "00000001111110000000",
  "00000000111100000000",
  "00000111111111100000", 
  "00001111111111110000",
  "00001111111111110000",
  "00000011111111000000",
  "00000011111111000000",
  "00000011100111000000", 
  "00000011100111000000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000"
];

const SPRITE_BODY_GRIND = [
  "00000000111100000000",
  "00000001111110000000",
  "00000001111110000000",
  "00000000111100000000",
  "00001111111111110000", 
  "00011111111111111000",
  "00011111111111111000",
  "00000011111111000000",
  "00000011111111000000",
  "00000011100111000000",
  "00000011100111000000",
  "00000111000011100000",
  "00000111000011100000",
  "00000110000001100000",
  "00000110000001100000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000"
];

const SPRITE_BODY_DUCK = [
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000111100000000",
  "00000001111110000000",
  "00000001111110000000",
  "00000000111100000000",
  "00000011111111000000",
  "00000111111111100000",
  "00000111111111100000",
  "00000011100111000000",
  "00000011100111000000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000"
];

const SPRITE_BOARD_NORMAL = [
  "00111111111111111100",
  "00111111111111111100",
  "00011100000000111000",
  "00001000000000010000"
];

const SPRITE_BOARD_UPSIDEDOWN = [
  "00001000000000010000", 
  "00011100000000111000",
  "00111111111111111100", 
  "00111111111111111100"
];

const SPRITE_BOARD_SIDE = [
  "00000000000000000000",
  "00000000111100000000", 
  "00000000111100000000",
  "00000000000000000000"
];

const SPRITE_BOARD_VERTICAL = [
  "00000000011000000000",
  "00000000011000000000",
  "00000000011000000000",
  "00000000011000000000"
];

// --- OBSTACLES ---

const SPRITE_HYDRANT = [
  "000000111100",
  "000011111111",
  "000000111100",
  "000000111100",
  "000111111111",
  "000111111111",
  "000111111111",
  "000111111111",
  "000111111111",
  "000111111111",
  "000000111100",
  "000011111110"
];

const SPRITE_GUARD = [
  "000001111000",
  "000011111100",
  "000001111000",
  "000011111100",
  "000111111110",
  "000111111110",
  "000111111110",
  "000011111100",
  "000011001100",
  "000011001100",
  "000011001100",
  "000011001100"
];

const SPRITE_DRONE = [
  "0000110000110000",
  "0011111111111100",
  "0111011111101110",
  "0000011111100000",
  "0000001111000000",
  "0000000110000000"
];

const SPRITE_STAIRS = [
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000",
  "00000000000000000000",
  "11000000000000000000",
  "11110000000000000000",
  "11111100000000000000",
  "11111111000000000000",
  "11111111110000000000",
  "11111111111100000000",
  "11111111111111000000",
  "11111111111111110000"
];

const SkaterGame: React.FC<SkaterGameProps> = ({ onClose, isOverlay = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<number | undefined>(undefined);
  
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState(0);
  
  // Safe Storage Access
  const [highScore, setHighScore] = useState(() => {
      try {
          return parseInt(localStorage.getItem('skater_highscore_pixel') || '0');
      } catch {
          return 0;
      }
  });
  
  const [trickFeedback, setTrickFeedback] = useState<{name: string, id: number} | null>(null);
  
  const touchStartRef = useRef<{x: number, y: number, time: number} | null>(null);

  const state = useRef({
    skater: {
      y: 0,
      dy: 0,
      grounded: true,
      ducking: false,
      grinding: false,
      frameTick: 0,
      currentTrick: 'Ollie' as 'Ollie' | 'Pop Shuv-it' | 'Kickflip' | 'Grind',
      airTapCount: 0,
      trickFrame: 0
    },
    obstacles: [] as { 
        type: 'HYDRANT' | 'RAIL' | 'BOX' | 'DRONE' | 'GUARD' | 'GAP' | 'STAIRS', 
        x: number, 
        y: number, 
        w: number, 
        h: number, 
        grindable: boolean,
        grinded: boolean
    }[],
    particles: [] as { x: number, y: number, dx: number, dy: number, life: number, color: string }[],
    speed: INITIAL_SPEED,
    distance: 0,
    groundY: 260
  });

  const drawPixelGrid = (
      ctx: CanvasRenderingContext2D, 
      grid: string[], 
      x: number, 
      y: number, 
      color: string = '#FFFFFF', 
      pixelScale: number = WORLD_PIXEL_SIZE,
      flipX: boolean = false
  ) => {
    ctx.fillStyle = color;
    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        if (row[c] === '1') {
          const drawX = flipX ? x + (row.length - 1 - c) * pixelScale : x + c * pixelScale;
          ctx.fillRect(Math.floor(drawX), Math.floor(y + r * pixelScale), pixelScale, pixelScale);
        }
      }
    }
  };

  const initGame = () => {
    if (!canvasRef.current) return;
    const internalHeight = 360; 
    const groundY = internalHeight - GROUND_Y_OFFSET;
    const startY = groundY - (22 * SKATER_SCALE); 

    state.current = {
      skater: { y: startY, dy: 0, grounded: true, ducking: false, grinding: false, frameTick: 0, currentTrick: 'Ollie', airTapCount: 0, trickFrame: 0 },
      obstacles: [],
      particles: [],
      speed: INITIAL_SPEED,
      distance: 0,
      groundY: groundY
    };
    setScore(0);
    setTrickFeedback(null);
    setGameState('PLAYING');
    playSound('skate_start'); // Real skateboard sound
  };

  const handleTapAction = () => {
    if (gameState === 'IDLE' || gameState === 'GAME_OVER') {
        initGame();
        return;
    }

    const s = state.current.skater;

    if (s.grounded || s.grinding) {
      // First Jump
      s.dy = JUMP_FORCE;
      s.grounded = false;
      s.grinding = false;
      s.currentTrick = 'Ollie';
      s.airTapCount = 1;
      s.trickFrame = 0;
      playSound('ollie');
      triggerHaptic('light');
    } else {
        // Multi-Tap Tricks with Incremental Height
        s.airTapCount++;
        if (s.airTapCount === 2) {
            s.currentTrick = 'Pop Shuv-it';
            s.trickFrame = 0;
            playSound('skate_pop');
            triggerHaptic('medium');
            s.dy = -12; // Boost to keep height (reduced slightly)
        } else if (s.airTapCount === 3) {
            s.currentTrick = 'Kickflip';
            s.trickFrame = 0;
            playSound('skate_pop');
            triggerHaptic('heavy');
            s.dy = -10; // Further float (reduced slightly)
        }
    }
  };

  const handleDuck = (isDucking: boolean) => {
    if (gameState !== 'PLAYING') return;
    state.current.skater.ducking = isDucking;
    if (isDucking) {
        if (!state.current.skater.grounded) {
            state.current.skater.dy += 8; // Fast drop
        }
        triggerHaptic('light');
    }
  };

  const gameOver = () => {
    setGameState('GAME_OVER');
    playSound('error');
    triggerHaptic('heavy');
    const finalScore = Math.floor(state.current.distance / 10);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
          localStorage.setItem('skater_highscore_pixel', finalScore.toString());
      } catch {}
    }
  };

  // --- GAME LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Fixed Internal Resolution
    const INTERNAL_WIDTH = 800;
    const INTERNAL_HEIGHT = 360;
    
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
      s.skater.trickFrame++;
      setScore(Math.floor(s.distance / 10));

      // Gradual Acceleration
      if (s.distance % 300 === 0 && s.speed < MAX_SPEED) {
        s.speed += SPEED_INCREMENT;
      }

      // Physics
      if (!s.skater.grounded && !s.skater.grinding) {
        s.skater.dy += GRAVITY;
        s.skater.y += s.skater.dy;
      } else if (s.skater.grinding) {
          s.skater.dy = 0; 
          // Constant spark effect during grind
          if (s.skater.frameTick % 4 === 0) {
              for(let i=0; i<3; i++) {
                  s.particles.push({
                      x: 80 + (SKATER_SCALE * 10), 
                      y: s.skater.y + (22 * SKATER_SCALE),
                      dx: (Math.random() - 0.5) * 4 - 2, 
                      dy: Math.random() * -3 - 1,
                      life: 20,
                      color: '#fbbf24'
                  });
              }
          }
      } else {
        s.skater.dy = 0;
      }

      // Ground Check
      const skaterH = (s.skater.ducking ? 16 : 22) * SKATER_SCALE;
      const floorY = s.groundY - skaterH;
      
      let overGap = false;
      for (const ob of s.obstacles) {
          if (ob.type === 'GAP') {
              const playerX = 50 + (10 * SKATER_SCALE); 
              if (playerX > ob.x && playerX < ob.x + ob.w) {
                  overGap = true;
              }
          }
      }

      if (overGap && s.skater.y >= floorY) {
          s.skater.grounded = false; // Fall into gap
      } else if (s.skater.y >= floorY && !s.skater.grinding && !overGap) {
        if (!s.skater.grounded) {
            playSound('land');
            if (s.skater.currentTrick !== 'Ollie') {
                setTrickFeedback({ name: s.skater.currentTrick, id: Date.now() });
            }
            // Dust
            for(let i=0; i<5; i++) {
                s.particles.push({
                    x: 60 + (Math.random() * 20),
                    y: floorY + skaterH,
                    dx: (Math.random() - 0.5) * 2,
                    dy: Math.random() * -2,
                    life: 10,
                    color: '#94a3b8'
                });
            }
        }
        s.skater.y = floorY;
        s.skater.grounded = true;
        s.skater.airTapCount = 0;
    }
      
      if (s.skater.y > cvs.height) {
          gameOver();
      }

      // --- SPAWNING LOGIC ---
      const lastOb = s.obstacles[s.obstacles.length - 1];
      const minDistance = 350 + (Math.random() * 250) + (s.speed * 15);
      
      if (!lastOb || (cvs.width - (lastOb.x + lastOb.w) > minDistance)) {
        if (Math.random() < 0.65) {
          let type: any = 'HYDRANT';
          let w = WORLD_PIXEL_SIZE * 12;
          let h = WORLD_PIXEL_SIZE * 12; 
          let grindable = false;

          // Progression Tiers
          const dist = s.distance;
          const choices = ['HYDRANT', 'BOX']; // Tier 1 (Start)

          if (dist > 500) {
              choices.push('RAIL', 'GUARD'); // Tier 2
          }
          if (dist > 1200) {
              choices.push('STAIRS', 'DRONE'); // Tier 3
          }
          if (dist > 2000) {
              choices.push('GAP'); // Tier 4
          }

          type = choices[Math.floor(Math.random() * choices.length)];

          // Configure Properties
          if (type === 'BOX') { w = WORLD_PIXEL_SIZE * 40; h = WORLD_PIXEL_SIZE * 10; grindable = true; } // Longer box
          else if (type === 'RAIL') { w = WORLD_PIXEL_SIZE * 60; h = WORLD_PIXEL_SIZE * 10; grindable = true; } // Longer rail
          else if (type === 'GUARD') { w = WORLD_PIXEL_SIZE * 12; h = WORLD_PIXEL_SIZE * 12; }
          else if (type === 'DRONE') { w = WORLD_PIXEL_SIZE * 16; h = WORLD_PIXEL_SIZE * 6; }
          else if (type === 'STAIRS') { w = WORLD_PIXEL_SIZE * 25; h = WORLD_PIXEL_SIZE * 12; }
          else if (type === 'GAP') { w = WORLD_PIXEL_SIZE * 25; h = 10; }

          s.obstacles.push({ type, x: cvs.width, y: 0, w, h, grindable, grinded: false });
        }
      }

      // Obstacle Collision
      let isCurrentlyGrinding = false;
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const ob = s.obstacles[i];
        ob.x -= s.speed;

        if (ob.type !== 'GAP') {
            const pPadding = SKATER_SCALE * 3;
            const pRect = {
                x: 50 + pPadding,
                y: s.skater.y + pPadding,
                w: (20 * SKATER_SCALE) - (pPadding * 2),
                h: skaterH - (pPadding * 2)
            };

            let obY = s.groundY - ob.h;
            if (ob.type === 'DRONE') obY = s.groundY - (25 * WORLD_PIXEL_SIZE);

            const obRect = {
                x: ob.x + WORLD_PIXEL_SIZE,
                y: obY + WORLD_PIXEL_SIZE,
                w: ob.w - (WORLD_PIXEL_SIZE * 2),
                h: ob.h - (WORLD_PIXEL_SIZE * 2)
            };

            const colliding = 
                pRect.x < obRect.x + obRect.w &&
                pRect.x + pRect.w > obRect.x &&
                pRect.y < obRect.y + obRect.h &&
                pRect.y + pRect.h > obRect.y;

            if (colliding) {
                const playerBottom = pRect.y + pRect.h;
                const obstacleTop = obRect.y;
                const grindTolerance = WORLD_PIXEL_SIZE * 8; // Slight tolerance

                const canGrind = ob.grindable && s.skater.dy >= 0 && playerBottom <= obstacleTop + grindTolerance;

                if (canGrind) {
                    s.skater.y = obstacleTop - skaterH;
                    s.skater.dy = 0;
                    s.skater.grounded = false; 
                    s.skater.grinding = true;
                    isCurrentlyGrinding = true;
                    
                    if (!ob.grinded) {
                        playSound('grind');
                        triggerHaptic('light');
                        ob.grinded = true;
                        setTrickFeedback({ name: '50-50 Grind', id: Date.now() });
                        
                        // Impact sparks
                        for(let k=0; k<5; k++) {
                            s.particles.push({
                                x: 80 + (SKATER_SCALE * 10), 
                                y: s.skater.y + (22 * SKATER_SCALE),
                                dx: (Math.random() - 0.5) * 6, 
                                dy: Math.random() * -4,
                                life: 15,
                                color: '#ffffff'
                            });
                        }
                    }
                } else {
                    if (!s.skater.grinding) gameOver();
                }
            }
        }
        if (ob.x + ob.w < -100) s.obstacles.splice(i, 1);
      }

      if (s.skater.grinding && !isCurrentlyGrinding) {
          s.skater.grinding = false;
          s.skater.grounded = false;
          s.skater.dy = 4;
      }

      // Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x -= s.speed * 0.8;
          p.x += p.dx;
          p.y += p.dy;
          p.dy += 0.5;
          p.life--;
          if (p.life <= 0) s.particles.splice(i, 1);
      }
    };

    const draw = (ctx: CanvasRenderingContext2D, cvs: HTMLCanvasElement) => {
      const s = state.current;

      // 1. Background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, cvs.width, cvs.height);

      // Speed lines
      if (s.speed > 10) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          for(let i=0; i<3; i++) {
              if (Math.random() > 0.8) {
                  const y = Math.random() * cvs.height;
                  const x = Math.random() * cvs.width;
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  ctx.lineTo(x - 50, y);
                  ctx.stroke();
              }
          }
      }

      // 2. Ground & Gaps
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, s.groundY, cvs.width, WORLD_PIXEL_SIZE * 2);

      s.obstacles.forEach(ob => {
          if (ob.type === 'GAP') {
              ctx.fillStyle = '#050505';
              ctx.fillRect(ob.x, s.groundY, ob.w, WORLD_PIXEL_SIZE * 2);
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(ob.x - 10, s.groundY + 10, 10, WORLD_PIXEL_SIZE);
              ctx.fillRect(ob.x + ob.w, s.groundY + 10, 10, WORLD_PIXEL_SIZE);
          }
      });

      // 3. Obstacles
      s.obstacles.forEach(ob => {
        if (ob.type === 'GAP') return;
        let sprite = SPRITE_HYDRANT;
        let color = '#ef4444'; 

        if (ob.type === 'RAIL') { 
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(ob.x, s.groundY - ob.h, ob.w, WORLD_PIXEL_SIZE * 2); 
            ctx.fillRect(ob.x + 10, s.groundY - ob.h, WORLD_PIXEL_SIZE * 2, ob.h); 
            ctx.fillRect(ob.x + ob.w - 10, s.groundY - ob.h, WORLD_PIXEL_SIZE * 2, ob.h); 
            return;
        } 
        else if (ob.type === 'BOX') { 
            ctx.fillStyle = '#d97706';
            ctx.fillRect(ob.x, s.groundY - ob.h, ob.w, ob.h);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(ob.x, s.groundY - ob.h, ob.w, WORLD_PIXEL_SIZE);
            return;
        }
        else if (ob.type === 'STAIRS') { sprite = SPRITE_STAIRS; color = '#9ca3af'; }
        else if (ob.type === 'DRONE') { sprite = SPRITE_DRONE; color = '#ef4444'; }
        else if (ob.type === 'GUARD') { sprite = SPRITE_GUARD; color = '#3b82f6'; }

        let drawY = s.groundY - ob.h;
        if (ob.type === 'DRONE') drawY = s.groundY - (25 * WORLD_PIXEL_SIZE);

        drawPixelGrid(ctx, sprite, ob.x, drawY, color, WORLD_PIXEL_SIZE);
      });

      // 4. Particles
      s.particles.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, WORLD_PIXEL_SIZE, WORLD_PIXEL_SIZE);
      });

      // 5. Skater COMPOSITE
      const skaterX = 50;
      let bodySprite = SPRITE_BODY_RUN_1;
      let boardSprite = SPRITE_BOARD_NORMAL;
      let bodyYOffset = 0;
      let boardYOffset = 18 * SKATER_SCALE; 
      let flipBoard = false;

      // Body Logic
      if (s.skater.grounded) {
          bodySprite = Math.floor(s.skater.frameTick / 6) % 2 === 0 ? SPRITE_BODY_RUN_1 : SPRITE_BODY_RUN_1; 
      } else if (s.skater.grinding) {
          bodySprite = SPRITE_BODY_GRIND; 
      } else if (s.skater.ducking) {
          bodySprite = SPRITE_BODY_DUCK;
          bodyYOffset = 6 * SKATER_SCALE;
      } else {
          bodySprite = SPRITE_BODY_JUMP;
      }

      // Board Logic
      if (!s.skater.grounded && !s.skater.grinding) {
          if (s.skater.currentTrick === 'Pop Shuv-it') {
              const cycle = Math.floor(s.skater.trickFrame / 4) % 4;
              if (cycle === 0) boardSprite = SPRITE_BOARD_NORMAL;
              else if (cycle === 1) boardSprite = SPRITE_BOARD_VERTICAL; 
              else if (cycle === 2) { boardSprite = SPRITE_BOARD_NORMAL; flipBoard = true; } 
              else boardSprite = SPRITE_BOARD_VERTICAL;
          } 
          else if (s.skater.currentTrick === 'Kickflip') {
              const cycle = Math.floor(s.skater.trickFrame / 3) % 4;
              if (cycle === 0) boardSprite = SPRITE_BOARD_NORMAL;
              else if (cycle === 1) boardSprite = SPRITE_BOARD_SIDE;
              else if (cycle === 2) boardSprite = SPRITE_BOARD_UPSIDEDOWN;
              else boardSprite = SPRITE_BOARD_SIDE;
          }
          boardYOffset += (Math.sin(s.skater.trickFrame * 0.5) * 2);
      }

      // Draw Shadow
      if (!s.skater.grounded) {
          const distToGround = s.groundY - (s.skater.y + 22 * SKATER_SCALE);
          const shadowW = 20 * SKATER_SCALE * (1 - Math.min(distToGround/200, 0.5));
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.ellipse(skaterX + 10*SKATER_SCALE, s.groundY, shadowW/2, 4, 0, 0, Math.PI * 2);
          ctx.fill();
      }

      // Draw Body
      drawPixelGrid(ctx, bodySprite, skaterX, s.skater.y + bodyYOffset, '#ffffff', SKATER_SCALE);
      
      // Draw Board
      let finalBoardY = s.skater.y + boardYOffset;
      if (s.skater.ducking) finalBoardY = s.skater.y + (18 * SKATER_SCALE);

      drawPixelGrid(ctx, boardSprite, skaterX, finalBoardY, '#ffffff', SKATER_SCALE, flipBoard);
    };

    const renderStatic = (ctx: CanvasRenderingContext2D, cvs: HTMLCanvasElement) => {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, state.current.groundY, cvs.width, WORLD_PIXEL_SIZE * 2);
        drawPixelGrid(ctx, SPRITE_BODY_RUN_1, 50, state.current.groundY - (22 * SKATER_SCALE), '#ffffff', SKATER_SCALE);
        drawPixelGrid(ctx, SPRITE_BOARD_NORMAL, 50, state.current.groundY - (4 * SKATER_SCALE), '#ffffff', SKATER_SCALE);
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
  }, [gameState]);

  // --- CONTROLS ---
  
  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now()
      };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;

      if (Math.abs(dy) > 40 && dy > 0) {
          handleDuck(true);
          setTimeout(() => handleDuck(false), 800);
      } else if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && dt < 200) {
          handleTapAction();
      }
      touchStartRef.current = null;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          handleTapAction();
      } else if (e.code === 'ArrowDown') {
          e.preventDefault();
          handleDuck(true);
      }
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') handleDuck(false);
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
        className={`relative bg-black border-2 border-white/20 overflow-hidden shadow-2xl flex flex-col font-mono select-none ${isOverlay ? 'w-full max-w-2xl landscape:max-w-[90vw] aspect-[2/1] landscape:h-[80vh] landscape:aspect-video rounded-[2rem] landscape:rounded-xl' : 'w-full aspect-video rounded-xl'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
      {/* CRT Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none z-10 opacity-50" />
      
      {/* HUD */}
      <div className="absolute top-4 right-6 flex gap-6 z-20 text-[10px] md:text-xs font-bold tracking-widest text-white mix-blend-difference pointer-events-none">
          <span className="opacity-50">HI {highScore.toString().padStart(5, '0')}</span>
          <span>{score.toString().padStart(5, '0')}</span>
      </div>

      {/* Trick Feedback */}
      {trickFeedback && (
          <div 
            key={trickFeedback.id} 
            className="absolute top-1/2 left-1/2 z-30 text-center pointer-events-none"
            style={{ animation: 'trick-popup 0.6s ease-out forwards' }}
          >
              <h3 className="text-sm font-black italic uppercase text-yellow-400 tracking-wider stroke-black drop-shadow-sm" style={{ textShadow: '1px 1px 0 #000' }}>
                  {trickFeedback.name}
              </h3>
              <p className="text-[8px] font-bold text-white uppercase tracking-[0.2em] opacity-90">+50 XP</p>
          </div>
      )}
      
      {/* Inline Styles for Game-Specific Animations */}
      <style>{`
        @keyframes trick-popup {
            0% { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 0; transform: translate(-50%, -120%) scale(1); }
        }
      `}</style>

      <canvas ref={canvasRef} className="w-full h-full block relative z-0 object-contain bg-[#050505]" />

      {/* Start Screen */}
      {gameState === 'IDLE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 bg-black/60 backdrop-blur-sm">
              <p className="text-white text-xl md:text-2xl font-black tracking-widest animate-pulse mb-2">PRESS START</p>
              <div className="text-[8px] text-slate-300 uppercase tracking-wider bg-black/50 px-3 py-1 rounded border border-white/20">Tap to Jump • Swipe Down to Duck</div>
          </div>
      )}

      {/* Game Over */}
      {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30 backdrop-blur-sm">
              <div className="text-center pointer-events-auto" onClick={(e) => { e.stopPropagation(); initGame(); }}>
                  <h2 className="text-white text-3xl font-black tracking-widest mb-4 italic">SLAMMED</h2>
                  <button 
                    className="px-6 py-3 border-2 border-white text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-2 mx-auto text-xs rounded-lg"
                  >
                      <RotateCcw size={14} /> Retry
                  </button>
              </div>
          </div>
      )}
    </div>
  );

  if (isOverlay) {
      return createPortal(
          <div 
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-view"
            onClick={onClose}
          >
              <div className="absolute top-6 right-6 z-50">
                  <button onClick={onClose} className="p-3 bg-black/50 text-white border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
                      <X size={20} />
                  </button>
              </div>
              
              <div className="w-full max-w-2xl landscape:max-w-none landscape:w-auto relative animate-pop flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                  {content}
                  <div className="mt-4 text-center">
                      <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
                          [TAP] Jump / Multi-Trick • [SWIPE DOWN] Slide
                      </p>
                  </div>
              </div>
          </div>,
          document.body
      );
  }

  return content;
};

export default SkaterGame;
