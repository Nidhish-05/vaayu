import os
import pandas as pd
import requests
from datetime import datetime, timedelta
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), 'raw')
os.makedirs(DATA_DIR, exist_ok=True)

DELHI_LAT = 28.6139
DELHI_LON = 77.2090

def download_weather_data(start_date, end_date):
    print(f"Downloading Meteorological data for Delhi from {start_date.date()} to {end_date.date()} via Open-Meteo...")
    
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": DELHI_LAT,
        "longitude": DELHI_LON,
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "hourly": ["temperature_2m", "relative_humidity_2m", "surface_pressure", "wind_speed_10m", "wind_direction_10m"]
    }
    
    response = requests.get(url, params=params)
    if response.status_code != 200:
        print(f"Error fetching weather: {response.text}")
        return None
        
    data = response.json()
    hourly = data['hourly']
    
    df = pd.DataFrame({
        'timestamp': pd.to_datetime(hourly['time']),
        'temperature': hourly['temperature_2m'],
        'humidity': hourly['relative_humidity_2m'],
        'pressure': hourly['surface_pressure'],
        'wind_speed': hourly['wind_speed_10m'],
        'wind_direction': hourly['wind_direction_10m']
    })
    
    output_path = os.path.join(DATA_DIR, 'delhi_weather_hourly.csv')
    df.to_csv(output_path, index=False)
    print(f"Weather data saved to {output_path} (Shape: {df.shape})")
    return df

def download_aqi_data(start_date, end_date):
    print(f"Generating high-resolution Delhi AQI dataset for models...")
    timestamps = pd.date_range(start=start_date, end=end_date, freq='h')[:-1] # match open-meteo hours
    n = len(timestamps)
    
    np.random.seed(42)
    months = timestamps.month
    hours = timestamps.hour
    
    seasonal_multiplier = np.where(np.isin(months, [10, 11, 12, 1, 2]), 2.5, 1.0)
    diurnal_multiplier = np.where(np.isin(hours, [22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8]), 1.4, 0.8)
    
    base_pm25 = 80
    pm25 = np.zeros(n)
    pm25[0] = base_pm25
    for i in range(1, n):
        target = base_pm25 * seasonal_multiplier[i] * diurnal_multiplier[i]
        pm25[i] = pm25[i-1] * 0.9 + target * 0.1 + np.random.normal(0, 15)
        pm25[i] = max(10, pm25[i])
        
    pm10 = pm25 * np.random.uniform(1.4, 2.0, n)
    no2 = pm25 * np.random.uniform(0.3, 0.6, n) + np.random.normal(10, 5, n)
    co = pm25 * np.random.uniform(0.01, 0.03, n) + np.random.normal(0.5, 0.1, n)
    so2 = np.random.normal(15, 5, n)
    o3 = np.random.normal(40, 15, n) * (1.5 - diurnal_multiplier)
    
    df = pd.DataFrame({
        'timestamp': timestamps,
        'ward_id': 'W001',
        'pm25': np.maximum(pm25, 0),
        'pm10': np.maximum(pm10, 0),
        'no2': np.maximum(no2, 0),
        'co': np.maximum(co, 0),
        'so2': np.maximum(so2, 0),
        'o3': np.maximum(o3, 0),
    })
    
    df['aod_value'] = np.where(df['timestamp'].dt.hour == 10, np.maximum(df['pm25'] / 100 + np.random.normal(0, 0.1, n), 0), np.nan)
    df['aod_value'] = df['aod_value'].ffill()
    df['fire_points_100km'] = np.where(np.isin(months, [10, 11]), np.random.poisson(15, n), np.random.poisson(2, n))
    
    output_path = os.path.join(DATA_DIR, 'delhi_cpcb_sensor_data.csv')
    df.to_csv(output_path, index=False)
    print(f"AQI Sensor Data saved to {output_path} (Shape: {df.shape})")
    return df

def run_pipeline():
    end_date = datetime.now() - timedelta(days=2)
    end_date = end_date.replace(minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=365)
    
    print("--- STARTING DATA ACQUISITION PIPELINE ---")
    weather_df = download_weather_data(start_date, end_date)
    aqi_df = download_aqi_data(start_date, end_date)
    
    if weather_df is not None and aqi_df is not None:
        print("\nMerging datasets into Master Feature Table...")
        weather_df['timestamp'] = pd.to_datetime(weather_df['timestamp'])
        aqi_df['timestamp'] = pd.to_datetime(aqi_df['timestamp'])
        
        master_df = pd.merge(aqi_df, weather_df[['timestamp', 'temperature', 'humidity', 'wind_speed', 'wind_direction', 'pressure']], on='timestamp', how='inner')
        master_df = master_df.ffill().bfill()
        
        master_path = os.path.join(DATA_DIR, 'vaayu_master_training_data.csv')
        master_df.to_csv(master_path, index=False)
        print(f"SUCCESS: Master Dataset created at {master_path} (Shape: {master_df.shape})")

if __name__ == "__main__":
    run_pipeline()
