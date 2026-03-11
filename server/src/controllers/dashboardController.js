import pool from '../config/database.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    // Total clients
    const clientsResult = await pool.query('SELECT COUNT(*) as count FROM clients');
    const totalClients = parseInt(clientsResult.rows[0].count);

    // Clients installés
    const installedResult = await pool.query(
      `SELECT COUNT(DISTINCT client_id) as count
       FROM subscriptions s
       JOIN statuses st ON s.status_id = st.id
       WHERE st.code = 'installed'`
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

    // Services actifs
    const servicesResult = await pool.query(
      'SELECT COUNT(*) as count FROM services WHERE is_active = true'
    );
    const activeServices = parseInt(servicesResult.rows[0].count);

    // Revenus totaux
    const revenueResult = await pool.query(
      'SELECT COALESCE(SUM(contract_cost), 0) as total FROM subscriptions'
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0;

    // Graphe des 30 derniers jours
    const historyResult = await pool.query(`
      WITH RECURSIVE days AS (
        SELECT CURRENT_DATE - INTERVAL '29 days' as day
        UNION ALL
        SELECT day + INTERVAL '1 day' FROM days WHERE day < CURRENT_DATE
      )
      SELECT 
        d.day,
        (SELECT COUNT(*) FROM clients WHERE DATE(created_at) = d.day) as created,
        (SELECT COUNT(*) FROM subscriptions WHERE installation_date = d.day) as installed
      FROM days d
      ORDER BY d.day
    `);

    const chartData = historyResult.rows.map(r => ({
      name: new Date(r.day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      date: r.day,
      "créés": parseInt(r.created),
      "installés": parseInt(r.installed)
    }));

    res.json({
      clients: totalClients,
      installed,
      pending,
      tv: activeServices,
      totalRevenue,
      chartData
    });
  } catch (error) {
    next(error);
  }
};

export const getReportsData = async (req, res, next) => {
  try {
    // 1. Revenu par mois (6 derniers mois)
    const revenueByMonth = await pool.query(`
      SELECT 
        TO_CHAR(subscription_date, 'Mon') as name,
        SUM(contract_cost) as revenue,
        COUNT(*) as installations,
        COUNT(DISTINCT client_id) as users
      FROM subscriptions
      WHERE subscription_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(subscription_date, 'Mon'), DATE_TRUNC('month', subscription_date)
      ORDER BY DATE_TRUNC('month', subscription_date)
    `);

    // 2. Top Services (répartition)
    const topServices = await pool.query(`
      SELECT 
        s.label as name,
        COUNT(*) as value
      FROM subscriptions sub
      JOIN services s ON sub.service_id = s.id
      GROUP BY s.label
      ORDER BY value DESC
      LIMIT 5
    `);

    const colors = ["#2563EB", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];
    const pieData = topServices.rows.map((row, i) => ({
      ...row,
      value: parseInt(row.value),
      color: colors[i % colors.length]
    }));

    // 3. Activité Détaillée (Tableau)
    const detailedActivity = await pool.query(`
      SELECT 
        TO_CHAR(subscription_date, 'Month YYYY') as period,
        SUM(contract_cost) as gross,
        SUM(contract_cost) * 0.85 as net, -- Simulation net
        COUNT(*) as volume,
        CASE 
          WHEN COUNT(*) > 10 THEN 'Record'
          WHEN COUNT(*) > 5 THEN 'Hausse'
          ELSE 'Stable'
        END as status
      FROM subscriptions
      GROUP BY period, DATE_TRUNC('month', subscription_date)
      ORDER BY DATE_TRUNC('month', subscription_date) DESC
      LIMIT 12
    `);

    res.json({
      chartData: revenueByMonth.rows.map(r => ({ ...r, revenue: parseFloat(r.revenue), users: parseInt(r.users), installations: parseInt(r.installations) })),
      pieData,
      tableData: detailedActivity.rows.map(r => ({
        ...r,
        gross: parseFloat(r.gross).toLocaleString('fr-FR') + ' F',
        net: parseFloat(r.net).toLocaleString('fr-FR') + ' F',
      }))
    });
  } catch (error) {
    next(error);
  }
};
