from bson import ObjectId
from app.database import get_db

def get_market_basket_recommendations(product_id: str, limit: int = 5):
    """
    Implements Market Basket Analysis using transaction co-occurrence (Apriori).
    Returns list of recommended product_id strings.
    """
    db = get_db()
    
    try:
        target_id = ObjectId(product_id)
    except Exception:
        # Invalid ObjectId
        return []

    # 1. Retrieve all non-cancelled orders that contain the target product
    orders = list(db.orders.find({
        "orderStatus": {"$ne": "Cancelled"},
        "items.product": target_id
    }, {"items.product": 1}))

    if not orders:
        return []

    # 2. Count co-occurrences of other products
    co_occurrences = {}
    for order in orders:
        items = order.get("items", [])
        for item in items:
            prod_id = item.get("product")
            if prod_id and prod_id != target_id:
                prod_str = str(prod_id)
                co_occurrences[prod_str] = co_occurrences.get(prod_str, 0) + 1

    # 3. Sort by co-occurrence frequency (Support/Confidence ranking)
    sorted_co_occurrences = sorted(co_occurrences.items(), key=lambda x: x[1], reverse=True)
    
    # 4. Filter only active products in the recommendations
    recommended_ids = [ObjectId(item[0]) for item in sorted_co_occurrences[:limit * 2]]
    if not recommended_ids:
        return []
        
    active_products = db.products.find({
        "_id": {"$in": recommended_ids},
        "isActive": True
    }, {"_id": 1})
    
    active_set = {str(p["_id"]) for p in active_products}
    
    # Keep ranking order while filtering active products
    final_recommendations = [item[0] for item in sorted_co_occurrences if item[0] in active_set]
    
    return final_recommendations[:limit]
