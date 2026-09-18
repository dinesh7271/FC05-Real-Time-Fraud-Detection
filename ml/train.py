import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import os

def train_model():
    print("Loading dataset...")
    # Mock data generation since dataset folder is empty
    # In real use: df = pd.read_csv('dataset/fraud_data.csv')
    import numpy as np
    X = np.random.rand(1000, 10)
    y = np.random.randint(0, 2, 1000)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training RandomForest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    print("Evaluating model...")
    preds = model.predict(X_test)
    print(classification_report(y_test, preds))

    # Save model
    model_path = 'model.joblib'
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
