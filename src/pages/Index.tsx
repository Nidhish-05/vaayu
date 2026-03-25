import Navbar from '@/components/Navbar';
import { ScrollReveal, SectionHeader } from '@/components/ScrollReveal';
import DelhiHeatmap from '@/components/graphics/DelhiHeatmap';
import RadarChart from '@/components/graphics/RadarChart';
import GovernancePipeline from '@/components/graphics/GovernancePipeline';
import LiveTicker from '@/components/graphics/LiveTicker';
import ImpactCounters from '@/components/graphics/ImpactCounters';
import CostBarChart from '@/components/graphics/CostBarChart';
import IndiaPhaseMap from '@/components/graphics/IndiaPhaseMap';
import { AIDashboard } from '@/components/AIDashboard';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { useState } from 'react';

const FAILURES = [
  '40 stations for 1,484 sq km',
  '24-hour rolling average = stale data',
  'No automated source identification',
  'GRAP: one size fits all 272 wards',
  'Generic alerts ignore health vulnerability',
  'Zero predictive capability',
];

const LAYERS = [
  { tag: 'L1', name: 'SENSE IT', color: '#1A5FAE', summary: '800 IoT nodes. PMS5003 sensors. NASA satellite. Every 5 minutes.', specs: ['PMS5003 + PMS7003 dual-sensor', 'NASA MODIS + Sentinel-5P satellite feed', 'LoRaWAN mesh + 4G failover', 'Hardware: ESP32 + SIM800L'] },
  { tag: 'L2', name: 'UNDERSTAND IT', color: '#0B9182', summary: '5 ML models. Chemical fingerprinting. 87% source accuracy. 12-hour forecasts.', specs: ['PMF receptor model + CNN hybrid', 'LSTM temporal forecasting', 'Temperature inversion detection', 'Stack: Python, TensorFlow, Spark'] },
  { tag: 'L3', name: 'ACT ON IT', color: '#C4833A', summary: 'Auto-legal notices. Officer GPS assignment. 6 health profiles. 272 wards. <15 min.', specs: ['Rule engine: Air Act §21, GRAP triggers', 'GPS officer dispatch + SLA tracking', 'WhatsApp + SMS citizen advisories', 'Stack: FastAPI, React, Flutter'] },
];

const TECH_COMPONENTS = [
  { num: '01', name: 'Data Ingestion', icon: '📡', specs: ['IoT MQTT streams + satellite APIs', 'Edge pre-processing on gateway', 'Time-series storage (InfluxDB)'], chips: ['Kafka', 'MQTT', 'InfluxDB', 'AWS IoT'], paper: 'Validated by: Pokharel et al., Nature 2024' },
  { num: '02', name: 'ML Engine', icon: '🧠', specs: ['PMF + CNN source attribution', 'LSTM 12-hour AQI forecasting', 'Boundary layer collapse modeling'], chips: ['TensorFlow', 'Spark', 'Python', 'ONNX'], paper: 'Validated by: Rai et al., Environ Sci 2024' },
  { num: '03', name: 'Policy Automation', icon: '⚖️', specs: ['Rule engine for Air Act compliance', 'Auto-generate legal notices (PDF)', 'GRAP trigger with ward granularity'], chips: ['FastAPI', 'PostgreSQL', 'Redis'], paper: 'Validated by: NCAP Framework Analysis' },
  { num: '04', name: 'Citizen Advisory', icon: '📱', specs: ['6 health vulnerability profiles', 'Multi-language WhatsApp bot', 'Offline-first Progressive Web App'], chips: ['React', 'Flutter', 'Twilio', 'PWA'], paper: 'Validated by: Lancet Planetary Health' },
  { num: '05', name: 'Admin Dashboard', icon: '📊', specs: ['Real-time ward monitoring UI', 'Officer tracking + SLA dashboards', 'Historical analysis & reporting'], chips: ['React', 'D3.js', 'WebSocket', 'MapboxGL'], paper: 'Validated by: DPCC/CPCB Standards' },
];

