import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
RAW_DATA_PATH = os.path.join(BASE_DIR, 'data', 'raw', 'vaayu_master_training_data.csv')
PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')
os.makedirs(PROCESSED_DIR, exist_ok=True)

def generate_source_labels(df):
    """
    Simulates True Labels for Source Attribution (Random Forest Target).
    In reality, this would be provided by expert labeling or isotopic analysis.
    We generate synthetic labels based on chemical fingerprints to allow model training.
    """
    conditions = [
        (df['pm25']/df['pm10'] > 0.6) & (df['so2'] > 20) & (df['co'] > 1.0), # Industry
        (df['pm25']/df['pm10'] > 0.7) & (df['no2'] > 30), # Vehicles
        (df['pm25']/df['pm10'] < 0.4) & (df['wind_speed'] > 5), # Dust/Construction
        (df['pm25'] > 150) & (df['fire_points_100km'] > 5), # Biomass/Stubble
    ]
    choices = ['Industry', 'Vehicles', 'Construction_Dust', 'Biomass_Burning']
    
    df['source_label'] = np.select(conditions, choices, default='Mixed_Background')
    return df

def build_features():
    print(f"Loading raw data from {RAW_DATA_PATH}...")
    df = pd.read_csv(RAW_DATA_PATH, parse_dates=['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    print("1. Adding Temporal Features...")
    df['hour'] = df['timestamp'].dt.hour
    df['month'] = df['timestamp'].dt.month
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    df['season_winter'] = df['month'].isin([11, 12, 1, 2]).astype(int)
    
    print("2. Adding Chemical Profile Ratios (for RF)...")
    # Add epsilon to avoid divide by zero
    eps = 1e-6
    df['ratio_pm25_pm10'] = df['pm25'] / (df['pm10'] + eps)
    df['ratio_so2_no2'] = df['so2'] / (df['no2'] + eps)
    df['ratio_co_no2'] = df['co'] / (df['no2'] + eps)
    
    df = generate_source_labels(df)
    
    print("3. Adding Rolling Window Lags (for LSTM)...")
    lag_cols = ['pm25', 'pm10', 'no2', 'temperature', 'wind_speed']
    for col in lag_cols:
        # Lagged features (values at t-1, t-3, t-6, t-24)
        df[f'{col}_t-1'] = df[col].shift(1)
        df[f'{col}_t-3'] = df[col].shift(3)
        df[f'{col}_t-6'] = df[col].shift(6)
        df[f'{col}_t-24'] = df[col].shift(24)
        
        # Rolling averages (past 6h, past 24h)
        df[f'{col}_roll_avg_6h'] = df[col].rolling(window=6, min_periods=1).mean()
        df[f'{col}_roll_avg_24h'] = df[col].rolling(window=24, min_periods=1).mean()
        
    print("4. Adding Target Variables (for Forecasting)...")
    # For LSTM, predict PM2.5 at t+6
    df['target_pm25_t+6'] = df['pm25'].shift(-6)
    
    # Drop rows with NaNs resulting from shifts
    orig_len = len(df)
    df = df.dropna()
    print(f"Dropped {orig_len - len(df)} rows due to lag/lead NaN boundaries.")
    
    # Stratify datasets
    print("5. Splitting outputs for models...")
    
    # RF Dataset: Attribution (Current timestep chemical data -> Label)
    rf_cols = ['month', 'hour', 'temperature', 'wind_speed', 'pm25', 'pm10', 'no2', 'so2', 'co', 
               'ratio_pm25_pm10', 'ratio_so2_no2', 'ratio_co_no2', 'source_label']
    df_rf = df[rf_cols].copy()
    rf_path = os.path.join(PROCESSED_DIR, 'dataset_rf_source.csv')
    df_rf.to_csv(rf_path, index=False)
    
    # LSTM Dataset: Forecasting (Lagged data -> Future PM2.5)
    lstm_cols = [c for c in df.columns if c not in ['source_label', 'ward_id']]
    df_lstm = df[lstm_cols].copy()
    lstm_path = os.path.join(PROCESSED_DIR, 'dataset_lstm_forecast.csv')
    df_lstm.to_csv(lstm_path, index=False)
    
    # GBM Dataset: Dispersion (Wind + Current PM2.5 -> Contextual PM2.5)
    gbm_cols = ['month', 'hour', 'wind_speed', 'wind_direction', 'temperature', 'pressure', 'pm25', 'pm10', 'fire_points_100km']
    df_gbm = df[gbm_cols].copy()
    gbm_path = os.path.join(PROCESSED_DIR, 'dataset_gbm_dispersion.csv')
    df_gbm.to_csv(gbm_path, index=False)
    
    print(f"SUCCESS: Feature Engineering Complete. Artifacts saved to {PROCESSED_DIR}")

if __name__ == "__main__":
    build_features()
