import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const UserDashboard = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNo: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  const loadProducts = () =>
    api.get("/products").then((res) => setProducts(res.data.products || []));

  useEffect(() => {
    Promise.all([
      api.get("/user/profile").then((res) => {
        setProfile(res.data);
        setImagePreview(res.data.imageUrl);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          mobileNo: res.data.mobileNo || "",
          address: res.data.address || "",
        });
      }),
      loadProducts()
    ])
      .catch((err) => console.error("Error loading dashboard details:", err))
      .finally(() => setLoading(false));

    const interval = setInterval(loadProducts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("mobileNo", form.mobileNo);
      formData.append("address", form.address);
      if (profileImage) {
        formData.append("image", profileImage);
      }

      const { data } = await api.put("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(data);
      setProfileImage(null);
      setImagePreview(data.imageUrl);
      showToast("Profile updated successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    }
  };

  const addToCart = async (id) => {
    try {
      await api.post(`/user/cart/${id}`);
      showToast("Product added to cart!");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add to cart", "error");
    }
  };

  const addToWishlist = async (id) => {
    try {
      await api.post(`/user/wishlist/${id}`);
      showToast("Product added to wishlist!");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Could not add to wishlist",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={nav}>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader size="xl" color="blue" />
          <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">
            Loading your dashboard details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={nav}>
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
        <div className="mt-4 flex flex-wrap items-start gap-6">
          <div className="relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="h-24 w-24 rounded-full border-2 border-white object-cover shadow"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-2xl text-slate-500">
                {profile?.name?.[0] || "?"}
              </div>
            )}
            <label
              htmlFor="profile-image"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md transition"
              title="Click to edit profile picture"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <form onSubmit={saveProfile} className="grid flex-1 min-w-[240px] max-w-lg gap-3">
            {Object.keys(form).map((key) => (
              <input
                key={key}
                name={key}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={key}
                className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ))}
            <button
              type="submit"
              className="w-fit rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-500"
            >
              Save Profile
            </button>
          </form>
        </div>
      </section>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Shop Products</h2>
            <p className="text-sm text-slate-500">
              New items from sellers appear here automatically
            </p>
          </div>
          <Link
            to="/user/shop"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onAddToCart={addToCart}
              onAddToWishlist={addToWishlist}
            />
          ))}
        </div>
        {!products.length && (
          <p className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
            No products yet. Sellers can add items from their inventory.
          </p>
        )}
      </section>
    </DashboardLayout>
  );
};

export default UserDashboard;

