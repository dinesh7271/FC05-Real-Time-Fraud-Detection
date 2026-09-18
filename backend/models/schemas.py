from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class TransactionRequest(BaseModel):
    user_id: str
    amount: float = Field(..., gt=0)
    merchant_id: str
    location: str
    timestamp: Optional[datetime] = None
    device_id: str
    transaction_type: str

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
