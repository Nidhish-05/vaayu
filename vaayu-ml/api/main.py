from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import pandas as pd
import uvicorn

app = FastAPI(title="Project Vaayu ML Inference Engine", version="1.0.0")

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
    print(f"Warning: Models not found or failed to load. Please train them first. ({e})")
    rf_model = None
    gbm_model = None

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

@app.post("/infer/ward")
def infer_ward(data: SensorData):
    """
    Runs the 5-Model Stacked Ensemble inference for a given ward.
    Currently integrates Model 2 (RF Attribution) and Model 3 (GBM Dispersion).
    """
    if not rf_model or not gbm_model:
        raise HTTPException(status_code=503, detail="Models not loaded")

    # Reconstruct derived chemical ratios for RF
    eps = 1e-6
    ratio_pm25_pm10 = data.pm25 / (data.pm10 + eps)
    ratio_so2_no2 = data.so2 / (data.no2 + eps)
    ratio_co_no2 = data.co / (data.no2 + eps)

    rf_features = pd.DataFrame([{
        'month': data.month,
        'hour': data.hour,
        'temperature': data.temperature,
        'wind_speed': data.wind_speed,
        'pm25': data.pm25,
        'pm10': data.pm10,
        'no2': data.no2,
        'so2': data.so2,
        'co': data.co,
        'ratio_pm25_pm10': ratio_pm25_pm10,
        'ratio_so2_no2': ratio_so2_no2,
        'ratio_co_no2': ratio_co_no2
    }])

    gbm_features = pd.DataFrame([{
        'month': data.month,
        'hour': data.hour,
        'wind_speed': data.wind_speed,
        'wind_direction': data.wind_direction,
        'temperature': data.temperature,
        'pressure': data.pressure,
        'pm10': data.pm10,
        'fire_points_100km': data.fire_points_100km
    }])

    # 1. Random Forest Source Attribution
    source_pred = rf_model.predict(rf_features)[0]
    source_prob = dict(zip(rf_model.classes_, rf_model.predict_proba(rf_features)[0]))

    # 2. XGBoost Dispersion Impact (Predicts PM2.5 based on meteorological context)
    dispersion_pm25 = float(gbm_model.predict(gbm_features)[0])

    # 3. Meta-Learner Layer (Naive Blending for Hackathon Phase 1)
    # The actual sensor reported PM2.5 blended with the meteorological expectation
    meta_pm25_prediction = (data.pm25 * 0.7) + (dispersion_pm25 * 0.3)

    return {
        "ward_id": data.ward_id,
        "input_pm25": data.pm25,
        "forecast": {
            "meta_learner_blended_pm25": round(meta_pm25_prediction, 2),
            "dispersion_expected_pm25": round(dispersion_pm25, 2)
        },
        "attribution": {
            "primary_source": source_pred,
            "confidence_scores": {k: round(float(v), 3) for k, v in source_prob.items()}
        },
        "alerts": {
            "is_hotspot": bool(data.pm25 > 250),
            "downstream_warning": bool(dispersion_pm25 > 150 and data.wind_speed > 3)
        }
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": bool(rf_model and gbm_model)}

if __name__ == "__main__":
    print("Starting Vaayu Inference Server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
