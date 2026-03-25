import { useState, useEffect } from 'react';
import { WARD_DATA, getAqiColor } from '@/data/wardData';

export default function LiveTicker() {
  const [spikeIdx, setSpikeIdx] = useState<number | null>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      const idx = Math.floor(Math.random() * WARD_DATA.length);
      setSpikeIdx(idx);
      setTimeout(() => setSpikeIdx(null), 1200);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const items = [...WARD_DATA, ...WARD_DATA]; // doubled for seamless loop

  return (
    <div className="w-full overflow-hidden" style={{ background: 'rgba(13,13,20,0.9)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b" style={{ borderColor: 'rgba(196,131,58,0.12)' }}>
        <div className="flex items-center gap-2">
          <span className="pulse-dot" />
          <span className="text-[11px] font-mono font-semibold text-status-good">LIVE WARD FEED</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">272 WARDS MONITORED</span>
      </div>

      {/* Ticker */}
      <div className="relative">
        <div
          className="flex whitespace-nowrap py-2"
          style={{ animation: 'ticker-scroll 30s linear infinite' }}
        >
          {items.map((w, i) => {
            const realIdx = i % WARD_DATA.length;
            const isSpike = spikeIdx === realIdx;
            return (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-4 text-xs font-mono transition-colors duration-300"
                style={{ color: isSpike ? '#FFFFFF' : getAqiColor(w.aqi) }}
              >
                <span className="font-semibold">{w.name}</span>
                <span>PM2.5: {Math.round(w.aqi * 0.7)}µg/m³</span>
                <span>{w.sourceIcon}</span>
                <span>AQI: {w.aqi}</span>
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ background: getAqiColor(w.aqi) }}
                />
                {isSpike && (
                  <span className="text-status-warning font-bold animate-pulse">⚡ SPIKE</span>
                )}
                <span className="text-muted-foreground mx-2">│</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
