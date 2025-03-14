const router = require("express").Router();
const transactionController = require("../controllers/transaction");

// Midtrans notification endpoint
router.get("/", (req, res) => {
  res.send("Midtrans notification endpoint");
});

router.post("/", transactionController.midtransNotification);

module.exports = router;
