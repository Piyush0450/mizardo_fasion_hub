import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_register():
    print("Testing Registration...")
    payload = {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        if response.status_code == 200:
            print("✅ Registration Successful")
            return True
        elif response.status_code == 400 and "already registered" in response.text:
             print("⚠️ User already exists (Expected if running twice)")
             return True
        else:
            print(f"❌ Registration Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

def test_login():
    print("Testing Login...")
    payload = {
        "email": "test@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/token", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login Successful. Token received.")
            print(f"   Role: {data['user']['role']}")
            return True
        else:
            print(f"❌ Login Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

if __name__ == "__main__":
    if test_register():
        test_login()
