from datetime import datetime
from ..database import db

class AuditService:
    async def log_event(self, event_type: str, user_id: str, details: dict):
        """
        Logs every significant security event to the audit_logs collection.
        """
        log_entry = {
            "timestamp": datetime.utcnow(),
            "event_type": event_type,
            "user_id": user_id,
            "details": details
        }
        await db.db.audit_logs.insert_one(log_entry)

    async def log_incident(self, incident_type: str, user_id: str, severity: str, description: str):
        """
        Logs high-severity incidents to the security_incidents collection.
        """
        incident = {
            "timestamp": datetime.utcnow(),
            "incident_type": incident_type,
            "user_id": user_id,
            "severity": severity,
            "description": description,
            "status": "OPEN"
        }
        await db.db.security_incidents.insert_one(incident)

audit_service = AuditService()
