from fastapi import APIRouter
from ..database import db
from bson import ObjectId
import json

router = APIRouter(prefix="/transactions", tags=["Transactions"])

def serialize_doc(doc):
    """Convert MongoDB doc to JSON-serializable dict."""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    # Convert datetime to isoformat
    for k, v in doc.items():
        if hasattr(v, "isoformat"):
            doc[k] = v.isoformat()
    return doc

@router.get("")
async def get_transactions(limit: int = 50, risk_level: str = None):
    """
    Fetch recent transactions with optional risk_level filter.
    """
    if db.db is None:
        return []

    query = {}
    if risk_level and risk_level.upper() in ("LOW", "MEDIUM", "HIGH"):
        query["risk_level"] = risk_level.upper()

    cursor = db.db.transactions.find(query).sort("timestamp", -1).limit(limit)
    transactions = []
    async for doc in cursor:
        t = serialize_doc(doc)
        # Normalize for frontend compatibility
        t["id"] = t.get("_id", "")
        t["date"] = t.get("timestamp", "")
        t["riskLevel"] = t.get("risk_level", "LOW")
        t["status"] = "Locked" if t.get("is_locked") else ("High Risk" if t.get("risk_level") == "HIGH" else "Normal")
        t["recipient"] = t.get("merchant_id", "Unknown")
        t["location"] = t.get("location", "Unknown")
        transactions.append(t)

    return transactions
