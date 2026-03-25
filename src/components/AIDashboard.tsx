import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { default as RechartsPieChart } from 'recharts/lib/chart/PieChart';
import { default as RechartsPie } from 'recharts/lib/polar/Pie';
import { Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BrainCircuit, Wind, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { runMLInference, SensorData, MLInferenceResult } from '@/lib/ml_api';
import { useToast } from "@/components/ui/use-toast";

// Recharts imports need to be direct or destructured properly to avoid vite bugs
import { PieChart, Pie } from 'recharts';

export function AIDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MLInferenceResult | null>(null);

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

  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
      {/* LEFT COLUMN: Sensor Simulator */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-blue-500" />
              Live Sensor Simulator
            </CardTitle>
            <CardDescription>Adjust variables to see how the AI predicts source & dispersion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>PM2.5 (µg/m³)</Label>
                  <span className="text-sm font-bold text-red-500">{sensors.pm25}</span>
                </div>
                <Slider 
                  max={500} step={1} value={[sensors.pm25]} 
                  onValueChange={(v) => updateSensor('pm25', v[0])} 
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>NO₂ (Vehicular Marker)</Label>
                  <span className="text-sm font-bold">{sensors.no2}</span>
                </div>
                <Slider 
                  max={200} step={1} value={[sensors.no2]} 
                  onValueChange={(v) => updateSensor('no2', v[0])} 
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>SO₂ (Industrial Marker)</Label>
                  <span className="text-sm font-bold">{sensors.so2}</span>
                </div>
                <Slider 
                  max={100} step={1} value={[sensors.so2]} 
                  onValueChange={(v) => updateSensor('so2', v[0])} 
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>Wind Speed (m/s)</Label>
                  <span className="text-sm font-bold text-blue-500">{sensors.wind_speed}</span>
                </div>
                <Slider 
                  max={15} step={0.1} value={[sensors.wind_speed]} 
                  onValueChange={(v) => updateSensor('wind_speed', v[0])} 
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>Hour of Day</Label>
                  <span className="text-sm font-bold">{sensors.hour}:00</span>
                </div>
                <Slider 
                  max={23} step={1} value={[sensors.hour]} 
                  onValueChange={(v) => updateSensor('hour', v[0])} 
                />
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold"
              onClick={handleRunInference}
              disabled={loading}
            >
              {loading ? "Processing via 5-Model Stack..." : "Run AI Inference"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Results Dashboard */}
      <div className="lg:col-span-8 space-y-6">
        {!result ? (
          <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl border-gray-200 bg-gray-50/50">
            <div className="text-center text-gray-500">
              <BrainCircuit className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Awaiting Sensor Data...</p>
              <p className="text-sm">Click 'Run AI Inference' to populate the dashboard.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Source Attribution Box */}
            <Card>
              <CardHeader>
                <CardTitle>Model 2: Source Attribution</CardTitle>
                <CardDescription>Random Forest Chemical Fingerprinting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-2">
                  <span className="text-sm text-gray-500 uppercase tracking-wider">Primary Polluter</span>
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">
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
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Dispersion Box & Alerts */}
            <div className="space-y-6">
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5" />
                    Model 3: Dispersion Impact
                  </CardTitle>
                  <CardDescription>XGBoost Meteorological Forecasting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current PM2.5</p>
                      <p className="text-3xl font-bold text-gray-900">{result.input_pm25}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500">Wind-Expected PM2.5</p>
                      <p className="text-3xl font-bold text-blue-600">{result.forecast.dispersion_expected_pm25}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">Model 5 Meta-Learner Blended Forecast</p>
                    <p className="text-xl font-bold text-purple-600">{result.forecast.meta_learner_blended_pm25} µg/m³</p>
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Alerts */}
              {result.alerts.is_hotspot ? (
                <Alert variant="destructive" className="border-red-500 bg-red-50 text-red-900">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Level 4 Hotspot Detected!</AlertTitle>
                  <AlertDescription>
                    Critically high pollution levels. AI Attribution targets <strong>{result.attribution.primary_source.replace('_', ' ')}</strong> as the primary cause. Deploying mitigation fleets to {sensors.ward_id}.
                  </AlertDescription>
                </Alert>
              ) : (
                 <Alert className="border-green-500 bg-green-50 text-green-900">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Ward Status Normal</AlertTitle>
                  <AlertDescription>
                    AQI is below threshold limits.
                  </AlertDescription>
                </Alert>
              )}

              {result.alerts.downstream_warning && (
                <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle>Downstream Warning</AlertTitle>
                  <AlertDescription>
                    High wind speeds detected alongside elevated PM2.5. Neighboring wards in the path are at risk of smog drift.
                  </AlertDescription>
                </Alert>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
