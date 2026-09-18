import logging
from datetime import datetime
from ..database import db

logger = logging.getLogger(__name__)

class AuditService:
    async def log_event(self, event_type: str, user_id: str, details: dict):
        """
        Logs every significant security event to the audit_logs collection.
        Silently skips if MongoDB is unavailable.
        """
        if db.db is None:
            return
        log_entry = {
            "timestamp": datetime.utcnow(),
            "event_type": event_type,
            "user_id": user_id,
            "details": details
        }
        try:
            await db.db.audit_logs.insert_one(log_entry)
        except Exception as e:
            logger.error("Failed to write audit log: %s", e)

    async def log_incident(self, incident_type: str, user_id: str, severity: str, description: str):
        """
        Logs high-severity incidents to the security_incidents collection.
        Silently skips if MongoDB is unavailable.
        """
        if db.db is None:
            return
        incident = {
            "timestamp": datetime.utcnow(),
            "incident_type": incident_type,
            "user_id": user_id,
            "severity": severity,
            "description": description,
            "status": "OPEN"
        }
        try:
            await db.db.security_incidents.insert_one(incident)
        except Exception as e:
            logger.error("Failed to write security incident: %s", e)

audit_service = AuditService()
