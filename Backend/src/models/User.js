const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    mobileNo: { type: String, required: true },
    address: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    role: { type: String, default: "user", enum: ["user"] },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
