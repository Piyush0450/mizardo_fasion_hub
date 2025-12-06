# Deployment Guide

This guide describes how to deploy the Mizardo application.

## 1. Prerequisites
- **GitHub Account**: Your project must be pushed to GitHub.
- **Vercel Account**: For deploying the Frontend.
- **Render Account**: For deploying the Backend.
- **MongoDB Atlas**: You need a hosted MongoDB database (or use Render's managed MongoDB).

## 2. Backend Deployment (Render)
1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Render should automatically detect `render.yaml` in the `backend` folder.
    - If it asks for settings, ensure:
        - **Root Directory**: `backend`
        - **Runtime**: `Python 3`
        - **Build Command**: `pip install -r requirements.txt`
        - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
    Render might ask you to input these during setup, or you can add them in the "Environment" tab after creation.
    - `MONGO_URI`: Your production MongoDB connection string.
    - `RAZORPAY_KEY_ID`: Production key.
    - `RAZORPAY_KEY_SECRET`: Production secret.
    - `SMTP_PASSWORD`: Your email app password.
    - `SMTP_USER`: Your email.

## 3. Frontend Deployment (Vercel)
1. Log in to [vercel.com](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. **Configure Project**:
    - **Framework Preset**: Vite
    - **Root Directory**: Click "Edit" and select `frontend`.
5. **Environment Variables**:
    - Add the variables from your `.env` (or `.env.example`) that start with `VITE_`.
    - `VITE_FIREBASE_API_KEY`, etc.
    - **Important**: You likely need to update your Firebase settings to allow the Vercel domain (e.g., `mizardo.vercel.app`) in "Authentication -> Settings -> Authorized Domains".
    - Update `VITE_API_URL` (if you have one) to point to your **Render Backend URL** (e.g., `https://mizardo-backend.onrender.com`).

## 4. Final Steps
- Once both are deployed, verify the frontend can communicate with the backend.
- Update the frontend `VITE_API_URL` variable in Vercel to match the actual Render backend URL if you haven't already.
