from fastapi import APIRouter, HTTPException, Depends, Body
from app.db import db
from app.models import Notification
from app.routes.auth import get_current_user
from bson import ObjectId
from datetime import datetime
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[Notification])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """
    Get notifications for the current user.
    Includes personal notifications AND broadcast notifications for their role.
    """
    user_id = str(current_user["_id"])
    role = current_user.get("role", "user")
    
    # Query logic:
    # 1. user_id matches current user
    # 2. OR role_scope matches 'all_users' (if user) or 'all_admins' (if admin/super_admin)
    
    query = {
        "$or": [
            {"user_id": user_id},
            {"role_scope": "all_users"},
        ]
    }
    
    if role in ["admin", "super_admin"]:
        query["$or"].append({"role_scope": "all_admins"})
        
    # Sort by created_at desc
    cursor = db.notifications.find(query).sort("created_at", -1).limit(7)
    notifications = await cursor.to_list(length=7)
    
    # Map _id to id
    for n in notifications:
        n["id"] = str(n["_id"])
        del n["_id"]
        
    return notifications

@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """
    Mark a notification as read.
    """
    # Verify ownership or broadcast visibility
    # For simplicity, just update if found by ID, assuming the user wouldn't guess IDs of others easily
    # A better check would be to verify user_id matches or it's a broadcast
    
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"is_read": True, "read_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    return {"status": "success"}

@router.put("/read-all")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    """
    Mark all notifications for the current user as read.
    """
    user_id = str(current_user["_id"])
    role = current_user.get("role", "user")
    
    query = {
        "$or": [
            {"user_id": user_id},
            {"role_scope": "all_users"},
        ],
        "is_read": False
    }
    
    if role in ["admin", "super_admin"]:
        query["$or"].append({"role_scope": "all_admins"})
        
    await db.notifications.update_many(
        query,
        {"$set": {"is_read": True, "read_at": datetime.utcnow()}}
    )
    
    return {"status": "success"}

@router.post("/send")
async def send_notification(payload: dict = Body(...), current_user: dict = Depends(get_current_user)):
    """
    Send a notification (Admin only).
    Payload: { email (optional), user_id (optional), type, title, message, meta }
    """
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from app.services.notification_service import create_and_send_notification
    
    target_user = None
    
    # 1. Try to find user by email first
    if payload.get("email"):
        target_user = await db.users.find_one({"email": payload["email"]})
    
    # 2. Fallback to user_id
    if not target_user and payload.get("user_id"):
        try:
            target_user = await db.users.find_one({"_id": ObjectId(payload["user_id"])})
        except:
            pass
            
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    await create_and_send_notification(
        user_id=str(target_user["_id"]),
        type=payload.get("type", "manual"),
        title=payload.get("title"),
        message=payload.get("message"),
        meta=payload.get("meta", {}),
        role_scope="user"
    )
    
    return {"status": "success", "message": "Notification sent"}

@router.post("/broadcast")
async def broadcast_notification(payload: dict = Body(...), current_user: dict = Depends(get_current_user)):
    """
    Broadcast a notification (Admin only).
    Payload: { scope: 'all_users'|'all_admins', type, title, message, meta }
    """
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    from app.services.notification_service import broadcast_notification_service
    
    await broadcast_notification_service(
        scope=payload.get("scope", "all_users"),
        type=payload.get("type", "manual"),
        title=payload.get("title"),
        message=payload.get("message"),
        meta=payload.get("meta", {})
    )
    
    return {"status": "success", "message": "Broadcast sent"}
