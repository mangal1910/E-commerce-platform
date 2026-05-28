import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import OrderStatusTimeline from "../../components/OrderStatusTimeline";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/Loader";

const nav = [{ to: "/delivery/dashboard", label: "Assignments" }];

const statuses = ["Pending", "Picked Up", "In Transit", "Delivered to Customer"];

const DeliveryDashboard = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [otpModal, setOtpModal] = useState(null); // { orderId, status }
  const [deliveryOtp, setDeliveryOtp] = useState("");
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/delivery/assignments").then((res) => setOrders(res.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const updateStatus = async (order, status) => {
    const orderId = order._id;

    if (status === "Delivered to Customer") {
      setOtpModal({ orderId, status });
      setDeliveryOtp("");
      return;
    }

    try {
      await api.patch(`/delivery/orders/${orderId}/status`, { status });
      showToast(`Status: ${status}`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed", "error");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryOtp.trim()) {
      showToast("OTP is required", "error");
      return;
    }

    setUpdating(true);
    try {
      await api.patch(`/delivery/orders/${otpModal.orderId}/status`, {
        status: otpModal.status,
        otp: deliveryOtp.trim()
      });
      showToast("Order marked as delivered successfully!");
      setOtpModal(null);
      setDeliveryOtp("");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Verification failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  const closeDelivery = async (orderId) => {
    try {
      await api.patch(`/delivery/orders/${orderId}/close`);
      showToast("Delivery closed successfully");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not close delivery", "error");
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={nav}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <Loader size="lg" color="blue" />
          <p className="text-gray-500 animate-pulse font-medium">Loading deliveries...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold">Assigned Deliveries</h2>

      <div className="mt-6 space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="rounded-xl border bg-slate-50 p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-slate-600">
                  Customer: {order.user?.name}
                </p>
                <p className="text-sm text-slate-600">
                  📍 {order.shippingAddress}
                </p>
                <p className="text-sm text-slate-500">
                  {order.user?.mobileNo} · {order.user?.email}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  order.deliveryClosed
                    ? "bg-slate-200 text-slate-700"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {order.deliveryClosed ? "Closed" : order.orderStatus}
              </span>
            </div>

            <div className="mt-3 rounded-lg border bg-white p-3">
              <p className="text-xs font-medium uppercase text-slate-500">
                Pickup (Seller)
              </p>
              {order.items.map((item, i) => (
                <p key={i} className="mt-1 text-sm">
                  {item.name} — Pickup:{" "}
                  {item.seller?.shopAddress || "See seller profile"} (
                  {item.seller?.name})
                </p>
              ))}
            </div>

            <OrderStatusTimeline
              updates={order.shippingUpdates}
              orderStatus={order.orderStatus}
              returnStatus={order.returnStatus}
            />

            {!order.deliveryClosed && (
              <>
                <p className="mt-4 text-sm font-medium text-slate-700">
                  Update status
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateStatus(order, s)}
                      className="rounded-lg border bg-white px-3 py-1.5 text-xs hover:bg-blue-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {order.orderStatus === "Delivered" && (
                  <button
                    type="button"
                    onClick={() => closeDelivery(order._id)}
                    className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    Close Delivery
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      {!orders.length && (
        <p className="mt-6 text-slate-500">No assignments yet.</p>
      )}

      {/* 🔐 Custom Delivery OTP Verification Modal */}
      {otpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleOtpSubmit}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 transform scale-100 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
                <span className="text-xl">🔑</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">OTP Delivery Verification</h3>
              <p className="mt-2 text-xs text-slate-500 px-4">
                Ask the customer for the 6-digit delivery security code to successfully complete the delivery.
              </p>
            </div>

            <div className="mt-6">
              <label htmlFor="otp-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                required
                pattern="\d{6}"
                value={deliveryOtp}
                onChange={(e) => setDeliveryOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 123456"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-xl font-extrabold tracking-widest text-slate-800 placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition duration-200"
              >
                {updating ? (
                  <>
                    <Loader size="sm" color="white" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Confirm Delivery"
                )}
              </button>
              <button
                type="button"
                onClick={() => setOtpModal(null)}
                disabled={updating}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DeliveryDashboard;

