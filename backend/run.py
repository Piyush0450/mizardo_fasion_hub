import uvicorn
import os
import sys

if __name__ == "__main__":
    # Add the current directory to sys.path to make 'app' module resolvable
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    print("Starting Mizardo Backend...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
