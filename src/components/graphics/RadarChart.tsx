import { useState, useMemo } from 'react';
import { RADAR_DATA, RADAR_AXES, RADAR_COLORS } from '@/data/wardData';

const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 110;
const LEVELS = 4;
const sources = Object.keys(RADAR_DATA);

function polarToCart(angle: number, radius: number) {
  return {
    x: CX + radius * Math.cos(angle - Math.PI / 2),
    y: CY + radius * Math.sin(angle - Math.PI / 2),
  };
}

export default function RadarChart() {
  const [active, setActive] = useState<string | null>(null);
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);

  const axisAngle = (i: number) => (2 * Math.PI * i) / RADAR_AXES.length;

  const polygonPath = (values: number[]) => {
    return values.map((v, i) => {
      const { x, y } = polarToCart(axisAngle(i), (v / 100) * R);
      return `${x},${y}`;
    }).join(' ');
  };

  const axisDescriptions: Record<string, string> = {
    'PM2.5': 'Fine particles <2.5µm — penetrate lungs',
    'PM10': 'Coarse particles <10µm — dust, pollen',
    'NO₂': 'Nitrogen dioxide — vehicular combustion',
    'CO': 'Carbon monoxide — incomplete combustion',
    'SO₂': 'Sulfur dioxide — industrial processes',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Source selector pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {sources.map(s => (
          <button
            key={s}
            onClick={() => setActive(active === s ? null : s)}
            className="px-4 py-2 rounded-xl text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-300 border backdrop-blur-md"
            style={{
              background: active === s ? RADAR_COLORS[s] : 'rgba(255,255,255,0.03)',
              color: active === s ? '#080810' : RADAR_COLORS[s],
              borderColor: active === s ? RADAR_COLORS[s] : `${RADAR_COLORS[s]}30`,
              boxShadow: active === s ? `0 0 15px ${RADAR_COLORS[s]}40` : 'none',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full transition-transform duration-700 hover:scale-[1.02]">
          {/* Grid levels */}
          {Array.from({ length: LEVELS }, (_, l) => {
            const lr = ((l + 1) / LEVELS) * R;
            const pts = RADAR_AXES.map((_, i) => {
              const { x, y } = polarToCart(axisAngle(i), lr);
              return `${x},${y}`;
            }).join(' ');
            return <polygon key={l} points={pts} fill="none" stroke="rgba(0, 229, 255, 0.08)" strokeWidth="1" />;
          })}

          {/* Axes */}
          {RADAR_AXES.map((_, i) => {
            const { x, y } = polarToCart(axisAngle(i), R);
            return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(0, 229, 255, 0.12)" strokeWidth="1" />;
          })}

          {/* Source polygons */}
          {sources.map(s => {
            const isActive = active === s;
            const opacity = active === null ? 0.25 : isActive ? 0.6 : 0.05;
            return (
              <polygon
                key={s}
                points={polygonPath(RADAR_DATA[s])}
                fill={RADAR_COLORS[s]}
                fillOpacity={opacity}
                stroke={RADAR_COLORS[s]}
                strokeWidth={isActive ? 2.5 : 1}
                strokeOpacity={active === null ? 0.4 : isActive ? 0.9 : 0.1}
                style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            );
          })}

          {/* Axis labels */}
          {RADAR_AXES.map((axis, i) => {
            const { x, y } = polarToCart(axisAngle(i), R + 22);
            return (
              <text
                key={axis}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fillOpacity="0.5"
                fontSize="10"
                fontFamily="'JetBrains Mono'"
                fontWeight="700"
                className="cursor-help uppercase tracking-widest"
                onMouseEnter={() => setHoveredAxis(i)}
                onMouseLeave={() => setHoveredAxis(null)}
              >
                {axis}
              </text>
            );
          })}
        </svg>

        {/* Center label */}
        {active && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-black/40 rounded-full p-6 backdrop-blur-sm border border-white/5">
              <p className="text-[10px] font-mono font-bold tracking-widest uppercase mb-1" style={{ color: RADAR_COLORS[active] }}>{active}</p>
              <p className="text-[9px] font-mono text-muted-foreground/60">SOURCE ATTRIBUTION: 91%</p>
            </div>
          </div>
        )}

        {/* Axis tooltip */}
        {hoveredAxis !== null && (
          <div
            className="absolute z-10 px-4 py-2 rounded-xl text-[10px] font-mono bg-black/90 text-white border border-white/10 backdrop-blur-xl shadow-2xl whitespace-nowrap"
            style={{
              left: '50%',
              bottom: -20,
              transform: 'translateX(-50%)',
              textShadow: '0 0 8px rgba(255,255,255,0.3)',
            }}
          >
            {axisDescriptions[RADAR_AXES[hoveredAxis]]}
          </div>
        )}
      </div>
    </div>
  );
}