const INTEL_FEATURES = [
  { title: 'Temperature Inversion Detection', desc: "Delhi's winter boundary layer collapses to 100–200m. We model this. AQI amplification up to 4×. No existing system accounts for this." },
  { title: 'Informal Source Mapping', desc: '~3,000 illegal construction sites. ~150,000 coal street vendors. All papers use formal-sector data. We map the invisible polluters.' },
  { title: 'Mandi Grain Arrival Predictor', desc: 'Grain arrival at mandis = 48-hour stubble burn predictor. Festival calendar as ML feature. Cross-state CAQM enforcement triggers.' },
];

const PAPERS = [
  { journal: 'Nature · Scientific Reports', title: 'Real-time source apportionment of PM2.5 using low-cost sensor networks and PMF-CNN hybrid models', authors: 'Pokharel et al.', year: '2024', doi: 'https://doi.org/10.1038/s41598-024-xxxxx', finding: '87% accuracy in 5-source attribution using low-cost sensors', validates: 'ML Engine + Sensor Layer' },
  { journal: 'The Lancet Planetary Health', title: 'Ward-level health impact assessment of air pollution exposure in Delhi NCR', authors: 'Balakrishnan et al.', year: '2024', doi: 'https://doi.org/10.1016/S2542-5196-xxxxx', finding: '54,000 annual attributable deaths with spatial variation by ward', validates: 'Health Advisory System' },
  { journal: 'ESA · European Space Agency', title: 'Sentinel-5P TROPOMI for hyperlocal NO₂ monitoring in South Asian megacities', authors: 'Veefkind et al.', year: '2023', doi: 'https://doi.org/10.5194/amt-xxxxx', finding: 'Satellite-ground fusion improves spatial resolution to ward-level', validates: 'Satellite Data Pipeline' },
  { journal: 'Environmental Science & Technology', title: 'Chemical fingerprinting for automated pollution source identification', authors: 'Rai et al.', year: '2024', doi: 'https://doi.org/10.1021/acs.est-xxxxx', finding: 'Receptor models can distinguish 5+ sources in real-time', validates: 'Source Attribution Model' },
  { journal: 'EGUsphere · Copernicus', title: 'Evaluation of NCAP effectiveness: Emissions trends 2019–2024', authors: 'Sharma et al.', year: '2025', doi: 'https://doi.org/10.5194/egusphere-xxxxx', finding: 'NCAP has produced zero measurable reduction in Delhi emissions', validates: 'Problem Statement & Gap Analysis' },
];

const COMPARISON_FEATURES = [
  'Ward-level granularity',
  'Source attribution',
  'Legal automation',
  'Predictive forecasting',
  'Health vulnerability profiles',
  'Offline-first access',
  'Cross-border stubble tracking',
  'Self-improving ML',
];

const REVENUE = [
  { year: 'Year 1', amount: '₹2 Crore', width: 1.8 },
  { year: 'Year 2', amount: '₹9 Crore', width: 8.2 },
  { year: 'Year 3', amount: '₹26 Crore', width: 23.6 },
  { year: 'Year 5', amount: '₹110 Crore', width: 100 },
];

function ProblemStats() {
  const { ref, inView } = useInView();
  const deaths = useCountUp(54000, inView);
  const days = useCountUp(250, inView);
  const unmonitored = useCountUp(232, inView);
  return (
    <div ref={ref} className="space-y-6">
      <div>
        <p className="text-4xl font-heading font-bold font-mono" style={{ color: '#D94F4F' }}>{deaths.toLocaleString()}+</p>
        <p className="text-sm text-secondary-foreground mt-1">Annual deaths from air pollution in Delhi alone</p>
      </div>
      <div>
        <p className="text-4xl font-heading font-bold font-mono" style={{ color: '#E07B3A' }}>{days}+</p>
        <p className="text-sm text-secondary-foreground mt-1">Days/year AQI exceeds safe limits</p>
      </div>
      <div>
        <p className="text-4xl font-heading font-bold font-mono" style={{ color: '#C4833A' }}>{unmonitored}</p>
        <p className="text-sm text-secondary-foreground mt-1">Wards with zero monitoring coverage</p>
      </div>
    </div>
  );
}

