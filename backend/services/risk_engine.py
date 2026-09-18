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
            self.model = joblib.load(self.model_path)
            print(f"Risk model loaded from {self.model_path}")
        except Exception as e:
            print(f"Warning: Could not load risk model: {e}. Using mock mode.")

    def predict(self, features: list) -> Tuple[float, RiskLevel, List[str]]:
        """
        Predicts the risk score and level.
        Returns: (score, level, reasons)
        """
        if self.model is None:
            # Mock logic for demo if model file is missing
            score = 0.85 if features[0] > 1000 else 0.1
            reasons = ["Mock: High amount"] if score > 0.7 else ["Low risk transaction"]
        else:
            # Real XGBoost prediction
            # Expects 2D array
            data = np.array(features).reshape(1, -1)
            score = float(self.model.predict_proba(data)[0][1])

            reasons = []
            if score > self.threshold:
                reasons.append("High probability of fraud detected by XGBoost")
            elif score > 0.4:
                reasons.append("Moderate risk patterns identified")
            else:
                reasons.append("Transaction aligns with normal patterns")

        # Determine Risk Level
        if score >= self.threshold:
            level = RiskLevel.HIGH
        elif score >= 0.4:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        return score, level, reasons

risk_engine = RiskEngine()
