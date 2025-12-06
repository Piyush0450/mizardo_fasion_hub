import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def update_role():
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/mizardo")
    print(f"Connecting to {uri}...")
    try:
        client = AsyncIOMotorClient(uri)
        db = client.get_database()
        users_collection = db["users"]
        
        email = "piyushchaurasiya771@gmail.com"
        # Check if user exists (try both with and without .com just in case, though user said .gmail)
        # User said "piyushchaurasiya771@gmail", assuming they meant "@gmail.com" but I will check for partial match or exact if possible.
        # Actually, let's just assume standard email format first.
        
        user = await users_collection.find_one({"email": email})
        if not user:
             print(f"User {email} not found. Trying without .com...")
             email_alt = "piyushchaurasiya771@gmail"
             user = await users_collection.find_one({"email": email_alt})
             if user:
                 email = email_alt
        
        if user:
            print(f"Found user: {user.get('email')} with role: {user.get('role')}")
            result = await users_collection.update_one(
                {"email": email},
                {"$set": {"role": "super_admin"}}
            )
            print(f"Modified count: {result.modified_count}")
            
            # Verify
            updated_user = await users_collection.find_one({"email": email})
            print(f"Updated role: {updated_user.get('role')}")
        else:
            print(f"User {email} not found in database.")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(update_role())
