const pushShippingUpdate = (order, status, note, updatedBy = "system") => {
  order.shippingUpdates.push({
    status,
    note,
    updatedAt: new Date(),
    updatedBy,
  });
};

const orderPopulate = [
  { path: "user", select: "name email mobileNo address" },
  { path: "deliveryPartner", select: "name email mobileNo" },
];

module.exports = { pushShippingUpdate, orderPopulate };
