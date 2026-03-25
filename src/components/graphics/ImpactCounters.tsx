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
  { value: 54000, suffix: '+', label: 'Annual Delhi deaths prevented', citation: 'Source: The Lancet, 2024', color: '#F5C9A0' },
  { value: 272, label: 'Wards monitored', citation: 'Source: Delhi MCD Ward Data', color: '#E8A85C' },
  { value: 15, prefix: '<', suffix: ' min', label: 'Spike to legal notice', citation: 'Source: Project Vaayu Architecture', color: '#4CAF8C' },
  { value: 29, prefix: '₹', suffix: 'K/ward/yr', label: 'vs ₹3.5Cr CPCB station', citation: 'Source: CPCB Cost Analysis', color: '#C4833A' },
  { value: 87, suffix: '%', label: 'ML attribution accuracy', citation: 'Source: IIT Indore, Nature 2024', color: '#7B68EE' },
  { value: 120, prefix: '1/', suffix: 'th', label: 'Our cost vs CPCB', citation: 'Source: CPCB Budget Report', color: '#F5C9A0', display: '1/120th' },
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
      className="card-glow rounded-lg p-6 bg-card transition-all duration-200 hover:rotate-1 hover:scale-[1.02] will-change-transform"
      style={{
        animation: inView ? 'none' : undefined,
        boxShadow: inView ? `0 0 30px ${stat.color}15` : undefined,
      }}
    >
      <p className="text-3xl md:text-4xl font-heading font-bold font-mono" style={{ color: stat.color }}>
        {display}
      </p>
      <p className="text-sm text-secondary-foreground mt-2">{stat.label}</p>
      <span className="inline-block mt-3 text-[9px] font-mono px-2 py-0.5 rounded bg-primary/10 text-muted-foreground">
        {stat.citation}
      </span>
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
