"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Orders", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_orders_user",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Tambahkan FK untuk status jika diperlukan
    // await queryInterface.addConstraint("Orders", {
    //   fields: ["status"],
    //   type: "foreign key",
    //   name: "fk_orders_status",
    //   references: {
    //     table: "Statuses",
    //     field: "id",
    //   },
    //   onDelete: "SET NULL",
    //   onUpdate: "CASCADE",
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Orders", "fk_orders_user");
    // await queryInterface.removeConstraint("Orders", "fk_orders_status");
  },
};
