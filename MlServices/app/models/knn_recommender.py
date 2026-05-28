import math
from bson import ObjectId
from app.database import get_db

def calculate_knn_distance(target: dict, item: dict, max_price: float) -> float:
    """
    Calculates weighted multi-feature distance between a target product and a catalog item.
    """
    w_category = 0.4
    w_brand = 0.2
    w_price = 0.2
    w_rating = 0.2

    # Category overlap (categorical: 0 for match, 1 for mismatch)
    t_cat = str(target.get("category", "")).strip().lower()
    i_cat = str(item.get("category", "")).strip().lower()
    d_category = 0.0 if t_cat == i_cat else 1.0

    # Brand overlap (categorical: 0 for match, 1 for mismatch)
    t_brand = str(target.get("brand", "")).strip().lower()
    i_brand = str(item.get("brand", "")).strip().lower()
    d_brand = 0.0 if t_brand == i_brand else 1.0

    # Price difference (numerical, normalized by max price)
    t_price = float(target.get("price", 0.0))
    i_price = float(item.get("price", 0.0))
    d_price = abs(t_price - i_price) / max_price if max_price > 0 else 0.0

    # Rating difference (numerical, ratings range 0.0 to 5.0)
    t_rating = float(target.get("averageRating", 0.0))
    i_rating = float(item.get("averageRating", 0.0))
    d_rating = abs(t_rating - i_rating) / 5.0

    # Weighted Euclidean distance
    distance = math.sqrt(
        w_category * (d_category ** 2) +
        w_brand * (d_brand ** 2) +
        w_price * (d_price ** 2) +
        w_rating * (d_rating ** 2)
    )
    return distance

def get_knn_recommendations(product_id: str, limit: int = 5):
    """
    Finds top K similar products using K-Nearest Neighbors.
    """
    db = get_db()
    
    try:
        target_id = ObjectId(product_id)
    except Exception:
        return []

    target = db.products.find_one({"_id": target_id, "isActive": True})
    if not target:
        return []

    # Fetch all other active products in catalog
    all_items = list(db.products.find({"_id": {"$ne": target_id}, "isActive": True}))
    if not all_items:
        return []

    # Get max price in catalog for normalization
    prices = [float(item.get("price", 0.0)) for item in all_items] + [float(target.get("price", 0.0))]
    max_price = max(prices) if prices else 1.0
    if max_price == 0:
        max_price = 1.0

    # Compute distances
    scored_items = []
    for item in all_items:
        dist = calculate_knn_distance(target, item, max_price)
        scored_items.append((str(item["_id"]), dist))

    # Sort ascending (closest distance first)
    scored_items.sort(key=lambda x: x[1])

    return [item[0] for item in scored_items[:limit]]

def get_user_personalized_recommendations(user_id: str, limit: int = 5):
    """
    Generates personalized recommendations based on the user's cart and wishlist.
    If empty, falls back to recommending highly-rated active products.
    """
    db = get_db()
    
    try:
        u_id = ObjectId(user_id)
    except Exception:
        return []

    user = db.users.find_one({"_id": u_id})
    if not user:
        return []

    # Retrieve all item IDs in the user's cart and wishlist
    cart_items = [ObjectId(pid) for pid in user.get("cart", []) if pid]
    wishlist_items = [ObjectId(pid) for pid in user.get("wishlist", []) if pid]
    anchor_ids = list(set(cart_items + wishlist_items))
    anchor_str_set = {str(aid) for aid in anchor_ids}

    # If user has no items in cart or wishlist, fallback to top-rated active items
    if not anchor_ids:
        top_rated = db.products.find({"isActive": True}).sort("averageRating", -1).limit(limit)
        return [str(p["_id"]) for p in top_rated]

    # Fetch details for the anchor products
    anchors = list(db.products.find({"_id": {"$in": anchor_ids}, "isActive": True}))
    if not anchors:
        top_rated = db.products.find({"isActive": True}).sort("averageRating", -1).limit(limit)
        return [str(p["_id"]) for p in top_rated]

    # Fetch all candidates (active products NOT in cart/wishlist)
    candidates = list(db.products.find({
        "_id": {"$nin": anchor_ids},
        "isActive": True
    }))

    if not candidates:
        return []

    # Calculate max price
    all_prices = [float(p.get("price", 0.0)) for p in candidates] + [float(p.get("price", 0.0)) for p in anchors]
    max_price = max(all_prices) if all_prices else 1.0
    if max_price == 0:
        max_price = 1.0

    # Score each candidate product by minimum distance to ANY of the user's anchor products
    scored_candidates = []
    for candidate in candidates:
        min_dist = float("inf")
        for anchor in anchors:
            dist = calculate_knn_distance(anchor, candidate, max_price)
            if dist < min_dist:
                min_dist = dist
        scored_candidates.append((str(candidate["_id"]), min_dist))

    # Sort ascending (nearest neighbors to user's preferences first)
    scored_candidates.sort(key=lambda x: x[1])

    return [item[0] for item in scored_candidates[:limit]]
