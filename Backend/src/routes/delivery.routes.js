const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { loginDelivery } = require("../controllers/authController");
const {
  getProfile,
  updateProfile,
  updatePassword,
  getAssignments,
  updateDeliveryStatus,
  closeDelivery,
} = require("../controllers/deliveryController");

const router = express.Router();

router.post("/login", loginDelivery);

router.get("/profile", protect, authorizeRoles("deliveryPartner"), getProfile);
router.put("/profile", protect, authorizeRoles("deliveryPartner"), updateProfile);
router.put(
  "/password",
  protect,
  authorizeRoles("deliveryPartner"),
  updatePassword
);

router.get(
  "/assignments",
  protect,
  authorizeRoles("deliveryPartner"),
  getAssignments
);
router.patch(
  "/orders/:orderId/status",
  protect,
  authorizeRoles("deliveryPartner"),
  updateDeliveryStatus
);
router.patch(
  "/orders/:orderId/close",
  protect,
  authorizeRoles("deliveryPartner"),
  closeDelivery
);

router.get(
  "/dashboard",
  protect,
  authorizeRoles("deliveryPartner"),
  getAssignments
);

module.exports = router;
