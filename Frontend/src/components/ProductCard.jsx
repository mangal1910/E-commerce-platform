import { Link } from "react-router-dom";

const ProductCard = ({
  product,
  onAddToCart,
  onAddToWishlist,
  hideWishlist = false,
}) => (
  <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
    <Link
      to={`/user/product/${product._id}`}
      className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400">
          No image
        </div>
      )}
      {product.stock <= 0 && (
        <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-0.5 text-xs text-white">
          Out of stock
        </span>
      )}
    </Link>
    <div className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
        {product.category}
      </p>
      <Link to={`/user/product/${product._id}`}>
        <h3 className="mt-1 font-semibold text-slate-900 line-clamp-1 hover:text-blue-600">
          {product.name}
        </h3>
      </Link>
      <p className="mt-1 text-sm text-slate-500 line-clamp-2">
        {product.description || product.brand || "—"}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-slate-900">
          ₹{Number(product.price).toLocaleString()}
        </span>
        {product.averageRating > 0 && (
          <span className="text-sm text-amber-600">
            ★ {product.averageRating}
          </span>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={() => onAddToCart(product._id)}
          className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to Cart
        </button>
        {!hideWishlist && onAddToWishlist && (
          <button
            type="button"
            onClick={() => onAddToWishlist(product._id)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            title="Add to wishlist"
          >
            ♥
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ProductCard;

