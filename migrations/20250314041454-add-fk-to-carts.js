"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Asumsi carts memiliki user_id dan product_id
    await queryInterface.addConstraint("Carts", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_carts_user",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("Carts", {
      fields: ["product_id"],
      type: "foreign key",
      name: "fk_carts_product",
      references: {
        table: "Products",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Carts", "fk_carts_user");
    await queryInterface.removeConstraint("Carts", "fk_carts_product");
  },
};
