const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const DeliveryPartner = require("../models/DeliveryPartner");
const asyncHandler = require("../utils/asyncHandler");
const { hashPassword, comparePassword } = require("../utils/password");
const { sanitizeUser } = require("../utils/sanitize");
const { upload } = require("../config/cloudinary");
const { pushShippingUpdate, orderPopulate } = require("../utils/orderHelpers");

const getProfile = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.user.id).select("-password");
  if (!seller) return res.status(404).json({ message: "Seller not found" });
  res.json(seller);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, mobileNo, shopAddress, imageUrl } = req.body;
  const seller = await Seller.findById(req.user.id);
  if (!seller) return res.status(404).json({ message: "Seller not found" });

  if (name) seller.name = name;
  if (email) seller.email = email.toLowerCase();
  if (mobileNo) seller.mobileNo = mobileNo;
  if (shopAddress) seller.shopAddress = shopAddress;
  if (imageUrl) seller.imageUrl = imageUrl;
  if (req.file?.path) seller.imageUrl = req.file.path;

  await seller.save();
  res.json(sanitizeUser(seller));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const seller = await Seller.findById(req.user.id);
  if (!seller) return res.status(404).json({ message: "Seller not found" });

  const match = await comparePassword(currentPassword, seller.password);
  if (!match) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  seller.password = await hashPassword(newPassword);
  await seller.save();
  res.json({ message: "Password updated successfully" });
});

const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(products);
});

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    brand,
    price,
    stock,
    costPrice,
    imageUrl,
    specifications,
  } = req.body;

  if (!name || !category || price === undefined || price === "") {
    return res.status(400).json({
      message: "Name, category, and price are required",
    });
  }

  const finalImageUrl = req.file?.path || imageUrl;
  if (!finalImageUrl) {
    return res.status(400).json({
      message: "Product image is required. Upload an image file.",
    });
  }

  let specs = {};
  if (specifications) {
    try {
      specs =
        typeof specifications === "string"
          ? JSON.parse(specifications)
          : specifications;
    } catch {
      specs = {};
    }
  }

  const product = await Product.create({
    seller: req.user.id,
    name,
    description: description || "",
    category,
    brand: brand || "",
    price: Number(price),
    stock: Number(stock) || 0,
    imageUrl: finalImageUrl,
    specifications: specs,
    costPrice: costPrice ? Number(costPrice) : 0,
    isActive: true,
  });

  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    brand,
    price,
    stock,
    costPrice,
    specifications,
  } = req.body;

  const product = await Product.findOne({
    _id: req.params.id,
    seller: req.user.id,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (name) product.name = name;
  if (description !== undefined) product.description = description;
  if (category) product.category = category;
  if (brand !== undefined) product.brand = brand;
  if (price !== undefined && price !== "") product.price = Number(price);
  if (stock !== undefined && stock !== "") product.stock = Number(stock);
  if (costPrice !== undefined && costPrice !== "")
    product.costPrice = Number(costPrice);

  if (req.file?.path) {
    product.imageUrl = req.file.path;
  }

  if (specifications) {
    try {
      product.specifications =
        typeof specifications === "string"
          ? JSON.parse(specifications)
          : specifications;
    } catch {
      // Keep existing specifications if parsing fails
    }
  }

  await product.save();
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    seller: req.user.id,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.isActive = false;
  await product.save();
  res.json({ message: "Product removed successfully" });
});

const getReviews = asyncHandler(async (req, res) => {
  const productIds = await Product.find({ seller: req.user.id }).distinct(
    "_id"
  );
  const reviews = await Review.find({ product: { $in: productIds } })
    .populate("user", "name email")
    .populate("product", "name imageUrl")
    .sort({ createdAt: -1 });
  res.json(reviews);
});

