module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "stok", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "stok");
  },
};
