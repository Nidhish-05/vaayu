import { useEffect, useState } from 'react';
import { WARD_DATA, getAqiColor, getAqiLabel, WardData } from '@/data/wardData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ══ Live AQI Simulation ══ */
function useLiveWards() {
  const [wards, setWards] = useState<WardData[]>(WARD_DATA);

  useEffect(() => {
    const iv = setInterval(() => {
      setWards(prev =>
        prev.map(w => ({
          ...w,
          aqi: Math.max(30, w.aqi + Math.floor(Math.random() * 40 - 20)),
        }))
      );
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  return wards;
}

/* ══ Main Component (Vanilla Leaflet – no react-leaflet) ══ */
export default function InteractiveAQIMap() {
  const wards = useLiveWards();
  const [selectedWard, setSelectedWard] = useState<WardData | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.CircleMarker[]>([]);

  // Initialize Leaflet map once
  useEffect(() => {
    const container = document.getElementById('vaayu-leaflet-map');
    if (!container || mapInstance) return;

    const map = L.map(container, {
      center: [28.6448, 77.1700],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    // CartoDB Dark Matter tiles (free)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Enable scroll zoom on click, disable on mouseout
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());

    setMapInstance(map);

    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, []);

  // Update markers when wards change
  useEffect(() => {
    if (!mapInstance) return;

    // Remove old markers
    markers.forEach(m => m.remove());

    const newMarkers = wards.map(ward => {
      const color = getAqiColor(ward.aqi);
      const radius = Math.max(12, Math.min(28, ward.aqi / 13));

      const marker = L.circleMarker([ward.lat, ward.lng], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 2,
        opacity: 0.8,
      }).addTo(mapInstance);

      // Popup
      marker.bindPopup(
        `<div style="background:#0a0c14;color:#fff;padding:12px 16px;border-radius:12px;min-width:200px;border:1px solid ${color}40;font-family:'Space Grotesk',sans-serif;">
          <p style="font-weight:700;font-size:16px;margin:0;letter-spacing:-0.02em">${ward.name}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
            <span style="font-family:monospace;font-weight:700;font-size:24px;color:${color}">${ward.aqi}</span>
            <span style="font-family:monospace;font-size:11px;padding:2px 8px;border-radius:6px;background:${color}20;color:${color};font-weight:600;text-transform:uppercase;letter-spacing:0.1em">${getAqiLabel(ward.aqi)}</span>
          </div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">
            <p style="font-size:12px;color:#999;margin:0">${ward.sourceIcon} Source: <strong style="color:#fff">${ward.source}</strong></p>
          </div>
        </div>`,
        { className: 'vaayu-popup' }
      );

      marker.on('click', () => setSelectedWard(ward));

      return marker;
    });

    setMarkers(newMarkers);
  }, [mapInstance, wards]);

  return (
    <div className="relative">
      {/* LIVE badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 border border-[#39FF14]/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono z-[1000]">
        <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.6)]" />
        <span className="text-[#39FF14] font-bold tracking-widest">LIVE MONITORING</span>
      </div>

      {/* Ward Count */}
      <div className="absolute top-4 left-4 bg-black/60 border border-[#00E5FF]/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono z-[1000]">
        <span className="text-[#00E5FF]">{wards.length} WARDS</span>
        <span className="text-muted-foreground ml-2">|</span>
        <span className="text-[#FF5F3C] ml-2">{wards.filter(w => w.aqi > 300).length} CRITICAL</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/70 border border-white/10 backdrop-blur-md p-4 rounded-xl z-[1000]">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">AQI Scale</p>
        <div className="space-y-1.5">
          {[
            { label: 'Good (0-100)', color: '#39FF14' },
            { label: 'Moderate (100-200)', color: '#00E5FF' },
            { label: 'Poor (200-300)', color: '#7A5CFF' },
            { label: 'Severe (300+)', color: '#FF5F3C' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
              <span className="text-[11px] text-secondary-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div id="vaayu-leaflet-map" style={{ height: '600px', width: '100%', borderRadius: '1.5rem' }} />

      {/* Selected Ward Info Panel */}
      {selectedWard && (
        <div className="absolute bottom-4 right-4 z-[1000] neon-card p-6 rounded-2xl min-w-[240px] backdrop-blur-xl" style={{ border: `1px solid ${getAqiColor(selectedWard.aqi)}30` }}>
          <button className="absolute top-2 right-3 text-muted-foreground hover:text-white text-sm" onClick={() => setSelectedWard(null)}>✕</button>
          <p className="text-lg font-heading font-bold text-white tracking-tight">{selectedWard.name}</p>
          <p className="text-3xl font-mono font-bold mt-2" style={{ color: getAqiColor(selectedWard.aqi), textShadow: `0 0 15px ${getAqiColor(selectedWard.aqi)}60` }}>
            {selectedWard.aqi}
          </p>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">{getAqiLabel(selectedWard.aqi)}</p>
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-sm text-secondary-foreground">
              {selectedWard.sourceIcon} {selectedWard.source}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
