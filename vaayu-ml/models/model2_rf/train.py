import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'dataset_rf_source.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'models', 'model2_rf')

def train_rf_model():
    print(f"Loading RF dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    # Drop NaNs
    df = df.dropna()
    
    X = df.drop(columns=['source_label'])
    y = df['source_label']
    
    # Simulating a time-series aware split (80% train, 20% test chronologically)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    print(f"Training Data: {X_train.shape}, Testing Data: {X_test.shape}")
    
    print("Training Random Forest Classifier (Source Attribution)...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight='balanced')
    clf.fit(X_train, y_train)
    
    print("Evaluating Model...")
    y_pred = clf.predict(X_test)
    print("\n--- Classification Report ---")
    print(classification_report(y_test, y_pred))
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.3f}")
    
    # Feature Importance
    print("\n--- Top 5 Important Features ---")
    importances = pd.DataFrame({'Feature': X.columns, 'Importance': clf.feature_importances_})
    print(importances.sort_values(by='Importance', ascending=False).head(5))
    
    model_path = os.path.join(MODEL_DIR, 'rf_source_model.pkl')
    joblib.dump(clf, model_path)
    print(f"\nModel saved to {model_path}")

if __name__ == "__main__":
    train_rf_model()
