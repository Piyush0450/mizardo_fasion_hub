import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_shipping_flow():
    print("Testing Shipping Flow...")
    
    # 1. Create a dummy order first (or find existing one)
    # For simplicity, let's assume we have an order or create one
    # Note: This requires the backend to be running
    
    # Create a dummy order
    order_payload = {
        "user_id": "test_user_123",
        "products": [
            {
                "product_id": "prod_1",
                "name": "Test Product",
                "price": 1000,
                "quantity": 1,
                "image": "http://example.com/img.jpg"
            }
        ],
        "total_amount": 1000,
        "address": {
            "fullName": "Test User",
            "phone": "9999999999",
            "addressLine1": "123 Test St",
            "city": "Test City",
            "state": "Test State",
            "pincode": "123456"
        },
        "payment_method": "cod"
    }
    
    try:
        # Create Order
        print("Creating Order...")
        res = requests.post(f"{BASE_URL}/orders/", json=order_payload)
        if res.status_code != 200:
            print(f"Failed to create order: {res.text}")
            return
            
        order = res.json()
        order_id = order['id']
        print(f"Order Created: {order_id}")
        
        # 2. Create Shipment
        print(f"Creating Shipment for {order_id}...")
        shipment_payload = {
            "dimensions": {"length": 10, "width": 10, "height": 10},
            "weight": 0.5
        }
        res = requests.post(f"{BASE_URL}/orders/{order_id}/delhivery/create-shipment", json=shipment_payload)
        
        if res.status_code == 200:
            print("✅ Shipment Created Successfully")
            print(json.dumps(res.json(), indent=2))
        else:
            print(f"❌ Shipment Creation Failed: {res.text}")
            return

        # 3. Download Label
        print(f"Downloading Label for {order_id}...")
        res = requests.get(f"{BASE_URL}/orders/{order_id}/delhivery/label")
        
        if res.status_code == 200 and res.headers['content-type'] == 'application/pdf':
            print("✅ Label Downloaded Successfully (PDF)")
            # with open(f"label_{order_id}.pdf", "wb") as f:
            #     f.write(res.content)
        else:
            print(f"❌ Label Download Failed: {res.status_code}")
            
        # 4. Track Order
        print(f"Tracking Order {order_id}...")
        res = requests.get(f"{BASE_URL}/orders/{order_id}/track")
        
        if res.status_code == 200:
            data = res.json()
            if data['awb']:
                print("✅ Tracking Data Fetched Successfully")
                print(json.dumps(data, indent=2))
            else:
                print("❌ Tracking Data Empty (AWB missing?)")
        else:
            print(f"❌ Tracking Failed: {res.text}")
            
    except Exception as e:
        print(f"Test Failed with Exception: {e}")

if __name__ == "__main__":
    test_shipping_flow()
