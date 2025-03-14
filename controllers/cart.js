const { Cart, Product, User } = require("../models");
const { Op } = require("sequelize");

// Mendapatkan keranjang belanja user yang sedang login
async function getUserCart(req, res, next) {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "nama_produk", "harga", "id_produk"],
        },
      ],
    });

    // Kalkulasi total
    let total = 0;
    const items = cartItems.map((item) => {
      const subtotal = item.quantity * item.Product.harga;
      total += subtotal;

      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.Product,
        subtotal,
      };
    });

    res.status(200).json({
      items,
      total,
      count: items.length,
    });
  } catch (error) {
    next(error);
  }
}

// Menambahkan produk ke keranjang
async function addToCart(req, res, next) {
  try {
    console.log("Request body:", req.body); // Logging untuk debug

    const userId = req.user.id;

    const productId = req.body.productId || req.body.product_id;
    const quantity = req.body.quantity || 1;

    // Validasi produk
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Validasi stok
    if (product.stok < quantity) {
      return res.status(400).json({
        message: `Stok tidak cukup. Tersedia: ${product.stok}`,
      });
    }

    // Cek apakah produk sudah di keranjang
    const existingCartItem = await Cart.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity jika produk sudah ada di keranjang
      const newQuantity = existingCartItem.quantity + Number(quantity);
      cartItem = await existingCartItem.update({ quantity: newQuantity });

      res.status(200).json({
        message: "Quantity produk di keranjang berhasil diupdate",
        cartItem,
      });
    } else {
      // Tambahkan produk baru ke keranjang
      cartItem = await Cart.create({
        user_id: userId,
        product_id: productId,
        quantity: Number(quantity),
      });

      res.status(201).json({
        message: "Produk berhasil ditambahkan ke keranjang",
        cartItem,
      });
    }
  } catch (error) {
    next(error);
  }
}

// Update quantity produk di keranjang
async function updateCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity harus lebih dari 0" });
    }

    // Cari item keranjang
    const cartItem = await Cart.findOne({
      where: {
        id: cartItemId,
        user_id: userId,
      },
      include: [Product],
    });

    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Item keranjang tidak ditemukan" });
    }

    // Validasi stok
    if (quantity > cartItem.Product.stok) {
      return res.status(400).json({
        message: `Stok tidak cukup. Tersedia: ${cartItem.Product.stok}`,
      });
    }

    // Update quantity
    await cartItem.update({ quantity });

    res.status(200).json({
      message: "Quantity produk di keranjang berhasil diupdate",
      cartItem: cartItem,
    });
  } catch (error) {
    next(error);
  }
}

// Menghapus produk dari keranjang
async function removeFromCart(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await Cart.destroy({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Item tidak ditemukan di keranjang" });
    }

    res.status(200).json({ message: "Item berhasil dihapus dari keranjang" });
  } catch (error) {
    next(error);
  }
}

// Menghapus semua produk dari keranjang
async function clearCart(req, res, next) {
  try {
    const userId = req.user.id;

    await Cart.destroy({
      where: {
        user_id: userId,
      },
    });

    res.status(200).json({ message: "Keranjang berhasil dikosongkan" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
