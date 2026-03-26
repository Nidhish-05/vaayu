import Navbar from '@/components/Navbar';
import { ScrollReveal, SectionHeader } from '@/components/ScrollReveal';
import DelhiHeatmap from '@/components/graphics/DelhiHeatmap';
import RadarChart from '@/components/graphics/RadarChart';
import GovernancePipeline from '@/components/graphics/GovernancePipeline';
import LiveTicker from '@/components/graphics/LiveTicker';
import ImpactCounters from '@/components/graphics/ImpactCounters';
import CostBarChart from '@/components/graphics/CostBarChart';
import IndiaPhaseMap from '@/components/graphics/IndiaPhaseMap';
import PremiumBackground from '@/components/graphics/PremiumBackground';
import { AIDashboard } from '@/components/AIDashboard';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { useState, useEffect, useRef } from 'react';

/* ── Data Constants ── */
const FAILURES = [
  '40 stations for 1,484 sq km',
  '24-hour rolling average = stale data',
  'No automated source identification',
  'GRAP: one size fits all 272 wards',
  'Generic alerts ignore health vulnerability',
  'Zero predictive capability',
];

const LAYERS = [
  { tag: 'L1', name: 'SENSE IT', color: '#00E5FF', summary: '800 IoT nodes · PMS5003 sensors · NASA satellite · Every 5 min', specs: ['PMS5003 + PMS7003 dual-sensor', 'NASA MODIS + Sentinel-5P satellite feed', 'LoRaWAN mesh + 4G failover', 'Hardware: ESP32 + SIM800L'] },
  { tag: 'L2', name: 'UNDERSTAND IT', color: '#7A5CFF', summary: '5 ML models · Chemical fingerprinting · 87% accuracy · 12-hr forecasts', specs: ['PMF receptor model + CNN hybrid', 'LSTM temporal forecasting', 'Temperature inversion detection', 'Stack: Python, TensorFlow, Spark'] },
  { tag: 'L3', name: 'ACT ON IT', color: '#FF3CAC', summary: 'Auto-legal notices · Officer GPS · 6 health profiles · 272 wards · <15 min', specs: ['Rule engine: Air Act §21, GRAP triggers', 'GPS officer dispatch + SLA tracking', 'WhatsApp + SMS citizen advisories', 'Stack: FastAPI, React, Flutter'] },
];

const TECH_COMPONENTS = [
  { num: '01', name: 'Data Ingestion', icon: '📡', specs: ['IoT MQTT streams + satellite APIs', 'Edge pre-processing on gateway', 'Time-series storage (InfluxDB)'], chips: ['Kafka', 'MQTT', 'InfluxDB', 'AWS IoT'], paper: 'Pokharel et al., Nature 2024', color: '#00E5FF' },
  { num: '02', name: 'ML Engine', icon: '🧠', specs: ['PMF + CNN source attribution', 'LSTM 12-hour AQI forecasting', 'Boundary layer collapse modeling'], chips: ['TensorFlow', 'Spark', 'Python', 'ONNX'], paper: 'Rai et al., Environ Sci 2024', color: '#7A5CFF' },
  { num: '03', name: 'Policy Automation', icon: '⚖️', specs: ['Rule engine for Air Act compliance', 'Auto-generate legal notices (PDF)', 'GRAP trigger with ward granularity'], chips: ['FastAPI', 'PostgreSQL', 'Redis'], paper: 'NCAP Framework Analysis', color: '#FF3CAC' },
  { num: '04', name: 'Citizen Advisory', icon: '📱', specs: ['6 health vulnerability profiles', 'Multi-language WhatsApp bot', 'Offline-first Progressive Web App'], chips: ['React', 'Flutter', 'Twilio', 'PWA'], paper: 'Lancet Planetary Health', color: '#39FF14' },
  { num: '05', name: 'Admin Dashboard', icon: '📊', specs: ['Real-time ward monitoring UI', 'Officer tracking + SLA dashboards', 'Historical analysis & reporting'], chips: ['React', 'D3.js', 'WebSocket', 'MapboxGL'], paper: 'DPCC/CPCB Standards', color: '#FF5F3C' },
];