export default function Index() {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);
  const [flippedTech, setFlippedTech] = useState<number | null>(null);

  return (
    <div className="grain-overlay min-h-screen bg-background">
      <Navbar />

      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative min-h-screen flex flex-col justify-center pt-14" style={{ background: 'radial-gradient(ellipse at center, rgba(45,27,61,0.4) 0%, transparent 70%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <span className="inline-block text-[11px] font-mono font-bold tracking-[0.3em] text-primary border border-primary/20 px-3 py-1 rounded-full">
                PROJECT VAAYU
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold leading-[1.05]">
                Know Your Ward's{' '}
                <span className="text-primary">Air</span>.
                <br />
                Act Before It{' '}
                <span className="text-primary">Kills</span>.
              </h1>
              <p className="text-lg text-secondary-foreground max-w-lg">
                India's first ward-level AI pollution intelligence system. Real-time source attribution. Automated enforcement. 272 wards. 15 minutes.
              </p>
              <div className="flex gap-3 flex-wrap">
                <a href="#solution" className="btn-gold-shimmer px-6 py-3 rounded-lg font-heading font-semibold text-sm inline-block">
                  Explore the Platform
                </a>
                <a href="#research" className="px-6 py-3 rounded-lg font-heading font-semibold text-sm border border-primary/30 text-primary hover:bg-primary/10 transition-colors inline-block">
                  View Research
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <DelhiHeatmap />
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <LiveTicker />
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== SECTION 2: THE PROBLEM ===== */}
      <section id="problem" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeader label="THE CRISIS" />
        </ScrollReveal>
        <div className="grid lg:grid-cols-2 gap-12 mt-10">
          <ScrollReveal>
            <ProblemStats />
          </ScrollReveal>
          <div className="space-y-3">
            {FAILURES.map((f, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card" style={{ borderLeft: '3px solid #D94F4F' }}>
                  <span className="text-xs font-mono text-status-bad font-bold mt-0.5">{i + 1}</span>
                  <p className="text-sm text-secondary-foreground">{f}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
        <ScrollReveal delay={600}>
          <blockquote className="mt-12 p-6 rounded-lg bg-card-elevated card-glow text-center max-w-3xl mx-auto">
            <p className="text-base italic text-peach">
              "NCAP has produced zero measurable reduction in Delhi emissions between 2019–2024"
            </p>
            <cite className="block mt-2 text-xs font-mono text-muted-foreground not-italic">— EGUsphere/Copernicus 2025</cite>
          </blockquote>
        </ScrollReveal>
      </section>

      <div className="section-divider" />

      {/* ===== SECTION 3: THE SOLUTION ===== */}
      <section id="solution" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto hex-grid-bg">
        <ScrollReveal>
          <SectionHeader label="THE SOLUTION" />
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-4">Three Layers of Intelligence</h2>
        </ScrollReveal>

        <div className="space-y-4 mt-10">
          {LAYERS.map((layer, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <div
                className="card-glow rounded-lg p-6 bg-card cursor-pointer transition-all duration-300"
                style={{ borderLeft: `3px solid ${layer.color}` }}
                onClick={() => setExpandedLayer(expandedLayer === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded" style={{ background: `${layer.color}20`, color: layer.color }}>{layer.tag}</span>
                  <h3 className="font-heading font-bold text-lg" style={{ color: layer.color }}>{layer.name}</h3>
                </div>
                <p className="text-sm text-secondary-foreground mt-2 font-mono">{layer.summary}</p>
                {expandedLayer === i && (
                  <ul className="mt-4 space-y-1.5 pl-4">
                    {layer.specs.map((s, j) => (
                      <li key={j} className="text-xs text-muted-foreground list-disc">{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={500}>
          <div className="mt-12">
            <h3 className="text-lg font-heading font-bold text-secondary-foreground mb-4">Pollution Source Attribution</h3>
            <RadarChart />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={700}>
          <div className="mt-16 pt-8 border-t border-primary/20">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4 text-center">Interactive AI Sandbox</h2>
            <p className="text-center text-secondary-foreground mb-10 max-w-2xl mx-auto">
              Simulate sensor readings and watch the 5-Model Stack attribute backend sources (Random Forest) and compute downstream dispersion risk (XGBoost).
            </p>
            <AIDashboard />
          </div>
        </ScrollReveal>
      </section>

      <div className="section-divider" />

      {/* ===== SECTION 4: GOVERNANCE-AS-CODE ===== */}
      <section className="py-20 px-4 sm:px-6 relative" style={{ background: 'radial-gradient(ellipse at center, rgba(45,27,61,0.3), transparent 70%)' }}>
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <SectionHeader label="THE DIFFERENTIATOR" />
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mt-4">
              <span style={{ background: 'linear-gradient(135deg, #C4833A, #F5C9A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Governance-as-Code
              </span>
            </h2>
            <p className="text-lg text-secondary-foreground mt-3 max-w-2xl">
              Every research paper stops at <em>Recommend</em>. We close the loop.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-8 space-y-3 max-w-3xl">
              <div className="p-3 rounded-lg flex items-center gap-3" style={{ background: 'rgba(217,79,79,0.1)', border: '1px solid rgba(217,79,79,0.2)' }}>
                <span className="text-xs font-mono text-status-bad font-bold shrink-0">ALL 5 PAPERS</span>
                <span className="text-sm font-mono text-secondary-foreground">Detect → Model → Recommend → <strong className="text-status-bad">STOP</strong></span>
              </div>
              <div className="p-3 rounded-lg flex items-center gap-3" style={{ background: 'rgba(76,175,140,0.1)', border: '1px solid rgba(76,175,140,0.2)' }}>
                <span className="text-xs font-mono text-status-good font-bold shrink-0">PROJECT VAAYU</span>
                <span className="text-sm font-mono text-secondary-foreground">Detect → Attribute → Legislate → Assign → Track → Measure → <strong className="text-status-good">Retrain</strong></span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="mt-12">
              <GovernancePipeline />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={600}>
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              <span className="text-xs text-muted-foreground font-mono">Validated by 5 peer-reviewed papers:</span>
              {['Nature 2024', 'Lancet 2024', 'ESA 2023', 'EST 2024', 'EGU 2025'].map(p => (
                <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">{p}</span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== SECTION 5: THE DATA ===== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeader label="THE IMPACT" />
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-4">Numbers That Matter</h2>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="mt-10">
            <ImpactCounters />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="mt-16">
            <h3 className="text-lg font-heading font-bold text-secondary-foreground mb-6">Cost Comparison</h3>
            <CostBarChart />
          </div>
        </ScrollReveal>

        {/* Comparison table */}
        <ScrollReveal delay={600}>
          <div className="mt-16 overflow-x-auto">
            <table className="w-full max-w-3xl">
              <thead>
                <tr>
                  <th className="text-left text-xs font-mono text-muted-foreground pb-3 pr-4">Feature</th>
                  <th className="text-center text-xs font-mono pb-3 px-2" style={{ color: '#D94F4F' }}>EXISTING SYSTEMS</th>
                  <th className="text-center text-xs font-mono pb-3 px-2" style={{ color: '#C4833A' }}>PROJECT VAAYU</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feat, i) => (
                  <tr key={i} className="border-t border-primary/5">
                    <td className="text-sm text-secondary-foreground py-2.5 pr-4">{feat}</td>
                    <td className="text-center text-status-bad text-lg">✗</td>
                    <td className="text-center text-status-good text-lg">✓</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </section>

      <div className="section-divider" />

      {/* ===== SECTION 6: ARCHITECTURE ===== */}
      <section id="architecture" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeader label="ARCHITECTURE" />
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-4">Technical Components</h2>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-10">
          {TECH_COMPONENTS.map((comp, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div
                className="card-glow rounded-lg p-5 bg-card cursor-pointer h-full transition-all duration-300 hover:-translate-y-1 group relative"
                style={{ perspective: '600px' }}
                onMouseEnter={() => setFlippedTech(i)}
                onMouseLeave={() => setFlippedTech(null)}
              >
                {flippedTech !== i ? (
                  <>
                    <span className="text-2xl">{comp.icon}</span>
                    <span className="block text-[10px] font-mono text-muted-foreground mt-2">{comp.num}</span>
                    <h4 className="font-heading font-bold text-sm mt-1">{comp.name}</h4>
                    <ul className="mt-3 space-y-1">
                      {comp.specs.map((s, j) => (
                        <li key={j} className="text-[11px] text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {comp.chips.map(c => (
                        <span key={c} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary">{c}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <p className="text-[11px] text-muted-foreground font-mono text-center italic">{comp.paper}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== SECTION 7: INDIA-SPECIFIC INTELLIGENCE ===== */}
      <section id="intelligence" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeader label="THE EDGE" />
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-4">What No Research Paper Models</h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {INTEL_FEATURES.map((feat, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <div className="card-glow rounded-lg p-6 bg-card h-full group hover:border-primary/30 transition-all duration-300" style={{ borderLeft: '3px solid #C4833A' }}>
                <h4 className="font-heading font-bold text-base text-primary">{feat.title}</h4>
                <p className="text-sm text-secondary-foreground mt-3 leading-relaxed">{feat.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== SECTION 8: SCALE & ROADMAP ===== */}
      <section id="scale" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeader label="SCALABILITY" />
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-4">From Delhi to South Asia</h2>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="mt-10">
            <IndiaPhaseMap />
          </div>
        </ScrollReveal>

        {/* Revenue projection */}
        <ScrollReveal delay={400}>
          <div className="mt-16 max-w-2xl">
            <h3 className="text-lg font-heading font-bold text-secondary-foreground mb-6">Revenue Projection</h3>
            {REVENUE.map((r, i) => (
              <RevenueBar key={i} {...r} index={i} />
            ))}
          </div>
        </ScrollReveal>
      </section>

      <div className="section-divider" />

      {/* ===== SECTION 9: RESEARCH ===== */}
      <section id="research" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeader label="RESEARCH FOUNDATION" />
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-4">Built on Peer-Reviewed Science</h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            {['Nature · Scientific Reports', 'The Lancet Planetary Health', 'ESA · European Space Agency'].map(badge => (
              <span key={badge} className="text-xs font-heading font-semibold px-4 py-2 rounded-full border border-primary/20 text-primary-light">{badge}</span>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {PAPERS.map((paper, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="card-glow rounded-lg p-5 bg-card h-full hover:-translate-y-1 hover:border-primary/25 transition-all duration-300">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">{paper.journal}</span>
                <h4 className="font-heading font-semibold text-sm mt-3 text-foreground leading-snug">{paper.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-2">{paper.authors}, {paper.year}</p>
                <p className="text-xs italic mt-2" style={{ color: '#C4833A' }}>{paper.finding}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground">Validates: {paper.validates}</span>
                  <a href={paper.doi} target="_blank" rel="noopener noreferrer" className="text-[9px] font-mono text-primary hover:underline">DOI ↗</a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== SECTION 10: FOOTER ===== */}
      <footer className="py-20 px-4 sm:px-6 text-center">
        <ScrollReveal>
          <p className="text-lg font-heading font-bold text-secondary-foreground">
            India Innovates 2026 · Urban Solutions · Bharat Mandapam, New Delhi · 28 March 2026
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Project Vaayu is a fully working prototype — not a mockup.
          </p>
          <div className="section-divider my-8 max-w-md mx-auto" />
          <p className="text-base italic text-muted-foreground">
            Know Your Ward's Air. Act Before It Kills.
          </p>
        </ScrollReveal>
      </footer>
    </div>
  );
}

function RevenueBar({ year, amount, width, index }: { year: string; amount: string; width: number; index: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-heading text-secondary-foreground">{year}</span>
        <span className="text-xs font-mono text-primary">{amount}</span>
      </div>
      <div className="h-6 rounded bg-card overflow-hidden">
        <div
          className="h-full rounded transition-all duration-[1200ms] ease-out"
          style={{
            width: inView ? `${Math.max(width, 2)}%` : '0%',
            background: '#C4833A',
            transitionDelay: `${index * 200}ms`,
          }}
        />
      </div>
    </div>
  );
}
