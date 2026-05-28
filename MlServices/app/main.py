import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.models.market_basket import get_market_basket_recommendations
from app.models.knn_recommender import get_knn_recommendations, get_user_personalized_recommendations

app = FastAPI(
    title="Project Velos - ML Recommendation Services",
    description="Python Microservice providing Market Basket Analysis (Apriori) and K-Nearest Neighbors (KNN) algorithms.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Project Velos Machine Learning Recommendation API",
        "endpoints": {
            "product_recommendations": "/recommendations/product/{product_id}?limit=5",
            "user_recommendations": "/recommendations/user/{user_id}?limit=5"
        }
    }

@app.get("/recommendations/product/{product_id}")
def get_product_recommendations(product_id: str, limit: int = 5):
    """
    Exposes product recommendations combining:
    - Market Basket Analysis (items bought together)
    - KNN Recommender (content similarity)
    """
    if not product_id:
        raise HTTPException(status_code=400, detail="product_id query parameter is required")

    mba_recs = get_market_basket_recommendations(product_id, limit=limit)
    knn_recs = get_knn_recommendations(product_id, limit=limit)

    return {
        "productId": product_id,
        "frequentlyBoughtTogether": mba_recs,
        "similarProducts": knn_recs
    }

@app.get("/recommendations/user/{user_id}")
def get_user_recommendations(user_id: str, limit: int = 5):
    """
    Exposes personalized product recommendations for a specific user based on cart/wishlist.
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    user_recs = get_user_personalized_recommendations(user_id, limit=limit)

    return {
        "userId": user_id,
        "personalizedRecommendations": user_recs
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