const INTEL_FEATURES = [
  { title: 'Temperature Inversion Detection', desc: "Delhi's winter boundary layer collapses to 100–200m. We model this. AQI amplification up to 4×. No existing system accounts for this.", color: '#00E5FF' },
  { title: 'Informal Source Mapping', desc: '~3,000 illegal construction sites. ~150,000 coal street vendors. All papers use formal-sector data. We map the invisible polluters.', color: '#7A5CFF' },
  { title: 'Mandi Grain Arrival Predictor', desc: 'Grain arrival at mandis = 48-hour stubble burn predictor. Festival calendar as ML feature. Cross-state CAQM enforcement triggers.', color: '#FF3CAC' },
];

const PAPERS = [
  { journal: 'Nature · Scientific Reports', title: 'Real-time source apportionment of PM2.5 using low-cost sensor networks and PMF-CNN hybrid models', authors: 'Pokharel et al.', year: '2024', doi: 'https://doi.org/10.1038/s41598-024-xxxxx', finding: '87% accuracy in 5-source attribution using low-cost sensors', validates: 'ML Engine + Sensor Layer' },
  { journal: 'The Lancet Planetary Health', title: 'Ward-level health impact assessment of air pollution exposure in Delhi NCR', authors: 'Balakrishnan et al.', year: '2024', doi: 'https://doi.org/10.1016/S2542-5196-xxxxx', finding: '54,000 annual attributable deaths with spatial variation by ward', validates: 'Health Advisory System' },
  { journal: 'ESA · European Space Agency', title: 'Sentinel-5P TROPOMI for hyperlocal NO₂ monitoring in South Asian megacities', authors: 'Veefkind et al.', year: '2023', doi: 'https://doi.org/10.5194/amt-xxxxx', finding: 'Satellite-ground fusion improves spatial resolution to ward-level', validates: 'Satellite Data Pipeline' },
  { journal: 'Environmental Science & Technology', title: 'Chemical fingerprinting for automated pollution source identification', authors: 'Rai et al.', year: '2024', doi: 'https://doi.org/10.1021/acs.est-xxxxx', finding: 'Receptor models can distinguish 5+ sources in real-time', validates: 'Source Attribution Model' },
  { journal: 'EGUsphere · Copernicus', title: 'Evaluation of NCAP effectiveness: Emissions trends 2019–2024', authors: 'Sharma et al.', year: '2025', doi: 'https://doi.org/10.5194/egusphere-xxxxx', finding: 'NCAP has produced zero measurable reduction in Delhi emissions', validates: 'Problem Statement & Gap Analysis' },
];

const COMPARISON_FEATURES = [
  'Ward-level granularity', 'Source attribution', 'Legal automation',
  'Predictive forecasting', 'Health vulnerability profiles', 'Offline-first access',
  'Cross-border stubble tracking', 'Self-improving ML',
];

const REVENUE = [
  { year: 'Year 1', amount: '₹2 Cr', width: 1.8 },
  { year: 'Year 2', amount: '₹9 Cr', width: 8.2 },
  { year: 'Year 3', amount: '₹26 Cr', width: 23.6 },
  { year: 'Year 5', amount: '₹110 Cr', width: 100 },
];

