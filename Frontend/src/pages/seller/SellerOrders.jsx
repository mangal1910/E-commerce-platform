import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import OrderStatusTimeline from "../../components/OrderStatusTimeline";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const nav = [
  { to: "/seller/dashboard", label: "Profile" },
  { to: "/seller/inventory", label: "Inventory" },
  { to: "/seller/orders", label: "Orders" },
  { to: "/seller/analytics", label: "Analytics" },
  { to: "/seller/reviews", label: "Reviews" },
];

const SellerOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [assignMap, setAssignMap] = useState({});

  const load = async () => {
    const [ordersRes, partnersRes] = await Promise.all([
      api.get("/seller/orders"),
      api.get("/seller/delivery-partners"),
    ]);
    setOrders(ordersRes.data);
    setPartners(partnersRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const assignDelivery = async (orderId) => {
    const deliveryPartnerId = assignMap[orderId];
    if (!deliveryPartnerId) {
      showToast("Select a delivery partner", "error");
      return;
    }
    try {
      await api.post("/seller/shipping", { orderId, deliveryPartnerId });
      showToast("Delivery partner assigned");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Assignment failed", "error");
    }
  };

  const handleReturn = async (orderId, action) => {
    const returnNote = prompt(
      action === "approve" ? "Approval note (optional):" : "Rejection reason:"
    );
    try {
      await api.patch(`/seller/orders/${orderId}/return`, {
        action,
        returnNote: returnNote || "",
      });
      showToast(`Return ${action}d`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold">Order History</h2>
      <p className="text-sm text-slate-500">
        Orders containing your products — assign delivery and manage returns
      </p>

      <div className="mt-6 space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="rounded-xl border bg-slate-50 p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(order.orderedAt).toLocaleString()} · Customer:{" "}
                  {order.user?.name}
                </p>
                <p className="text-sm text-slate-500">{order.shippingAddress}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {order.orderStatus}
              </span>
            </div>

            <ul className="mt-3 space-y-2">
              {order.sellerItems?.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg border bg-white p-2 text-sm"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <span>
                    {item.name} × {item.quantity} — ₹{item.subtotal}
                  </span>
                </li>
              ))}
            </ul>

            <OrderStatusTimeline
              updates={order.shippingUpdates}
              orderStatus={order.orderStatus}
              returnStatus={order.returnStatus}
            />

            {order.deliveryPartner ? (
              <p className="mt-3 text-sm text-green-700">
                Assigned to: {order.deliveryPartner.name} (
                {order.deliveryPartner.mobileNo})
              </p>
            ) : (
              ["Placed", "Processing"].includes(order.orderStatus) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <select
                    value={assignMap[order._id] || ""}
                    onChange={(e) =>
                      setAssignMap({ ...assignMap, [order._id]: e.target.value })
                    }
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Select delivery partner</option>
                    {partners.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — {p.mobileNo}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => assignDelivery(order._id)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
                  >
                    Assign Delivery
                  </button>
                </div>
              )
            )}

            {order.returnStatus === "Requested" && (
              <div className="mt-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="flex-1 text-sm text-red-800">
                  Return requested: {order.returnReason}
                </p>
                <button
                  type="button"
                  onClick={() => handleReturn(order._id, "approve")}
                  className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReturn(order._id, "reject")}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {!orders.length && (
        <p className="mt-8 text-center text-slate-500">No orders yet.</p>
      )}
    </DashboardLayout>
  );
};

export default SellerOrders;

