const router = require("express").Router();
const cartController = require("../controllers/cart");

// Mendapatkan semua item di keranjang user yang sedang login
router.get("/", cartController.getUserCart);

// Menambahkan produk ke keranjang
router.post("/", cartController.addToCart);

// Update quantity produk di keranjang
router.put("/:id", cartController.updateCartItem);

// Menghapus produk dari keranjang
router.delete("/:id", cartController.removeFromCart);

// Menghapus semua produk dari keranjang
router.delete("/", cartController.clearCart);

module.exports = router;
