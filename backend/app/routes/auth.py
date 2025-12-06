from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
from ..db import db
from ..models import User, Address
import firebase_admin
from firebase_admin import auth, credentials
import os
from datetime import datetime
from bson import ObjectId

router = APIRouter()

# Initialize Firebase Admin
# TODO: Replace with path to your serviceAccountKey.json
# cred = credentials.Certificate("path/to/serviceAccountKey.json")
# firebase_admin.initialize_app(cred)

# For now, we will mock verification if no creds are present or use a placeholder
try:
    firebase_admin.get_app()
except ValueError:
    # firebase_admin.initialize_app() # Initialize without creds (works on GCP) or use placeholder
    pass

class TokenSchema(BaseModel):
    token: str

@router.post("/verify-token")
async def verify_token(token_data: TokenSchema):
    token = token_data.token
    try:
        # Verify the token
        # Verify the token
        try:
            decoded_token = auth.verify_id_token(token)
        except Exception as e:
            print(f"⚠️ Secure verification failed: {e}")
            print("⚠️ Falling back to insecure decoding for development/testing.")
            # Fallback: Insecure decode for dev without service account
            import jwt
            decoded_token = jwt.decode(token, options={"verify_signature": False})
        
        uid = decoded_token.get('uid')
        email = decoded_token.get('email')
        name = decoded_token.get('name') or email.split('@')[0]
        picture = decoded_token.get('picture')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in token")
        
        # Check if user exists in DB
        user = await db.users.find_one({"email": email})
        
        if not user:
            # Create new user
            user_dict = {
                "email": email,
                "firebase_uid": uid,
                "full_name": name,
                "photoURL": picture,
                "role": "user",
                "created_at": datetime.utcnow()
            }
            
            # HARDCODED SUPER ADMIN (Restored per user request)
            if email == "piyushchaurasiya771@gmail.com":
                user_dict["role"] = "super_admin"
            
            await db.users.insert_one(user_dict)
            user = user_dict
        else:
            # Update existing user info if needed (e.g. photo)
            update_data = {}
            if picture and user.get('photoURL') != picture:
                update_data['photoURL'] = picture
            
            # Ensure Super Admin role is enforced for this email even if it exists
            if email == "piyushchaurasiya771@gmail.com" and user.get('role') != 'super_admin':
               update_data['role'] = 'super_admin'
                
            if update_data:
                await db.users.update_one({"_id": user["_id"]}, {"$set": update_data})
                user.update(update_data)
            
        return {
            "status": "success", 
            "user": {
                "email": user["email"], 
                "role": user.get("role", "user"), 
                "full_name": user.get("full_name"),
                "addresses": user.get("addresses", [])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# Dependency to get current user
async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authentication header")
    
    token = authorization.split(" ")[1]
    
    try:
        # Verify the token
        try:
            decoded_token = auth.verify_id_token(token)
        except Exception as e:
            # Fallback: Insecure decode for dev without service account
            import jwt
            decoded_token = jwt.decode(token, options={"verify_signature": False})
        
        email = decoded_token.get('email')
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        user = await db.users.find_one({"email": email})
        if not user:
             raise HTTPException(status_code=401, detail="User not found")
        return user
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

class RoleUpdate(BaseModel):
    role: str

@router.get("/users")
async def list_users(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = {}
    if current_user.get("role") == "admin":
        query["role"] = {"$ne": "super_admin"}
        
    users_cursor = db.users.find(query)
    users = await users_cursor.to_list(length=100)
    
    # Convert ObjectId to str
    for u in users:
        u["id"] = str(u["_id"])
        del u["_id"]
        if "password_hash" in u:
            del u["password_hash"]
            
    return users
    
@router.put("/profile")
async def update_profile(data: dict, current_user: dict = Depends(get_current_user)):
    update_data = {}
    if "full_name" in data:
        update_data["full_name"] = data["full_name"]
        
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
        
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    return {"status": "success", "message": "Profile updated successfully"}

from bson import ObjectId

@router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, role_data: RoleUpdate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Only Super Admin can change roles")
    
    if role_data.role not in ["user", "admin", "super_admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role_data.role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"status": "success", "message": f"User role updated to {role_data.role}"}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Only Super Admin can delete users")
        
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"status": "success", "message": "User deleted successfully"}

@router.post("/address")
async def add_address(address: Address, current_user: dict = Depends(get_current_user)):
    # Ensure ID is set
    if not address.id:
        address.id = str(ObjectId())
        
    # If default, unset other defaults
    if address.isDefault:
        await db.users.update_one(
            {"_id": current_user["_id"], "addresses.isDefault": True},
            {"$set": {"addresses.$.isDefault": False}}
        )
    
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$push": {"addresses": address.dict()}}
    )
    
    return {"status": "success", "address": address.dict()}

@router.put("/address/{address_id}")
async def update_address(address_id: str, address_data: dict, current_user: dict = Depends(get_current_user)):
    # If setting as default, unset others first
    if address_data.get('isDefault'):
        await db.users.update_one(
            {"_id": current_user["_id"], "addresses.isDefault": True},
            {"$set": {"addresses.$.isDefault": False}}
        )
        
    # Construct update fields
    update_fields = {}
    for key, value in address_data.items():
        if key != 'id':
            update_fields[f"addresses.$.{key}"] = value
            
    result = await db.users.update_one(
        {"_id": current_user["_id"], "addresses.id": address_id},
        {"$set": update_fields}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
        
    return {"status": "success", "message": "Address updated"}

@router.delete("/address/{address_id}")
async def delete_address(address_id: str, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$pull": {"addresses": {"id": address_id}}}
    )
    return {"status": "success", "message": "Address deleted"}
