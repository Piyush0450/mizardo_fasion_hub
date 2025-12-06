import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_product_security():
    print("Testing Product Security...")
    
    # 1. Try to delete a product without auth
    try:
        # Use a fake ID
        response = requests.delete(f"{BASE_URL}/products/656c73656c73656c73656c73")
        if response.status_code == 401:
            print("✅ Unauthenticated delete blocked (401)")
        else:
            print(f"❌ Unauthenticated delete NOT blocked: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

    # 2. Try to update a product without auth
    try:
        # Send a valid-ish payload to avoid 422 validation error hiding the 401
        payload = {
            "name": "Hacked Product",
            "description": "Hacked",
            "price": 100,
            "category": "Men",
            "images": ["http://example.com/img.jpg"],
            "variants": [{"color": "Red", "size": "M", "stock": 10}]
        }
        response = requests.put(f"{BASE_URL}/products/656c73656c73656c73656c73", json=payload)
        if response.status_code == 401:
            print("✅ Unauthenticated update blocked (401)")
        else:
            print(f"❌ Unauthenticated update NOT blocked: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_auth_verification():
    print("\nTesting Auth Verification...")
    # Try to verify a fake token
    try:
        response = requests.post(f"{BASE_URL}/auth/verify-token", json={"token": "fake_token"})
        # Should be 401 because verify_id_token will fail and we catch it
        if response.status_code == 401:
            print("✅ Invalid token rejected (401)")
        else:
            print(f"❌ Invalid token NOT rejected properly: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_product_security()
    test_auth_verification()
