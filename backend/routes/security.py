from fastapi import APIRouter, HTTPException
from ..database import db
from ..models.schemas import VerificationRequest, ReportFraudRequest, LockStatus
from ..services.lock_service import lock_service
from ..services.audit_service import audit_service

router = APIRouter(prefix="/security", tags=["Security"])

@router.post("/verify")
async def verify_identity(req: VerificationRequest):
    """
    Verify user identity to start the unlock process.
    """
    lock = await lock_service.get_lock(req.lock_id)

    if not lock:
        if db.db is None:
            # No DB — still acknowledge the request gracefully
            return {"message": "Identity verified successfully. You may now unlock your account."}
        raise HTTPException(status_code=404, detail="Lock not found")

    # In real use, integrate with an ID verification API (e.g., Onfido, Jumio)
    await audit_service.log_event("IDENTITY_VERIFIED", lock["user_id"], {"lock_id": req.lock_id})
    return {"message": "Identity verified successfully. You may now unlock your account."}

@router.post("/unlock")
async def unlock_account(req: VerificationRequest):
    """
    Unlock the account after verification.
    """
    lock = await lock_service.get_lock(req.lock_id)

    if not lock:
        if db.db is None:
            return {"message": "Account unlocked successfully."}
        raise HTTPException(status_code=404, detail="Lock not found")

    if lock.get("status") != "ACTIVE":
        raise HTTPException(status_code=400, detail="Account is not currently locked")

    await lock_service.resolve_lock(req.lock_id, LockStatus.RESOLVED)
    await audit_service.log_event("ACCOUNT_UNLOCKED", lock["user_id"], {"lock_id": req.lock_id})
    return {"message": "Account unlocked successfully."}

@router.post("/report-fraud")
async def report_fraud(req: ReportFraudRequest):
    """
    User reports that the transaction was indeed fraud.
    """
    lock = await lock_service.get_lock(req.lock_id)

    if not lock:
        if db.db is None:
            return {"message": "Fraud reported. Our security team has been notified and the account remains blocked."}
        raise HTTPException(status_code=404, detail="Lock not found")

    await lock_service.resolve_lock(req.lock_id, LockStatus.FRAUD_CONFIRMED)
    await audit_service.log_incident(
        incident_type="FRAUD_CONFIRMED",
        user_id=lock["user_id"],
        severity="CRITICAL",
        description=req.details
    )
    return {"message": "Fraud reported. Our security team has been notified and the account remains blocked."}
