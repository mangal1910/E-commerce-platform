const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { registerUser, loginUser } = require("../controllers/authController");
const {
  getProfile,
  updateProfile,
  updatePassword,
  getCart,
  addToCart,
  removeFromCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getMyOrders,
  getOrderById,
  placeOrder,
  addReview,
  requestReturn,
  uploadAvatar,
} = require("../controllers/userController");
const { uploadToCloudinary } = require("../config/cloudinary");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, authorizeRoles("user"), getProfile);

router.put(
  "/profile",
  protect,
  authorizeRoles("user"),
  uploadAvatar,
  uploadToCloudinary,
  updateProfile
);
router.put("/password", protect, authorizeRoles("user"), updatePassword);

router.get("/cart", protect, authorizeRoles("user"), getCart);
router.post("/cart/:productId", protect, authorizeRoles("user"), addToCart);
router.delete("/cart/:productId", protect, authorizeRoles("user"), removeFromCart);

router.get("/wishlist", protect, authorizeRoles("user"), getWishlist);
router.post("/wishlist/:productId", protect, authorizeRoles("user"), addToWishlist);
router.delete(
  "/wishlist/:productId",
  protect,
  authorizeRoles("user"),
  removeFromWishlist
);

router.get("/orders", protect, authorizeRoles("user"), getMyOrders);
router.get("/orders/:orderId", protect, authorizeRoles("user"), getOrderById);
router.post("/orders", protect, authorizeRoles("user"), placeOrder);
router.post(
  "/orders/:orderId/return",
  protect,
  authorizeRoles("user"),
  requestReturn
);

router.post(
  "/reviews/:productId",
  protect,
  authorizeRoles("user"),
  addReview
);

router.get("/dashboard", protect, authorizeRoles("user"), getProfile);

module.exports = router;
