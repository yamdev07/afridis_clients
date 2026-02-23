import pool from '../config/database.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    // Total clients
    const clientsResult = await pool.query('SELECT COUNT(*) as count FROM clients');
    const totalClients = parseInt(clientsResult.rows[0].count);

    // Clients installés (avec installation_date)
    const installedResult = await pool.query(
      'SELECT COUNT(DISTINCT client_id) as count FROM subscriptions WHERE installation_date IS NOT NULL'
    );
    const installed = parseInt(installedResult.rows[0].count);

    // Clients en attente
    const pendingResult = await pool.query(
      `SELECT COUNT(DISTINCT client_id) as count
       FROM subscriptions s
       JOIN statuses st ON s.status_id = st.id
       WHERE st.code = 'pending'`
    );
    const pending = parseInt(pendingResult.rows[0].count);

    // Services actifs (TV, Internet, etc.)
    const servicesResult = await pool.query(
      'SELECT COUNT(*) as count FROM services WHERE is_active = true'
    );
    const activeServices = parseInt(servicesResult.rows[0].count);

    // Revenus totaux (somme des contract_cost)
    const revenueResult = await pool.query(
      'SELECT COALESCE(SUM(contract_cost), 0) as total FROM subscriptions WHERE contract_cost IS NOT NULL'
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0;

    res.json({
      clients: totalClients,
      installed,
      pending,
      tv: activeServices,
      totalRevenue,
    });
  } catch (error) {
    next(error);
  }
};
