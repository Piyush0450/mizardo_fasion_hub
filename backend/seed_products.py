import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/mizardo")

SAMPLE_PRODUCTS = [
    {
        "name": "Oversized Acid Wash Hoodie",
        "description": "Premium heavyweight cotton hoodie with a vintage acid wash finish. Features dropped shoulders and a boxy fit for the ultimate streetwear look.",
        "price": 2499.0,
        "mrp": 3999.0,
        "category": "Hoodies",
        "images": [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1578587018452-892bace13f1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        "tags": ["WINTER", "TRENDING", "OVERSIZED"],
        "variants": [
            {"color": "Charcoal", "color_code": "#36454F", "size": "M", "stock": 15},
            {"color": "Charcoal", "color_code": "#36454F", "size": "L", "stock": 20},
            {"color": "Charcoal", "color_code": "#36454F", "size": "XL", "stock": 10}
        ],
        "created": datetime.utcnow(),
        "created_by_role": "admin"
    },
    {
        "name": "Essential Cargo Pants",
        "description": "Functional and stylish cargo pants with multiple pockets. Made from durable ripstop fabric.",
        "price": 1899.0,
        "mrp": 2999.0,
        "category": "Pants",
        "images": [
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        "tags": ["UTILITY", "STREETWEAR"],
        "variants": [
            {"color": "Black", "color_code": "#000000", "size": "30", "stock": 10},
            {"color": "Black", "color_code": "#000000", "size": "32", "stock": 15},
            {"color": "Olive", "color_code": "#808000", "size": "32", "stock": 12}
        ],
        "created": datetime.utcnow(),
        "created_by_role": "admin"
    },
    {
        "name": "Graphic Print Tee",
        "description": "High-quality cotton t-shirt with a bold graphic print on the back.",
        "price": 999.0,
        "mrp": 1499.0,
        "category": "T-Shirts",
        "images": [
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        "tags": ["SUMMER", "GRAPHIC"],
        "variants": [
            {"color": "White", "color_code": "#FFFFFF", "size": "M", "stock": 25},
            {"color": "White", "color_code": "#FFFFFF", "size": "L", "stock": 25}
        ],
        "created": datetime.utcnow(),
        "created_by_role": "admin"
    }
]

async def seed_products():
    print(f"Connecting to: {MONGO_URI}")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database()
    
    print("Clearing existing products...")
    await db.products.delete_many({})
    
    print(f"Inserting {len(SAMPLE_PRODUCTS)} sample products...")
    result = await db.products.insert_many(SAMPLE_PRODUCTS)
    
    print(f"✅ Successfully inserted {len(result.inserted_ids)} products!")

if __name__ == "__main__":
    asyncio.run(seed_products())
