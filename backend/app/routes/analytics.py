from fastapi import APIRouter, HTTPException, Depends
from app.db import db
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats():
    try:
        # 1. Total Revenue
        pipeline = [
            {"$match": {"status": "paid"}},
            {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
        ]
        revenue_result = await db.orders.aggregate(pipeline).to_list(1)
        total_revenue = revenue_result[0]['total'] if revenue_result else 0

        # 2. Active Orders (paid or processing)
        active_orders = await db.orders.count_documents({"status": {"$in": ["paid", "processing"]}})

        # 3. Total Products
        total_products = await db.products.count_documents({})

        # 4. Total Users
        total_users = await db.users.count_documents({})

        return {
            "total_revenue": total_revenue,
            "active_orders": active_orders,
            "total_products": total_products,
            "total_users": total_users
        }
    except Exception as e:
        print(f"Analytics Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics data")

@router.get("/chart-data")
async def get_chart_data(period: str = "week"):
    try:
        now = datetime.utcnow()
        if period == "day":
            start_date = now - timedelta(days=1)
            start_date = start_date.replace(minute=0, second=0, microsecond=0)
            group_format = "%H:00" # Hourly
            date_format = "%Y-%m-%d %H:00:00"
        elif period == "week":
            start_date = now - timedelta(weeks=1)
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            group_format = "%Y-%m-%d" # Daily
            date_format = "%Y-%m-%d"
        elif period == "month":
            start_date = now - timedelta(days=30)
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            group_format = "%Y-%m-%d" # Daily
            date_format = "%Y-%m-%d"
        elif period == "year":
            start_date = now - timedelta(days=365)
            start_date = start_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            group_format = "%Y-%m" # Monthly
            date_format = "%Y-%m"
        else:
            raise HTTPException(status_code=400, detail="Invalid period")

        # Helper to fill missing dates
        def fill_dates(data, start, end, period_type):
            filled = []
            current = start
            data_dict = {d["date"]: d for d in data}
            
            while current <= end:
                if period_type == "day":
                    key = current.strftime("%H:00")
                    next_step = timedelta(hours=1)
                elif period_type == "year":
                    key = current.strftime("%Y-%m")
                    # Approximate month step
                    next_month = current.month + 1 if current.month < 12 else 1
                    next_year = current.year + 1 if current.month == 12 else current.year
                    next_step_date = datetime(next_year, next_month, 1)
                    next_step = next_step_date - current
                else: # week, month
                    key = current.strftime("%Y-%m-%d")
                    next_step = timedelta(days=1)
                
                filled.append(data_dict.get(key, {"date": key, "revenue": 0, "orders": 0, "products": 0, "users": 0}))
                current += next_step
            return filled

        # 1. Revenue & Orders (grouped by date)
        pipeline_orders = [
            {"$match": {"created": {"$gte": start_date}}},
            {"$group": {
                "_id": {"$dateToString": {"format": group_format, "date": "$created"}},
                "revenue": {"$sum": "$total_amount"},
                "orders": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        orders_data = await db.orders.aggregate(pipeline_orders).to_list(None)
        
        # 2. Products
        pipeline_products = [
            {"$match": {"created": {"$gte": start_date}}},
            {"$group": {
                "_id": {"$dateToString": {"format": group_format, "date": "$created"}},
                "products": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        products_data = await db.products.aggregate(pipeline_products).to_list(None)

        # 3. Users
        pipeline_users = [
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {
                "_id": {"$dateToString": {"format": group_format, "date": "$created_at"}},
                "users": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        users_data = await db.users.aggregate(pipeline_users).to_list(None)

        # Merge data
        merged = {}
        for d in orders_data:
            merged[d["_id"]] = {"date": d["_id"], "revenue": d.get("revenue", 0), "orders": d.get("orders", 0), "products": 0, "users": 0}
        
        for d in products_data:
            if d["_id"] not in merged:
                merged[d["_id"]] = {"date": d["_id"], "revenue": 0, "orders": 0, "products": 0, "users": 0}
            merged[d["_id"]]["products"] = d["products"]
            
        for d in users_data:
            if d["_id"] not in merged:
                merged[d["_id"]] = {"date": d["_id"], "revenue": 0, "orders": 0, "products": 0, "users": 0}
            merged[d["_id"]]["users"] = d["users"]

        final_data = list(merged.values())
        final_data.sort(key=lambda x: x["date"])
        
        # Fill gaps
        filled_data = fill_dates(final_data, start_date, now, period)
        
        return filled_data

    except Exception as e:
        print(f"Chart Data Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch chart data")
