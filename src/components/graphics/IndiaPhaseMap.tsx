import { useState } from 'react';

const PHASES = [
  { id: 1, label: 'Phase 1', time: '0–6 months', detail: '272 Wards · Delhi NCT', sensors: '800 nodes' },
  { id: 2, label: 'Phase 2', time: '6–12 months', detail: 'NCR Region · Delhi, Haryana, UP Border', sensors: '2,400 nodes' },
  { id: 3, label: 'Phase 3', time: '12–24 months', detail: 'Top 10 NCAP Cities across India', sensors: '8,000 nodes' },
  { id: 4, label: 'Phase 4', time: '24–36 months', detail: 'South Asia · Bangladesh, Nepal', sensors: '15,000 nodes' },
];

export default function IndiaPhaseMap() {
  const [phase, setPhase] = useState(1);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Simplified India SVG */}
      <div className="relative w-full max-w-md aspect-[3/4]">
        <svg viewBox="0 0 300 400" className="w-full h-full">
          {/* India outline - simplified */}
          <path
            d="M150 20 C80 20 30 60 25 120 C20 160 40 200 50 230 C55 250 45 280 60 310 C70 330 90 350 110 370 C120 380 140 390 150 395 C160 390 180 380 190 370 C210 350 230 330 240 310 C255 280 245 250 250 230 C260 200 280 160 275 120 C270 60 220 20 150 20Z"
            fill="none"
            stroke="rgba(0, 229, 255, 0.2)"
            strokeWidth="1.5"
          />

          {/* Delhi - always visible */}
          <circle cx="148" cy="100" r={phase >= 1 ? 8 : 4} fill="#00E5FF" opacity={phase >= 1 ? 1 : 0.3} className="transition-all duration-500">
            {phase >= 1 && <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />}
          </circle>
          <text x="163" y="104" fill="#00E5FF" fontSize="10" fontFamily="'JetBrains Mono'" fontWeight="bold" opacity={phase >= 1 ? 1 : 0.3} style={{ textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}>Delhi</text>

          {/* NCR region */}
          <circle cx="130" cy="90" r="4" fill="#7A5CFF" opacity={phase >= 2 ? 0.8 : 0} className="transition-all duration-500" style={{ transitionDelay: '0.5s' }} />
          <circle cx="165" cy="85" r="4" fill="#7A5CFF" opacity={phase >= 2 ? 0.8 : 0} className="transition-all duration-500" style={{ transitionDelay: '0.7s' }} />
          <circle cx="140" cy="115" r="4" fill="#7A5CFF" opacity={phase >= 2 ? 0.8 : 0} className="transition-all duration-500" style={{ transitionDelay: '0.9s' }} />

          {/* NCAP cities */}
          {[
            { cx: 100, cy: 170, name: 'Mumbai' },
            { cx: 210, cy: 150, name: 'Kolkata' },
            { cx: 130, cy: 250, name: 'Bengaluru' },
            { cx: 160, cy: 230, name: 'Hyderabad' },
            { cx: 180, cy: 270, name: 'Chennai' },
            { cx: 120, cy: 130, name: 'Jaipur' },
            { cx: 190, cy: 120, name: 'Lucknow' },
            { cx: 105, cy: 200, name: 'Pune' },
            { cx: 85, cy: 140, name: 'Ahmedabad' },
            { cx: 200, cy: 170, name: 'Patna' },
          ].map((city, i) => (
            <g key={city.name} opacity={phase >= 3 ? 1 : 0} className="transition-all duration-500" style={{ transitionDelay: `${1 + i * 0.1}s` }}>
              <circle cx={city.cx} cy={city.cy} r="3" fill="#FF3CAC" />
              <text x={city.cx + 8} y={city.cy + 3} fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'JetBrains Mono'" fontWeight="bold">{city.name}</text>
            </g>
          ))}

          {/* South Asia outline (Phase 4) */}
          {phase >= 4 && (
            <>
              <ellipse cx="230" cy="140" rx="40" ry="50" fill="none" stroke="#7A5CFF" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" className="transition-opacity duration-500" />
              <text x="225" y="180" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="'JetBrains Mono'" opacity="0.5">Bangladesh</text>
              <ellipse cx="135" cy="55" rx="25" ry="15" fill="none" stroke="#7A5CFF" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
              <text x="125" y="50" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="'JetBrains Mono'" opacity="0.5">Nepal</text>
            </>
          )}

          {/* Flight paths from Delhi */}
          {phase >= 3 && (
            <g opacity="0.4">
              {[
                'M148 100 Q 120 140 100 170',
                'M148 100 Q 180 130 210 150',
                'M148 100 Q 130 180 130 250',
              ].map((d, i) => (
                <path key={i} d={d} fill="none" stroke="#00E5FF" strokeWidth="1.2" strokeDasharray="6 4" className="animate-dash" />
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Timeline slider */}
      <div className="w-full max-w-md">
        <input
          type="range"
          min="1"
          max="4"
          value={phase}
          onChange={e => setPhase(Number(e.target.value))}
          className="w-full accent-[#00E5FF] h-2 rounded-lg appearance-none cursor-pointer bg-white/5 border border-white/10"
        />
        <div className="flex justify-between mt-4">
          {PHASES.map(p => (
            <button
              key={p.id}
              onClick={() => setPhase(p.id)}
              className="text-center cursor-pointer group px-2"
            >
              <p className="text-[10px] font-mono font-bold tracking-widest uppercase transition-colors" style={{ color: phase >= p.id ? '#00E5FF' : 'rgba(255,255,255,0.3)' }}>
                {p.label}
              </p>
              <p className="text-[9px] font-mono text-muted-foreground/60 mt-1 uppercase">{p.time}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current phase detail */}
      <div className="neon-card rounded-[2rem] p-8 text-center max-w-sm w-full pulse-glow">
        <p className="text-sm font-heading font-bold glow-text-cyan uppercase tracking-[0.2em]">{PHASES[phase - 1].label}</p>
        <p className="text-base text-white/80 mt-3 leading-relaxed font-light">{PHASES[phase - 1].detail}</p>
        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-xs font-mono font-bold text-[#7A5CFF] tracking-widest">{PHASES[phase - 1].sensors.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
