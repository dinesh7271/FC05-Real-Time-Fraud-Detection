import pandas as pd
import joblib
from sklearn.metrics import roc_auc_score, precision_recall_curve
import numpy as np

def evaluate_model():
    try:
        model = joblib.load('model.joblib')
        print("Model loaded successfully.")
    except FileNotFoundError:
        print("Error: model.joblib not found. Run train.py first.")
        return

    # Mock test data
    X_test = np.random.rand(200, 10)
    y_test = np.random.randint(0, 2, 200)

    probs = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, probs)
    print(f"ROC AUC Score: {auc:.4f}")

if __name__ == "__main__":
    evaluate_model()
