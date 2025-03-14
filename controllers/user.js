const { comparePass } = require("../helpers/bcrypt");
const { User } = require("../models");
const { signToken } = require("../helpers/jwt"); // Asumsi ini ada di project Anda

async function register(req, res, next) {
  try {
    // Tambahkan logging untuk debugging
    console.log("Register request received:", req.body);
    const { username, email, password } = req.body;

    // Tambahkan validasi menggunakan Zod
    const validation = User.validateUser({ username, email, password });
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
    }

    const newUser = await User.create({ username, email, password });
    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw { name: "emailrequired" };
    }

    if (!password) {
      throw { name: "passwordrequired" };
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw { name: "unauthentication" };
    }

    // console.log(user);
    // console.log("ini dari postman", password);
    // console.log("ini dari db", user.password);

    const isPasswordMatch = comparePass(password, user.password);

    if (!isPasswordMatch) {
      throw { name: "unauthentication" };
    }

    const access_token = signToken({ id: user.id });

    res.status(200).json({ message: "Login success", access_token });
  } catch (error) {
    next(error);
  }
}

async function getTopCustomers(req, res, next) {
  try {
    // Ambil period dari query params atau gunakan default "1 month"
    const { period = "1 month" } = req.query;

    // Validasi period untuk keamanan (mencegah SQL injection)
    const validPeriods = [
      "7 days",
      "14 days",
      "1 month",
      "3 months",
      "6 months",
      "1 year",
    ];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        message:
          "Invalid period. Valid options: 7 days, 14 days, 1 month, 3 months, 6 months, 1 year",
      });
    }

    // Gunakan fungsi dari model untuk mendapatkan data
    const results = await sequelize.query(
      `SELECT 
        "Orders".user_id as customer_id,
        "Users".username,
        "Users".email,
        COUNT("Orders".id) as order_count,
        SUM("Orders".total) AS total_spent
      FROM 
        "Orders"
      JOIN
        "Users" ON "Orders".user_id = "Users".id
      WHERE 
        "Orders"."createdAt" >= NOW() - INTERVAL '${period}'
        AND "Orders".status = 'success'
      GROUP BY 
        "Orders".user_id, "Users".username, "Users".email
      ORDER BY 
        total_spent DESC
      LIMIT 5`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Format response data
    const formattedResults = results.map((customer) => ({
      customer_id: customer.customer_id,
      username: customer.username,
      email: customer.email,
      order_count: parseInt(customer.order_count),
      total_spent: parseFloat(customer.total_spent),
    }));

    res.status(200).json({
      message: `Top customers by spending in the last ${period}`,
      period,
      customers: formattedResults,
    });
  } catch (error) {
    console.error("Error in getTopCustomers:", error);
    next(error);
  }
}

module.exports = {
  register,
  login,
  getTopCustomers,
};
