const Order = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");
const asyncHandler = require("../utils/asyncHandler");
const { hashPassword, comparePassword } = require("../utils/password");
const { sanitizeUser } = require("../utils/sanitize");
const { pushShippingUpdate, orderPopulate } = require("../utils/orderHelpers");

const getProfile = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findById(req.user.id).select("-password");
  if (!partner) {
    return res.status(404).json({ message: "Delivery partner not found" });
  }
  res.json(partner);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, mobileNo, imageUrl } = req.body;
  const partner = await DeliveryPartner.findById(req.user.id);
  if (!partner) {
    return res.status(404).json({ message: "Delivery partner not found" });
  }

  if (name) partner.name = name;
  if (mobileNo) partner.mobileNo = mobileNo;
  if (imageUrl) partner.imageUrl = imageUrl;

  await partner.save();
  res.json(sanitizeUser(partner));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const partner = await DeliveryPartner.findById(req.user.id);
  if (!partner) {
    return res.status(404).json({ message: "Delivery partner not found" });
  }

  const match = await comparePassword(currentPassword, partner.password);
  if (!match) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  partner.password = await hashPassword(newPassword);
  await partner.save();
  res.json({ message: "Password updated successfully" });
});

const getAssignments = asyncHandler(async (req, res) => {
  const orders = await Order.find({ deliveryPartner: req.user.id })
    .populate(orderPopulate)
    .populate({
      path: "items.seller",
      select: "name shopAddress mobileNo email",
    })
    .sort({ orderedAt: -1 });

  res.json(orders);
});

const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const allowed = ["Pending", "Picked Up", "In Transit", "Delivered to Customer"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid delivery status" });
  }

  const order = await Order.findOne({
    _id: req.params.orderId,
    deliveryPartner: req.user.id,
  });

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.deliveryClosed) {
    return res.status(400).json({ message: "Delivery is already closed" });
  }

  pushShippingUpdate(
    order,
    status,
    note || `Status updated to ${status}`,
    "deliveryPartner"
  );

  if (status === "Delivered to Customer") {
    order.orderStatus = "Delivered";
  } else if (status === "In Transit") {
    order.orderStatus = "Shipped";
  } else if (status === "Picked Up") {
    order.orderStatus = "Processing";
  }

  await order.save();
  res.json(order);
});

const closeDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    deliveryPartner: req.user.id,
  });

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.orderStatus !== "Delivered") {
    return res.status(400).json({
      message: "Mark order as Delivered to Customer before closing",
    });
  }

  if (order.deliveryClosed) {
    return res.status(400).json({ message: "Delivery already closed" });
  }

  order.deliveryClosed = true;
  order.deliveryClosedAt = new Date();
  pushShippingUpdate(
    order,
    "Delivery Closed",
    "Delivery partner closed this assignment",
    "deliveryPartner"
  );

  await order.save();
  res.json(order);
});

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  getAssignments,
  updateDeliveryStatus,
  closeDelivery,
};
