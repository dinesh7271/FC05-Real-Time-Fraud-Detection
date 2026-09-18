from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class TransactionRequest(BaseModel):
    """
    Exact feature set for XGBoost model.
    Order:
    1. amount
    2. transaction_hour
    3. new_device
    4. new_recipient
    5. location_change
    6. velocity
    7. account_age_days
    8. avg_transaction_amount
    """
    user_id: str
    amount: float = Field(..., gt=0)
    transaction_hour: int = Field(..., ge=0, le=23)
    new_device: int = Field(..., ge=0, le=1)
    new_recipient: int = Field(..., ge=0, le=1)
    location_change: int = Field(..., ge=0, le=1)
    velocity: int = Field(..., ge=0)
    account_age_days: int = Field(..., ge=0)
    avg_transaction_amount: float = Field(..., ge=0)

    # Metadata (not used in ML model)
    merchant_id: Optional[str] = None
    location: Optional[str] = None
    timestamp: Optional[datetime] = None
    device_id: Optional[str] = None
    transaction_type: Optional[str] = "purchase"

class PredictionResponse(BaseModel):
    risk_score: float
    risk_level: RiskLevel
    action: str
    reasons: List[str]
    explanation: str
    is_locked: bool
    lock_id: Optional[str] = None

class LockStatus(str, Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    FRAUD_CONFIRMED = "FRAUD_CONFIRMED"

class LockModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    lock_id: str = Field(alias="_id")
    user_id: str
    risk_score: float
    created_at: datetime
    status: LockStatus = LockStatus.ACTIVE
    resolved_at: Optional[datetime] = None
    reason: str

class VerificationRequest(BaseModel):
    lock_id: str
    verification_token: str
    id_proof_url: Optional[str] = None

class ReportFraudRequest(BaseModel):
    lock_id: str
    details: str
