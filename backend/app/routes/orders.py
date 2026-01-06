from fastapi import APIRouter, HTTPException, Depends, Body, BackgroundTasks
from fastapi.responses import JSONResponse
from app.models import Order, OrderIn
from app.db import db
from bson import ObjectId
from datetime import datetime, timedelta
import razorpay
import os
import hmac
import hashlib

router = APIRouter()

# Initialize Razorpay Client
# Using environment variables or placeholders if not set
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_placeholder')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', 'secret_placeholder')

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@router.post("/", response_model=Order)
async def create_order(order_in: OrderIn):
    order_dict = order_in.dict()
    order_dict['created'] = datetime.utcnow()
    order_dict['status'] = 'created'
    
    # Create Razorpay Order if method is razorpay
    if order_in.payment_method == 'razorpay':
        print(f"DEBUG: Processing Razorpay order for user {order_in.user_id}")
        if 'placeholder' in RAZORPAY_KEY_ID or 'placeholder' in RAZORPAY_KEY_SECRET:
             print("DEBUG: DEFAULT KEYS FOUND - THIS WILL FAIL")
             raise HTTPException(status_code=500, detail="Payment Gateway Configuration Error: Invalid Keys")
             
        try:
            data = {
                "amount": int(order_in.total_amount * 100), # Amount in paise
                "currency": "INR",
                "receipt": f"order_{datetime.utcnow().timestamp()}"
            }
            print(f"DEBUG: Creating Razorpay order with data: {data}")
            rzp_order = client.order.create(data=data)
            print(f"DEBUG: Razorpay order created: {rzp_order}")
            order_dict['razorpay_order_id'] = rzp_order['id']
        except Exception as e:
            print(f"Razorpay Error: {e}")
            raise HTTPException(status_code=500, detail=f"Payment Gateway Error: {str(e)}")
    elif order_in.payment_method == 'cod':
        order_dict['razorpay_order_id'] = None
        order_dict['razorpay_payment_id'] = None
        # Status remains 'created' until delivered and paid


    try:
        new_order = await db.orders.insert_one(order_dict)
        created_order = await db.orders.find_one({"_id": new_order.inserted_id})
        
        # Map _id to id
        created_order['id'] = str(created_order['_id'])
        
        # Notify User
        user_notification = {
            "user_id": order_in.user_id,
            "role_scope": "user",
            "type": "order",
            "title": "Order Placed Successfully",
            "message": f"Your order #{created_order['id'][-6:].upper()} has been placed.",
            "meta": {"order_id": created_order['id'], "amount": order_in.total_amount},
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        await db.notifications.insert_one(user_notification)
        
        # Notify Admins
        admin_notification = {
            "user_id": None,
            "role_scope": "all_admins",
            "type": "order",
            "title": "New Order Received",
            "message": f"New order #{created_order['id'][-6:].upper()} from {order_in.address.get('fullName')} for ₹{order_in.total_amount}",
            "meta": {"order_id": created_order['id']},
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        await db.notifications.insert_one(admin_notification)
        
        # Send Emails (User + Admin)
        from app.services.email import send_email
        
        # User Email
        if order_in.address.get("email"):
            await send_email(
                to=order_in.address["email"],
                subject=f"Order Confirmation - #{created_order['id'][-6:].upper()}",
                text=f"Thank you for your order! Total: ₹{order_in.total_amount}",
                html=f"<h1>Order Confirmed</h1><p>Total: ₹{order_in.total_amount}</p>"
            )
            
        # Admin Email (Mock - assume admin email is configured)
        # await send_email(to="admin@mizardo.com", subject="New Order", text=f"Order #{created_order['id']}")
        
        return created_order
    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create order")

@router.post("/payment/verify")
async def verify_payment(payload: dict = Body(...)):
    """
    Verify Razorpay Payment Signature
    Payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_db_id }
    """
    try:
        # Verify signature
        params_dict = {
            'razorpay_order_id': payload['razorpay_order_id'],
            'razorpay_payment_id': payload['razorpay_payment_id'],
            'razorpay_signature': payload['razorpay_signature']
        }
        
        # Verify signature using client utility
        # client.utility.verify_payment_signature(params_dict) 
        # Manual verification to be safe with mock keys sometimes
        
        msg = f"{payload['razorpay_order_id']}|{payload['razorpay_payment_id']}"
        generated_signature = hmac.new(
            bytes(RAZORPAY_KEY_SECRET, 'utf-8'),
            msg.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature == payload['razorpay_signature']:
            # Update Order Status
            await db.orders.update_one(
                {"_id": ObjectId(payload['order_db_id'])},
                {"$set": {
                    "status": "paid", 
                    "razorpay_payment_id": payload['razorpay_payment_id']
                }}
            )
            return {"status": "success"}
        else:
            raise HTTPException(status_code=400, detail="Invalid Signature")
            
    except Exception as e:
        print(f"Verification Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{order_id}/delhivery/create-shipment")
async def create_shipment(order_id: str, payload: dict = Body(...)):
    """
    Create Delhivery Shipment
    Payload: { dimensions: {length, width, height}, weight }
    """
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Mock Delhivery API Call
        # In production: requests.post('https://track.delhivery.com/waybill/api/bulk/json/...')
        
        # Simulate API delay
        # await asyncio.sleep(1)

        # Mock Response
        awb = f"DELHI{int(datetime.utcnow().timestamp())}"
        
        # Update Order
        await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {
                "status": "shipped",
                "shipment_id": f"SHIP_{awb}",
                "awb_code": awb,
                "courier_name": "Delhivery",
                "tracking_url": f"https://www.delhivery.com/track/package/{awb}",
                "shipment_created_at": datetime.utcnow(),
                "timeline": order.get('timeline', []) + [{"status": "shipped", "timestamp": datetime.utcnow()}]
            }}
        )
        
        # Create Notification for User
        notification = {
            "user_id": order["user_id"],
            "role_scope": "user",
            "type": "shipping",
            "title": "Order Shipped!",
            "message": f"Your order #{order.get('id', order_id)[-6:].upper()} has been shipped via Delhivery. AWB: {awb}",
            "meta": {"order_id": order_id, "awb": awb},
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        await db.notifications.insert_one(notification)
        
        # Send Email to User
        from app.services.email import send_email
        if order.get("address", {}).get("email"):
             await send_email(
                to=order["address"]["email"],
                subject=f"Order Shipped - #{order.get('id', order_id)[-6:].upper()}",
                text=f"Your order has been shipped. Track it here: https://www.delhivery.com/track/package/{awb}",
                html=f"<h1>Order Shipped!</h1><p>Your order has been shipped via Delhivery.</p><p>AWB: <b>{awb}</b></p>"
             )
        
        return {
            "success": True, 
            "awb": awb, 
            "message": "Shipment created with Delhivery"
        }
        
    except Exception as e:
        print(f"Shipment Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}/delhivery/label")
async def download_label(order_id: str):
    """
    Download Shipping Label (Mock PDF)
    """
    from fastapi.responses import Response
    
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order or not order.get('awb_code'):
        raise HTTPException(status_code=404, detail="Shipment not found for this order")
        
    # Mock PDF generation (just returning a simple text file pretending to be PDF for this demo, 
    # or we can use reportlab if we want a real PDF, but user said "pretend we have some PDF bytes")
    
    # Let's create a simple valid PDF using reportlab since we already use it for invoices
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A6
    import io
    
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A6)
    p.drawString(20, 400, "DELHIVERY SHIPPING LABEL")
    p.drawString(20, 380, f"AWB: {order['awb_code']}")
    p.drawString(20, 360, f"Order: {order['order_number'] if 'order_number' in order else order_id}")
    p.drawString(20, 340, "To:")
    p.drawString(20, 325, f"{order['address'].get('fullName')}")
    p.drawString(20, 310, f"{order['address'].get('city')}, {order['address'].get('pincode')}")
    p.showPage()
    p.save()
    
    pdf_bytes = buffer.getvalue()
    
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=label_{order['awb_code']}.pdf"})

@router.get("/{order_id}/track")
async def track_order(order_id: str):
    """
    Track Order (Mock Delhivery Tracking)
    """
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if not order.get('awb_code'):
        return {
            "awb": None,
            "current_status": "Processing",
            "events": []
        }
        
    # Mock Tracking Response
    return {
        "awb": order['awb_code'],
        "current_status": "In Transit",
        "events": [
            {
                "time": datetime.utcnow().isoformat(),
                "location": "New Delhi Hub",
                "status": "In Transit"
            },
            {
                "time": (datetime.utcnow() - timedelta(hours=5)).isoformat(),
                "location": "Warehouse Pickup",
                "status": "Picked Up"
            },
            {
                "time": (datetime.utcnow() - timedelta(hours=10)).isoformat(),
                "location": "Seller Warehouse",
                "status": "Manifested"
            }
        ]
    }

@router.get("/{order_id}/invoice")
async def generate_invoice(order_id: str):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    import io
    from fastapi.responses import StreamingResponse
    
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    
    # Header
    p.setFont("Helvetica-Bold", 24)
    p.drawString(50, 800, "MIZARDO INVOICE")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, 770, f"Invoice #: INV-{order_id[-6:].upper()}")
    p.drawString(50, 750, f"Date: {order['created'].strftime('%Y-%m-%d')}")
    
    # Customer Details
    p.drawString(50, 700, "Bill To:")
    p.drawString(50, 680, f"{order['address'].get('fullName', 'Customer')}")
    p.drawString(50, 665, f"{order['address'].get('addressLine1', '')}")
    p.drawString(50, 650, f"{order['address'].get('city', '')}, {order['address'].get('state', '')} - {order['address'].get('pincode', '')}")
    p.drawString(50, 635, f"Phone: {order['address'].get('phone', '')}")
    
    # Items
    y = 600
    p.drawString(50, y, "Item")
    p.drawString(300, y, "Qty")
    p.drawString(400, y, "Price")
    p.drawString(500, y, "Total")
    p.line(50, y-5, 550, y-5)
    y -= 30
    
    for item in order['products']:
        p.drawString(50, y, f"{item['name']} ({item.get('color','')}/{item.get('size','')})")
        p.drawString(300, y, str(item['quantity']))
        p.drawString(400, y, f"Rs. {item['price']}")
        p.drawString(500, y, f"Rs. {item['price'] * item['quantity']}")
        y -= 20
        
    p.line(50, y-10, 550, y-10)
    y -= 40
    
    p.setFont("Helvetica-Bold", 14)
    p.drawString(400, y, f"Total: Rs. {order['total_amount']}")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=invoice_{order_id}.pdf"})

