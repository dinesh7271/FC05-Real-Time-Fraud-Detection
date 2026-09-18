import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    confusion_matrix, classification_report, roc_auc_score,
    precision_recall_curve, auc, roc_curve
)
import os

def evaluate_model():
    print("Loading model and data...")
    model_path = 'models/fraud_model.joblib'
    data_path = 'data/fraud_dataset.csv'

    if not os.path.exists(model_path) or not os.path.exists(data_path):
        print("Error: Model or dataset missing. Run generate_data.py and train.py first.")
        return

    model = joblib.load(model_path)
    df = pd.read_csv(data_path)

    # Feature order
    features_order = [
        'amount', 'transaction_hour', 'new_device', 'new_recipient',
        'location_change', 'velocity', 'account_age_days', 'avg_transaction_amount'
    ]

    X = df[features_order]
    y = df['is_fraud']

    # Split for evaluation (use a fixed seed to be consistent with train.py)
    from sklearn.model_selection import train_test_split
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Predictions
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]

    print("\n" + "="*30)
    print(" FINAL MODEL EVALUATION ")
    print("="*30)

    # 1. Classification Report
    print("\nClassification Report:\n")
    print(classification_report(y_test, preds))

    # 2. ROC-AUC
    roc_auc = roc_auc_score(y_test, probs)
    print(f"ROC-AUC Score: {roc_auc:.4f}")

    # 3. Precision-Recall Curve AUC
    precision, recall, _ = precision_recall_curve(y_test, probs)
    pr_auc = auc(recall, precision)
    print(f"PR-AUC Score: {pr_auc:.4f}")

    # 4. Confusion Matrix Plot
    cm = confusion_matrix(y_test, preds)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Normal', 'Fraud'],
                yticklabels=['Normal', 'Fraud'])
    plt.title('Confusion Matrix')
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    plt.savefig('models/confusion_matrix.png')
    print("\nConfusion matrix saved as models/confusion_matrix.png")

    # 5. ROC Curve Plot
    fpr, tpr, _ = roc_curve(y_test, probs)
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, label=f'XGBoost (AUC = {roc_auc:.2f})')
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve')
    plt.legend()
    plt.savefig('models/roc_curve.png')
    print("ROC curve saved as models/roc_curve.png")

if __name__ == "__main__":
    evaluate_model()
