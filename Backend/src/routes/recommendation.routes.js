const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const {
  getProductRecommendations,
  getUserRecommendations
} = require("../controllers/recommendationController");

const router = express.Router();

// General recommendations based on product page (unauthenticated)
router.get("/product/:productId", getProductRecommendations);

// Personalized recommendations based on user cart/wishlist (requires authentication)
router.get("/user", protect, authorizeRoles("user"), getUserRecommendations);

module.exports = router;
