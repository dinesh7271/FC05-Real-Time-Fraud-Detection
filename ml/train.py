import pandas as pd
import numpy as np
import joblib
import os
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score

def train_fraud_model():
    print("Loading dataset...")
    if not os.path.exists('data/fraud_dataset.csv'):
        print("Error: Dataset not found. Please run generate_data.py first.")
        return

    df = pd.read_csv('data/fraud_dataset.csv')

    # Ensure features are in the EXACT order required by the backend
    features_order = [
        'amount', 'transaction_hour', 'new_device', 'new_recipient',
        'location_change', 'velocity', 'account_age_days', 'avg_transaction_amount'
    ]

    X = df[features_order]
    y = df['is_fraud']

    # Handle class imbalance: calculate scale_pos_weight
    # scale_pos_weight = sum(negative cases) / sum(positive cases)
    num_neg = (y == 0).sum()
    num_pos = (y == 1).sum()
    spw = num_neg / num_pos if num_pos > 0 else 1
    print(f"Class distribution: {num_pos} fraud, {num_neg} normal. scale_pos_weight: {spw:.2f}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training XGBoost model...")
    model = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=spw, # Crucial for fraud detection imbalance
        use_label_encoder=False,
        eval_metric='logloss',
        random_state=42
    )

    model.fit(X_train, y_train)

    # Basic evaluation
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]

    print("\n--- Initial Training Evaluation ---")
    print(classification_report(y_test, preds))
    print(f"ROC-AUC Score: {roc_auc_score(y_test, probs):.4f}")

    # Save model
    os.makedirs('models', exist_ok=True)
    model_path = 'models/fraud_model.joblib'
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")

    # Save feature names for documentation/verification
    with open('models/feature_names.txt', 'w') as f:
        f.write("\n".join(features_order))
    print("Feature order saved to models/feature_names.txt")

if __name__ == "__main__":
    train_fraud_model()
