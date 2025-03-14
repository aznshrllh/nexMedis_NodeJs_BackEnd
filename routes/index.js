const router = require("express").Router();

const { register, login } = require("../controllers/user");
const authentication = require("../middlewares/authentication");
const User = require("../controllers/user");

router.get("/", (req, res) => {
  res.send({ message: "App is working!" });
});

router.post("/api/register", register);
router.post("/api/login", login);
router.use("/api/midtrans/notification", require("./publicTransactions"));

router.use(authentication);

router.get("/user/toptransactions", User.getTopCustomers);
router.use("/api/products", require("./products"));
router.use("/api/carts", require("./carts"));
router.use("/api/transactions", require("./transactions"));

module.exports = router;
