const { comparePass } = require("../helpers/bcrypt");
const { User } = require("../models");
const { signToken } = require("../helpers/jwt"); // Asumsi ini ada di project Anda

async function register(req, res, next) {
  try {
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

module.exports = {
  register,
  login,
};
