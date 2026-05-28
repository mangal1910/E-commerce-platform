const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingUpdateSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "Order Placed",
        "Pending",
        "Picked Up",
        "In Transit",
        "Delivered to Customer",
        "Delivery Closed",
        "Return Requested",
        "Return Approved",
        "Return Rejected",
        "Return Picked Up",
        "Return Completed",
      ],
      default: "Pending",
    },
    note: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: {
      type: String,
      enum: ["system", "seller", "deliveryPartner"],
      default: "system",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
    },
    shippingAddress: { type: String, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    platformCommission: { type: Number, default: 0, min: 0 },
    shippingUpdates: { type: [shippingUpdateSchema], default: [] },
    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Return Requested",
        "Returned",
        "Cancelled",
      ],
      default: "Placed",
      index: true,
    },
    returnStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Picked Up", "Completed", "Rejected"],
      default: "None",
    },
    returnReason: { type: String, default: "" },
    returnNote: { type: String, default: "" },
    returnRequestedAt: { type: Date, default: null },
    returnDeliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
    },
    returnPickedUpAt: { type: Date, default: null },
    returnCompletedAt: { type: Date, default: null },
    deliveryClosed: { type: Boolean, default: false },
    deliveryClosedAt: { type: Date, default: null },
    orderedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
