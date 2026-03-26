import { useEffect, useRef } from 'react';

const BG_IMAGE = '/background.png';

/**
 * PremiumBackground
 * ------------------------------------------------------------------
 * A full-page fixed background with VISIBLE parallax scrolling.
 *
 * HOW IT WORKS:
 *  - The outer wrapper is `position: fixed; inset: 0` so it stays in
 *    the viewport while content scrolls above it.
 *  - The image layer is intentionally 40 % taller than the viewport.
 *  - On scroll, a `requestAnimationFrame` loop smoothly interpolates
 *    a negative `translateY` so the image drifts upward at ~30 % of
 *    the page-scroll speed → classic parallax depth illusion.
 *  - All transforms use `translate3d` (GPU-composited, no repaints).
 *  - On mobile (≤ 768 px) the multiplier drops to 15 % for perf.
 * ------------------------------------------------------------------
 */
export default function PremiumBackground() {
  const imageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // -------- Parallax engine (rAF + lerp) --------
  useEffect(() => {
    let targetY = 0;
    let currentY = 0;
    let rafId = 0;
    const isMobile = window.innerWidth <= 768;
    const SPEED = isMobile ? 0.15 : 0.30; // scroll-speed multiplier
    const LERP = 0.08; // smoothing factor (lower = heavier/cinematic)

    const onScroll = () => {
      targetY = window.scrollY;
    };

    const tick = () => {
      // Smooth interpolation toward target
      currentY += (targetY - currentY) * LERP;

      if (imageRef.current) {
        // Negative Y → image moves UP as user scrolls DOWN → depth illusion
        const offset = -(currentY * SPEED);
        imageRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // -------- Sparse elegant particles --------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0, frameId = 0;

    interface Mote { x: number; y: number; r: number; vx: number; vy: number; a: number }
    const motes: Mote[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 45; i++) {
      motes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.06,
        vy: -(Math.random() * 0.12 + 0.02),
        a: Math.random() * 0.2 + 0.04,
      });
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx + Math.sin(t * 0.00025 + m.y * 0.004) * 0.03;
        m.y += m.vy;
        if (m.y < -5) { m.y = h + 5; m.x = Math.random() * w; }
        if (m.x < -5) m.x = w + 5;
        if (m.x > w + 5) m.x = -5;
        ctx.globalAlpha = m.a;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frameId = requestAnimationFrame(draw);
    };
    frameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      {/* L0  Deep black base colour */}
      <div className="absolute inset-0 bg-[#080810]" />

      {/* L1  Background image — 40 % taller for parallax headroom */}
      <div
        ref={imageRef}
        className="absolute left-0 w-full will-change-transform"
        style={{
          top: '-20%',
          height: '140%',
          backgroundImage: `url('${BG_IMAGE}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          transform: 'translate3d(0, 0, 0)', // initial; overridden by JS
        }}
      />

      {/* L2  Dark tint */}
      <div className="absolute inset-0 bg-black/30" />

      {/* L3  Top ↔ Bottom readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* L4  Cinematic radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* L5  Warm ambient glow (top-left) */}
      <div
        className="absolute rounded-full mix-blend-screen"
        style={{
          top: '-12%', left: '-8%', width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(196,131,58,0.18) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'ambientPulse 14s ease-in-out infinite alternate',
        }}
      />

      {/* L6  Cool accent glow (bottom-right) */}
      <div
        className="absolute rounded-full mix-blend-screen"
        style={{
          bottom: '-8%', right: '-8%', width: '42%', height: '42%',
          background: 'radial-gradient(circle, rgba(11,145,130,0.14) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'ambientPulse 18s ease-in-out 4s infinite alternate',
        }}
      />

      {/* L7  Elegant floating particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-screen opacity-50"
      />

      {/* L8  Film grain texture */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
