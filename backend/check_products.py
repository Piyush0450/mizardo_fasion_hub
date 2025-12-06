import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/mizardo")

async def check_products():
    print(f"Connecting to: {MONGO_URI}")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database() # Gets the database from URI
    
    count = await db.products.count_documents({})
    print(f"Total Products: {count}")
    
    if count > 0:
        cursor = db.products.find({}).limit(5)
        async for doc in cursor:
            print(f"- {doc.get('name', 'Unknown')} ({doc.get('_id')})")

if __name__ == "__main__":
    asyncio.run(check_products())
