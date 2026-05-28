import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import StarRating from "../../components/StarRating";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const nav = [
  { to: "/user/dashboard", label: "Profile" },
  { to: "/user/shop", label: "Shop" },
  { to: "/user/cart", label: "Cart" },
  { to: "/user/wishlist", label: "Wishlist" },
  { to: "/user/orders", label: "My Orders" },
];

const ProductDetail = () => {
  const { productId } = useParams();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    api.get(`/products/${productId}`).then((res) => setProduct(res.data));
    api.get(`/products/${productId}/reviews`).then((res) => {
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.averageRating || 0);
    });
    api.get(`/recommendations/product/${productId}`)
      .then((res) => {
        setFrequentlyBoughtTogether(res.data.frequentlyBoughtTogether || []);
        setSimilarProducts(res.data.similarProducts || []);
      })
      .catch((err) => console.error("Error fetching recommendations:", err));

    api.get("/user/orders").then((res) => {
      const delivered = res.data.some(
        (o) =>
          o.orderStatus === "Delivered" &&
          o.items.some((i) => String(i.product) === String(productId))
      );
      setCanReview(delivered);
    });
  }, [productId]);

  const addComboToCart = async (comboProduct) => {
    try {
      await api.post(`/user/cart/${productId}`);
      await api.post(`/user/cart/${comboProduct._id}`);
      showToast("Added combo products to cart!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add combo", "error");
    }
  };

  const addToCart = async () => {
    try {
      await api.post(`/user/cart/${productId}`);
      showToast("Added to cart!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/user/reviews/${productId}`, { rating, comment });
      showToast("Review submitted!");
      const { data } = await api.get(`/products/${productId}/reviews`);
      setReviews(data.reviews || []);
      setAvgRating(data.averageRating || 0);
      setComment("");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not submit review", "error");
    }
  };

  if (!product) {
    return (
      <DashboardLayout navItems={nav}>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader size="xl" color="blue" />
          <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">
            Loading product details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={nav}>
      <Link to="/user/shop" className="text-sm text-blue-600 hover:underline">
        ← Back to shop
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full rounded-xl border object-cover"
            />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-blue-600">{product.category}</p>
          <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-1 text-slate-600">{product.brand}</p>
          <div className="mt-2 flex items-center gap-2">
            <StarRating value={Math.round(avgRating)} readOnly />
            <span className="text-sm text-slate-500">
              {avgRating} ({product.ratingsCount || reviews.length} reviews)
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">
            ₹{Number(product.price).toLocaleString()}
          </p>
          <p className="mt-3 text-slate-600">{product.description}</p>
          <p className="mt-2 text-sm text-slate-500">
            Seller: {product.seller?.name} · {product.seller?.shopAddress}
          </p>
          <p className="text-sm text-slate-500">Stock: {product.stock}</p>
          <button
            type="button"
            onClick={addToCart}
            disabled={product.stock <= 0}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-500 disabled:opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* 🧠 Machine Learning Recommendations */}
      <div className="mt-16 border-t pt-10">
        
        {/* Market Basket Analysis Section */}
        {frequentlyBoughtTogether.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                🛒
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Frequently Bought Together</h2>
                <p className="text-xs text-slate-500 font-mono">Algorithm: Market Basket Analysis (Apriori Rule Mining)</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Main Product */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 w-full md:w-auto">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-800 line-clamp-1">{product.name}</h4>
                    <p className="text-sm text-slate-500">₹{Number(product.price).toLocaleString()}</p>
                  </div>
                </div>

                <div className="text-2xl font-bold text-slate-400">+</div>

                {/* First Recommended Product */}
                {frequentlyBoughtTogether.slice(0, 1).map((item) => (
                  <div key={item._id} className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                    <Link to={`/user/product/${item._id}`} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition w-full">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                      <div>
                        <h4 className="font-semibold text-slate-800 line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-slate-500">₹{Number(item.price).toLocaleString()}</p>
                      </div>
                    </Link>

                    <div className="text-2xl font-bold text-slate-400">=</div>

                    {/* Combo Details & Buy Button */}
                    <div className="flex flex-col items-center md:items-start gap-1">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Combo Price</span>
                      <p className="text-2xl font-extrabold text-blue-600">
                        ₹{Number(product.price + item.price).toLocaleString()}
                      </p>
                      <button
                        onClick={() => addComboToCart(item)}
                        className="mt-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-500 hover:shadow-lg transition-all duration-200"
                      >
                        Add Combo to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Additional items if any */}
              {frequentlyBoughtTogether.length > 1 && (
                <div className="mt-6 border-t pt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-3">Other frequently bought combinations:</p>
                  <div className="flex flex-wrap gap-4">
                    {frequentlyBoughtTogether.slice(1).map((item) => (
                      <Link
                        key={item._id}
                        to={`/user/product/${item._id}`}
                        className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 hover:border-blue-300 transition text-sm"
                      >
                        <span className="font-medium text-slate-700 line-clamp-1">{item.name}</span>
                        <span className="text-blue-600 font-semibold">₹{Number(item.price).toLocaleString()}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* KNN Products You May Also Like Section */}
        {similarProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                🧬
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Products You May Also Like</h2>
                <p className="text-xs text-slate-500 font-mono">Algorithm: K-Nearest Neighbors (Weighted Content Distance similarity)</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {similarProducts.map((item) => (
                <div
                  key={item._id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <Link to={`/user/product/${item._id}`} className="block flex-shrink-0 relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 bg-indigo-600 text-[10px] font-bold text-white px-2 py-0.5 rounded-md shadow-sm">
                      KNN Similar
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase">
                      {item.category}
                    </span>
                    <Link
                      to={`/user/product/${item._id}`}
                      className="mt-1 font-semibold text-slate-800 hover:text-indigo-600 line-clamp-2 text-sm leading-snug"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">{item.brand}</p>
                    
                    <div className="mt-2 flex items-center gap-1">
                      <StarRating value={Math.round(item.averageRating || 0)} readOnly size="xs" />
                      <span className="text-[10px] text-slate-400 font-medium">({item.ratingsCount || 0})</span>
                    </div>

                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">
                        ₹{Number(item.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="mt-10 border-t pt-8">
        <h2 className="text-lg font-semibold">Reviews & Feedback</h2>
        {canReview ? (
          <form onSubmit={submitReview} className="mt-4 max-w-lg rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Rate this product</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your feedback..."
              rows={4}
              className="mt-3 w-full rounded-lg border px-3 py-2"
            />
            <button
              type="submit"
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-amber-700">
            You can leave a review after the product is delivered.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.user?.name || "Customer"}</p>
                <StarRating value={r.rating} readOnly size="sm" />
              </div>
              <p className="mt-2 text-slate-600">{r.comment}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {!reviews.length && (
            <p className="text-slate-500">No reviews yet. Be the first!</p>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default ProductDetail;

