from fastapi import APIRouter, HTTPException
from ..services.rag_service import rag_service

router = APIRouter(prefix="/rag", tags=["Explainable AI"])

@router.get("/explain/{lock_id}")
async def get_explanation(lock_id: str):
    """
    Manually fetch an AI explanation for a specific lock event.
    """
    # In a real scenario, fetch transaction details from DB using lock_id
    # For now, we'll mock the input to rag_service
    mock_details = {"amount": 5000, "location": "Unknown", "user_id": "user123"}
    explanation = await rag_service.generate_explanation(
        risk_score=0.9,
        reasons=["Unusual location", "High amount"],
        transaction_details=mock_details
    )
    return {"lock_id": lock_id, "explanation": explanation}
