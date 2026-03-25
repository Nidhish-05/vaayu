import { useState, useEffect, useCallback } from 'react';
import { WARD_DATA, getAqiColor } from '@/data/wardData';

const COLS = 5;
const ROWS = 4;
const HEX_W = 72;
const HEX_H = 64;

interface Zone {
  id: number;
  name: string;
  aqi: number;
  source: string;
  sourceIcon: string;
  col: number;
  row: number;
}

function buildZones(): Zone[] {
  return WARD_DATA.slice(0, COLS * ROWS).map((w, i) => ({
    id: i,
    name: w.name,
    aqi: w.aqi,
    source: w.source,
    sourceIcon: w.sourceIcon,
    col: i % COLS,
    row: Math.floor(i / COLS),
  }));
}

export default function DelhiHeatmap() {
  const [zones, setZones] = useState(buildZones);
  const [hovered, setHovered] = useState<number | null>(null);
  const [alertZone, setAlertZone] = useState(14); // Bawana
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // Live simulation: change 2-3 random zones every 3s
  useEffect(() => {
    const iv = setInterval(() => {
      setZones(prev => {
        const next = [...prev];
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * next.length);
          next[idx] = { ...next[idx], aqi: 50 + Math.floor(Math.random() * 350) };
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  // Alert zone cycling
  useEffect(() => {
    const iv = setInterval(() => {
      setAlertZone(Math.floor(Math.random() * zones.length));
    }, 5000);
    return () => clearInterval(iv);
  }, [zones.length]);

  const getX = useCallback((col: number, row: number) => {
    return col * (HEX_W + 6) + (row % 2 === 1 ? (HEX_W + 6) / 2 : 0) + HEX_W / 2 + 10;
  }, []);
  const getY = useCallback((row: number) => row * (HEX_H * 0.78) + HEX_H / 2 + 10, []);

  const svgW = COLS * (HEX_W + 6) + HEX_W / 2 + 20;
  const svgH = ROWS * (HEX_H * 0.78) + HEX_H / 2 + 20;

  const hexPath = (cx: number, cy: number) => {
    const r = HEX_W / 2 - 2;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle) * 0.85}`;
    });
    return `M${pts.join('L')}Z`;
  };

  return (
    <div className="relative">
      {/* LIVE badge */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-card-elevated/80 px-2.5 py-1 rounded-full text-xs font-mono z-10">
        <span className="pulse-dot" style={{ width: 6, height: 6 }} />
        <span className="text-status-good font-semibold">LIVE</span>
      </div>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[420px]">
        {zones.map((z, i) => {
          const cx = getX(z.col, z.row);
          const cy = getY(z.row);
          const isAlert = z.id === alertZone;
          return (
            <g
              key={z.id}
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'scale(1)' : 'scale(0.8)',
                transformOrigin: `${cx}px ${cy}px`,
                transition: `all 0.5s ease ${i * 50}ms`,
              }}
              onMouseEnter={() => setHovered(z.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {isAlert && (
                <circle cx={cx} cy={cy} r={HEX_W / 2 + 6} fill="none" stroke="#D94F4F" strokeWidth="2" opacity="0.6">
                  <animate attributeName="r" values={`${HEX_W / 2};${HEX_W / 2 + 12};${HEX_W / 2}`} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <path
                d={hexPath(cx, cy)}
                fill={getAqiColor(z.aqi)}
                fillOpacity={0.7}
                stroke={getAqiColor(z.aqi)}
                strokeWidth={hovered === z.id ? 2 : 0.5}
                strokeOpacity={0.5}
                style={{ transition: 'fill 0.8s ease, fill-opacity 0.3s' }}
                className="cursor-pointer"
              />
              <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="9" fontFamily="'JetBrains Mono'" fontWeight="600">
                {z.aqi}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered !== null && (() => {
        const z = zones[hovered];
        const cx = getX(z.col, z.row);
        const cy = getY(z.row);
        return (
          <div
            className="absolute z-20 pointer-events-none card-glow rounded-lg p-3 min-w-[180px]"
            style={{
              left: `${(cx / svgW) * 100}%`,
              top: `${(cy / svgH) * 100 - 5}%`,
              transform: 'translate(-50%, -110%)',
              background: '#22223A',
            }}
          >
            <p className="text-sm font-heading font-bold text-foreground">{z.name}</p>
            <p className="text-xs font-mono mt-1" style={{ color: getAqiColor(z.aqi) }}>AQI: {z.aqi}</p>
            <p className="text-xs text-secondary-foreground mt-0.5">{z.sourceIcon} {z.source}</p>
            <span className="inline-block mt-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary-light">
              Source: 91% confidence
            </span>
          </div>
        );
      })()}
    </div>
  );
}
