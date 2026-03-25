import { useState, useEffect, useRef } from 'react';

const STEPS = [
  { name: 'DETECT', color: '#1A5FAE', desc: 'Real-time IoT + satellite pollution monitoring across 272 wards' },
  { name: 'ATTRIBUTE', color: '#0B9182', desc: 'ML-powered chemical fingerprinting identifies exact pollution source' },
  { name: 'LOCATE', color: '#0B9182', desc: 'GPS-pinpoint ward-level source location with 50m accuracy' },
  { name: 'LEGISLATE', color: '#C4833A', desc: 'Auto-generate legal notices under Air Act §21 within minutes' },
  { name: 'ASSIGN', color: '#C4833A', desc: 'GPS-dispatch nearest enforcement officer with evidence packet' },
  { name: 'TRACK', color: '#D94F4F', desc: 'Monitor compliance with SLA timers and escalation protocols' },
  { name: 'MEASURE', color: '#4CAF8C', desc: 'Validate AQI improvement post-intervention with before/after data' },
  { name: 'RETRAIN', color: '#7B68EE', desc: 'Feed outcome data back to ML models for continuous improvement' },
];

export default function GovernancePipeline() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [pulseIdx, setPulseIdx] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const iv = setInterval(() => {
      if (!paused.current) {
        setPulseIdx(prev => (prev + 1) % STEPS.length);
      }
    }, 750);
    return () => clearInterval(iv);
  }, []);

  const handleClick = (i: number) => {
    if (activeStep === i) {
      setActiveStep(null);
      paused.current = false;
    } else {
      setActiveStep(i);
      paused.current = true;
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-center gap-1 min-w-[800px] justify-center py-6">
        {STEPS.map((step, i) => {
          const isActive = activeStep === i;
          const isPulse = pulseIdx === i && activeStep === null;
          return (
            <div key={i} className="flex items-center">
              <button
                onClick={() => handleClick(i)}
                className="relative flex flex-col items-center cursor-pointer group"
              >
                {/* Node */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-heading font-bold transition-all duration-300"
                  style={{
                    background: isActive ? step.color : `${step.color}30`,
                    color: isActive ? '#0D0D14' : step.color,
                    boxShadow: isPulse ? `0 0 20px ${step.color}80` : isActive ? `0 0 30px ${step.color}60` : 'none',
                    transform: isActive ? 'scale(1.2)' : isPulse ? 'scale(1.1)' : 'scale(1)',
                    border: `2px solid ${step.color}`,
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="mt-2 text-[10px] font-mono font-semibold tracking-wider transition-colors"
                  style={{ color: isActive || isPulse ? step.color : '#7A7A9A' }}
                >
                  {step.name}
                </span>

                {/* Expanded card */}
                {isActive && (
                  <div className="absolute top-full mt-4 w-56 card-glow rounded-lg p-3 bg-card-elevated z-10 text-left">
                    <p className="text-xs font-heading font-bold" style={{ color: step.color }}>{step.name}</p>
                    <p className="text-[11px] text-secondary-foreground mt-1">{step.desc}</p>
                    <span className="inline-block mt-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary-light">
                      Research-validated
                    </span>
                  </div>
                )}
              </button>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <svg width="40" height="4" className="mx-0.5">
                  <line
                    x1="0" y1="2" x2="40" y2="2"
                    stroke={STEPS[i + 1].color}
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    opacity="0.4"
                    style={{ animation: 'dash-travel 1s linear infinite' }}
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback loop arrow */}
      <div className="flex justify-center mt-2">
        <div className="flex items-center gap-1 text-[10px] font-mono text-chart-purple opacity-60">
          <span>↩</span>
          <span>RETRAIN feeds back to ML pipeline (steps 2–3)</span>
        </div>
      </div>
    </div>
  );
}
