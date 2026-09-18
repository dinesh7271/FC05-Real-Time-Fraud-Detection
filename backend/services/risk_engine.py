import os
import joblib
import numpy as np
from typing import Tuple, List
from dotenv import load_dotenv
from ..models.schemas import RiskLevel

load_dotenv()

# Resolve model path relative to this file so it works from any working directory
_HERE = os.path.dirname(os.path.abspath(__file__))
_DEFAULT_MODEL_PATH = os.path.normpath(os.path.join(_HERE, "..", "..", "..", "models", "fraud_model.joblib"))

class RiskEngine:
    def __init__(self):
        self.model_path = os.getenv("MODEL_PATH", _DEFAULT_MODEL_PATH)
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

    def _rule_score(self, features: list) -> Tuple[float, List[str]]:
        """
        Computes a rule-based risk score (0.0 – 1.0) and collects reasons.
        Each flag contributes a weighted amount to the score.
        """
        reasons = []
        score = 0.0
        amount, tx_hour, new_dev, new_rec, loc_chg, vel, age, avg_amt = features

        if amount > avg_amt * 5:
            reasons.append("Transaction amount significantly exceeds historical average")
            score += 0.35
        if loc_chg == 1:
            reasons.append("Geographic location shift detected")
            score += 0.25
        if new_dev == 1 and amount > 1000:
            reasons.append("High-value transaction from an unrecognized device")
            score += 0.20
        if vel > 5:
            reasons.append("High transaction velocity (too many requests in short time)")
            score += 0.20
        if tx_hour < 5 or tx_hour >= 22:
            reasons.append("Transaction occurring during unusual hours")
            score += 0.15
        if new_rec == 1 and amount > 500:
            reasons.append("High-value transfer to a new recipient")
            score += 0.15
        if age < 30 and amount > 500:
            reasons.append("New account making a high-value transaction")
            score += 0.20

        return min(score, 1.0), reasons

    def predict(self, features: list) -> Tuple[float, RiskLevel, List[str]]:
        """
        Predicts the risk score and level using a blend of ML model + rule engine.
        features: [amount, transaction_hour, new_device, new_recipient,
                   location_change, velocity, account_age_days, avg_transaction_amount]
        """
        rule_score, reasons = self._rule_score(features)

        if self.model is None:
            # Mock mode: rule-based only
            score = rule_score if rule_score > 0 else 0.05
            if not reasons:
                reasons.append("Low risk patterns detected")
            # Use standard thresholds in mock mode
            high_thresh = self.threshold
            med_thresh = 0.4
        else:
            # Real mode: blend ML (40%) + rules (60%)
            # The ML model was trained with heavy class imbalance (scale_pos_weight ~212x),
            # so raw probabilities are very low. Blending with rule score compensates.
            data = np.array(features).reshape(1, -1)
            ml_score = float(self.model.predict_proba(data)[0][1])
            score = 0.6 * rule_score + 0.4 * ml_score

            # Adjust thresholds for blended score (rule score dominates)
            high_thresh = 0.55   # ~2+ strong risk factors
            med_thresh = 0.25    # ~1 risk factor

            if score >= high_thresh:
                reasons.append("ML Model identified high-probability fraud pattern")
            elif score >= med_thresh:
                reasons.append("ML Model identified moderate risk")
            elif not reasons:
                reasons.append("Standard transaction profile")

        # Determine Risk Level
        if score >= high_thresh:
            level = RiskLevel.HIGH
        elif score >= med_thresh:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        return score, level, reasons

risk_engine = RiskEngine()
