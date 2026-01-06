
import requests
import json
import time

API_URL = "http://127.0.0.1:8000"

def test_razorpay_order():
    payload = {
        "user_id": "test_debug_user",
        "products": [
            {
                "product_id": "651f1e1a1234567890abcdef",
                "name": "Debug Product",
                "price": 100,
                "quantity": 1,
                "color": "Black",
                "size": "M",
                "image": "http://example.com/img.jpg"
            }
        ],
        "total_amount": 199,
        "address": {
            "fullName": "Debug User",
            "phone": "9876543210",
            "email": "debug@example.com",
            "addressLine1": "123 Debug St",
            "city": "Debug City",
            "state": "DS",
            "pincode": "123456"
        },
        "payment_method": "razorpay"
    }
    
    try:
        print("Sending request to backend...")
        response = requests.post(f"{API_URL}/orders/", json=payload)
        print(f"Status Code: {response.status_code}")
        try:
            print("Response:", response.json())
        except:
            print("Raw Response:", response.text)
            
        if response.status_code != 200:
            print("FAILED: Backend rejected the request.")
        else:
            print("SUCCESS: Order created. Backend keys are working.")
            
    except Exception as e:
        print(f"Error connecting to backend: {e}")

if __name__ == "__main__":
    test_razorpay_order()
