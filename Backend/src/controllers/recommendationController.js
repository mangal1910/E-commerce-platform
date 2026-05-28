const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// Helper to keep products in specific ID sorted order
const sortProductsByIds = (products, ids) => {
  const idStrList = ids.map(id => id.toString());
  return products
    .sort((a, b) => idStrList.indexOf(a._id.toString()) - idStrList.indexOf(b._id.toString()));
};

const getProductRecommendations = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const limit = parseInt(req.query.limit) || 5;

  const targetProduct = await Product.findById(productId);
  if (!targetProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  let frequentlyBoughtTogether = [];
  let similarProducts = [];

  try {
    // Query standalone Python ML microservice
    const mlResponse = await fetch(`${ML_SERVICE_URL}/recommendations/product/${productId}?limit=${limit}`);
    
    if (mlResponse.ok) {
      const data = await mlResponse.json();
      const mbaIds = data.frequentlyBoughtTogether || [];
      const knnIds = data.similarProducts || [];

      // Fetch and populate Product details for frequently bought together items
      if (mbaIds.length > 0) {
        const products = await Product.find({
          _id: { $in: mbaIds },
          isActive: true
        }).populate("seller", "name shopAddress");
        frequentlyBoughtTogether = sortProductsByIds(products, mbaIds);
      }

      // Fetch and populate Product details for similar items
      if (knnIds.length > 0) {
        const products = await Product.find({
          _id: { $in: knnIds },
          isActive: true
        }).populate("seller", "name shopAddress");
        similarProducts = sortProductsByIds(products, knnIds);
      }
    } else {
      console.warn("ML Service returned non-200 response. Using fallbacks.");
    }
  } catch (error) {
    console.error("Failed to connect to ML Microservice:", error.message);
  }

  // --- Fallbacks if ML Service is unreachable or returns empty ---
  if (similarProducts.length === 0) {
    // KNN Fallback: Same category, sorting by ratings
    similarProducts = await Product.find({
      category: targetProduct.category,
      _id: { $ne: productId },
      isActive: true
    })
      .populate("seller", "name shopAddress")
      .sort({ averageRating: -1 })
      .limit(limit);
  }

  if (frequentlyBoughtTogether.length === 0) {
    // MBA Fallback: Other popular items in same category, excluding those in similar list
    const excludedIds = [productId, ...similarProducts.map(p => p._id.toString())];
    frequentlyBoughtTogether = await Product.find({
      category: targetProduct.category,
      _id: { $nin: excludedIds },
      isActive: true
    })
      .populate("seller", "name shopAddress")
      .sort({ ratingsCount: -1 })
      .limit(limit);
  }

  res.json({
    productId,
    frequentlyBoughtTogether,
    similarProducts
  });
});

const getUserRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 5;

  let personalizedRecommendations = [];

  try {
    // Query standalone Python ML microservice
    const mlResponse = await fetch(`${ML_SERVICE_URL}/recommendations/user/${userId}?limit=${limit}`);
    
    if (mlResponse.ok) {
      const data = await mlResponse.json();
      const recIds = data.personalizedRecommendations || [];

      if (recIds.length > 0) {
        const products = await Product.find({
          _id: { $in: recIds },
          isActive: true
        }).populate("seller", "name shopAddress");
        personalizedRecommendations = sortProductsByIds(products, recIds);
      }
    }
  } catch (error) {
    console.error("Failed to connect to ML Microservice for user recs:", error.message);
  }

  // Fallback: Recommend highest rated items across the platform
  if (personalizedRecommendations.length === 0) {
    personalizedRecommendations = await Product.find({ isActive: true })
      .populate("seller", "name shopAddress")
      .sort({ averageRating: -1 })
      .limit(limit);
  }

  res.json(personalizedRecommendations);
});

module.exports = {
  getProductRecommendations,
  getUserRecommendations
};
