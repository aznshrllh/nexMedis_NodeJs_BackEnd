"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // FK for kategori_id
    await queryInterface.addConstraint("Products", {
      fields: ["kategori_id"],
      type: "foreign key",
      name: "fk_products_kategori",
      references: {
        table: "Categories", // Pastikan nama tabel ini benar
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // FK for status_id
    await queryInterface.addConstraint("Products", {
      fields: ["status_id"],
      type: "foreign key",
      name: "fk_products_status",
      references: {
        table: "Statuses",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Products", "fk_products_kategori");
    await queryInterface.removeConstraint("Products", "fk_products_status");
  },
};
