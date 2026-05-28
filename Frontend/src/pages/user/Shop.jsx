import { useEffect, useState, useRef } from "react";
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

const Shop = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
  });
  const debounceTimer = useRef(null);

  const loadProducts = async (filterData) => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filterData).filter(([, v]) => v !== "")
      );
      const { data } = await api.get("/products", { params });
      setProducts(data.products || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(filters);
  }, []);

  // Real-time search with debounce
  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      loadProducts(updatedFilters);
    }, 500); // 500ms debounce delay
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

  return (
    <DashboardLayout navItems={nav}>
      <h2 className="text-xl font-semibold text-slate-900">Browse Products</h2>
      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          placeholder="Search by name"
          value={filters.q}
          onChange={(e) => handleFilterChange("q", e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        />
        {/* <input
          placeholder="Category"
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        /> */}
        {/* <input
          placeholder="Brand"
          value={filters.brand}
          onChange={(e) => handleFilterChange("brand", e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        /> */}
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        >
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {!loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onAddToCart={addToCart}
              onAddToWishlist={addToWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader size="xl" color="blue" />
          <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">Searching products catalog...</p>
        </div>
      )}
      {!loading && !products.length && (
        <p className="mt-8 text-center text-slate-500">No products found.</p>
      )}
    </DashboardLayout>
  );
};

export default Shop;

