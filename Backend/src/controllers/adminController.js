const Admin = require("../models/Admin");
const Seller = require("../models/Seller");
const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/Order");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { hashPassword, comparePassword } = require("../utils/password");
const { sanitizeUser } = require("../utils/sanitize");

const getProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id).select("-password");
  if (!admin) return res.status(404).json({ message: "Admin not found" });
  res.json(admin);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, mobileNo, imageUrl } = req.body;
  const admin = await Admin.findById(req.user.id);
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  if (name) admin.name = name;
  if (email) admin.email = email.toLowerCase();
  if (mobileNo) admin.mobileNo = mobileNo;
  if (imageUrl) admin.imageUrl = imageUrl;

  await admin.save();
  res.json(sanitizeUser(admin));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.user.id);
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  const match = await comparePassword(currentPassword, admin.password);
  if (!match) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  admin.password = await hashPassword(newPassword);
  await admin.save();
  res.json({ message: "Password updated successfully" });
});

const createDeliveryPartner = asyncHandler(async (req, res) => {
  const { name, email, password, mobileNo } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  const exists = await DeliveryPartner.findOne({
    email: email.toLowerCase(),
  });
  if (exists) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const hashed = await hashPassword(password);
  const partner = await DeliveryPartner.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    mobileNo: mobileNo || "",
    assignedBy: req.user.id,
  });

  res.status(201).json({
    message: "Delivery partner created",
    partner: sanitizeUser(partner),
    loginId: partner._id,
  });
});

const getDeliveryPartners = asyncHandler(async (req, res) => {
  const partners = await DeliveryPartner.find()
    .select("-password")
    .sort({ createdAt: -1 });
  res.json(partners);
});

const moderateSeller = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const seller = await Seller.findById(req.params.id);
  if (!seller) return res.status(404).json({ message: "Seller not found" });

  if (action === "block") {
    seller.isBlocked = true;
    seller.isSuspended = false;
  } else if (action === "suspend") {
    seller.isSuspended = true;
    seller.isBlocked = false;
  } else if (action === "activate") {
    seller.isBlocked = false;
    seller.isSuspended = false;
  } else {
    return res
      .status(400)
      .json({ message: "Invalid action. Use block, suspend, or activate" });
  }

  await seller.save();
  res.json(sanitizeUser(seller));
});

const getPlatformRevenue = asyncHandler(async (req, res) => {
  const orders = await Order.find({ orderStatus: { $ne: "Cancelled" } });
  const totalCommission = orders.reduce(
    (sum, o) => sum + (o.platformCommission || 0),
    0
  );
  const totalOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const [userCount, sellerCount, deliveryCount] = await Promise.all([
    User.countDocuments(),
    Seller.countDocuments(),
    DeliveryPartner.countDocuments(),
  ]);

  res.json({
    totalCommission,
    totalOrderValue,
    totalOrders: orders.length,
    metrics: { users: userCount, sellers: sellerCount, deliveryPartners: deliveryCount },
  });
});

const getSellers = asyncHandler(async (req, res) => {
  const sellers = await Seller.find().select("-password").sort({ createdAt: -1 });
  res.json(sellers);
});

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  createDeliveryPartner,
  getDeliveryPartners,
  moderateSeller,
  getPlatformRevenue,
  getSellers,
};
