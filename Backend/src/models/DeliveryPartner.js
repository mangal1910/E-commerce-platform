const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    mobileNo: { type: String, default: "" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    role: {
      type: String,
      default: "deliveryPartner",
      enum: ["deliveryPartner"],
    },
    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
