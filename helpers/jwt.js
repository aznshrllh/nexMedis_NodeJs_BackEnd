const jwt = require("jsonwebtoken");

const secret = process.env.SECRET;
const signToken = (user) => {
  return jwt.sign(user, secret);
};

const verifyToken = (token) => {
  return jwt.verify(token, secret);
};

module.exports = { signToken, verifyToken };
