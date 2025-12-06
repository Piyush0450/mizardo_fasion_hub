import requests
import json

API_URL = "http://127.0.0.1:8000"
USER_ID = "test_user_123"

def test_fetch_orders():
    try:
        response = requests.get(f"{API_URL}/orders/{USER_ID}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            orders = response.json()
            print(f"Found {len(orders)} orders for user {USER_ID}")
            return orders
        else:
            print("Failed to fetch orders.")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    test_fetch_orders()
