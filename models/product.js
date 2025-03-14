"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, {
        foreignKey: "kategori_id",
      });

      Product.belongsTo(models.Status, {
        foreignKey: "status_id",
      });

      Product.hasMany(models.Cart, {
        foreignKey: "product_id",
      });

      Product.hasMany(models.OrderDetail, {
        foreignKey: "product_id",
      });
    }
  }
  Product.init(
    {
      id_produk: {
        type: DataTypes.STRING,
        unique: true,
      },
      nama_produk: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Nama produk tidak boleh kosong" },
        },
      },
      harga: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      kategori_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Categories",
          key: "id",
        },
      },
      status_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Statuses",
          key: "id",
        },
      },
      stok: {
        // Tambahkan field stok
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
    },

    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
