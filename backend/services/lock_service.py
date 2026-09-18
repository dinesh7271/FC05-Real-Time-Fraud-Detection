import uuid
from datetime import datetime
from ..database import db
from ..models.schemas import LockModel, LockStatus

class LockService:
    async def create_lock(self, user_id: str, risk_score: float, reason: str) -> str:
        """
        Creates a temporary lock for the user in MongoDB.
        """
        lock_id = str(uuid.uuid4())
        lock_doc = {
            "_id": lock_id,
            "user_id": user_id,
            "risk_score": risk_score,
            "created_at": datetime.utcnow(),
            "status": LockStatus.ACTIVE,
            "reason": reason,
            "resolved_at": None
        }
        await db.db.locks.insert_one(lock_doc)
        return lock_id

    async def get_lock(self, lock_id: str):
        return await db.db.locks.find_one({"_id": lock_id})

    async def resolve_lock(self, lock_id: str, status: LockStatus):
        """
        Updates lock status (e.g., to RESOLVED or FRAUD_CONFIRMED).
        """
        await db.db.locks.update_one(
            {"_id": lock_id},
            {"$set": {
                "status": status,
                "resolved_at": datetime.utcnow()
            }}
        )
        return True

    async def is_user_locked(self, user_id: str) -> bool:
        lock = await db.db.locks.find_one({"user_id": user_id, "status": LockStatus.ACTIVE})
        return lock is not None

lock_service = LockService()
