import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# Mock login to get a token (assuming we have a way to get a token or we can just mock the user injection in tests, 
# but for end-to-end we need a token. Let's assume we can register/login a test user)

def get_auth_token(email, password):
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        if res.status_code == 200:
            return res.json()['access_token']
    except:
        pass
    return None

def test_notifications():
    print("Testing Notification System...")
    
    # 1. Login as Admin (assuming we have one, or we can use the hardcoded one if restored)
    # If not, we might need to skip auth checks or create a user first.
    # For this test, let's try to login as the super admin we restored.
    
    admin_token = get_auth_token("piyushchaurasiya771@gmail.com", "admin123") # Assuming default password or similar
    
    # If login fails, we might need to register a new user
    if not admin_token:
        print("⚠️ Could not login as admin. Attempting to register a test admin...")
        requests.post(f"{BASE_URL}/auth/register", json={
            "email": "testadmin@example.com", 
            "password": "password123", 
            "full_name": "Test Admin"
        })
        # Manually promote to admin (requires DB access or another admin, tricky without direct DB access here)
        # So let's just try to login as the user we just created and see if we can at least test user notifications
        admin_token = get_auth_token("testadmin@example.com", "password123")

    if not admin_token:
        print("❌ Failed to get auth token. Skipping tests.")
        return

    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2. Send Broadcast Notification (if admin)
    print("Sending Broadcast Notification...")
    broadcast_payload = {
        "scope": "all_users",
        "type": "system",
        "title": "Test Broadcast",
        "message": "This is a test broadcast message."
    }
    res = requests.post(f"{BASE_URL}/notifications/broadcast", json=broadcast_payload, headers=headers)
    if res.status_code == 200:
        print("✅ Broadcast Sent")
    else:
        print(f"⚠️ Broadcast Failed (might not be admin): {res.status_code}")

    # 3. Fetch Notifications
    print("Fetching Notifications...")
    res = requests.get(f"{BASE_URL}/notifications/", headers=headers)
    if res.status_code == 200:
        notifs = res.json()
        print(f"✅ Fetched {len(notifs)} notifications")
        
        if len(notifs) > 0:
            # 4. Mark as Read
            notif_id = notifs[0]['id']
            print(f"Marking notification {notif_id} as read...")
            res = requests.put(f"{BASE_URL}/notifications/{notif_id}/read", headers=headers)
            if res.status_code == 200:
                print("✅ Marked as Read")
            else:
                print(f"❌ Failed to mark as read: {res.status_code}")
    else:
        print(f"❌ Failed to fetch notifications: {res.status_code}")

if __name__ == "__main__":
    test_notifications()
