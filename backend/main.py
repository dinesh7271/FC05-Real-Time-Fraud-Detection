import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import db
from .routes import transaction, security, rag, history, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern lifespan context manager (replaces deprecated @app.on_event)."""
    await db.connect()
    yield
    await db.close()

app = FastAPI(
    title="SentinelFraud API",
    description="Real-Time Financial Fraud Detection with Adaptive Account Protection and RAG",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(transaction.router)
app.include_router(security.router)
app.include_router(rag.router)
app.include_router(history.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {
        "status": "Online",
        "system": "SentinelFraud",
        "version": "1.0.0",
        "endpoints": [
            "/predict",
            "/security/verify",
            "/security/unlock",
            "/security/report-fraud",
            "/rag/explain",
            "/transactions",
            "/dashboard/stats",
        ]
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
