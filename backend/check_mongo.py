import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

from dotenv import load_dotenv

load_dotenv()

async def check_mongo():
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/mizardo")
    print(f"Connecting to {uri}...")
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=2000)
        await client.server_info()
        print("✅ MongoDB is running and accessible.")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_mongo())