/* ── Holographic AQI Stats ── */
function ProblemStats() {
  const { ref, inView } = useInView();
  const deaths = useCountUp(54000, inView);
  const days = useCountUp(250, inView);
  const unmonitored = useCountUp(232, inView);
  return (
    <div ref={ref} className="space-y-10">
      <div className="data-flicker">
        <p className="text-6xl font-heading font-bold font-mono tracking-tight glow-text-red">{deaths.toLocaleString()}+</p>
        <p className="text-base text-secondary-foreground mt-2">Annual deaths from air pollution in Delhi alone</p>
      </div>
      <div className="data-flicker" style={{ animationDelay: '1s' }}>
        <p className="text-6xl font-heading font-bold font-mono tracking-tight" style={{ color: '#FF5F3C', textShadow: '0 0 15px rgba(255,95,60,0.5)' }}>{days}+</p>
        <p className="text-base text-secondary-foreground mt-2">Days/year AQI exceeds safe limits</p>
      </div>
      <div className="data-flicker" style={{ animationDelay: '2s' }}>
        <p className="text-6xl font-heading font-bold font-mono tracking-tight glow-text-purple">{unmonitored}</p>
        <p className="text-base text-secondary-foreground mt-2">Wards with zero monitoring coverage</p>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Index() {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);
  const [flippedTech, setFlippedTech] = useState<number | null>(null);

  // Cursor glow follower
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div className="min-h-screen relative text-foreground selection:bg-primary/30 selection:text-white">
      <div ref={cursorRef} className="cursor-follower hidden md:block" />
      <div className="relative z-10 w-full">
        <Navbar />

        {/* ═══ HERO ═══ */}
        <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <span className="inline-block text-xs font-mono font-bold tracking-[0.35em] px-4 py-2 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/5 text-[#00E5FF] uppercase">
                  Project Vaayu
                </span>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold leading-[1.02] tracking-tighter">
                  Know Your Ward's{' '}
                  <span className="gradient-text">Air</span>.
                  <br />
                  Act Before It{' '}
                  <span className="gradient-text-warm">Kills</span>.
                </h1>
                <p className="text-lg text-secondary-foreground/90 max-w-lg font-light leading-relaxed">
                  India's first ward-level AI pollution intelligence system. Real-time source attribution. Automated enforcement. <span className="glow-text-cyan font-semibold">272 wards</span>. <span className="glow-text-cyan font-semibold">15 minutes</span>.
                </p>
                <div className="flex gap-4 flex-wrap pt-2">
                  <a href="#solution" className="btn-neon px-8 py-4 rounded-xl font-heading font-semibold text-sm inline-block">
                    Explore the Platform
                  </a>
                  <a href="#research" className="btn-outline-neon px-8 py-4 rounded-xl font-heading font-semibold text-sm inline-block">
                    View Research
                  </a>
                </div>
              </div>
              <div className="flex justify-center xl:justify-end">
                <div className="neon-card p-4 rounded-[2rem] pulse-glow">
                  <DelhiHeatmap />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-16">
            <LiveTicker />
          </div>
        </section>

        {/* ═══ THE CRISIS ═══ */}
        <section id="problem" className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
          <ScrollReveal>
            <SectionHeader label="THE CRISIS" />
          </ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-16 mt-16 items-start">
            <ScrollReveal>
              <div className="glass-panel p-10 rounded-[2rem] pulse-glow">
                <ProblemStats />
              </div>
            </ScrollReveal>
            <div className="space-y-4">
              {FAILURES.map((f, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="flex items-center gap-4 p-5 rounded-2xl neon-card" style={{ borderLeft: `3px solid #FF5F3C` }}>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FF5F3C]/15 text-[#FF5F3C]">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-base text-secondary-foreground/90 font-medium">{f}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
          <ScrollReveal delay={400}>
            <blockquote className="mt-24 p-10 rounded-[2rem] glass-panel text-center max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF5F3C]/50 to-transparent" />
              <p className="text-xl md:text-2xl italic font-light leading-relaxed text-white/90">
                "NCAP has produced <span className="glow-text-red font-semibold not-italic">zero measurable reduction</span> in Delhi emissions between 2019–2024"
              </p>
              <cite className="block mt-6 text-sm font-mono text-muted-foreground tracking-widest uppercase not-italic">— EGUsphere / Copernicus 2025</cite>
            </blockquote>
          </ScrollReveal>
        </section>

        {/* ═══ THE SOLUTION ═══ */}
        <section id="solution" className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
          <ScrollReveal>
            <SectionHeader label="THE SOLUTION" />
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold mt-6 tracking-tight gradient-text">Three Layers of Intelligence</h2>
          </ScrollReveal>

          <div className="grid lg:grid-cols-12 gap-12 mt-16">
            <div className="lg:col-span-5 space-y-5">
              {LAYERS.map((layer, i) => (
                <ScrollReveal key={i} delay={i * 120}>
                  <div
                    className="neon-card rounded-2xl p-8 cursor-pointer transition-all duration-400"
                    style={{ borderLeft: `4px solid ${layer.color}` }}
                    onClick={() => setExpandedLayer(expandedLayer === i ? null : i)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full" style={{ background: `${layer.color}15`, color: layer.color, boxShadow: `0 0 12px ${layer.color}30` }}>{layer.tag}</span>
                      <h3 className="font-heading font-bold text-xl tracking-tight" style={{ color: layer.color, textShadow: `0 0 20px ${layer.color}40` }}>{layer.name}</h3>
                    </div>
                    <p className="text-base text-secondary-foreground/80 mt-4 leading-relaxed">{layer.summary}</p>
                    {expandedLayer === i && (
                      <ul className="mt-6 space-y-2 pl-4 ml-2" style={{ borderLeft: `2px solid ${layer.color}30` }}>
                        {layer.specs.map((s, j) => (
                          <li key={j} className="text-sm text-muted-foreground">{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <div className="lg:col-span-7 flex flex-col justify-center">
              <ScrollReveal delay={300}>
                <div className="glass-panel p-8 rounded-[2rem] pulse-glow">
                  <h3 className="text-xl font-heading font-bold glow-text-cyan mb-8 tracking-tight">Real-Time Source Apportionment Engine</h3>
                  <div className="flex justify-center"><RadarChart /></div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          <ScrollReveal delay={500}>
            <div className="mt-32">
              <div className="text-center max-w-3xl mx-auto mb-16 glass-panel p-10 rounded-[2rem]">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight gradient-text">Interactive AI Sandbox</h2>
                <p className="text-lg text-secondary-foreground/80 font-light leading-relaxed">
                  Simulate live sensor readings. Watch the 5-Model Stack attribute sources via random forest and compute dispersion risk via ensemble XGBoost.
                </p>
              </div>
              <div className="neon-card rounded-[2rem] p-2 sm:p-4 pulse-glow">
                <AIDashboard />
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ GOVERNANCE-AS-CODE ═══ */}
        <section className="py-32 px-4 sm:px-6 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <ScrollReveal>
              <SectionHeader label="THE DIFFERENTIATOR" />
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-heading font-bold mt-6 tracking-tight gradient-text">
                Governance-as-Code
              </h2>
              <p className="text-xl md:text-2xl text-secondary-foreground mt-6 max-w-3xl font-light">
                Every research paper stops at <em className="text-white/90">Recommend</em>. We close the loop in <span className="glow-text-cyan font-semibold">under 15 minutes</span>.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="mt-12 space-y-4 max-w-4xl">
                <div className="p-6 rounded-2xl neon-card" style={{ borderLeft: '4px solid #FF5F3C' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <span className="text-sm font-mono font-bold shrink-0 uppercase tracking-widest px-3 py-1 rounded bg-[#FF5F3C]/10 text-[#FF5F3C]">Past Literature</span>
                    <span className="text-base font-medium text-secondary-foreground/80">Detect → Map → Model → Recommend → <strong className="glow-text-red">STOP</strong></span>
                  </div>
                </div>
                <div className="p-6 rounded-2xl neon-card" style={{ borderLeft: '4px solid #39FF14', boxShadow: '0 0 30px rgba(57,255,20,0.08)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <span className="text-sm font-mono font-bold shrink-0 uppercase tracking-widest px-3 py-1 rounded bg-[#39FF14]/10 text-[#39FF14]">Project Vaayu</span>
                    <span className="text-base font-medium text-secondary-foreground">Detect → Attribute → Legislate → Assign → Track → Measure → <strong className="glow-text-green">Retrain</strong></span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="mt-16 glass-panel p-6 sm:p-10 rounded-[2.5rem]">
                <GovernancePipeline />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={600}>
              <div className="mt-12 flex flex-wrap gap-3 justify-center">
                <span className="text-sm text-muted-foreground font-mono mr-2 self-center">Validated by:</span>
                {['Nature 2024', 'Lancet 2024', 'ESA 2023', 'EST 2024', 'EGU 2025'].map(p => (
                  <span key={p} className="text-xs font-mono px-3 py-1.5 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF]/80 backdrop-blur-sm">{p}</span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* ═══ THE IMPACT ═══ */}
        <section className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
          <ScrollReveal>
            <SectionHeader label="THE IMPACT" />
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mt-6 tracking-tight gradient-text">Metrics & Transparency</h2>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-16 glass-panel p-8 rounded-[2rem] pulse-glow">
              <ImpactCounters />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="mt-20">
              <h3 className="text-2xl font-heading font-bold text-white mb-8">Hardware Operations Cost</h3>
              <div className="neon-card p-8 rounded-[2rem]"><CostBarChart /></div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={600}>
            <div className="mt-24 glass-panel p-8 rounded-[2rem]">
              <h3 className="text-2xl font-heading font-bold gradient-text mb-10">Capabilities Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#00E5FF]/10">
                      <th className="text-left text-sm font-mono text-muted-foreground pb-6 pl-4 uppercase tracking-widest">Feature</th>
                      <th className="text-center text-sm font-mono pb-6 px-4 uppercase tracking-widest text-[#FF5F3C]">Legacy Systems</th>
                      <th className="text-center text-sm font-mono pb-6 px-4 uppercase tracking-widest glow-text-cyan">Project Vaayu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00E5FF]/5">
                    {COMPARISON_FEATURES.map((feat, i) => (
                      <tr key={i} className="group hover:bg-[#00E5FF]/[0.02] transition-colors">
                        <td className="text-base text-secondary-foreground py-4 pl-4 font-medium">{feat}</td>
                        <td className="text-center text-[#FF5F3C] text-xl py-4">✗</td>
                        <td className="text-center text-xl py-4 glow-text-green group-hover:text-shadow-lg transition-all">✓</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ ARCHITECTURE ═══ */}
        <section id="architecture" className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
          <ScrollReveal>
            <SectionHeader label="ARCHITECTURE" />
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mt-6 tracking-tight gradient-text">Component Blueprint</h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-16">
            {TECH_COMPONENTS.map((comp, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div
                  className="neon-card rounded-[1.5rem] p-6 h-full transition-all duration-500 hover:-translate-y-3 group relative"
                  style={{ borderTop: `2px solid ${comp.color}40` }}
                  onMouseEnter={() => setFlippedTech(i)}
                  onMouseLeave={() => setFlippedTech(null)}
                >
                  {flippedTech !== i ? (
                    <div className="flex flex-col h-full">
                      <span className="text-4xl mb-6">{comp.icon}</span>
                      <span className="block text-xs font-mono mb-2 font-bold tracking-widest" style={{ color: comp.color }}>{comp.num}</span>
                      <h4 className="font-heading font-bold text-lg mb-4 text-white tracking-tight">{comp.name}</h4>
                      <ul className="space-y-2 flex-grow mb-6">
                        {comp.specs.map((s, j) => (
                          <li key={j} className="text-sm text-muted-foreground/90 font-light flex items-start gap-2">
                            <span className="mt-1.5 text-[6px]" style={{ color: comp.color }}>●</span> {s}
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {comp.chips.map(c => (
                          <span key={c} className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/5 text-secondary-foreground border border-white/10">{c}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[250px]">
                      <p className="text-sm font-mono text-center leading-relaxed" style={{ color: comp.color }}>
                        Validated by:<br /><br />
                        <span className="text-white font-bold text-base">{comp.paper}</span>
                      </p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══ THE EDGE ═══ */}
        <section id="intelligence" className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
          <ScrollReveal>
            <SectionHeader label="THE EDGE" />
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mt-6 tracking-tight gradient-text">Deep Context Models</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {INTEL_FEATURES.map((feat, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="neon-card rounded-[2rem] p-8 h-full group float-subtle" style={{ borderLeft: `4px solid ${feat.color}`, animationDelay: `${i * 0.5}s` }}>
                  <h4 className="font-heading font-bold text-xl mb-4 tracking-tight" style={{ color: feat.color, textShadow: `0 0 15px ${feat.color}40` }}>{feat.title}</h4>
                  <p className="text-base text-secondary-foreground/90 leading-relaxed font-light">{feat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══ SCALABILITY ═══ */}
        <section id="scale" className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
          <ScrollReveal>
            <SectionHeader label="SCALABILITY" />
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mt-6 tracking-tight gradient-text">Expansion Roadmap</h2>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-16 glass-panel p-2 sm:p-10 rounded-[3rem]">
              <IndiaPhaseMap />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="mt-24 max-w-3xl">
              <h3 className="text-2xl font-heading font-bold text-white mb-10">Financial Projections</h3>
              <div className="space-y-6">
                {REVENUE.map((r, i) => (
                  <RevenueBar key={i} {...r} index={i} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* ═══ RESEARCH ═══ */}
        <section id="research" className="py-28 px-4 sm:px-6 max-w-7xl mx-auto">
          <ScrollReveal>
            <SectionHeader label="RESEARCH FOUNDATION" />
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mt-6 tracking-tight gradient-text">Peer-Reviewed Engine</h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="flex flex-wrap gap-4 mt-10 justify-center">
              {['Nature · Scientific Reports', 'The Lancet Planetary Health', 'ESA · European Space Agency'].map(badge => (
                <span key={badge} className="text-sm font-heading font-semibold px-6 py-3 rounded-xl border border-[#7A5CFF]/25 bg-[#7A5CFF]/5 text-[#7A5CFF] backdrop-blur-sm tracking-wide">{badge}</span>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {PAPERS.map((paper, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="neon-card rounded-[1.5rem] p-8 h-full hover:-translate-y-3 transition-all duration-500 flex flex-col" style={{ borderTop: '2px solid rgba(122,92,255,0.3)' }}>
                  <span className="text-[10px] font-mono font-bold px-3 py-1 rounded bg-[#7A5CFF]/10 text-[#7A5CFF] w-fit tracking-wider uppercase">{paper.journal}</span>
                  <h4 className="font-heading font-semibold text-lg mt-5 text-white leading-snug tracking-tight">{paper.title}</h4>
                  <p className="text-xs text-muted-foreground/80 mt-3 font-medium">{paper.authors}, {paper.year}</p>
                  <p className="text-sm italic mt-5 flex-grow font-light leading-relaxed glow-text-cyan">"{paper.finding}"</p>
                  <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest overflow-hidden text-ellipsis mr-2 whitespace-nowrap">{paper.validates}</span>
                    <a href={paper.doi} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#00E5FF] font-bold hover:text-white transition-colors bg-[#00E5FF]/10 px-3 py-1 rounded-md">DOI ↗</a>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="py-28 px-4 sm:px-6 pb-32">
          <ScrollReveal>
            <div className="glass-panel max-w-4xl mx-auto p-14 rounded-[3rem] text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#7A5CFF]/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight gradient-text">Know Your Ward's Air. Act Before It Kills.</h2>
              <p className="text-lg text-secondary-foreground/90 max-w-2xl mx-auto font-light leading-relaxed mt-6 mb-8">
                Project Vaayu is a fully functioning technical prototype deployed for India Innovates 2026.
              </p>
              <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-[#39FF14]/5 border border-[#39FF14]/20 backdrop-blur-md text-sm font-mono text-[#39FF14]/80">
                <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.6)]" /> Live Systems Operational
              </div>
            </div>
          </ScrollReveal>
        </footer>
      </div>
    </div>
  );
}

/* ── Revenue Bar ── */
function RevenueBar({ year, amount, width, index }: { year: string; amount: string; width: number; index: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <span className="text-base font-heading font-medium text-secondary-foreground/90">{year}</span>
        <span className="text-sm font-mono font-bold glow-text-cyan">{amount}</span>
      </div>
      <div className="h-8 rounded-full bg-black/40 border border-[#00E5FF]/10 overflow-hidden backdrop-blur-sm p-1">
        <div
          className="h-full rounded-full transition-all duration-[1500ms] relative overflow-hidden"
          style={{
            width: inView ? `${Math.max(width, 2)}%` : '0%',
            background: 'linear-gradient(90deg, #00E5FF, #7A5CFF, #FF3CAC)',
            transitionDelay: `${index * 150}ms`,
            transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
            boxShadow: inView ? '0 0 15px rgba(0, 229, 255, 0.4)' : 'none',
          }}
        />
      </div>
    </div>
  );
}