@router.get("/{user_id}")
async def get_user_orders(user_id: str):
    if db is None:
        return JSONResponse(status_code=500, content={"error": "Database connection failed"})
        
    try:
        cursor = db.orders.find({"user_id": user_id}).sort("created", -1)
        orders = await cursor.to_list(100)
        
        result = []
        for order in orders:
            order['id'] = str(order['_id'])
            del order['_id']
            result.append(order)
                
        return result
    except Exception as e:
        print(f"Error fetching orders: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

from fastapi import BackgroundTasks

async def cleanup_orders():
    if db is None: return
    try:
        now = datetime.utcnow()
        # Delete cancelled orders older than 2 days
        await db.orders.delete_many({
            "status": "cancelled",
            "updated_at": {"$lt": now - timedelta(days=2)}
        })
        # Delete delivered orders older than 30 days
        await db.orders.delete_many({
            "status": "delivered",
            "updated_at": {"$lt": now - timedelta(days=30)}
        })
    except Exception as e:
        print(f"Cleanup Error: {e}")

@router.get("/")
async def get_all_orders(background_tasks: BackgroundTasks):
    if db is None:
        return JSONResponse(status_code=500, content={"error": "Database connection failed"})
        
    try:
        # Trigger cleanup
        background_tasks.add_task(cleanup_orders)
        
        # Admin only - TODO: Add dependency
        cursor = db.orders.find().sort("created", -1)
        orders = await cursor.to_list(100)
        
        result = []
        for order in orders:
            order['id'] = str(order['_id'])
            del order['_id']
            result.append(order)
            
        return result
    except Exception as e:
        print(f"Database Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.put("/{order_id}/status")
async def update_order_status(order_id: str, payload: dict = Body(...)):
    if db is None:
        return JSONResponse(status_code=500, content={"error": "Database connection failed"})
        
    try:
        new_status = payload.get("status")
        if new_status not in ["processing", "cancelled", "shipped", "delivered"]:
             return JSONResponse(status_code=400, content={"error": "Invalid status"})

        result = await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {
                "status": new_status,
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
             return JSONResponse(status_code=404, content={"error": "Order not found or status unchanged"})
             
        return {"status": "success", "new_status": new_status}
    except Exception as e:
        print(f"Update Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
