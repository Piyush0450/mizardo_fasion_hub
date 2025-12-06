from fastapi import APIRouter, HTTPException, Depends, Body
from app.models import Review
from app.db import db
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/", response_model=Review)
async def create_review(review: Review):
    review_dict = review.dict()
    review_dict['created'] = datetime.utcnow()
    
    # Verify product exists
    product = await db.products.find_one({"_id": ObjectId(review.product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        new_review = await db.reviews.insert_one(review_dict)
        created_review = await db.reviews.find_one({"_id": new_review.inserted_id})
        return created_review
    except Exception as e:
        print(f"Review Creation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit review")

@router.get("/{product_id}", response_model=List[Review])
async def get_product_reviews(product_id: str):
    try:
        reviews = await db.reviews.find({"product_id": product_id}).sort("created", -1).to_list(100)
        return reviews
    except Exception as e:
        print(f"Review Fetch Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch reviews")
