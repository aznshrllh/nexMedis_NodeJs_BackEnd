const router = require("express").Router();
const transactionController = require("../controllers/transaction");

// Mendapatkan semua transaksi user
router.get("/", transactionController.getUserTransactions);

// Mendapatkan detail transaksi berdasarkan ID
router.get("/:id", transactionController.getTransactionById);

// Membuat transaksi baru (checkout)
router.post("/", transactionController.createTransaction);

// Update status transaksi (opsional, bisa juga hanya untuk admin)
router.put("/:id/status", transactionController.updateTransactionStatus);

module.exports = router;
