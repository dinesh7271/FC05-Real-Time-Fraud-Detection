import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    async def connect(self):
        uri = os.getenv("MONGO_URI")
        db_name = os.getenv("MONGO_DB_NAME", "sentinel_fraud_db")
        if not uri:
            print("MONGO_URI not configured. Running without persistent database.")
            return

        try:
            self.client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
            self.db = self.client[db_name]
            print(f"Connected to MongoDB database '{db_name}'.")
        except Exception as e:
            print(f"Could not connect to MongoDB: {e}. Running in disconnected mode.")
            self.db = None

    async def close(self):
        if self.client:
            self.client.close()
            print("MongoDB connection closed.")

db = MongoDB()
