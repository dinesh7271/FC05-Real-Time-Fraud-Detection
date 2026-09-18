import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import db
from .routes import transaction, security, rag

app = FastAPI(
    title="SentinelFraud API",
    description="Real-Time Financial Fraud Detection with Adaptive Account Protection and RAG",
    version="1.0.0"
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lifecycle events
@app.on_event("startup")
async def startup_db_client():
    await db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.close()

# Include Routers
app.include_router(transaction.router)
app.include_router(security.router)
app.include_router(rag.router)

@app.get("/")
async def root():
    return {
        "status": "Online",
        "system": "SentinelFraud",
        "version": "1.0.0",
        "endpoints": ["/predict", "/security/verify", "/security/unlock", "/security/report-fraud", "/rag/explain"]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
