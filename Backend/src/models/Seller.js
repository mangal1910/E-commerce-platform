const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    mobileNo: { type: String, required: true },
    shopAddress: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    role: { type: String, default: "seller", enum: ["seller"] },
    isBlocked: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    totalRevenue: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    pendingReturnRequests: { type: Number, default: 0 },
    totalReturnsProcessed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", sellerSchema);
