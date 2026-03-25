import { useInView } from '@/hooks/useInView';

const BARS = [
  { label: 'CPCB Station', cost: '₹3.5 Crore/point', width: 100, color: '#D94F4F', detail: 'Traditional CPCB monitoring station with full laboratory equipment' },
  { label: 'Competitor Avg', cost: '₹85 Lakh/point', width: 24, color: '#E07B3A', detail: 'Average cost of competing IoT-based monitoring solutions' },
  { label: 'Project Vaayu', cost: '₹29,000/ward/yr', width: 0.8, color: '#C4833A', detail: 'Low-cost IoT mesh with AI-powered analysis — 120× cheaper', badge: '120× CHEAPER' },
];

export default function CostBarChart() {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className="space-y-6 max-w-2xl">
      {BARS.map((bar, i) => (
        <div key={i} className="group relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-heading font-semibold text-secondary-foreground">{bar.label}</span>
            <span className="text-xs font-mono" style={{ color: bar.color }}>{bar.cost}</span>
          </div>
          <div className="relative h-8 rounded-md overflow-hidden bg-card">
            <div
              className="h-full rounded-md transition-all duration-[1200ms] ease-out"
              style={{
                width: inView ? `${Math.max(bar.width, 3)}%` : '0%',
                background: bar.color,
                transitionDelay: `${i * 200}ms`,
              }}
            />
            {bar.badge && inView && (
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-background/80"
                style={{
                  color: bar.color,
                  opacity: inView ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  transitionDelay: `${i * 200 + 1200}ms`,
                }}
              >
                {bar.badge}
              </span>
            )}
          </div>
          {/* Tooltip on hover */}
          <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground font-mono">
            {bar.detail}
          </div>
        </div>
      ))}
    </div>
  );
}
