const errorHandler = (error, req, res, next) => {
  let status = 500;
  let message = "Internal Server Error";

  if (error.name === "emailrequired") {
    status = 400;
    message = "Email is required";
  } else if (error.name === "passwordrequired") {
    status = 400;
    message = "Password is required";
  } else if (error.name === "unauthentication") {
    status = 401;
    message = "Invalid email or password";
  } else if (
    error.name === "SequelizeValidationError" ||
    error.name === "SequelizeUniqueConstraintError"
  ) {
    status = 400;
    message = error.errors[0].message;
  } else if (
    error.name === "Unauthorized" ||
    error.name === "JsonWebTokenError"
  ) {
    status = 401;
    message = "Invalid token";
  } else if (error.name === "forbidden") {
    status = 403;
    message = "You don't have permission";
  } else if (error.name === "notfound") {
    status = 404;
    message = "Not found";
  } else if (error.name === "stocklow") {
    status = 400;
    message = "Product stock is not enough";
  } else if (error.name === "googlefailed") {
    status = 401;
    message =
      "You already registered with our app, please choose sign in with email";
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;