const getReturnRequests = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    "items.seller": req.user.id,
    returnStatus: { $in: ["Requested", "Approved", "Picked Up"] },
  })
    .populate("user", "name email mobileNo")
    .populate("deliveryPartner", "name mobileNo")
    .populate("returnDeliveryPartner", "name mobileNo")
    .populate("items.product", "name imageUrl category")
    .sort({ returnRequestedAt: -1 });

  const sellerReturnRequests = orders.map((order) => {
    const sellerItems = order.items.filter(
      (item) => item.seller.toString() === req.user.id
    );
    return {
      orderId: order._id,
      user: order.user,
      items: sellerItems,
      returnStatus: order.returnStatus,
      returnReason: order.returnReason,
      returnRequestedAt: order.returnRequestedAt,
      returnDeliveryPartner: order.returnDeliveryPartner,
      returnPickedUpAt: order.returnPickedUpAt,
      shippingAddress: order.shippingAddress,
      totalAmount: sellerItems.reduce((sum, item) => sum + item.subtotal, 0),
    };
  });

  res.json(sellerReturnRequests);
});

const getAnalytics = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    "items.seller": req.user.id,
    orderStatus: { $ne: "Cancelled" },
  });

  let totalRevenue = 0;
  let totalProfit = 0;
  let returnedAmount = 0;
  let returnedProfit = 0;
  const soldItems = [];
  const returnedItems = [];

  for (const order of orders) {
    for (const item of order.items) {
      if (item.seller.toString() !== req.user.id) continue;

      const product = await Product.findById(item.product);
      const cost = product?.costPrice || 0;
      const itemProfit = item.subtotal - cost * item.quantity;

      // Check if order is returned
      if (order.returnStatus === "Completed" || order.orderStatus === "Returned") {
        returnedAmount += item.subtotal;
        returnedProfit += itemProfit;
        returnedItems.push({
          orderId: order._id,
          productName: item.name,
          quantity: item.quantity,
          amount: item.subtotal,
          profit: itemProfit,
          returnedAt: order.returnCompletedAt || order.updatedAt,
        });
      } else if (order.orderStatus !== "Return Requested") {
        // Only count non-returned orders
        totalRevenue += item.subtotal;
        totalProfit += itemProfit;
        soldItems.push({
          orderId: order._id,
          productName: item.name,
          quantity: item.quantity,
          revenue: item.subtotal,
          profit: itemProfit,
          orderedAt: order.orderedAt,
        });
      }
    }
  }

  const seller = await Seller.findById(req.user.id);
  seller.totalRevenue = totalRevenue;
  seller.totalProfit = totalProfit;
  await seller.save();

  res.json({
    totalRevenue,
    totalProfit,
    netRevenue: totalRevenue - returnedAmount,
    netProfit: totalProfit - returnedProfit,
    returnedAmount,
    returnedProfit,
    itemsSold: soldItems.length,
    itemsReturned: returnedItems.length,
    soldItems,
    returnedItems,
  });
});

const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ "items.seller": req.user.id })
    .populate(orderPopulate)
    .sort({ orderedAt: -1 });

  const filtered = orders.map((order) => {
    const obj = order.toObject();
    obj.sellerItems = obj.items.filter(
      (item) => item.seller.toString() === req.user.id
    );
    return obj;
  });

  res.json(filtered);
});

const getAvailableDeliveryPartners = asyncHandler(async (req, res) => {
  const partners = await DeliveryPartner.find({ isActive: true })
    .select("name email mobileNo")
    .sort({ name: 1 });
  res.json(partners);
});

const sendShippingDetails = asyncHandler(async (req, res) => {
  const { orderId, deliveryPartnerId, note } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const hasSellerItem = order.items.some(
    (item) => item.seller.toString() === req.user.id
  );
  if (!hasSellerItem) {
    return res.status(403).json({ message: "Not your order" });
  }

  if (!deliveryPartnerId) {
    return res.status(400).json({ message: "Delivery partner is required" });
  }

  const partner = await DeliveryPartner.findById(deliveryPartnerId);
  if (!partner || !partner.isActive) {
    return res.status(404).json({ message: "Delivery partner not found" });
  }

  order.deliveryPartner = deliveryPartnerId;
  pushShippingUpdate(
    order,
    "Pending",
    note || `Assigned to delivery partner ${partner.name}`,
    "seller"
  );
  order.orderStatus = "Processing";
  await order.save();

  const populated = await Order.findById(order._id).populate(orderPopulate);
  res.json(populated);
});

