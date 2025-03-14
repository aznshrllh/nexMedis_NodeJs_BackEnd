const { sequelize } = require("../models");

async function getTopCustomersBySpending(period = "1 month") {
  try {
    const results = await sequelize.query(
      `SELECT 
        user_id as customer_id, 
        SUM(total) AS total_spent
      FROM 
        "Orders"
      WHERE 
        "createdAt" >= NOW() - INTERVAL '${period}'
        AND status = 'completed'
      GROUP BY 
        user_id
      ORDER BY 
        total_spent DESC
      LIMIT 5`,
      { type: sequelize.QueryTypes.SELECT }
    );

    return results;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getTopCustomersBySpending,
};
