import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { default as RechartsPieChart } from 'recharts/lib/chart/PieChart';
import { default as RechartsPie } from 'recharts/lib/polar/Pie';
import { Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BrainCircuit, Wind, AlertTriangle, CheckCircle2, Shield, Phone, HeartPulse, Send } from 'lucide-react';
import { runMLInference, dispatchAlerts, SensorData, MLInferenceResult, AlertDispatchResult } from '@/lib/ml_api';
import { useToast } from "@/components/ui/use-toast";

// Recharts imports need to be direct or destructured properly to avoid vite bugs
import { PieChart, Pie } from 'recharts';

export function AIDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MLInferenceResult | null>(null);
  const [alertDispatching, setAlertDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<AlertDispatchResult | null>(null);

  // Default sensor simulation data (typical Delhi winter day)
  const [sensors, setSensors] = useState<SensorData>({
    ward_id: "W001",
    month: 11,
    hour: 8,
    temperature: 15.5,
    humidity: 75.0,
    pressure: 1015.0,
    wind_speed: 1.2,
    wind_direction: 270,
    pm25: 185.0,
    pm10: 290.0,
    no2: 85.0,
    so2: 30.0,
    co: 1.5,
    fire_points_100km: 12
  });

  const updateSensor = (key: keyof SensorData, value: number) => {
    setSensors(prev => ({ ...prev, [key]: value }));
  };

  const handleRunInference = useCallback(async () => {
    setLoading(true);
    try {
      const res = await runMLInference(sensors);
      setResult(res);
    } catch (err) {
      toast({
        title: "Backend Connection Failed",
        description: "Is the FastAPI server running on port 8000?",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [sensors, toast]);

  // Auto-run inference when sensors change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRunInference();
    }, 400); // 400ms debounce for smooth UX
    
    return () => clearTimeout(timer);
  }, [handleRunInference]);

  // Format Recharts data
  const pieData = result ? Object.entries(result.attribution.confidence_scores).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value: value * 100
  })).sort((a,b) => b.value - a.value) : [];

  const COLORS = ['#FF5F3C', '#7A5CFF', '#00E5FF', '#FF3CAC'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
      {/* LEFT COLUMN: Sensor Simulator */}
      <div className="lg:col-span-4 space-y-6">
        <div className="neon-card rounded-[2rem] p-8 pulse-glow" style={{ borderTop: '4px solid #00E5FF' }}>
          <div className="mb-8">
            <h3 className="flex items-center gap-2 font-heading font-bold text-xl text-white tracking-tight">
              <BrainCircuit className="h-5 w-5 text-[#00E5FF]" />
              Live Sensor Simulator
            </h3>
            <p className="text-sm text-secondary-foreground/70 mt-2 font-light">Adjust variables to see how the AI predicts source & dispersion.</p>
          </div>
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-3">
                <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">PM2.5 (µg/m³)</Label>
                <span className="text-sm font-bold glow-text-red">{sensors.pm25}</span>
              </div>
              <Slider 
                max={500} step={1} value={[sensors.pm25]} 
                onValueChange={(v) => updateSensor('pm25', v[0])} 
              />
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">NO₂ (Vehicular)</Label>
                <span className="text-sm font-bold text-white">{sensors.no2}</span>
              </div>
              <Slider 
                max={200} step={1} value={[sensors.no2]} 
                onValueChange={(v) => updateSensor('no2', v[0])} 
              />
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">SO₂ (Industrial)</Label>
                <span className="text-sm font-bold text-white">{sensors.so2}</span>
              </div>
              <Slider 
                max={100} step={1} value={[sensors.so2]} 
                onValueChange={(v) => updateSensor('so2', v[0])} 
              />
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Wind Speed (m/s)</Label>
                <span className="text-sm font-bold glow-text-cyan">{sensors.wind_speed}</span>
              </div>
              <Slider 
                max={15} step={0.1} value={[sensors.wind_speed]} 
                onValueChange={(v) => updateSensor('wind_speed', v[0])} 
              />
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Hour of Day</Label>
                <span className="text-sm font-bold text-white">{sensors.hour}:00</span>
              </div>
              <Slider 
                max={23} step={1} value={[sensors.hour]} 
                onValueChange={(v) => updateSensor('hour', v[0])} 
              />
            </div>
          </div>

          <button 
            className="btn-neon w-full py-4 mt-10 rounded-xl font-heading font-bold text-sm tracking-widest uppercase transition-all"
            onClick={handleRunInference}
            disabled={loading}
          >
            {loading ? "Processing Meta-Stack..." : "Run AI Inference"}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Results Dashboard */}
      <div className="lg:col-span-8 space-y-6">
        {!result ? (
          <div className="h-full min-h-[500px] flex items-center justify-center border-2 border-dashed rounded-[2.5rem] border-white/5 bg-white/[0.02] backdrop-blur-md">
            <div className="text-center">
              <BrainCircuit className="h-16 w-16 mx-auto mb-6 text-white/10 animate-pulse" />
              <p className="text-white/40 font-heading font-semibold text-lg">Awaiting Sensor Intelligence...</p>
              <p className="text-muted-foreground/40 text-sm mt-2 font-mono">LINK TO REAR-GUARD DATA NODES ACTIVE</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Source Attribution Box */}
            <div className="neon-card rounded-[2rem] p-8">
              <div className="mb-6">
                <h3 className="font-heading font-bold text-lg text-white tracking-tight">Model 2: Source Attribution</h3>
                <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mt-1">Chemical Fingerprinting</p>
              </div>
              
              <div className="text-center mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono">Primary Polluter</span>
                <h3 className="text-2xl font-bold gradient-text mt-1">
                  {result.attribution.primary_source.replace('_', ' ')}
                </h3>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'rgba(8, 8, 16, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Confidence']} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dispersion Box & Alerts */}
            <div className="space-y-6">
              
              <div className="neon-card rounded-[2rem] p-8">
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 font-heading font-bold text-lg text-white tracking-tight">
                    <Wind className="h-5 w-5 text-[#00E5FF]" />
                    Model 3: Dispersion Impact
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mt-1">Meteorological Forecasting</p>
                </div>
                
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[1.5rem] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1">Actual PM2.5</p>
                    <p className="text-4xl font-bold text-white">{result.input_pm25}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1">Wind-Expected</p>
                    <p className="text-4xl font-bold glow-text-cyan">{result.forecast.dispersion_expected_pm25}</p>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-2">Meta-Stack Blended Forecast</p>
                  <p className="text-2xl font-bold glow-text-purple">{result.forecast.meta_learner_blended_pm25} µg/m³</p>
                </div>
              </div>

              {/* Dynamic Alerts */}
              {result.alerts.is_hotspot ? (
                <div className="p-6 rounded-[1.5rem] border border-[#FF5F3C]/30 bg-[#FF5F3C]/5 backdrop-blur-md animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-[#FF5F3C]" />
                    <h4 className="text-[#FF5F3C] font-bold uppercase tracking-widest text-sm">Level 4 Hotspot Detected</h4>
                  </div>
                  <p className="text-sm text-[#FF5F3C]/80 leading-relaxed font-light">
                    Critically high pollution levels. AI Attribution targets <strong className="text-[#FF5F3C]">{result.attribution.primary_source.replace('_', ' ')}</strong> as the primary cause. Deploying mitigation fleets to {sensors.ward_id}.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-[1.5rem] border border-[#39FF14]/20 bg-[#39FF14]/5 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-[#39FF14]" />
                    <h4 className="text-[#39FF14] font-bold uppercase tracking-widest text-sm">Ward Status Normal</h4>
                  </div>
                  <p className="text-sm text-[#39FF14]/70 leading-relaxed font-light">
                    Pollution concentrations are currently within safety limits for this sector.
                  </p>
                </div>
              )}

              {result.alerts.downstream_warning && (
                <div className="p-6 rounded-[1.5rem] border border-[#7A5CFF]/30 bg-[#7A5CFF]/5 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-[#7A5CFF]" />
                    <h4 className="text-[#7A5CFF] font-bold uppercase tracking-widest text-sm">Downstream Warning</h4>
                  </div>
                  <p className="text-sm text-[#7A5CFF]/80 leading-relaxed font-light">
                    High wind speeds detected alongside elevated PM2.5. Neighboring sectors in the drift path are at extreme risk.
                  </p>
                </div>
              )}

            </div>

            {/* ═══ MITIGATION & HEALTH ADVISORY (Full Width) ═══ */}
            <div className="md:col-span-2 space-y-6">
              {/* Severity Tier Banner */}
              <div className="neon-card rounded-[2rem] p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Shield className="h-6 w-6" style={{ color: result.mitigation?.tier_color || '#fff' }} />
                  <h3 className="font-heading font-bold text-xl text-white tracking-tight">Automated Mitigation Engine</h3>
                  <span 
                    className="ml-auto text-sm font-mono font-bold px-4 py-2 rounded-full uppercase tracking-widest"
                    style={{ 
                      backgroundColor: `${result.mitigation?.tier_color}15`,
                      color: result.mitigation?.tier_color,
                      border: `1px solid ${result.mitigation?.tier_color}40`,
                      boxShadow: `0 0 15px ${result.mitigation?.tier_color}20`
                    }}
                  >
                    Tier {result.mitigation?.severity_tier} — {result.mitigation?.tier_label}
                  </span>
                </div>

                {/* Health Advisories */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <HeartPulse className="h-5 w-5 text-[#FF3CAC]" />
                    <h4 className="text-base font-heading font-bold text-white uppercase tracking-widest">Health Advisories</h4>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(122,92,255,0.3) transparent' }}>
                    {result.mitigation?.health_advisories?.map((advisory, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 mt-0.5 rounded bg-white/5 text-muted-foreground shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                        <p className="text-sm text-secondary-foreground/90 leading-relaxed">{advisory}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SMS Alert Preview + Dispatch */}
                <div className="border-t border-white/5 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="h-5 w-5 text-[#00E5FF]" />
                    <h4 className="text-base font-heading font-bold text-white uppercase tracking-widest">SMS Alert Preview</h4>
                  </div>
                  <div className="p-5 rounded-xl bg-black/30 border border-white/5 font-mono text-sm text-[#00E5FF]/90 whitespace-pre-line leading-relaxed mb-6">
                    {result.mitigation?.alert_message}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <button
                      className="btn-neon px-8 py-4 rounded-xl font-heading font-bold text-sm tracking-widest uppercase flex items-center gap-2"
                      disabled={alertDispatching}
                      onClick={async () => {
                        setAlertDispatching(true);
                        try {
                          const res = await dispatchAlerts(sensors.ward_id, sensors.pm25, result.attribution.primary_source);
                          setDispatchResult(res);
                          toast({
                            title: `📱 Alerts Dispatched!`,
                            description: `${res.total_sent} SMS alerts sent to team members.`,
                          });
                        } catch (err) {
                          toast({ title: "Dispatch Failed", description: "Backend unreachable.", variant: "destructive" });
                        } finally {
                          setAlertDispatching(false);
                        }
                      }}
                    >
                      <Send className="h-4 w-4" />
                      {alertDispatching ? "Dispatching..." : "Dispatch Emergency Alert"}
                    </button>

                    <p className="text-xs font-mono text-muted-foreground">
                      Registry: <strong className="text-white">{result.mitigation?.total_registry_size || 6}</strong> contacts
                      {dispatchResult && (
                        <span className="ml-3 text-[#39FF14]">✓ {dispatchResult.total_sent} sent at {new Date(dispatchResult.sms_results?.[0]?.timestamp || '').toLocaleTimeString()}</span>
                      )}
                    </p>
                  </div>

                  {/* Dispatch Result Log */}
                  {dispatchResult && (
                    <div className="mt-6 space-y-2">
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Dispatch Log</p>
                      {dispatchResult.sms_results.map((sms, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#39FF14]/5 border border-[#39FF14]/10">
                          <span className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.5)]" />
                          <span className="text-sm text-white font-medium">{sms.recipient_name}</span>
                          <span className="text-xs font-mono text-muted-foreground">{sms.to}</span>
                          <span className="ml-auto text-xs font-mono text-[#39FF14] font-bold">{sms.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
