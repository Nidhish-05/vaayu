import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Intelligence', href: '#intelligence' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Scale', href: '#scale' },
  { label: 'Research', href: '#research' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(13,13,20,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(196,131,58,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <a href="#" className="flex items-center gap-2">
          {/* Air wave icon */}
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <path d="M2 10C4 6 6 4 10 4C14 4 16 6 18 10" stroke="#C4833A" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M4 13C6 9 7 7 10 7C13 7 14 9 16 13" stroke="#C4833A" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <path d="M6 15.5C7 12 8 10 10 10C12 10 13 12 14 15.5" stroke="#C4833A" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          </svg>
          <span className="font-heading font-bold text-sm tracking-[0.2em] text-primary">VAAYU</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-mono tracking-wider text-muted-foreground hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className={`block w-5 h-0.5 bg-primary transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block w-5 h-0.5 bg-primary transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-primary transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-background/95 backdrop-blur-md z-40">
          <div className="flex flex-col items-center gap-8 pt-16">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-heading text-secondary-foreground hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
