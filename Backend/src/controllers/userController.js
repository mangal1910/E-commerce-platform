const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const { hashPassword, comparePassword } = require("../utils/password");
const { sanitizeUser } = require("../utils/sanitize");
const { PLATFORM_COMMISSION_RATE } = require("./authController");
const { upload } = require("../config/cloudinary");
const { pushShippingUpdate, orderPopulate } = require("../utils/orderHelpers");

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("cart")
    .populate("wishlist");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, mobileNo, address, imageUrl } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  if (mobileNo) user.mobileNo = mobileNo;
  if (address) user.address = address;
  if (imageUrl) user.imageUrl = imageUrl;
  if (req.file?.path) user.imageUrl = req.file.path;

  await user.save();
  res.json(sanitizeUser(user));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await comparePassword(currentPassword, user.password);
  if (!match) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = await hashPassword(newPassword);
  await user.save();
  res.json({ message: "Password updated successfully" });
});

const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("cart");
  res.json(user.cart || []);
});

const addToCart = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }

  const user = await User.findById(req.user.id);
  if (!user.cart.includes(product._id)) {
    user.cart.push(product._id);
    await user.save();
  }

  const updated = await User.findById(req.user.id).populate("cart");
  res.json(updated.cart);
});

const removeFromCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.cart = user.cart.filter((id) => id.toString() !== req.params.productId);
  await user.save();
  const updated = await User.findById(req.user.id).populate("cart");
  res.json(updated.cart);
});

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist");
  res.json(user.wishlist || []);
});

const addToWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }

  const user = await User.findById(req.user.id);
  if (!user.wishlist.includes(product._id)) {
    user.wishlist.push(product._id);
    await user.save();
  }

  const updated = await User.findById(req.user.id).populate("wishlist");
  res.json(updated.wishlist);
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== req.params.productId
  );
  await user.save();
  const updated = await User.findById(req.user.id).populate("wishlist");
  res.json(updated.wishlist);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const sort = req.query.sort === "asc" ? { orderedAt: 1 } : { orderedAt: -1 };
  const orders = await Order.find({ user: req.user.id })
    .populate(orderPopulate)
    .sort(sort);
  res.json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user.id,
  }).populate(orderPopulate);

  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;
  const user = await User.findById(req.user.id).populate("cart");

  if (!shippingAddress) {
    return res.status(400).json({ message: "Shipping address is required" });
  }
  if (!user.cart?.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const items = user.cart.map((product) => ({
    product: product._id,
    seller: product.seller,
    name: product.name,
    imageUrl: product.imageUrl,
    quantity: 1,
    unitPrice: product.price,
    subtotal: product.price,
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const platformCommission = totalAmount * PLATFORM_COMMISSION_RATE;

  const deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();

  const order = await Order.create({
    user: user._id,
    items,
    shippingAddress,
    totalAmount,
    platformCommission,
    orderedAt: new Date(),
    orderStatus: "Placed",
    deliveryOTP,
    shippingUpdates: [
      {
        status: "Order Placed",
        note: "Your order has been placed successfully",
        updatedAt: new Date(),
        updatedBy: "system",
      },
    ],
  });

  for (const product of user.cart) {
    product.stock = Math.max(0, product.stock - 1);
    await product.save();
  }

  user.cart = [];
  await user.save();

  res.status(201).json(order);
});

const userHasDeliveredProduct = async (userId, productId) => {
  const orders = await Order.find({
    user: userId,
    orderStatus: "Delivered",
    "items.product": productId,
  });
  return orders.length > 0;
};

const updateProductRatingStats = async (product) => {
  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats[0]) {
    product.averageRating = Number(stats[0].averageRating.toFixed(1));
    product.ratingsCount = stats[0].count;
  } else {
    product.averageRating = 0;
    product.ratingsCount = 0;
  }
  await product.save();
};

const addReview = asyncHandler(async (req, res) => {
  const { rating, comment, orderId } = req.body;
  const productId = req.params.productId;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const canReview = await userHasDeliveredProduct(req.user.id, productId);
  if (!canReview) {
    return res.status(400).json({
      message: "You can review only after the product is delivered",
    });
  }

  const review = await Review.findOneAndUpdate(
    { user: req.user.id, product: productId },
    {
      user: req.user.id,
      product: productId,
      order: orderId || null,
      rating,
      comment: comment || "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await updateProductRatingStats(product);

  res.status(201).json(review);
});

const requestReturn = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user.id,
  });

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.orderStatus !== "Delivered") {
    return res.status(400).json({
      message: "Return can be requested only for delivered orders",
    });
  }

  if (order.returnStatus !== "None" && order.returnStatus !== "Rejected") {
    return res.status(400).json({ message: "Return already requested or processed" });
  }

  order.returnStatus = "Requested";
  order.returnReason = reason || "Customer requested return";
  order.returnRequestedAt = new Date();
  order.orderStatus = "Return Requested";
  pushShippingUpdate(
    order,
    "Return Requested",
    order.returnReason,
    "system"
  );

  // Notify each seller about the return request
  const sellerIds = [...new Set(order.items.map(item => item.seller.toString()))];
  for (const sellerId of sellerIds) {
    await require("../models/Seller").findByIdAndUpdate(sellerId, {
      $inc: { pendingReturnRequests: 1 },
    });
  }

  await order.save();
  res.json(order);
});

const uploadAvatar = upload.single("image");

module.exports = {
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
};
