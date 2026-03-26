import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';

interface StatCard {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  citation: string;
  color: string;
  display?: string;
}

const STATS: StatCard[] = [
  { value: 54000, suffix: '+', label: 'Annual Delhi deaths prevented', citation: 'Source: The Lancet, 2024', color: '#FF5F3C' },
  { value: 272, label: 'Wards monitored', citation: 'Source: Delhi MCD Ward Data', color: '#00E5FF' },
  { value: 15, prefix: '<', suffix: ' min', label: 'Spike to legal notice', citation: 'Source: Project Vaayu Architecture', color: '#39FF14' },
  { value: 29, prefix: '₹', suffix: 'K/ward/yr', label: 'vs ₹3.5Cr CPCB station', citation: 'Source: CPCB Cost Analysis', color: '#00E5FF' },
  { value: 87, suffix: '%', label: 'ML attribution accuracy', citation: 'Source: IIT Indore, Nature 2024', color: '#7A5CFF' },
  { value: 120, prefix: '1/', suffix: 'th', label: 'Our cost vs CPCB', citation: 'Source: CPCB Budget Report', color: '#00E5FF', display: '1/120th' },
];

function Counter({ stat, inView }: { stat: StatCard; inView: boolean }) {
  const count = useCountUp(stat.value, inView);

  let display: string;
  if (stat.display) {
    display = inView ? stat.display : '0';
  } else {
    display = `${stat.prefix || ''}${count.toLocaleString()}${stat.suffix || ''}`;
  }

  return (
    <div
      className="neon-card rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-2 pulse-glow"
      style={{
        boxShadow: inView ? `0 0 40px ${stat.color}10` : undefined,
        borderLeft: `4px solid ${stat.color}`,
      }}
    >
      <p className="text-4xl md:text-5xl font-heading font-bold font-mono tracking-tighter" style={{ color: stat.color, textShadow: `0 0 15px ${stat.color}40` }}>
        {display}
      </p>
      <p className="text-sm font-heading font-semibold text-secondary-foreground/90 mt-3 tracking-tight">{stat.label}</p>
      <div className="mt-6 pt-4 border-t border-white/5">
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-muted-foreground/60 border border-white/10 uppercase tracking-widest">
          {stat.citation}
        </span>
      </div>
    </div>
  );
}

export default function ImpactCounters() {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {STATS.map((stat, i) => (
        <Counter key={i} stat={stat} inView={inView} />
      ))}
    </div>
  );
}
