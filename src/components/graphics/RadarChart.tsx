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
            className="px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-300"
            style={{
              background: active === s ? RADAR_COLORS[s] : 'rgba(196,131,58,0.1)',
              color: active === s ? '#0D0D14' : RADAR_COLORS[s],
              border: `1px solid ${RADAR_COLORS[s]}40`,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full transition-transform duration-500 hover:rotate-3">
          {/* Grid levels */}
          {Array.from({ length: LEVELS }, (_, l) => {
            const lr = ((l + 1) / LEVELS) * R;
            const pts = RADAR_AXES.map((_, i) => {
              const { x, y } = polarToCart(axisAngle(i), lr);
              return `${x},${y}`;
            }).join(' ');
            return <polygon key={l} points={pts} fill="none" stroke="rgba(196,131,58,0.1)" strokeWidth="0.5" />;
          })}

          {/* Axes */}
          {RADAR_AXES.map((_, i) => {
            const { x, y } = polarToCart(axisAngle(i), R);
            return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(196,131,58,0.15)" strokeWidth="0.5" />;
          })}

          {/* Source polygons */}
          {sources.map(s => {
            const isActive = active === s;
            const opacity = active === null ? 0.35 : isActive ? 0.8 : 0.08;
            return (
              <polygon
                key={s}
                points={polygonPath(RADAR_DATA[s])}
                fill={RADAR_COLORS[s]}
                fillOpacity={opacity}
                stroke={RADAR_COLORS[s]}
                strokeWidth={isActive ? 2 : 0.5}
                strokeOpacity={active === null ? 0.6 : isActive ? 1 : 0.1}
                style={{ transition: 'all 0.6s ease' }}
              />
            );
          })}

          {/* Axis labels */}
          {RADAR_AXES.map((axis, i) => {
            const { x, y } = polarToCart(axisAngle(i), R + 18);
            return (
              <text
                key={axis}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#C8C8D8"
                fontSize="11"
                fontFamily="'JetBrains Mono'"
                className="cursor-help"
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
            <div className="text-center">
              <p className="text-xs font-heading font-bold" style={{ color: RADAR_COLORS[active] }}>{active}</p>
              <p className="text-[10px] font-mono text-muted-foreground">91% confidence</p>
            </div>
          </div>
        )}

        {/* Axis tooltip */}
        {hoveredAxis !== null && (
          <div
            className="absolute z-10 px-2 py-1 rounded text-[10px] font-mono bg-card-elevated text-secondary-foreground card-glow whitespace-nowrap"
            style={{
              left: '50%',
              bottom: -8,
              transform: 'translateX(-50%)',
            }}
          >
            {axisDescriptions[RADAR_AXES[hoveredAxis]]}
          </div>
        )}
      </div>
    </div>
  );
}
