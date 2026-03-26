import { useState, useEffect, useRef } from 'react';

const STEPS = [
  { name: 'DETECT', color: '#00E5FF', desc: 'Real-time IoT + satellite pollution monitoring across 272 wards' },
  { name: 'ATTRIBUTE', color: '#00E5FF', desc: 'ML-powered chemical fingerprinting identifies exact pollution source' },
  { name: 'LOCATE', color: '#39FF14', desc: 'GPS-pinpoint ward-level source location with 50m accuracy' },
  { name: 'LEGISLATE', color: '#7A5CFF', desc: 'Auto-generate legal notices under Air Act §21 within minutes' },
  { name: 'ASSIGN', color: '#7A5CFF', desc: 'GPS-dispatch nearest enforcement officer with evidence packet' },
  { name: 'TRACK', color: '#FF5F3C', desc: 'Monitor compliance with SLA timers and escalation protocols' },
  { name: 'MEASURE', color: '#39FF14', desc: 'Validate AQI improvement post-intervention with before/after data' },
  { name: 'RETRAIN', color: '#FF3CAC', desc: 'Feed outcome data back to ML models for continuous improvement' },
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
                    background: isActive ? step.color : 'rgba(255,255,255,0.03)',
                    color: isActive ? '#080810' : step.color,
                    boxShadow: isPulse ? `0 0 20px ${step.color}60` : isActive ? `0 0 30px ${step.color}40` : 'none',
                    transform: isActive ? 'scale(1.2)' : isPulse ? 'scale(1.1)' : 'scale(1)',
                    border: `2px solid ${step.color}`,
                    borderColor: isActive || isPulse ? step.color : `${step.color}30`,
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="mt-3 text-[10px] font-mono font-bold tracking-widest transition-colors uppercase"
                  style={{ color: isActive || isPulse ? step.color : 'rgba(255,255,255,0.4)', textShadow: isActive || isPulse ? `0 0 8px ${step.color}40` : 'none' }}
                >
                  {step.name}
                </span>

                {/* Expanded card */}
                {isActive && (
                  <div className="absolute top-full mt-6 w-60 neon-card rounded-2xl p-5 bg-[#080810]/95 backdrop-blur-xl z-20 text-left border" style={{ borderColor: `${step.color}40`, boxShadow: `0 15px 30px rgba(0,0,0,0.5), 0 0 20px ${step.color}15` }}>
                    <p className="text-xs font-heading font-bold uppercase tracking-widest mb-2" style={{ color: step.color }}>{step.name}</p>
                    <p className="text-[11px] text-white/80 leading-relaxed font-light">{step.desc}</p>
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[#00E5FF] border border-[#00E5FF]/20">
                        SYSTEM VALIDATED
                      </span>
                    </div>
                  </div>
                )}
              </button>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <svg width="40" height="4" className="mx-0.5 opacity-30">
                  <line
                    x1="0" y1="2" x2="40" y2="2"
                    stroke={STEPS[i + 1].color}
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className="animate-dash"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback loop arrow */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#7A5CFF] bg-[#7A5CFF]/10 px-4 py-2 rounded-full border border-[#7A5CFF]/20 backdrop-blur-sm">
          <span className="text-lg">↩</span>
          <span className="uppercase tracking-[0.1em]">RETRAIN protocol feeds back to ML pipeline</span>
        </div>
      </div>
    </div>
  );
}
