from app.db import db
from app.services.email import send_email
from app.models import Notification
from datetime import datetime
from bson import ObjectId

# Email Constants
NO_REPLY_EMAIL = "no-reply@mizardo.com"
SUPPORT_EMAIL = "support@mizardo.com"
ALERTS_EMAIL = "alerts@mizardo.com"
UPDATES_EMAIL = "updates@mizardo.com"

def get_from_email_for_notification_type(type: str) -> str:
    """
    Returns the appropriate sender email based on notification type.
    """
    if type in ['return', 'refund', 'support']:
        return SUPPORT_EMAIL
    elif type in ['system', 'alert', 'error']:
        return ALERTS_EMAIL
    elif type in ['collection', 'wishlist', 'loyalty', 'promo', 'broadcast']:
        return UPDATES_EMAIL
    else:
        # Default for order, payment, shipping, security, etc.
        return NO_REPLY_EMAIL

async def create_and_send_notification(
    user_id: str,
    type: str,
    title: str,
    message: str,
    meta: dict = {},
    role_scope: str = "user"
):
    """
    Creates a notification in DB and sends an email if applicable.
    """
    
    # 1. Create Notification Record
    notification = {
        "user_id": user_id,
        "role_scope": role_scope,
        "type": type,
        "title": title,
        "message": message,
        "meta": meta,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    
    # Enforce 7-notification limit for user-specific notifications
    if user_id:
        count = await db.notifications.count_documents({"user_id": user_id})
        if count >= 7:
            # Find the oldest notifications to delete
            # We want to keep the (7-1) newest, so we delete the rest
            # Actually simpler: just find all, sort desc, skip 6, and delete the rest
            cursor = db.notifications.find({"user_id": user_id}).sort("created_at", -1).skip(6)
            old_notifications = await cursor.to_list(length=100)
            if old_notifications:
                ids_to_delete = [n["_id"] for n in old_notifications]
                await db.notifications.delete_many({"_id": {"$in": ids_to_delete}})

    await db.notifications.insert_one(notification)
    
    # 2. Send Email (if it's a user-specific notification)
    if user_id:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if user and user.get("email"):
                # Personalized Greeting
                first_name = user.get("full_name", "User").split(" ")[0]
                email_body_text = f"{first_name}, {message}"
                
                # Simple HTML Template
                email_body_html = f"""
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>{title}</h2>
                    <p>Hi {first_name},</p>
                    <p>{message}</p>
                    <br>
                    <p>Regards,<br>Mizardo Team</p>
                </div>
                """
                
                from_email = get_from_email_for_notification_type(type)
                
                await send_email(
                    to=user["email"],
                    subject=title, # Could be enhanced to include Order # etc.
                    text=email_body_text,
                    html=email_body_html,
                    from_email=from_email
                )
        except Exception as e:
            print(f"Failed to send email for notification {type}: {e}")

async def broadcast_notification_service(
    scope: str,
    type: str,
    title: str,
    message: str,
    meta: dict = {}
):
    """
    Creates a broadcast notification.
    TODO: For true broadcast email, we would need a background job queue (Celery/Redis)
    to iterate all users. For now, this just creates the in-app notification.
    """
    notification = {
        "user_id": None,
        "role_scope": scope,
        "type": type,
        "title": title,
        "message": message,
        "meta": meta,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    
    await db.notifications.insert_one(notification)
    
    # NOTE: Not sending emails for broadcast here to avoid blocking the server loop
    # with thousands of emails. This should be offloaded to a worker.
    return True
