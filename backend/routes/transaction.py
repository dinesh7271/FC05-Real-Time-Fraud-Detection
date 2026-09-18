from fastapi import APIRouter, Depends, HTTPException
from ..models.schemas import TransactionRequest, PredictionResponse, RiskLevel
from ..services.risk_engine import risk_engine
from ..services.lock_service import lock_service
from ..services.rag_service import rag_service
from ..services.audit_service import audit_service
from ..database import db

router = APIRouter(prefix="/predict", tags=["Transactions"])

@router.post("", response_model=PredictionResponse)
async def predict_fraud(tx: TransactionRequest):
    # 1. Feature Extraction (Simplification for hackathon)
    # In real use, map TransactionRequest to ML feature vector
    features = [tx.amount, len(tx.location), len(tx.merchant_id)]

    # 2. Risk Scoring
    score, level, reasons = risk_engine.predict(features)

    is_locked = False
    lock_id = None
    action = "ALLOW"

    # 3. High Risk -> Automated Lock
    if level == RiskLevel.HIGH:
        action = "LOCK_ACCOUNT"
        lock_id = await lock_service.create_lock(
            user_id=tx.user_id,
            risk_score=score,
            reason="High risk transaction detected"
        )
        is_locked = True
        await audit_service.log_incident(
            incident_type="ACCOUNT_LOCK",
            user_id=tx.user_id,
            severity="HIGH",
            description=f"Auto-locked due to score {score}"
        )
    elif level == RiskLevel.MEDIUM:
        action = "FLAG_FOR_REVIEW"

    # 4. RAG Explanation
    explanation = "Transaction processed normally."
    if level != RiskLevel.LOW:
        explanation = await rag_service.generate_explanation(
            risk_score=score,
            reasons=reasons,
            transaction_details=tx.model_dump()
        )

    # 5. Store in MongoDB
    transaction_doc = {
        "user_id": tx.user_id,
        "amount": tx.amount,
        "risk_score": score,
        "risk_level": level,
        "action": action,
        "explanation": explanation,
        "is_locked": is_locked,
        "lock_id": lock_id,
        "timestamp": tx.timestamp or datetime.utcnow()
    }
    await db.db.transactions.insert_one(transaction_doc)

    # Audit Log
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
