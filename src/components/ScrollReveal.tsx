import { ReactNode, useRef, useEffect, useState } from 'react';

export function ScrollReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span className={`text-xs font-mono font-bold tracking-[0.25em] uppercase glow-text-cyan ${className}`}>
      {label}
    </span>
  );
}
