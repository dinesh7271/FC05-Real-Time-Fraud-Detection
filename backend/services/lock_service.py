import uuid
import logging
from datetime import datetime
from ..database import db
from ..models.schemas import LockModel, LockStatus

logger = logging.getLogger(__name__)

class LockService:
    async def create_lock(self, user_id: str, risk_score: float, reason: str) -> str:
        """
        Creates a temporary lock for the user in MongoDB.
        Returns a lock_id (UUID string). If DB is unavailable, still returns a valid ID.
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
        try:
            if db.db is not None:
                await db.db.locks.insert_one(lock_doc)
            else:
                logger.warning("MongoDB not connected — lock not persisted (lock_id=%s)", lock_id)
        except Exception as e:
            logger.error("Failed to create lock in DB: %s", e)
        return lock_id

    async def get_lock(self, lock_id: str):
        if db.db is None:
            return None
        try:
            return await db.db.locks.find_one({"_id": lock_id})
        except Exception as e:
            logger.error("Failed to get lock: %s", e)
            return None

    async def resolve_lock(self, lock_id: str, status: LockStatus):
        """
        Updates lock status (e.g., to RESOLVED or FRAUD_CONFIRMED).
        """
        if db.db is None:
            logger.warning("MongoDB not connected — lock resolution not persisted")
            return True
        try:
            await db.db.locks.update_one(
                {"_id": lock_id},
                {"$set": {
                    "status": status,
                    "resolved_at": datetime.utcnow()
                }}
            )
        except Exception as e:
            logger.error("Failed to resolve lock: %s", e)
        return True

    async def is_user_locked(self, user_id: str) -> bool:
        if db.db is None:
            return False
        try:
            lock = await db.db.locks.find_one({"user_id": user_id, "status": LockStatus.ACTIVE})
            return lock is not None
        except Exception as e:
            logger.error("Failed to check lock status: %s", e)
            return False

lock_service = LockService()
