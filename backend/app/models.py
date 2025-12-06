from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class ProductVariant(BaseModel):
    color: str
    color_code: str # Hex code
    size: str
    stock: int

class ProductIn(BaseModel):
    name: str
    description: Optional[str] = ''
    price: float
    mrp: Optional[float] = 0.0
    discount: Optional[float] = 0.0
    images: List[str] = []
    category: Optional[str] = 'hoodies'
    tags: List[str] = [] # NEW, TRENDING, etc.
    variants: List[ProductVariant] = []
    
    # Deprecated but kept for backward compatibility if needed
    sizes: List[str] = [] 
    inventory: int = 0

class Product(ProductIn):
    id: str # Changed from _id to id for consistency

class OrderIn(BaseModel):
    user_id: str
    products: List[dict] # [{product_id, name, price, quantity, color, size, image}]
    total_amount: float
    address: dict # {street, city, state, zip, phone}
    payment_method: str = 'razorpay' # razorpay or cod

class Order(OrderIn):
    id: str
    status: str = 'created' # created, paid, processing, shipped, delivered, cancelled
    created: datetime = Field(default_factory=datetime.utcnow)
    
    # Payment Details
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    
    # Shipment Details
    shipment_id: Optional[str] = None
    awb_code: Optional[str] = None
    courier_name: Optional[str] = None
    tracking_url: Optional[str] = None
    
    # Invoice Details
    invoice_number: Optional[str] = None
    invoice_url: Optional[str] = None
    invoice_date: Optional[datetime] = None
    
    # Timeline
    timeline: List[dict] = [] # [{status: 'created', timestamp: datetime}]

class Review(BaseModel):
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created: datetime = Field(default_factory=datetime.utcnow)

class Address(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    fullName: str
    phone: str
    email: str
    addressLine1: str
    city: str
    state: str
    pincode: str
    isDefault: bool = False

class User(BaseModel):
    email: str
    password_hash: str = '' # Optional for Firebase users
    full_name: str
    photoURL: Optional[str] = None
    role: str = 'user' # user, admin, super_admin
    addresses: List[Address] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    user_id: Optional[str] = None # null for broadcast
    role_scope: str = "user" # user, all_users, admin, all_admins, super_admin
    type: str # order, payment, shipping, etc.
    title: str
    message: str
    meta: dict = {}
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read_at: Optional[datetime] = None
