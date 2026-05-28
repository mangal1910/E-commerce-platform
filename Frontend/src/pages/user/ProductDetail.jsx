import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import StarRating from "../../components/StarRating";
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

  useEffect(() => {
    api.get(`/products/${productId}`).then((res) => setProduct(res.data));
    api.get(`/products/${productId}/reviews`).then((res) => {
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.averageRating || 0);
    });
    api.get("/user/orders").then((res) => {
      const delivered = res.data.some(
        (o) =>
          o.orderStatus === "Delivered" &&
          o.items.some((i) => String(i.product) === String(productId))
      );
      setCanReview(delivered);
    });
  }, [productId]);

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
        <p className="text-slate-500">Loading...</p>
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

