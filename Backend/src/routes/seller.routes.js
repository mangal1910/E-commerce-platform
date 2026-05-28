const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { registerSeller, loginSeller } = require("../controllers/authController");
const {
  getProfile,
  updateProfile,
  updatePassword,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getReviews,
  getReturnRequests,
  getAnalytics,
  getSellerOrders,
  getAvailableDeliveryPartners,
  sendShippingDetails,
  handleReturnRequest,
  uploadProductImage,
  uploadAvatar,
} = require("../controllers/sellerController");
const { uploadToCloudinary } = require("../config/cloudinary");

const router = express.Router();

router.post("/register", registerSeller);
router.post("/login", loginSeller);

router.get("/profile", protect, authorizeRoles("seller"), getProfile);
router.put(
  "/profile",
  protect,
  authorizeRoles("seller"),
  uploadAvatar,
  uploadToCloudinary,
  updateProfile
);
router.put("/password", protect, authorizeRoles("seller"), updatePassword);

router.get("/products", protect, authorizeRoles("seller"), getMyProducts);
router.post(
  "/products",
  protect,
  authorizeRoles("seller"),
  uploadProductImage,
  uploadToCloudinary,
  createProduct
);
router.put(
  "/products/:id",
  protect,
  authorizeRoles("seller"),
  uploadProductImage,
  uploadToCloudinary,
  updateProduct
);
router.delete(
  "/products/:id",
  protect,
  authorizeRoles("seller"),
  deleteProduct
);

router.get("/orders", protect, authorizeRoles("seller"), getSellerOrders);
router.get(
  "/delivery-partners",
  protect,
  authorizeRoles("seller"),
  getAvailableDeliveryPartners
);
router.get("/reviews", protect, authorizeRoles("seller"), getReviews);
router.get("/returns", protect, authorizeRoles("seller"), getReturnRequests);
router.get("/analytics", protect, authorizeRoles("seller"), getAnalytics);
router.post(
  "/shipping",
  protect,
  authorizeRoles("seller"),
  sendShippingDetails
);
router.patch(
  "/orders/:orderId/return",
  protect,
  authorizeRoles("seller"),
  handleReturnRequest
);

router.get("/dashboard", protect, authorizeRoles("seller"), getProfile);

module.exports = router;
