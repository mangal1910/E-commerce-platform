const Product = require("../models/Product");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");

const buildProductQuery = (query) => {
  const filter = { isActive: true };

  // Build OR logic for category and brand filters
  const orConditions = [];
  
  if (query.category) {
    orConditions.push({ category: new RegExp(query.category, "i") });
  }
  if (query.brand) {
    orConditions.push({ brand: new RegExp(query.brand, "i") });
  }

  // If both category and brand are provided, use OR logic
  if (orConditions.length > 0) {
    filter.$or = orConditions;
  }

  // Search query (q) uses OR logic across name, category, and brand
  if (query.q) {
    filter.$or = [
      { name: new RegExp(query.q, "i") },
      { category: new RegExp(query.q, "i") },
      { brand: new RegExp(query.q, "i") },
    ];
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  let sort = { createdAt: -1 };
  if (query.sort === "price_asc") sort = { price: 1 };
  if (query.sort === "price_desc") sort = { price: -1 };
  if (query.sort === "rating") sort = { averageRating: -1 };

  return { filter, sort };
};

const getProducts = asyncHandler(async (req, res) => {
  const { filter, sort } = buildProductQuery(req.query);
  const products = await Product.find(filter)
    .populate("seller", "name shopAddress")
    .sort(sort);
  res.json({ count: products.length, products });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "seller",
    "name shopAddress email mobileNo"
  );
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }

  const reviews = await Review.find({ product: product._id })
    .populate("user", "name imageUrl")
    .sort({ createdAt: -1 });

  res.json({
    averageRating: product.averageRating,
    ratingsCount: product.ratingsCount,
    reviews,
  });
});

module.exports = {
  getProducts,
  getProductById,
  getProductReviews,
  buildProductQuery,
};
