"use strict";

const fs = require("fs");
const path = require("path");

// Baca data dari file JSON
// const categoriesPath = require ('../data/categories.json');
// const statusesPath = require ('../data/statuses.json');
// const productsPath = require ('../data/products.json');

const categories = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/categories.json"), "utf8")
);
const statuses = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/statuses.json"), "utf8")
);
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/products.json"), "utf8")
);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seed Categories
    await queryInterface.bulkInsert("Categories", categories, {});

    // Seed Statuses
    await queryInterface.bulkInsert("Statuses", statuses, {});

    // Seed Products
    await queryInterface.bulkInsert("Products", products, {});

    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    // Delete data in reverse order to avoid foreign key constraints
    await queryInterface.bulkDelete("Products", null, {});
    await queryInterface.bulkDelete("Statuses", null, {});
    await queryInterface.bulkDelete("Categories", null, {});

    return Promise.resolve();
  },
};
