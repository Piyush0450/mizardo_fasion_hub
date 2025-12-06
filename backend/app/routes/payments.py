from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import razorpay
import os
import hmac
import hashlib
from typing import Optional

router = APIRouter()

# 1. Settings / Config
# Load keys from environment variables
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_placeholder')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', 'secret_placeholder')

# Initialize Razorpay Client
try:
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except Exception as e:
    print(f"Warning: Razorpay client initialization failed: {e}")
    client = None

# 2. Pydantic Models
class CreateOrderRequest(BaseModel):
    orderId: str
    amount: float # in rupees

class CreateOrderResponse(BaseModel):
    razorpay_key_id: str
    razorpay_order_id: str
    amount: int # in paise
    currency: str = "INR"

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    orderId: Optional[str] = None

# 3. Endpoints

@router.post("/create-order", response_model=CreateOrderResponse)
async def create_payment_order(request: CreateOrderRequest):
    """
    Creates a Razorpay order.
    Input: orderId (internal), amount (rupees)
    Output: razorpay_order_id, key_id, amount (paise)
    """
    if not client:
        raise HTTPException(status_code=500, detail="Razorpay client not initialized")

    try:
        amount_paise = int(request.amount * 100)
        
        data = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": request.orderId,
            "payment_capture": 1 # Auto capture
        }
        
        # Call Razorpay Orders API
        rzp_order = client.order.create(data=data)
        
        # In a real app, you would save the mapping request.orderId <-> rzp_order['id'] in DB here
        
        return CreateOrderResponse(
            razorpay_key_id=RAZORPAY_KEY_ID,
            razorpay_order_id=rzp_order['id'],
            amount=amount_paise,
            currency="INR"
        )
        
    except Exception as e:
        print(f"Error creating Razorpay order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
async def verify_payment(request: VerifyPaymentRequest):
    """
    Verifies Razorpay payment signature.
    """
    try:
        # Compute signature
        msg = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
        
        generated_signature = hmac.new(
            bytes(RAZORPAY_KEY_SECRET, 'utf-8'),
            msg.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature == request.razorpay_signature:
            # Payment Verified
            # In a real app, update order status in DB to 'paid' here
            
            return {
                "success": True, 
                "message": "Payment verified", 
                "orderId": request.orderId,
                "razorpay_payment_id": request.razorpay_payment_id
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid signature")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error verifying payment: {e}")
        raise HTTPException(status_code=500, detail=str(e))
