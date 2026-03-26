import { useInView } from '@/hooks/useInView';

const BARS = [
  { label: 'CPCB Station', cost: '₹3.5 Crore/point', width: 95, color: '#FF5F3C', detail: 'Traditional CPCB monitoring station with full laboratory equipment' },
  { label: 'Competitor Avg', cost: '₹85 Lakh/point', width: 24, color: '#7A5CFF', detail: 'Average cost of competing IoT-based monitoring solutions' },
  { label: 'Project Vaayu', cost: '₹29,000/ward/yr', width: 0.8, color: '#00E5FF', detail: 'Low-cost IoT mesh with AI-powered analysis — 120× cheaper', badge: '120× CHEAPER' },
];

export default function CostBarChart() {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className="space-y-6 max-w-2xl">
      {BARS.map((bar, i) => (
        <div key={i} className="group relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-heading font-semibold text-secondary-foreground/90">{bar.label}</span>
            <span className="text-xs font-mono font-bold" style={{ color: bar.color }}>{bar.cost}</span>
          </div>
          <div className="relative h-10 rounded-xl overflow-hidden bg-white/[0.03] border border-white/5 backdrop-blur-sm p-1">
            <div
              className="h-full rounded-lg transition-all duration-[1500ms] ease-[cubic-bezier(0.25, 1, 0.5, 1)]"
              style={{
                width: inView ? `${Math.max(bar.width, 3)}%` : '0%',
                background: `linear-gradient(90deg, ${bar.color}80, ${bar.color})`,
                boxShadow: inView ? `0 0 15px ${bar.color}30` : 'none',
                transitionDelay: `${i * 150}ms`,
              }}
            />
            {bar.badge && inView && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-3 py-1 rounded-md bg-black/40 border border-white/10"
                style={{
                  color: bar.color,
                  opacity: inView ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  transitionDelay: `${i * 150 + 1300}ms`,
                }}
              >
                {bar.badge}
              </span>
            )}
          </div>
          {/* Tooltip on hover */}
          <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground/60 font-mono tracking-wider uppercase">
            {bar.detail}
          </div>
        </div>
      ))}
    </div>
  );
}
