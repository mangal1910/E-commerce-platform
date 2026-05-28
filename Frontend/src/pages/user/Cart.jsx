import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
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

const Cart = () => {
  const { showToast } = useToast();
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = async () => {
    const { data } = await api.get("/user/cart");
    setCart(data);
  };

  useEffect(() => {
    Promise.all([
      api.get("/user/cart").then((res) => setCart(res.data)),
      api.get("/user/profile").then((res) => setAddress(res.data.address || ""))
    ])
      .catch((err) => console.error("Error loading cart profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (id) => {
    await api.delete(`/user/cart/${id}`);
    loadCart();
    showToast("Removed from cart");
  };

  const checkout = async () => {
    try {
      await api.post("/user/orders", { shippingAddress: address });
      showToast("Order placed successfully!");
      navigate("/user/orders");
    } catch (err) {
      showToast(err.response?.data?.message || "Checkout failed", "error");
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  if (loading) {
    return (
      <DashboardLayout navItems={nav}>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader size="xl" color="blue" />
          <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">
            Loading your cart details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold">Cart</h2>
      <div className="mt-4 space-y-3">
        {cart.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 rounded-xl border bg-white p-3"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-slate-500">₹{item.price}</p>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item._id)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {!cart.length && (
        <p className="mt-6 text-slate-500">Your cart is empty.</p>
      )}
      <p className="mt-6 text-lg font-semibold">Total: ₹{total.toLocaleString()}</p>
      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Shipping address"
        className="mt-3 w-full max-w-lg rounded-lg border px-3 py-2"
        rows={3}
      />
      <button
        type="button"
        onClick={checkout}
        disabled={!cart.length}
        className="mt-3 rounded-lg bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-500 disabled:opacity-50"
      >
        Place Order
      </button>
    </DashboardLayout>
  );
};

export default Cart;

