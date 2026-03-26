from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import joblib
import os
import pandas as pd
import uvicorn
import requests

app = FastAPI(title="Project Vaayu ML Inference Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
RF_MODEL_PATH = os.path.join(BASE_DIR, 'models', 'model2_rf', 'rf_source_model.pkl')
GBM_MODEL_PATH = os.path.join(BASE_DIR, 'models', 'model3_gbm', 'xgb_dispersion_model.pkl')

# Load models globally at startup
try:
    rf_model = joblib.load(RF_MODEL_PATH)
    gbm_model = joblib.load(GBM_MODEL_PATH)
    print("Models loaded successfully.")
except Exception as e:
    print(f"Warning: Models not found or failed to load. ({e})")
    rf_model = None
    gbm_model = None

# ═══════════════════════════════════════════════════════════════
# ALERT ENGINE: AQI Severity Tiers (CPCB India Standard)
# ═══════════════════════════════════════════════════════════════

SEVERITY_TIERS = [
    {"tier": 0, "label": "Good",      "color": "#39FF14", "min": 0,   "max": 50},
    {"tier": 1, "label": "Satisfactory","color": "#7CFC00", "min": 51,  "max": 100},
    {"tier": 2, "label": "Moderate",   "color": "#FFD700", "min": 101, "max": 200},
    {"tier": 3, "label": "Poor",       "color": "#FF8C00", "min": 201, "max": 300},
    {"tier": 4, "label": "Very Poor",  "color": "#FF5F3C", "min": 301, "max": 400},
    {"tier": 5, "label": "Severe",     "color": "#DC143C", "min": 401, "max": 999},
]

def get_severity_tier(pm25: float) -> dict:
    for t in SEVERITY_TIERS:
        if t["min"] <= pm25 <= t["max"]:
            return t
    return SEVERITY_TIERS[-1]

# ═══════════════════════════════════════════════════════════════
# HEALTH ADVISORY KNOWLEDGE BASE
# Tiered + source-specific recommendations
# ═══════════════════════════════════════════════════════════════

# Base advisories by tier (cumulative — higher tiers include lower tier advice)
TIER_ADVISORIES = {
    0: ["Air quality is good. Enjoy outdoor activities freely."],
    1: ["Sensitive individuals should limit prolonged outdoor exertion.",
        "Keep windows open for natural ventilation."],
    2: ["Wear a basic cloth mask outdoors if you have respiratory conditions.",
        "Reduce prolonged outdoor exertion, especially for children and elderly.",
        "Keep indoor air purifiers running if available.",
        "Stay hydrated — drink warm fluids to keep airways moist."],
    3: ["Wear an N95 mask when stepping outdoors — cloth masks are insufficient.",
        "Avoid all outdoor exercise. Shift to indoor workouts.",
        "Keep all windows and doors sealed. Use damp towels at gaps.",
        "Run HEPA air purifiers continuously in living spaces.",
        "Consume antioxidant-rich foods: turmeric milk, citrus fruits, green leafy vegetables.",
        "Monitor elderly family members and children for breathing difficulty."],
    4: ["HEALTH EMERGENCY: Wear N95/N99 respirator masks at ALL times outdoors.",
        "Do NOT allow children, elderly, or pregnant women outdoors.",
        "Seal all windows. Place wet towels under doors to block particulates.",
        "If you experience chest tightness, wheezing, or persistent cough — seek medical attention.",
        "Avoid cooking with gas/biomass indoors — use electric appliances only.",
        "Keep emergency inhaler accessible for asthma patients.",
        "Limit vehicle usage to reduce local emissions further."],
    5: ["🚨 SEVERE EMERGENCY: Stay indoors. This is a public health crisis.",
        "Evacuate ground-floor residences near industrial zones if possible.",
        "Emergency medical services are on high alert — call 108 for respiratory distress.",
        "Schools and outdoor workplaces must shut down immediately.",
        "Government GRAP-IV restrictions are now active.",
        "Distribute emergency masks to all household members.",
        "Monitor local news and Vaayu alerts for evacuation advisories.",
        "Do NOT burn any solid fuels including wood, coal, or crop residue."],
}

# Source-specific bonus advisories
SOURCE_ADVISORIES = {
    "vehicular": [
        "🚗 Primary source: VEHICLE EMISSIONS — Avoid walking near major roads.",
        "Use indoor routes to travel between buildings when possible.",
        "If driving, keep car windows up and set AC to recirculation mode."
    ],
    "industry": [
        "🏭 Primary source: INDUSTRIAL EMISSIONS — Stay away from factory zones.",
        "Report visible black smoke to DPCC helpline: 011-4359-3973.",
        "Industrial pollutants contain heavy metals — wash hands and face frequently."
    ],
    "biomass_burning": [
        "🔥 Primary source: BIOMASS/STUBBLE BURNING — Smoke contains toxic aldehydes.",
        "Use wet cloth over nose if you smell burning even indoors.",
        "Report active fires to the Delhi Fire Service: 101."
    ],
    "construction_dust": [
        "🏗️ Primary source: CONSTRUCTION DUST — Contains silica particles.",
        "Avoid areas near active construction sites.",
        "Rinse eyes with clean water if you feel irritation."
    ],
}

def get_health_advisories(tier: int, source: str) -> List[str]:
    """Get cumulative advisories for given tier + source-specific tips."""
    advisories = []
    # Add all advisories from tier 0 up to current tier (cumulative)
    for t in range(tier + 1):
        advisories.extend(TIER_ADVISORIES.get(t, []))
    # Add source-specific advice
    source_key = source.lower().replace(" ", "_")
    advisories.extend(SOURCE_ADVISORIES.get(source_key, []))
    return advisories

# ═══════════════════════════════════════════════════════════════
# TEAM CONTACT REGISTRY (Demo: 6 Indo Innovatorz members)
# ═══════════════════════════════════════════════════════════════
# 🔴 REPLACE these with your real phone numbers before the demo!

TEAM_CONTACTS = [
    {"name": "Yashaswi Goel",     "phone": "+91-8448644505", "ward": "W001"},
    {"name": "Akshi Budhiraja",   "phone": "+91-7827171212", "ward": "W002"},
    {"name": "Kushagra",          "phone": "+91-8307124633", "ward": "W003"},
    {"name": "Nakul Khera",       "phone": "+91-9315674448", "ward": "W004"},
    {"name": "Nidhish Bansal",    "phone": "+91-8745026023", "ward": "W005"},
    {"name": "Tishika Jaiswal",   "phone": "+91-9193216672", "ward": "W006"},
]

# In-memory alert log for the demo
alert_log: List[dict] = []

# Fast2SMS API Key
FAST2SMS_API_KEY = "e93n7Rh1QuSgZfmpC4PTKvVzWqdjAbtl0FcYNDOorwkG2MBIHLXheUWP6BMqJTEk1LSaZpN27nVvARQx"

def send_sms(phone: str, name: str, message: str) -> dict:
    """Sends a real SMS via Fast2SMS Quick SMS API."""
    timestamp = datetime.now().isoformat()
    # Extract 10-digit number (remove +91- prefix)
    clean_number = phone.replace("+91-", "").replace("+91", "").replace("-", "").strip()
    
    try:
        response = requests.post(
            "https://www.fast2sms.com/dev/bulkV2",
            headers={
                "authorization": FAST2SMS_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "route": "q",
                "message": message,
                "language": "english",
                "flash": 0,
                "numbers": clean_number
            },
            timeout=10
        )
        result = response.json()
        status = "DELIVERED" if result.get("return") else "FAILED"
        print(f"SMS -> {name} ({clean_number}): {status} | API: {result.get('message', 'N/A')}")
        return {
            "to": phone,
            "recipient_name": name,
            "message": message,
            "status": status,
            "timestamp": timestamp,
            "provider": "Fast2SMS",
            "api_response": result.get("message", "")
        }
    except Exception as e:
        print(f"SMS FAILED -> {name} ({clean_number}): {e}")
        return {
            "to": phone,
            "recipient_name": name,
            "message": message,
            "status": "ERROR",
            "timestamp": timestamp,
            "provider": "Fast2SMS",
            "api_response": str(e)
        }

def build_alert_message(ward_id: str, tier: dict, pm25: float, source: str) -> str:
    """Constructs the SMS alert text (ASCII-safe for delivery)."""
    tier_num = tier['tier']
    if tier_num >= 4:
        action = "EMERGENCY: Stay indoors. Seal windows. Wear N95."
    elif tier_num >= 3:
        action = "Take precautions. Wear N95 mask outdoors."
    elif tier_num >= 2:
        action = "Monitor conditions. Limit outdoor activity."
    else:
        action = "Air quality is acceptable."
    
    return (
        f"VAAYU ALERT [{tier['label'].upper()}] - Ward {ward_id}\n"
        f"PM2.5: {pm25:.0f} ug/m3 | Source: {source.replace('_', ' ').title()}\n"
        f"{action}\n"
        f"- Project Vaayu AI | {datetime.now().strftime('%H:%M %d-%b')}"
    )

# ═══════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ═══════════════════════════════════════════════════════════════

class SensorData(BaseModel):
    ward_id: str
    month: int
    hour: int
    temperature: float
    humidity: float
    pressure: float
    wind_speed: float
    wind_direction: float
    pm25: float
    pm10: float
    no2: float
    so2: float
    co: float
    fire_points_100km: int = 0

class AlertDispatchRequest(BaseModel):
    ward_id: str
    pm25: float
    source: str

# ═══════════════════════════════════════════════════════════════
# API ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@app.post("/infer/ward")
def infer_ward(data: SensorData):
    """
    Runs the 5-Model Stacked Ensemble inference + mitigation advisory.
    """
    if not rf_model or not gbm_model:
        raise HTTPException(status_code=503, detail="Models not loaded")

    eps = 1e-6
    ratio_pm25_pm10 = data.pm25 / (data.pm10 + eps)
    ratio_so2_no2 = data.so2 / (data.no2 + eps)
    ratio_co_no2 = data.co / (data.no2 + eps)

    rf_features = pd.DataFrame([{
        'month': data.month, 'hour': data.hour,
        'temperature': data.temperature, 'wind_speed': data.wind_speed,
        'pm25': data.pm25, 'pm10': data.pm10,
        'no2': data.no2, 'so2': data.so2, 'co': data.co,
        'ratio_pm25_pm10': ratio_pm25_pm10,
        'ratio_so2_no2': ratio_so2_no2,
        'ratio_co_no2': ratio_co_no2
    }])

    gbm_features = pd.DataFrame([{
        'month': data.month, 'hour': data.hour,
        'wind_speed': data.wind_speed, 'wind_direction': data.wind_direction,
        'temperature': data.temperature, 'pressure': data.pressure,
        'pm10': data.pm10, 'fire_points_100km': data.fire_points_100km
    }])

    source_pred = rf_model.predict(rf_features)[0]
    source_prob = dict(zip(rf_model.classes_, rf_model.predict_proba(rf_features)[0]))
    dispersion_pm25 = float(gbm_model.predict(gbm_features)[0])
    meta_pm25 = (data.pm25 * 0.7) + (dispersion_pm25 * 0.3)

    # Mitigation engine
    tier = get_severity_tier(data.pm25)
    advisories = get_health_advisories(tier["tier"], source_pred)
    alert_msg = build_alert_message(data.ward_id, tier, data.pm25, source_pred)

    # Count how many team members are in this ward
    ward_contacts = [c for c in TEAM_CONTACTS if c["ward"] == data.ward_id]

    return {
        "ward_id": data.ward_id,
        "input_pm25": data.pm25,
        "forecast": {
            "meta_learner_blended_pm25": round(meta_pm25, 2),
            "dispersion_expected_pm25": round(dispersion_pm25, 2)
        },
        "attribution": {
            "primary_source": source_pred,
            "confidence_scores": {k: round(float(v), 3) for k, v in source_prob.items()}
        },
        "alerts": {
            "is_hotspot": bool(data.pm25 > 250),
            "downstream_warning": bool(dispersion_pm25 > 150 and data.wind_speed > 3)
        },
        "mitigation": {
            "severity_tier": tier["tier"],
            "tier_label": tier["label"],
            "tier_color": tier["color"],
            "health_advisories": advisories,
            "alert_message": alert_msg,
            "ward_contacts_count": len(ward_contacts),
            "total_registry_size": len(TEAM_CONTACTS)
        }
    }

@app.post("/alerts/dispatch")
def dispatch_alerts(req: AlertDispatchRequest):
    """
    Manually trigger SMS alerts to all registered contacts for a ward.
    For the demo, dispatches to ALL 6 team members regardless of ward.
    """
    tier = get_severity_tier(req.pm25)
    alert_msg = build_alert_message(req.ward_id, tier, req.pm25, req.source)
    advisories = get_health_advisories(tier["tier"], req.source)

    dispatched = []
    for contact in TEAM_CONTACTS:
        result = send_sms(contact["phone"], contact["name"], alert_msg)
        dispatched.append(result)

    # Store in log
    log_entry = {
        "ward_id": req.ward_id,
        "tier": tier,
        "pm25": req.pm25,
        "source": req.source,
        "recipients": len(dispatched),
        "dispatched_at": datetime.now().isoformat()
    }
    alert_log.append(log_entry)

    return {
        "status": "dispatched",
        "tier": tier,
        "alert_message": alert_msg,
        "health_advisories": advisories,
        "sms_results": dispatched,
        "total_sent": len(dispatched)
    }

@app.get("/alerts/log")
def get_alert_log():
    """Returns the history of all dispatched alerts this session."""
    return {"total_alerts": len(alert_log), "log": alert_log[-20:]}

@app.get("/alerts/contacts")
def get_contacts():
    """Returns the registered team contact list."""
    return {"contacts": TEAM_CONTACTS}

@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": bool(rf_model and gbm_model)}

if __name__ == "__main__":
    print("Starting Vaayu Inference Server v2.0 on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
