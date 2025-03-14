"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderDetail.belongsTo(models.Order, {
        foreignKey: "order_id",
        onDelete: "CASCADE",
      });

      OrderDetail.belongsTo(models.Product, {
        foreignKey: "product_id",
        onDelete: "CASCADE",
      });
    }
  }

  OrderDetail.init(
    {
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Orders",
          key: "id",
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      subtotal: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.quantity * this.price;
        },
      },
    },
    {
      sequelize,
      modelName: "OrderDetail",
      tableName: "OrderDetails",
    }
  );

  return OrderDetail;
};
