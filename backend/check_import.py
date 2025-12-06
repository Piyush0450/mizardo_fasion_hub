import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app.routes import orders
    print("Import successful")
except Exception as e:
    print(f"Import failed: {e}")
