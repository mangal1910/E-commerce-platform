import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import ProductCard from "../../components/ProductCard";
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

const Wishlist = () => {
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/user/wishlist");
      setWishlist(data);
    } catch (err) {
      console.error("Error loading wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeItem = async (id) => {
    await api.delete(`/user/wishlist/${id}`);
    load();
    showToast("Removed from wishlist");
  };

  const addToCart = async (id) => {
    try {
      await api.post(`/user/cart/${id}`);
      showToast("Product added to cart!");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add to cart", "error");
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={nav}>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader size="xl" color="blue" />
          <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">
            Loading your wishlist...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold">Wishlist</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item) => (
          <div key={item._id} className="relative">
            <ProductCard
              product={item}
              onAddToCart={addToCart}
              hideWishlist
            />
            <button
              type="button"
              onClick={() => removeItem(item._id)}
              className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs text-red-600 shadow"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {!wishlist.length && (
        <p className="mt-6 text-slate-500">Your wishlist is empty.</p>
      )}
    </DashboardLayout>
  );
};

export default Wishlist;

