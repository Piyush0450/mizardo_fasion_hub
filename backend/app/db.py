from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

from pathlib import Path

# Load .env from root directory
env_path = Path(__file__).resolve().parents[2] / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

try:
    client = AsyncIOMotorClient(MONGO_URI)
    db = client["mizardo"]
except Exception as e:
    print("⚠️ Could not connect to MongoDB:", e)
    # Raising error to prevent app from starting with broken DB
    raise ConnectionError(f"Could not connect to MongoDB: {e}")
