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
            stroke="rgba(196,131,58,0.2)"
            strokeWidth="1.5"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 0,
              animation: 'none',
            }}
          />

          {/* Delhi - always visible */}
          <circle cx="148" cy="100" r={phase >= 1 ? 8 : 4} fill="#C4833A" opacity={phase >= 1 ? 1 : 0.3} className="transition-all duration-500">
            {phase >= 1 && <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />}
          </circle>
          <text x="163" y="104" fill="#C4833A" fontSize="8" fontFamily="'JetBrains Mono'" opacity={phase >= 1 ? 1 : 0.3}>Delhi</text>

          {/* NCR region */}
          <circle cx="130" cy="90" r="4" fill="#E8A85C" opacity={phase >= 2 ? 0.8 : 0} className="transition-all duration-500" style={{ transitionDelay: '0.5s' }} />
          <circle cx="165" cy="85" r="4" fill="#E8A85C" opacity={phase >= 2 ? 0.8 : 0} className="transition-all duration-500" style={{ transitionDelay: '0.7s' }} />
          <circle cx="140" cy="115" r="4" fill="#E8A85C" opacity={phase >= 2 ? 0.8 : 0} className="transition-all duration-500" style={{ transitionDelay: '0.9s' }} />

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
              <circle cx={city.cx} cy={city.cy} r="3" fill="#F5C9A0" />
              <text x={city.cx + 6} y={city.cy + 3} fill="#7A7A9A" fontSize="6" fontFamily="'JetBrains Mono'">{city.name}</text>
            </g>
          ))}

          {/* South Asia outline (Phase 4) */}
          {phase >= 4 && (
            <>
              <ellipse cx="230" cy="140" rx="40" ry="50" fill="none" stroke="#C4833A" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" className="transition-opacity duration-500" />
              <text x="225" y="180" fill="#7A7A9A" fontSize="6" fontFamily="'JetBrains Mono'" opacity="0.5">Bangladesh</text>
              <ellipse cx="135" cy="55" rx="25" ry="15" fill="none" stroke="#C4833A" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" />
              <text x="125" y="50" fill="#7A7A9A" fontSize="6" fontFamily="'JetBrains Mono'" opacity="0.5">Nepal</text>
            </>
          )}

          {/* Flight paths from Delhi */}
          {phase >= 3 && (
            <g opacity="0.3">
              {[
                'M148 100 Q 120 140 100 170',
                'M148 100 Q 180 130 210 150',
                'M148 100 Q 130 180 130 250',
              ].map((d, i) => (
                <path key={i} d={d} fill="none" stroke="#C4833A" strokeWidth="0.8" strokeDasharray="4 3" style={{ animation: 'dash-travel 2s linear infinite' }} />
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
          className="w-full accent-primary h-1 rounded-lg appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #C4833A ${((phase - 1) / 3) * 100}%, rgba(196,131,58,0.2) ${((phase - 1) / 3) * 100}%)` }}
        />
        <div className="flex justify-between mt-2">
          {PHASES.map(p => (
            <button
              key={p.id}
              onClick={() => setPhase(p.id)}
              className="text-center cursor-pointer group"
            >
              <p className="text-[10px] font-mono font-semibold transition-colors" style={{ color: phase >= p.id ? '#C4833A' : '#7A7A9A' }}>
                {p.label}
              </p>
              <p className="text-[8px] font-mono text-muted-foreground">{p.time}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current phase detail */}
      <div className="card-glow rounded-lg p-4 bg-card text-center max-w-sm">
        <p className="text-sm font-heading font-bold text-primary">{PHASES[phase - 1].label}</p>
        <p className="text-xs text-secondary-foreground mt-1">{PHASES[phase - 1].detail}</p>
        <p className="text-xs font-mono text-primary-light mt-1">{PHASES[phase - 1].sensors}</p>
      </div>
    </div>
  );
}
