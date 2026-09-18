import os
import joblib
import numpy as np
from typing import Tuple, List
from dotenv import load_dotenv
from ..models.schemas import RiskLevel

load_dotenv()

class RiskEngine:
    def __init__(self):
        self.model_path = os.getenv("MODEL_PATH", "../models/fraud_model.joblib")
        self.threshold = float(os.getenv("FRAUD_THRESHOLD", 0.7))
        self.model = None
        self.load_model()

    def load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print(f"Risk model loaded successfully from {self.model_path}")
            else:
                print(f"Model file not found at {self.model_path}. Running in Mock Mode.")
        except Exception as e:
            print(f"Error loading model: {e}. Running in Mock Mode.")

    def predict(self, features: list) -> Tuple[float, RiskLevel, List[str]]:
        """
        Predicts the risk score and level.
        features: [amount, transaction_hour, new_device, new_recipient, location_change, velocity, account_age_days, avg_transaction_amount]
        """
        reasons = []

        # Rule-based risk analysis ( complements the ML model )
        # Feature mapping for readability
        amount, tx_hour, new_dev, new_rec, loc_chg, vel, age, avg_amt = features

        if amount > avg_amt * 5:
            reasons.append("Transaction amount significantly exceeds historical average")
        if loc_chg == 1:
            reasons.append("Geographic location shift detected")
        if new_dev == 1 and amount > 1000:
            reasons.append("High-value transaction from an unrecognized device")
        if vel > 5:
            reasons.append("High transaction velocity (too many requests in short time)")
        if tx_hour < 5 or tx_hour > 23:
            reasons.append("Transaction occurring during unusual hours")

        if self.model is None:
            # Mock prediction logic for development
            # Trigger high risk if rules flagged > 2 things or amount is huge
            score = 0.85 if (len(reasons) >= 2 or amount > 10000) else 0.15
            if not reasons:
                reasons.append("Low risk patterns detected")
        else:
            # Real XGBoost prediction
            data = np.array(features).reshape(1, -1)
            score = float(self.model.predict_proba(data)[0][1])

            if score > self.threshold:
                reasons.append("ML Model identified high-probability fraud pattern")
            elif score > 0.4:
                reasons.append("ML Model identified moderate risk")
            elif not reasons:
                reasons.append("Standard transaction profile")

        # Determine Risk Level
        if score >= self.threshold:
            level = RiskLevel.HIGH
        elif score >= 0.4:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        return score, level, reasons

risk_engine = RiskEngine()
