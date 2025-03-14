const {
  searchProducts,
  getAllProducts,
  getProductById,
} = require("../controllers/product");

const router = require("express").Router();

// Route untuk mengambil semua produk atau mencari produk berdasarkan keyword
router.get("/", (req, res, next) => {
  if (req.query.search) {
    return searchProducts(req, res, next);
  }
  return getAllProducts(req, res, next);
});

// Route untuk mengambil detail produk berdasarkan ID
router.get("/:id", getProductById);

module.exports = router;
