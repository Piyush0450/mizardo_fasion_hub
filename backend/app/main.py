from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Support running directly
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.routes import products, auth, orders, reviews, analytics, payments
except ImportError:
    # Fallback if running as module
    from .routes import products, auth, orders, reviews, analytics, payments

app = FastAPI(title='Mizardo Fashion Hub API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173','http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])

app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
from app.routes import notifications
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

@app.get('/health')
async def health():
    return {'status':'ok'}


if __name__ == '__main__':
    # Allow running the app directly for development convenience. Uses
    # uvicorn if available. Prefer running with: python -m uvicorn app.main:app --reload
    try:
        import uvicorn
        uvicorn.run('app.main:app', host='127.0.0.1', port=8000, reload=True)
    except Exception:
        print('uvicorn is not installed. Run the app with:')
        print('  python -m uvicorn app.main:app --reload')
