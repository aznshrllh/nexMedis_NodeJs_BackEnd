const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

const authentication = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;
    console.log(bearerToken);
    if (!bearerToken) {
      throw { name: "unauthentication" };
    }

    const token = bearerToken.split(" ")[1];

    const verified = verifyToken(token);

    const user = await User.findByPk(verified.id);

    if (!user) {
      throw { name: "unauthentication" };
    }

    req.user = {
      id: user.id,
      email: user.email,
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
