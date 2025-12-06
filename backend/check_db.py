import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

async def check_connection():
    print(f"Attempting to connect to: {MONGO_URI}")
    try:
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("✅ MongoDB is CONNECTED!")
    except Exception as e:
        print(f"❌ MongoDB Connection FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(check_connection())
