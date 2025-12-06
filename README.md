# Mizardo - Luxury E-Commerce Platform

Mizardo is a full-scale luxury ecommerce system designed with a "Spotify-like" aesthetic, featuring smooth animations, dark/light themes, and green branding.

## 🚀 Features

### 🎨 UI / UX
- **Fully Modern Luxury Aesthetics**: Deep black backgrounds, green accents, rounded corners.
- **Smooth Animations**: Powered by Framer Motion.
- **Responsive Design**: Mobile-first approach.

### 🛍️ E-Commerce
- **Product Variants**: Support for multiple colors (with hex codes) and sizes.
- **Wishlist**: Save favorite items.
- **Advanced Cart**: Real-time updates, variant support.
- **Reviews & Ratings**: User-generated content.

### 🔐 Authentication & Roles
- **Firebase Authentication**: Google Sign-In and Email/Password.
- **Role-Based Access Control (RBAC)**:
    - **User**: Shop, Review, Manage Orders.
    - **Admin**: Manage Products, Orders, Shipments.
    - **Super Admin**: Manage Users (Promote/Demote).

### 💳 Payments & Checkout
- **Razorpay Integration**: Secure payment processing.
- **Address Management**: Streamlined checkout flow.

### 🚚 Logistics & Invoicing
- **Delhivery Integration**: Automated AWB generation and label creation.
- **Invoice Generation**: PDF tax invoices generated on-demand.
- **Order Tracking**: Real-time shipment tracking.

### 📊 Analytics
- **Admin Dashboard**: Visual insights into Sales, Revenue, and Top Products.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Framer Motion, Axios.
- **Backend**: FastAPI (Python), MongoDB (Motor), Pydantic.
- **Services**: Firebase Auth, Razorpay, Delhivery API.
