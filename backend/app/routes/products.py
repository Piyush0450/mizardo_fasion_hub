from fastapi import APIRouter, HTTPException
from ..db import db
from ..models import ProductIn
from bson import ObjectId
from datetime import datetime
import asyncio
from fastapi import Depends
from .auth import get_current_user

router = APIRouter()

def serialize(doc):
    doc['_id'] = str(doc['_id'])
    return doc

@router.get('/')
async def list_products(
    category: str = None,
    min_price: float = None,
    max_price: float = None,
    color: str = None,
    size: str = None,
    sort: str = None # price_asc, price_desc, newest
):
    query = {}
    if category:
        query['category'] = category
    
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
            
    if color:
        query['variants.color'] = color
        
    if size:
        query['variants.size'] = size
        
    cursor = db.products.find(query)
    
    if sort == 'price_asc':
        cursor.sort('price', 1)
    elif sort == 'price_desc':
        cursor.sort('price', -1)
    else:
        cursor.sort('created', -1) # Default newest

    items = []
    async for doc in cursor:
        items.append(serialize(doc))
    return items

@router.get('/featured')
async def get_featured_products():
    # Filter for products created by admin or super_admin
    query = {
        'created_by_role': {'$in': ['admin', 'super_admin']}
    }
    # Sort by newest first and limit to 3
    cursor = db.products.find(query).sort('created', -1).limit(3)
    
    items = []
    async for doc in cursor:
        items.append(serialize(doc))
    return items

@router.get('/new')
async def get_new_products():
    # Fetch 7 newest products
    cursor = db.products.find({}).sort('created', -1).limit(7)
    items = []
    async for doc in cursor:
        items.append(serialize(doc))
    return items

@router.post('/')
async def create_product(p: ProductIn, current_user: dict = Depends(get_current_user)):
    if current_user.get('role') not in ['admin', 'super_admin']:
        raise HTTPException(403, 'Not authorized to create products')
        
    doc = p.dict()
    doc['created'] = datetime.utcnow()
    doc['created_by_role'] = current_user.get('role')
    res = await db.products.insert_one(doc)
    doc['_id'] = str(res.inserted_id)
    return doc

@router.get('/{product_id}')
async def get_product(product_id: str):
    try:
        doc = await db.products.find_one({'_id': ObjectId(product_id)})
    except Exception:
        raise HTTPException(400, 'Invalid product id')
    if not doc:
        raise HTTPException(404, 'Product not found')
    return serialize(doc)

@router.put('/{product_id}')
async def update_product(product_id: str, p: ProductIn, current_user: dict = Depends(get_current_user)):
    if current_user.get('role') not in ['admin', 'super_admin']:
        raise HTTPException(403, 'Not authorized to update products')
    try:
        oid = ObjectId(product_id)
    except:
        raise HTTPException(400, 'Invalid product id')
        
    doc = p.dict()
    # Remove None values to avoid overwriting with nulls if partial update (though ProductIn is full model)
    # For now assuming full update
    
    result = await db.products.update_one({'_id': oid}, {'$set': doc})
    if result.matched_count == 0:
        raise HTTPException(404, 'Product not found')
        
    doc['_id'] = product_id
    return doc

@router.delete('/{product_id}')
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get('role') not in ['admin', 'super_admin']:
        raise HTTPException(403, 'Not authorized to delete products')
    try:
        oid = ObjectId(product_id)
    except:
        raise HTTPException(400, 'Invalid product id')
        
    result = await db.products.delete_one({'_id': oid})
    if result.deleted_count == 0:
        raise HTTPException(404, 'Product not found')
    return {'status': 'deleted'}
