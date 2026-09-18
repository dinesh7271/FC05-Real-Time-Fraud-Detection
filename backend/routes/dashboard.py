from fastapi import APIRouter
from ..database import db
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["Admin"])

@router.get("/stats")
async def get_dashboard_stats():
    """
    Returns aggregated statistics for the Admin Dashboard.
    Falls back to sensible defaults if collections are empty or DB is unavailable.
    """
    if db.db is None:
        return {
            "totalTransactions": 0, "highRiskCount": 0,
            "currentlyLocked": 0, "securityIncidents": 0,
            "fraudTrend": [], "riskDistribution": [
                {"name": "Low", "value": 0}, {"name": "Medium", "value": 0}, {"name": "High", "value": 0}
            ]
        }

    # Total transactions
    total_transactions = await db.db.transactions.count_documents({})

    # High risk count
    high_risk_count = await db.db.transactions.count_documents({"risk_level": "HIGH"})

    # Currently locked accounts
    currently_locked = await db.db.locks.count_documents({"status": "ACTIVE"})

    # Security incidents count
    security_incidents = await db.db.security_incidents.count_documents({})

    # Fraud trend for the last 7 days
    now = datetime.utcnow()
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    fraud_trend = []
    for i in range(6, -1, -1):
        day_start = now - timedelta(days=i)
        day_start = day_start.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = await db.db.transactions.count_documents({
            "risk_level": "HIGH",
            "timestamp": {"$gte": day_start, "$lt": day_end}
        })
        fraud_trend.append({"name": days[day_start.weekday()], "count": count})

    # Risk distribution
    low_count = await db.db.transactions.count_documents({"risk_level": "LOW"})
    medium_count = await db.db.transactions.count_documents({"risk_level": "MEDIUM"})

    risk_distribution = [
        {"name": "Low", "value": low_count},
        {"name": "Medium", "value": medium_count},
        {"name": "High", "value": high_risk_count},
    ]

    return {
        "totalTransactions": total_transactions,
        "highRiskCount": high_risk_count,
        "currentlyLocked": currently_locked,
        "securityIncidents": security_incidents,
        "fraudTrend": fraud_trend,
        "riskDistribution": risk_distribution,
    }
