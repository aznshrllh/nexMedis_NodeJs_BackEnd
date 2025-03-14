import { comparePass } from "../helpers/bcrypt";
const { User } = require("../models/user");

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    const newUser = await User.create({ username, email, password });
    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
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
