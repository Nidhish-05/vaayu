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
    <div className="w-full holographic-noise border-y border-[#00E5FF]/20 bg-[#080810]/60 backdrop-blur-2xl relative overflow-hidden group">
      {/* Neon glowing edges */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent shadow-[0_0_10px_#00E5FF]" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7A5CFF]/40 to-transparent shadow-[0_0_10px_#7A5CFF]" />

      {/* Header Overlay */}
      <div className="flex items-center justify-between px-8 py-2.5 border-b border-white/5 bg-white/[0.03] relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] shadow-[0_0_10px_#39FF14]" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-ping opacity-60" />
          </div>
          <span className="text-[10px] font-mono font-black text-[#00E5FF] tracking-[0.3em] uppercase glow-text-cyan">
            LIVE WARD INTELLIGENCE STREAM
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-mono font-bold text-white/30 tracking-widest uppercase">
            UPDATING EVERY 5.0m
          </span>
          <div className="flex gap-1">
            {[1,2,3].map(i => (
              <div key={i} className="w-1 h-3 bg-[#00E5FF]/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="relative z-10">
        <div
          className="flex whitespace-nowrap py-4"
          style={{ animation: 'ticker-scroll 60s linear infinite' }}
        >
          {items.map((w, i) => {
            const realIdx = i % WARD_DATA.length;
            const isSpike = spikeIdx === realIdx;
            const aqiColor = getAqiColor(w.aqi);
            const aqiPercent = Math.min(100, (w.aqi / 500) * 100);

            return (
              <div
                key={i}
                className={`inline-flex items-center gap-6 px-8 transition-all duration-500 border-r border-white/10 ${isSpike ? 'bg-white/[0.05]' : ''}`}
              >
                {/* Ward Name & Status */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-tighter">WARD SECTOR</span>
                  <span className="text-xs font-heading font-black text-white uppercase tracking-tight">{w.name}</span>
                </div>

                {/* AQI Meter (Vertical) */}
                <div className="flex items-end gap-1 h-8 px-2 border-x border-white/5 bg-white/[0.02]">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div 
                      key={j}
                      className="w-1 rounded-full transition-all duration-700"
                      style={{ 
                        height: `${Math.max(20, (j + 1) * 20)}%`,
                        background: aqiPercent > (j * 20) ? aqiColor : 'rgba(255,255,255,0.05)',
                        boxShadow: aqiPercent > (j * 20) ? `0 0 8px ${aqiColor}40` : 'none'
                      }}
                    />
                  ))}
                </div>

                {/* Core Metrics */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 min-w-[140px]">
                  <span className="text-[9px] font-mono text-white/40 uppercase">PM2.5</span>
                  <span className="text-[10px] font-mono font-bold text-white/90">{Math.round(w.aqi * 0.7)} <span className="text-[8px] opacity-40">µg</span></span>
                  <span className="text-[9px] font-mono text-white/40 uppercase">Index</span>
                  <span className="text-[11px] font-mono font-black border-b border-current pb-0.5" style={{ color: aqiColor, textShadow: `0 0 10px ${aqiColor}50` }}>
                    {w.aqi}
                  </span>
                </div>

                {/* Source Icon with Glow */}
                <div className="relative group/icon">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                  <span className="relative text-lg filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{w.sourceIcon}</span>
                </div>

                {/* Spike Alert */}
                {isSpike && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF5F3C]/20 border border-[#FF5F3C]/40 animate-[dataFlicker_0.5s_infinite]">
                    <span className="text-[9px] font-mono font-black text-[#FF5F3C] tracking-tighter">🚨 ANOMALY DETECTED</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