const handleReturnRequest = asyncHandler(async (req, res) => {
  const { action, returnNote, deliveryPartnerId } = req.body;
  const order = await Order.findById(req.params.orderId).populate("items.product");

  if (!order) return res.status(404).json({ message: "Order not found" });

  const sellerItems = order.items.filter(
    (item) => item.seller.toString() === req.user.id
  );
  if (sellerItems.length === 0) {
    return res.status(403).json({ message: "Not your order" });
  }

  if (order.returnStatus !== "Requested") {
    return res.status(400).json({ message: "No pending return request" });
  }

  const seller = await Seller.findById(req.user.id);

  if (action === "approve") {
    order.returnStatus = "Approved";
    order.returnNote = returnNote || "Return approved by seller";
    order.orderStatus = "Returned";
    
    // Update inventory: add stock back for seller's items
    for (const item of sellerItems) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: item.quantity },
      });
    }

    // If delivery partner assigned, mark as picked up
    if (deliveryPartnerId) {
      const partner = await DeliveryPartner.findById(deliveryPartnerId);
      if (!partner || !partner.isActive) {
        return res.status(404).json({ message: "Invalid delivery partner" });
      }

      order.returnDeliveryPartner = deliveryPartnerId;
      order.returnStatus = "Picked Up";
      order.returnPickedUpAt = new Date();
      pushShippingUpdate(
        order,
        "Return Picked Up",
        `Return picked up by ${partner.name} for return processing`,
        "system"
      );
    } else {
      pushShippingUpdate(
        order,
        "Return Approved",
        order.returnNote,
        "seller"
      );
    }

    // Decrement pending return requests
    if (seller.pendingReturnRequests > 0) {
      seller.pendingReturnRequests -= 1;
    }
    seller.totalReturnsProcessed += 1;
    await seller.save();

  } else if (action === "reject") {
    order.returnStatus = "Rejected";
    order.returnNote = returnNote || "Return rejected by seller";
    order.orderStatus = "Delivered";
    pushShippingUpdate(order, "Return Rejected", order.returnNote, "seller");

    // Decrement pending return requests
    if (seller.pendingReturnRequests > 0) {
      seller.pendingReturnRequests -= 1;
    }
    seller.totalReturnsProcessed += 1;
    await seller.save();

  } else if (action === "assignDelivery") {
    // Assign delivery partner for return pickup without approving
    if (!deliveryPartnerId) {
      return res.status(400).json({ message: "Delivery partner ID required" });
    }

    if (order.returnStatus !== "Approved") {
      return res.status(400).json({ message: "Return must be approved first" });
    }

    const partner = await DeliveryPartner.findById(deliveryPartnerId);
    if (!partner || !partner.isActive) {
      return res.status(404).json({ message: "Invalid delivery partner" });
    }

    order.returnDeliveryPartner = deliveryPartnerId;
    order.returnStatus = "Picked Up";
    order.returnPickedUpAt = new Date();
    pushShippingUpdate(
      order,
      "Return Picked Up",
      `Return picked up by ${partner.name} for return processing`,
      "system"
    );

  } else if (action === "complete") {
    // Mark return as completed
    if (order.returnStatus !== "Picked Up") {
      return res.status(400).json({ message: "Return must be picked up first" });
    }

    order.returnStatus = "Completed";
    order.returnCompletedAt = new Date();
    order.orderStatus = "Returned";
    pushShippingUpdate(
      order,
      "Return Completed",
      "Return has been completed and processed",
      "system"
    );

  } else {
    return res.status(400).json({ 
      message: "Use action: approve, reject, assignDelivery, or complete" 
    });
  }

  await order.save();
  const populated = await Order.findById(order._id).populate([
    "user",
    "deliveryPartner",
    "returnDeliveryPartner",
    "items.product",
  ]);
  res.json(populated);
});

const uploadProductImage = upload.single("image");
const uploadAvatar = upload.single("image");

module.exports = {
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
};
