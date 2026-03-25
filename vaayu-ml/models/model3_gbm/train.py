import os
import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'dataset_gbm_dispersion.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'models', 'model3_gbm')

def train_xgb_model():
    print(f"Loading GBM Dispersion dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    # Target is predicting the current PM2.5 based on meteorological dispersion variables
    # In a full spatial implementation, target would be downstream ward PM2.5 at t+2
    # For this hackathon demo, we predict PM2.5 based on wind dispersion vectors
    
    df = df.dropna()
    X = df.drop(columns=['pm25'])
    y = df['pm25']
    
    # Chronological Split
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    print(f"Training Data: {X_train.shape}, Testing Data: {X_test.shape}")
    
    print("Training XGBoost Regressor (Dispersion Met-Model)...")
    model = XGBRegressor(n_estimators=150, max_depth=6, learning_rate=0.05, 
                         objective='reg:squarederror', random_state=42)
    
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    
    print("Evaluating Model...")
    y_pred = model.predict(X_test)
    
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("\n--- Regression Metrics ---")
    print(f"RMSE: {rmse:.2f} µg/m³")
    print(f"MAE:  {mae:.2f} µg/m³")
    print(f"R²:   {r2:.3f}")
    
    model_path = os.path.join(MODEL_DIR, 'xgb_dispersion_model.pkl')
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")

if __name__ == "__main__":
    try:
        train_xgb_model()
    except ImportError:
        import subprocess
        import sys
        print("XGBoost not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "xgboost"])
        train_xgb_model()
