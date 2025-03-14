const { Product } = require("../models");
const { Op } = require("sequelize");

// Get all products
async function getAllProducts(req, res, next) {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

// Get product by ID
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

// Search products by keyword
async function searchProducts(req, res, next) {
  try {
    const { search } = req.query;

    const products = await Product.findAll({
      where: {
        // Mencari berdasarkan nama produk yang mengandung kata kunci
        name: {
          [Op.iLike]: `%${search}%`, // Case insensitive search (untuk PostgreSQL)
        },
      },
    });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  searchProducts,
};
