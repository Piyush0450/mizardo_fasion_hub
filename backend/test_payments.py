import requests
import os
import hmac
import hashlib

BASE_URL = "http://127.0.0.1:8000/api/payments"
# Use the placeholders or real keys if available in env
KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', 'secret_placeholder')

def test_create_order():
    print("Testing Create Order...")
    payload = {
        "orderId": "TEST-ORDER-001",
        "amount": 500 # 500 Rupees
    }
    try:
        response = requests.post(f"{BASE_URL}/create-order", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("✅ Order Created Successfully")
            print(f"   Razorpay Order ID: {data['razorpay_order_id']}")
            print(f"   Amount (paise): {data['amount']}")
            return data
        else:
            print(f"❌ Create Order Failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return None

def test_verify_payment(order_data):
    if not order_data:
        return

    print("\nTesting Payment Verification...")
    
    # Simulate a payment
    razorpay_order_id = order_data['razorpay_order_id']
    razorpay_payment_id = "pay_fake_payment_id"
    
    # Generate valid signature
    msg = f"{razorpay_order_id}|{razorpay_payment_id}"
    signature = hmac.new(
        bytes(KEY_SECRET, 'utf-8'),
        msg.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    payload = {
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": signature,
        "orderId": "TEST-ORDER-001"
    }
    
    try:
        # 1. Test Valid Signature
        response = requests.post(f"{BASE_URL}/verify", json=payload)
        if response.status_code == 200:
            print("✅ Valid Signature Verified Successfully")
        else:
            print(f"❌ Valid Signature Verification Failed: {response.status_code} - {response.text}")

        # 2. Test Invalid Signature
        payload['razorpay_signature'] = "invalid_signature_hash"
        response = requests.post(f"{BASE_URL}/verify", json=payload)
        if response.status_code == 400:
            print("✅ Invalid Signature Rejected (400)")
        else:
            print(f"❌ Invalid Signature NOT Rejected: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    order_data = test_create_order()
    test_verify_payment(order_data)
