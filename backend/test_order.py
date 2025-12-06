import requests
import json

API_URL = "http://127.0.0.1:8000"

def test_create_order():
    payload = {
        "user_id": "test_user_123",
        "products": [
            {
                "product_id": "prod_1",
                "name": "Test Product",
                "price": 1000,
                "quantity": 1,
                "color": "Black",
                "size": "M",
                "image": "http://example.com/image.jpg"
            }
        ],
        "total_amount": 1000,
        "address": {
            "fullName": "Test User",
            "phone": "1234567890",
            "email": "test@example.com",
            "addressLine1": "123 Test St",
            "city": "Test City",
            "state": "Test State",
            "pincode": "123456"
        },
        "payment_method": "cod"
    }

    try:
        response = requests.post(f"{API_URL}/orders/", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("Order created successfully!")
            order_id = response.json()['id']
            print(f"Order ID: {order_id}")
            return order_id
        else:
            print("Failed to create order.")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    test_create_order()
