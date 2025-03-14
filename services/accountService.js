const { sequelize } = require("../models");

async function updateBalance(userId, amount) {
  const transaction = await sequelize.transaction();

  try {
    // Lock the row for the user's account
    const account = await sequelize.query(
      "SELECT balance FROM Accounts WHERE user_id = ? FOR UPDATE",
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (!account || account.length === 0) {
      await transaction.rollback();
      throw new Error("User account not found");
    }

    const currentBalance = parseFloat(account[0].balance);
    const newBalance = currentBalance + parseFloat(amount);

    if (newBalance < 0) {
      await transaction.rollback();
      throw new Error("Insufficient funds");
    }

    // Update the balance
    await sequelize.query("UPDATE Accounts SET balance = ? WHERE user_id = ?", {
      replacements: [newBalance, userId],
      type: sequelize.QueryTypes.UPDATE,
      transaction,
    });

    // Record the transaction
    await sequelize.query(
      "INSERT INTO Transactions (user_id, amount, balance_after, created_at) VALUES (?, ?, ?, NOW())",
      {
        replacements: [userId, amount, newBalance],
        type: sequelize.QueryTypes.INSERT,
        transaction,
      }
    );

    await transaction.commit();
    return { success: true, balance: newBalance };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = { updateBalance };
