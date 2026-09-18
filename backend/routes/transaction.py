from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List
from ..models.schemas import TransactionRequest, PredictionResponse, RiskLevel
from ..services.risk_engine import risk_engine
from ..services.lock_service import lock_service
from ..services.rag_service import rag_service
from ..services.audit_service import audit_service
from ..database import db

router = APIRouter(prefix="/predict", tags=["Transactions"])

def extract_features(tx: TransactionRequest) -> list:
    """
    Maps the TransactionRequest to the exact feature vector required by the ML model.

    Feature Order:
    1. amount (float)
    2. transaction_hour (int 0-23)
    3. new_device (0 or 1)
    4. new_recipient (0 or 1)
    5. location_change (0 or 1)
    6. velocity (int)
    7. account_age_days (int)
    8. avg_transaction_amount (float)
    """
    return [
        tx.amount,
        tx.transaction_hour,
        tx.new_device,
        tx.new_recipient,
        tx.location_change,
        tx.velocity,
        tx.account_age_days,
        tx.avg_transaction_amount
    ]

@router.post("", response_model=PredictionResponse)
async def predict_fraud(tx: TransactionRequest):
    # 1. Feature Extraction
    features = extract_features(tx)

    # 2. Risk Scoring (XGBoost)
    score, level, reasons = risk_engine.predict(features)

    is_locked = False
    lock_id = None
    action = "ALLOW"

    # 3. Adaptive Account Protection: Automated Lock for HIGH Risk
    if level == RiskLevel.HIGH:
        action = "LOCK_ACCOUNT"
        lock_id = await lock_service.create_lock(
            user_id=tx.user_id,
            risk_score=score,
            reason=f"Auto-lock: {', '.join(reasons)}"
        )
        is_locked = True
        await audit_service.log_incident(
            incident_type="ACCOUNT_LOCK",
            user_id=tx.user_id,
            severity="HIGH",
            description=f"Auto-locked due to risk score {score:.2f}"
        )
    elif level == RiskLevel.MEDIUM:
        action = "FLAG_FOR_REVIEW"

    # 4. Explainable AI (RAG)
    # We use the full request object for context
    explanation = "Transaction processed normally."
    if level != RiskLevel.LOW:
        explanation = await rag_service.generate_explanation(
            risk_score=score,
            reasons=reasons,
            transaction_details=tx.model_dump()
        )

    # 5. Persistence in MongoDB
    transaction_doc = {
        "user_id": tx.user_id,
        "amount": tx.amount,
        "features": features,
        "risk_score": score,
        "risk_level": level,
        "action": action,
        "explanation": explanation,
        "is_locked": is_locked,
        "lock_id": lock_id,
        "timestamp": tx.timestamp or datetime.utcnow()
    }
    await db.db.transactions.insert_one(transaction_doc)

    # Audit Log for traceability
    await audit_service.log_event("TRANSACTION_PREDICTED", tx.user_id, transaction_doc)

    return PredictionResponse(
        risk_score=score,
        risk_level=level,
        action=action,
        reasons=reasons,
        explanation=explanation,
        is_locked=is_locked,
        lock_id=lock_id
    )
