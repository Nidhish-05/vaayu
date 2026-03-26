export interface SensorData {
  ward_id: string;
  month: number;
  hour: number;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  fire_points_100km: number;
}

export interface MitigationData {
  severity_tier: number;
  tier_label: string;
  tier_color: string;
  health_advisories: string[];
  alert_message: string;
  ward_contacts_count: number;
  total_registry_size: number;
}

export interface MLInferenceResult {
  ward_id: string;
  input_pm25: number;
  forecast: {
    meta_learner_blended_pm25: number;
    dispersion_expected_pm25: number;
  };
  attribution: {
    primary_source: string;
    confidence_scores: Record<string, number>;
  };
  alerts: {
    is_hotspot: boolean;
    downstream_warning: boolean;
  };
  mitigation: MitigationData;
}

export interface AlertDispatchResult {
  status: string;
  tier: { tier: number; label: string; color: string };
  alert_message: string;
  health_advisories: string[];
  sms_results: Array<{
    to: string;
    recipient_name: string;
    message: string;
    status: string;
    timestamp: string;
    provider: string;
  }>;
  total_sent: number;
}

const API_URL = "http://localhost:8000";

export async function runMLInference(data: SensorData): Promise<MLInferenceResult> {
  try {
    const response = await fetch(`${API_URL}/infer/ward`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`ML Backend Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to connect to ML Backend:", error);
    throw error;
  }
}

export async function dispatchAlerts(ward_id: string, pm25: number, source: string): Promise<AlertDispatchResult> {
  const response = await fetch(`${API_URL}/alerts/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ward_id, pm25, source }),
  });

  if (!response.ok) {
    throw new Error(`Alert dispatch failed: ${response.status}`);
  }

  return await response.json();
}

