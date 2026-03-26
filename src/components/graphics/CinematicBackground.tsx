import { useEffect, useRef } from 'react';

const TOXIC_BG = [20, 15, 20];
const CLEAN_BG = [10, 20, 30];

const TOXIC_SMOG_1 = [217, 79, 79]; // #D94F4F
const TOXIC_SMOG_2 = [224, 123, 58]; // #E07B3A
const CLEAN_SMOG_1 = [26, 95, 174]; // #1A5FAE
const CLEAN_SMOG_2 = [11, 145, 130]; // #0B9182

const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;
const lerpColor = (c1: number[], c2: number[], amt: number) => [
  Math.round(lerp(c1[0], c2[0], amt)),
  Math.round(lerp(c1[1], c2[1], amt)),
  Math.round(lerp(c1[2], c2[2], amt)),
];

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
  isForeground: boolean;
}

interface AQIBox {
  x: number;
  y: number;
  width: number;
  height: number;
  phase: number;
  baseVal: number;
}

interface BuildingWindow {
  x: number;
  y: number;
  w: number;
  h: number;
  lit: boolean;
  color: string;
}

interface Building {
  x: number;
  w: number;
  h: number;
  windows: BuildingWindow[];
}

export default function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId: number;

    const particles: Particle[] = [];
    const maxParticles = 200;
    const aqiBoxes: AQIBox[] = [];

    // Resize handler
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      aqiBoxes.length = 0;
      for (let i = 0; i < 4; i++) {
        aqiBoxes.push({
          x: width * (0.15 + i * 0.25) + (Math.random() * 100 - 50),
          y: height * (0.2 + Math.random() * 0.4),
          width: 140,
          height: 60,
          phase: Math.random() * Math.PI * 2,
          baseVal: 300 + Math.random() * 150,
        });
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // Create immersive depth particles
    for (let i = 0; i < maxParticles; i++) {
      const isForeground = Math.random() > 0.7; // 30% foreground sharp, 70% background blurred
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isForeground ? Math.random() * 3 + 1.5 : Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: isForeground ? -(Math.random() * 1.5 + 0.5) : -(Math.random() * 0.8 + 0.1),
        opacity: Math.random() * 0.5 + 0.1,
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 100,
        isForeground,
      });
    }

    // Skyline Building Generator
    const generateSkyline = (baseHeight: number, volatility: number) => {
      const buildings: Building[] = [];
      let x = 0;
      while (x < 6000) { 
        const w = 40 + Math.random() * 100;
        const h = baseHeight + (Math.random() - 0.5) * volatility;
        
        // Cyberpunk glowing windows
        const windows: BuildingWindow[] = [];
        if (w > 50 && h > 100) {
          const rows = Math.floor(h / 30);
          const cols = Math.floor(w / 20);
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (Math.random() > 0.75) {
                windows.push({
                  x: c * 20 + 5,
                  y: r * 30 + 10,
                  w: 10,
                  h: 4,
                  lit: true,
                  color: Math.random() > 0.5 ? 'rgba(0, 255, 255, 0.4)' : 'rgba(255, 165, 0, 0.4)'
                });
              }
            }
          }
        }
        
        buildings.push({ x, w, h, windows });
        x += w + (Math.random() * 15);
      }
      return buildings;
    };

    const skylineL1 = generateSkyline(height * 0.5, 300);
    const skylineL2 = generateSkyline(height * 0.3, 200);

    const drawSkyline = (buildings: Building[], offsetX: number, fill: string, drawWindows: boolean, cycle: number) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (const b of buildings) {
        const renderX = b.x - offsetX;
        if (renderX + b.w > -100 && renderX < width + 100) {
          ctx.lineTo(renderX, height - b.h);
          ctx.lineTo(renderX + b.w, height - b.h);
        }
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      if (drawWindows) {
        for (const b of buildings) {
          const renderX = b.x - offsetX;
          if (renderX + b.w > 0 && renderX < width) {
            for (const win of b.windows) {
              const winColor = cycle > 0.5 && win.color.includes('255, 165') 
                ? 'rgba(0, 255, 255, 0.4)' 
                : win.color;
                
              ctx.fillStyle = winColor;
              ctx.shadowBlur = 5;
              ctx.shadowColor = winColor;
              ctx.fillRect(renderX + win.x, height - b.h + win.y, win.w, win.h);
              ctx.shadowBlur = 0;
            }
          }
        }
      }
    };

    let breathTime = 0;

    const render = (time: number) => {
      const cycle = (Math.sin(time * 0.0003) + 1) / 2;

      const bgColor = lerpColor(TOXIC_BG, CLEAN_BG, cycle);
      const smog1Color = lerpColor(TOXIC_SMOG_1, CLEAN_SMOG_1, cycle);
      const smog2Color = lerpColor(TOXIC_SMOG_2, CLEAN_SMOG_2, cycle);

      // Deep Space / Core Background
      ctx.fillStyle = `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`;
      ctx.fillRect(0, 0, width, height);

      // Distant Smog Glow
      const bgGrad = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, height * 1.5);
      bgGrad.addColorStop(0, `rgba(${smog1Color[0]}, ${smog1Color[1]}, ${smog1Color[2]}, 0.6)`);
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Background Particles (Blurred/Small)
      ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
      for (const p of particles) {
        if (p.isForeground) continue;
        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;
        if (p.y < 0 || p.life > p.maxLife || p.x > width || p.x < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.life = 0;
        }
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.opacity;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Distant Skyline
      const plx1 = (time * 0.01) % 6000;
      drawSkyline(skylineL1, plx1 * 0.3, `rgba(${Math.max(0, bgColor[0] - 10)}, ${Math.max(0, bgColor[1] - 10)}, ${Math.max(0, bgColor[2] - 10)}, 0.5)`, false, cycle);

      // Mid Smog Haze
      const midSmogGrad = ctx.createLinearGradient(0, height * 0.2, 0, height);
      midSmogGrad.addColorStop(0, 'transparent');
      midSmogGrad.addColorStop(1, `rgba(${smog2Color[0]}, ${smog2Color[1]}, ${smog2Color[2]}, 0.4)`);
      ctx.fillStyle = midSmogGrad;
      ctx.fillRect(0, 0, width, height);

      // Foreground Skyline (Cyberpunk details)
      const plx2 = (time * 0.02) % 6000;
      drawSkyline(skylineL2, plx2, `rgba(${Math.max(0, bgColor[0] - 20)}, ${Math.max(0, bgColor[1] - 20)}, ${Math.max(0, bgColor[2] - 20)}, 0.8)`, true, cycle);

      // People Masks Silhouettes / Faint Profiles (Symbolic)
      ctx.fillStyle = `rgba(10, 10, 15, ${0.4 + cycle * 0.2})`;
      ctx.beginPath();
      ctx.arc(width * 0.08, height + 80, 200, 1.2 * Math.PI, 1.8 * Math.PI);
      ctx.fill();
      
      // Breathing Rings
      breathTime += 1;
      const breathCycle = (Math.sin(breathTime * 0.02) + 1) / 2; 
      const breathAlpha = Math.max(0, (1 - cycle) * 0.6 * breathCycle); 
      if (breathAlpha > 0.01) {
        const breathGrad = ctx.createRadialGradient(width * 0.15, height - 120, 20, width * 0.15, height - 120, 250 + breathCycle * 80);
        breathGrad.addColorStop(0, `rgba(${smog2Color[0]}, ${smog2Color[1]}, ${smog2Color[2]}, ${breathAlpha})`);
        breathGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = breathGrad;
        ctx.beginPath();
        ctx.arc(width * 0.15, height - 120, 350, 0, Math.PI * 2);
        ctx.fill();
      }

      // Foreground Particles (Sharp, large)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (const p of particles) {
        if (!p.isForeground) continue;
        p.x += p.speedX * 1.5 + (Math.sin(time * 0.002 + p.y * 0.01) * 0.8); 
        p.y += p.speedY;
        p.life++;
        if (p.y < 0 || p.life > p.maxLife || p.x > width || p.x < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.life = 0;
        }
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.opacity;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Holographic AQI HUD Boxes
      for (const box of aqiBoxes) {
        const floatingY = box.y + Math.sin(time * 0.002 + box.phase) * 15;
        const currentAqi = Math.round(lerp(box.baseVal, 45, cycle));
        const isToxic = currentAqi > 150;
        
        // Neon UI Style
        const boxColor = isToxic ? 'rgba(217, 79, 79, 0.9)' : 'rgba(76, 175, 140, 0.9)';
        const glowColor = isToxic ? 'rgba(217, 79, 79, 0.6)' : 'rgba(76, 175, 140, 0.6)';

        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = glowColor;

        ctx.beginPath();
        ctx.moveTo(box.x, floatingY);
        ctx.lineTo(box.x + box.width - 15, floatingY);
        ctx.lineTo(box.x + box.width, floatingY + 15);
        ctx.lineTo(box.x + box.width, floatingY + box.height);
        ctx.lineTo(box.x + 15, floatingY + box.height);
        ctx.lineTo(box.x, floatingY + box.height - 15);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = 'rgba(10, 10, 15, 0.75)';
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = boxColor;
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(isToxic ? 'WARNG: HIGH' : 'SAFE: STABLE', box.x + 15, floatingY + 20);
        
        ctx.font = 'bold 28px "Space Grotesk", sans-serif';
        if (Math.random() > 0.05) {
          ctx.fillText(currentAqi.toString(), box.x + 15, floatingY + 48);
        }

        ctx.beginPath();
        ctx.moveTo(box.x + Math.max(75, box.width * 0.5), floatingY + 48);
        let px = box.x + Math.max(75, box.width * 0.5);
        for (let i = 0; i < 40; i += 8) {
          px += 8;
          ctx.lineTo(px, floatingY + 48 - Math.random() * 20);
        }
        ctx.strokeStyle = boxColor;
        ctx.stroke();
      }

      // God Rays / Sunlight Diffusing Through Smog
      const rayGrad = ctx.createLinearGradient(width * 0.1, 0, width * 0.9, height);
      rayGrad.addColorStop(0, `rgba(${smog1Color[0]}, ${smog1Color[1]}, ${smog1Color[2]}, 0.2)`);
      rayGrad.addColorStop(0.5, 'transparent');
      rayGrad.addColorStop(1, `rgba(${smog2Color[0]}, ${smog2Color[1]}, ${smog2Color[2]}, 0.08)`);
      ctx.fillStyle = rayGrad;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 mix-blend-screen"
      style={{ opacity: 0.9 }}
    />
  );
}
