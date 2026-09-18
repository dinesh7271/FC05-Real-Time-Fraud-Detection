from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from typing import List
import joblib
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="FC-05 Real-Time Fraud Detection API")

# Simple schema for a transaction
class Transaction(BaseModel):
    amount: float
    time: float
    merchant_id: str
    user_id: str
    location: str

class PredictionResponse(BaseModel):
    is_fraud: bool
    probability: float
    transaction_id: str

# Load model once on startup
MODEL_PATH = os.getenv("MODEL_PATH", "../ml/model.joblib")
model = None

@app.on_event("startup")
async def load_ml_model():
    global model
    try:
        model = joblib.load(MODEL_PATH)
        print(f"Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"Warning: Could not load model from {MODEL_PATH}: {e}")
        print("API will run in 'mock mode' for development.")

@app.get("/")
async def root():
    return {"message": "Welcome to FC-05 Fraud Detection API", "status": "online"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_fraud(tx: Transaction):
    if model is None:
        # Mock prediction for development
        return PredictionResponse(
            is_fraud=tx.amount > 1000,
            probability=0.9 if tx.amount > 1000 else 0.1,
            transaction_id="mock-123"
        )

    # Real prediction logic would go here (preprocessing + model.predict)
    # features = preprocess(tx)
    # pred = model.predict(features)
    # prob = model.predict_proba(features)

    return PredictionResponse(
        is_fraud=False, # Replace with actual logic
        probability=0.05, # Replace with actual logic
        transaction_id="real-123"
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
