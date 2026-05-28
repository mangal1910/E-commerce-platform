const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { loginAdmin } = require("../controllers/authController");
const {
  getProfile,
  updateProfile,
  updatePassword,
  createDeliveryPartner,
  getDeliveryPartners,
  moderateSeller,
  getPlatformRevenue,
  getSellers,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/login", loginAdmin);

router.get("/profile", protect, authorizeRoles("admin"), getProfile);
router.put("/profile", protect, authorizeRoles("admin"), updateProfile);
router.put("/password", protect, authorizeRoles("admin"), updatePassword);

router.post(
  "/delivery-partners",
  protect,
  authorizeRoles("admin"),
  createDeliveryPartner
);
router.get(
  "/delivery-partners",
  protect,
  authorizeRoles("admin"),
  getDeliveryPartners
);

router.get("/sellers", protect, authorizeRoles("admin"), getSellers);
router.patch(
  "/sellers/:id/moderate",
  protect,
  authorizeRoles("admin"),
  moderateSeller
);

router.get("/revenue", protect, authorizeRoles("admin"), getPlatformRevenue);
router.get("/dashboard", protect, authorizeRoles("admin"), getPlatformRevenue);

module.exports = router;
