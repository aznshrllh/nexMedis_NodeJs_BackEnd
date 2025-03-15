const { Op } = require("sequelize");
const { sequelize } = require("../models");
const Midtrans = require("midtrans-client");
const {
  Order,
  OrderDetail,
  Product,
  User,
  Cart,
  Status,
  Payment,
} = require("../models");

// Mendapatkan semua transaksi milik user
async function getUserTransactions(req, res, next) {
  try {
    const userId = req.user.id;

    // Basic query tanpa include dulu
    const orders = await Order.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
    });

    // Ambil informasi tambahan secara manual untuk menghindari error relasi
    const transactions = [];

    for (const order of orders) {
      const orderDetails = await OrderDetail.findAll({
        where: { order_id: order.id },
        include: [
          {
            model: Product,
            attributes: ["id", "nama_produk", "id_produk"],
          },
        ],
      });

      const payment = await Payment.findOne({
        where: { order_id: order.id },
      });

      transactions.push({
        ...order.toJSON(),
        orderDetails,
        payment: payment ? payment.toJSON() : null,
      });
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error in getUserTransactions:", error);
    next(error);
  }
}

// Mendapatkan detail transaksi berdasarkan ID
async function getTransactionById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const transaction = await Order.findOne({
      where: {
        id,
        user_id: userId,
      },
      include: [
        {
          model: OrderDetail,
          as: "orderDetails",
          include: [
            {
              model: Product,
              attributes: ["id", "nama_produk", "harga", "id_produk"],
            },
          ],
        },
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
        {
          model: Payment,
          attributes: [
            "id",
            "payment_method",
            "payment_status",
            "payment_token",
            "amount",
          ],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // Format response jika perlu
    const formattedTransaction = {
      ...transaction.toJSON(),
      // Tambahkan informasi tambahan jika diperlukan
    };

    res.status(200).json(formattedTransaction);
  } catch (error) {
    console.error("Error in getTransactionById:", error);
    next(error);
  }
}

async function createTransaction(req, res, next) {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;

    // 1. Ambil semua item di keranjang
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "nama_produk", "harga", "stok"],
        },
      ],
      transaction: t,
    });

    if (cartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Keranjang kosong" });
    }

    // 2. Validasi stok
    for (const item of cartItems) {
      if (item.quantity > item.Product.stok) {
        await t.rollback();
        return res.status(400).json({
          message: `Stok ${item.Product.nama_produk} tidak cukup. Tersedia: ${item.Product.stok}`,
        });
      }
    }

    // 3. Hitung total dan prepare items untuk Midtrans
    let total = 0;
    const items = [];
    cartItems.forEach((item) => {
      const price =
        typeof item.Product.harga === "string"
          ? parseFloat(item.Product.harga)
          : item.Product.harga;

      total += item.quantity * price;

      items.push({
        id: item.Product.id.toString(),
        price: price,
        quantity: item.quantity,
        name: item.Product.nama_produk,
      });
    });

    // 4. Buat Order langsung dengan status "processing" (paid)
    const order = await Order.create(
      {
        user_id: userId,
        total,
        status: "processing", // Langsung set menjadi processing (paid)
        order_date: new Date(),
      },
      { transaction: t }
    );

    // 5. Buat OrderDetail dan kurangi stok
    for (const item of cartItems) {
      await OrderDetail.create(
        {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price:
            typeof item.Product.harga === "string"
              ? parseFloat(item.Product.harga)
              : item.Product.harga,
        },
        { transaction: t }
      );

      // Update stok
      await Product.decrement("stok", {
        by: item.quantity,
        where: { id: item.product_id },
        transaction: t,
      });

      // Update status produk jika stok habis
      const updatedStok = item.Product.stok - item.quantity;
      if (updatedStok === 0) {
        await Product.update(
          { status_id: 2 }, // 2 = sold out
          { where: { id: item.product_id }, transaction: t }
        );
      }
    }

    // 6. Ambil data user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // 7. Setup Midtrans dan create token
    const snap = new Midtrans.Snap({
      isProduction: false, // Sesuaikan dengan environment
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const orderId = `ORDER-${order.id}-${Date.now()}`;
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: parseInt(total),
      },
      item_details: items,
      customer_details: {
        first_name: user.username,
        email: user.email,
      },
    };

    const token = await snap.createTransactionToken(parameter);

    // 8. Buat Payment langsung dengan status success
    await Payment.create(
      {
        order_id: order.id,
        payment_method: "midtrans",
        payment_status: "success", // Langsung set menjadi success
        payment_token: token,
        amount: total,
      },
      { transaction: t }
    );

    // 9. Hapus cart
    await Cart.destroy({
      where: { user_id: userId },
      transaction: t,
    });

    // Commit transaction
    await t.commit();

    // 10. Return response
    return res.status(201).json({
      message: "Pesanan berhasil dibuat dan sudah dibayar",
      order: {
        id: order.id,
        total: order.total,
        status: order.status, // Akan bernilai "processing"
        createdAt: order.createdAt,
      },
      payment: {
        status: "success",
        token: token,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${token}`,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error in createTransaction:", error);
    next(error);
  }
}

// Update status transaksi
async function updateTransactionStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Opsional: validasi status yang diizinkan
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    // Validasi order exist
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // Update status
    await order.update({ status });

    res.status(200).json({
      message: "Status transaksi berhasil diperbarui",
      order: {
        id: order.id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Callback untuk notifikasi Midtrans
async function midtransNotification(req, res, next) {
  try {
    console.log("========== MIDTRANS NOTIFICATION ==========");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Parsed Body:", JSON.stringify(req.body, null, 2));
    console.log("==========================================");

    const notification = req.body;
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log(
      `Processing notification: orderID=${orderId}, transactionStatus=${transactionStatus}, fraudStatus=${fraudStatus}`
    );

    let actualOrderId = null;

    // 1. Coba ekstrak dari format ORDER-{id}-{timestamp}
    if (orderId && orderId.startsWith("ORDER-")) {
      const orderIdParts = orderId.split("-");
      if (orderIdParts.length >= 2) {
        actualOrderId = parseInt(orderIdParts[1]);
        console.log("Extracted order ID from standard format:", actualOrderId);
      }
    }

    // 2. Jika ini adalah notifikasi test dari Midtrans
    if (!actualOrderId && orderId && orderId.includes("payment_notif_test")) {
      console.log("This is a test notification from Midtrans");

      // Jika ini test notification, cari order paling baru
      const lastOrder = await Order.findOne({
        where: { status: "pending" },
        order: [["createdAt", "DESC"]],
      });

      if (lastOrder) {
        actualOrderId = lastOrder.id;
        console.log("Using latest pending order:", actualOrderId);
      }
    }

    // 3. Jika masih tidak ditemukan, cari berdasarkan payment token
    if (!actualOrderId) {
      console.log("Trying to find payment by token");
      const payment = await Payment.findOne({
        where: { payment_token: orderId },
      });

      if (payment) {
        actualOrderId = payment.order_id;
        console.log("Found order ID from payment token:", actualOrderId);
      }
    }

    // 4. Jika masih tidak ditemukan, cek apakah ada yang pending
    if (!actualOrderId) {
      console.log("Checking for pending orders");
      const pendingOrders = await Order.findAll({
        where: { status: "pending" },
        include: [Payment],
        order: [["createdAt", "DESC"]],
      });

      if (pendingOrders.length === 1) {
        actualOrderId = pendingOrders[0].id;
        console.log("Using the only pending order:", actualOrderId);
      } else if (pendingOrders.length > 0) {
        // Jika ada beberapa pending orders, gunakan yang pertama saja (paling baru)
        actualOrderId = pendingOrders[0].id;
        console.log(
          `Found ${pendingOrders.length} pending orders, using the most recent:`,
          actualOrderId
        );
      }
    }

    if (!actualOrderId) {
      console.error("Could not determine order ID from notification:", orderId);
      // Tetap berikan status 200 agar Midtrans tidak mengirim ulang
      return res.status(200).json({
        status: "error",
        message: "Could not determine order ID from notification",
      });
    }

    // Temukan payment record
    const payment = await Payment.findOne({
      where: { order_id: actualOrderId },
    });

    if (!payment) {
      console.error(`Payment not found for order ID: ${actualOrderId}`);
      return res.status(200).json({
        status: "error",
        message: "Payment not found for determined order ID",
      });
    }

    // Determine payment status
    let paymentStatus = "pending";

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "challenge") {
        paymentStatus = "challenge";
      } else if (fraudStatus === "accept" || !fraudStatus) {
        paymentStatus = "success";
      }
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "expire"
    ) {
      paymentStatus = "failure";
    } else if (transactionStatus === "pending") {
      paymentStatus = "pending";
    }

    console.log(
      `Updating payment status to: ${paymentStatus} for order ${actualOrderId}`
    );

    // Update payment status
    await payment.update({
      payment_status: paymentStatus,
    });

    // Update order status
    if (paymentStatus === "success") {
      await Order.update(
        { status: "processing" },
        { where: { id: actualOrderId } }
      );
      console.log(`Order ${actualOrderId} status updated to processing`);
    } else if (paymentStatus === "failure") {
      await Order.update(
        { status: "cancelled" },
        { where: { id: actualOrderId } }
      );
      console.log(`Order ${actualOrderId} status updated to cancelled`);

      // Opsional: Kembalikan stok produk jika pembayaran gagal
      const orderDetails = await OrderDetail.findAll({
        where: { order_id: actualOrderId },
      });

      for (const detail of orderDetails) {
        await Product.increment("stok", {
          by: detail.quantity,
          where: { id: detail.product_id },
        });
      }
    }

    // Selalu berikan respons 200 OK ke Midtrans
    return res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Error processing Midtrans notification:", error);
    // Tetap berikan status 200 untuk mencegah Midtrans mencoba ulang terus-menerus
    return res.status(200).json({ status: "Error", message: error.message });
  }
}

module.exports = {
  getUserTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  midtransNotification,
};
