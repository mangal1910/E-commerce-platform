import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import OrderStatusTimeline from "../../components/OrderStatusTimeline";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const nav = [{ to: "/delivery/dashboard", label: "Assignments" }];

const statuses = ["Pending", "Picked Up", "In Transit", "Delivered to Customer"];

const DeliveryDashboard = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);

  const load = () => api.get("/delivery/assignments").then((res) => setOrders(res.data));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/delivery/orders/${orderId}/status`, { status });
      showToast(`Status: ${status}`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed", "error");
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
                      onClick={() => updateStatus(order._id, s)}
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
    </DashboardLayout>
  );
};

export default DeliveryDashboard;

