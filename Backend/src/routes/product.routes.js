const express = require("express");
const {
  getProducts,
  getProductById,
  getProductReviews,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id/reviews", getProductReviews);
router.get("/:id", getProductById);

module.exports = router;
