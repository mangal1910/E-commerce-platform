import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import OrderStatusTimeline from "../../components/OrderStatusTimeline";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/Loader";

const nav = [
  { to: "/user/dashboard", label: "Profile" },
  { to: "/user/shop", label: "Shop" },
  { to: "/user/cart", label: "Cart" },
  { to: "/user/wishlist", label: "Wishlist" },
  { to: "/user/orders", label: "My Orders" },
];

const RETURN_REASONS = [
  { id: "defective", label: "Product is defective/broken", icon: "⚠️" },
  { id: "not_as_expected", label: "Not as expected/described", icon: "❌" },
  { id: "damaged", label: "Received damaged", icon: "📦" },
  { id: "wrong_item", label: "Wrong item received", icon: "❓" },
  { id: "size_fit", label: "Size/fit not suitable", icon: "📏" },
  { id: "changed_mind", label: "Changed my mind", icon: "🤔" },
  { id: "other", label: "Other reason", icon: "💭" },
];

const MyOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [sort, setSort] = useState("desc");
  const [expanded, setExpanded] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    return api.get("/user/orders", { params: { sort } })
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [sort]);

  const openReturnModal = (orderId) => {
    setReturnModal(orderId);
    setSelectedReason("");
    setCustomReason("");
  };

  const closeReturnModal = () => {
    setReturnModal(null);
    setSelectedReason("");
    setCustomReason("");
  };

  const requestReturn = async () => {
    if (!selectedReason) {
      showToast("Please select a return reason", "error");
      return;
    }

    const selectedReasonObj = RETURN_REASONS.find((r) => r.id === selectedReason);
    let reason = selectedReasonObj.label;

    if (selectedReason === "other" && customReason.trim()) {
      reason = customReason.trim();
    } else if (customReason.trim()) {
      reason = `${selectedReasonObj.label}: ${customReason.trim()}`;
    }

    setSubmitting(true);
    try {
      await api.post(`/user/orders/${returnModal}/return`, { reason });
      showToast("Return request submitted successfully!");
      closeReturnModal();
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Return failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={nav}>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader size="xl" color="blue" />
          <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">
            Loading your orders...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={nav}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Orders</h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="rounded-xl border bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() =>
                setExpanded(expanded === order._id ? null : order._id)
              }
              className="flex w-full items-start justify-between text-left"
            >
              <div>
                <p className="font-semibold">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(order.orderedAt).toLocaleString()}
                </p>
                <p className="mt-1 text-sm">
                  Status:{" "}
                  <span className="font-medium text-blue-600">
                    {order.orderStatus}
                  </span>
                  {order.deliveryClosed && (
                    <span className="ml-2 text-green-600">· Delivery closed</span>
                  )}
                </p>
              </div>
              <p className="text-lg font-bold">₹{order.totalAmount}</p>
            </button>

            {expanded === order._id && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-slate-600">
                  Ship to: {order.shippingAddress}
                </p>
                {order.deliveryPartner && (
                  <p className="mt-1 text-sm text-slate-600">
                    Delivery: {order.deliveryPartner.name} ·{" "}
                    {order.deliveryPartner.mobileNo}
                  </p>
                )}
                {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && order.deliveryOTP && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                    <span className="font-semibold">🔑 Delivery OTP:</span>
                    <span className="font-mono text-base font-extrabold tracking-widest bg-white border border-amber-300 px-2 py-0.5 rounded shadow-sm">
                      {order.deliveryOTP}
                    </span>
                    <span className="text-xs text-amber-600 font-medium ml-1">
                      (Provide this OTP to the delivery agent to confirm delivery)
                    </span>
                  </div>
                )}

                <ul className="mt-3 space-y-2">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-2 rounded-lg border p-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <Link
                          to={`/user/product/${item.product}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {item.name}
                        </Link>
                      </div>
                      <span>×{item.quantity}</span>
                    </li>
                  ))}
                </ul>

                <OrderStatusTimeline
                  updates={order.shippingUpdates}
                  orderStatus={order.orderStatus}
                  returnStatus={order.returnStatus}
                />

                {order.orderStatus === "Delivered" &&
                  (order.returnStatus === "None" ||
                    order.returnStatus === "Rejected") && (
                    <button
                      type="button"
                      onClick={() => openReturnModal(order._id)}
                      className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
                    >
                      Request Return
                    </button>
                  )}

                {order.returnStatus === "Requested" && (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    ⏳ Return pending seller approval
                  </p>
                )}
                {order.returnStatus === "Approved" && (
                  <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    ✓ Return approved — {order.returnNote}
                  </p>
                )}
                {order.returnStatus === "Picked Up" && (
                  <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                    📦 Return picked up — In processing
                  </p>
                )}
                {order.returnStatus === "Completed" && (
                  <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    ✓ Return completed — Refund processed
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {!orders.length && <p className="mt-6 text-slate-500">No orders yet.</p>}

      {/* Return Reason Modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Return Reason</h3>
              <button
                onClick={closeReturnModal}
                className="text-2xl text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Please select the reason for your return request:
            </p>

            <div className="grid gap-3">
              {RETURN_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition ${
                    selectedReason === reason.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className="text-lg">{reason.icon}</span>
                  <span className="font-medium text-slate-800">{reason.label}</span>
                </label>
              ))}
            </div>

            {selectedReason === "other" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please describe your reason for return..."
                rows={3}
                className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}

            {(selectedReason === "defective" ||
              selectedReason === "damaged" ||
              selectedReason === "wrong_item") && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Add any additional details (optional)..."
                rows={2}
                className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={requestReturn}
                disabled={submitting || !selectedReason}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Return Request"}
              </button>
              <button
                type="button"
                onClick={closeReturnModal}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyOrders;

