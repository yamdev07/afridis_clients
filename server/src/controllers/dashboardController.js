import pool from '../config/database.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'super_admin';
    const userId = req.user?.id;
    const userRoleCondition = isAdmin ? '' : 'WHERE created_by = $1';
    const subUserRoleCondition = isAdmin ? '' : 'JOIN clients c ON s.client_id = c.id WHERE c.created_by = $1';
    const subUserRoleConditionAnd = isAdmin ? 'WHERE' : 'JOIN clients c ON s.client_id = c.id WHERE c.created_by = $1 AND';
    const subUserRoleConditionSubAnd = isAdmin ? 'WHERE' : 'JOIN clients c ON sub.client_id = c.id WHERE c.created_by = $1 AND';

    // Total clients
    const clientsResult = await pool.query(`SELECT COUNT(*) as count FROM clients ${userRoleCondition}`, isAdmin ? [] : [userId]);
    const totalClients = parseInt(clientsResult.rows[0].count);

    // Clients installés
    const installedResult = await pool.query(
      `SELECT COUNT(DISTINCT s.client_id) as count
       FROM subscriptions s
       JOIN statuses st ON s.status_id = st.id
       ${subUserRoleConditionAnd} st.code = 'installed'`,
       isAdmin ? [] : [userId]
    );
    const installed = parseInt(installedResult.rows[0].count);

    // Clients en attente
    const pendingResult = await pool.query(
      `SELECT COUNT(DISTINCT s.client_id) as count
       FROM subscriptions s
       JOIN statuses st ON s.status_id = st.id
       ${subUserRoleConditionAnd} st.code = 'pending'`,
       isAdmin ? [] : [userId]
    );
    const pending = parseInt(pendingResult.rows[0].count);

    // Services actifs
    const servicesResult = await pool.query(
      'SELECT COUNT(*) as count FROM services WHERE is_active = true'
    );
    const activeServices = parseInt(servicesResult.rows[0].count);

    // Revenus totaux
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(s.contract_cost), 0) as total FROM subscriptions s ${subUserRoleCondition}`,
      isAdmin ? [] : [userId]
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
        TO_CHAR(d.day, 'YYYY-MM-DD') as day,
        (SELECT COUNT(*) FROM subscriptions s2 ${isAdmin ? '' : 'JOIN clients c2 ON s2.client_id = c2.id'} WHERE DATE(s2.subscription_date) = d.day ${isAdmin ? '' : `AND c2.created_by = '${userId}'`}) as created,
        (SELECT COUNT(*) FROM subscriptions s3 ${isAdmin ? '' : 'JOIN clients c3 ON s3.client_id = c3.id'} WHERE DATE(s3.installation_date) = d.day ${isAdmin ? '' : `AND c3.created_by = '${userId}'`}) as installed
      FROM days d
      ORDER BY d.day
    `);

    const chartData = historyResult.rows.map(r => ({
      name: new Date(r.day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      date: r.day,
      created: parseInt(r.created),
      installed: parseInt(r.installed)
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
    const isAdmin = req.user && req.user.role === 'super_admin';
    const userId = req.user?.id;

    // 1. Revenu par mois (6 derniers mois garantis pour le graphique)
    const revenueByMonth = await pool.query(`
      WITH RECURSIVE months AS (
        SELECT DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months' as month_start
        UNION ALL
        SELECT month_start + INTERVAL '1 month' 
        FROM months 
        WHERE month_start < DATE_TRUNC('month', CURRENT_DATE)
      )
      SELECT 
        TO_CHAR(m.month_start, 'Mon') as name,
        COALESCE(SUM(s.contract_cost), 0) as revenue,
        COUNT(s.id) as installations,
        COUNT(DISTINCT s.client_id) as users
      FROM months m
      LEFT JOIN subscriptions s ON DATE_TRUNC('month', s.subscription_date) = m.month_start
      ${isAdmin ? '' : 'LEFT JOIN clients c ON s.client_id = c.id'}
      WHERE 1=1 ${isAdmin ? '' : 'AND (c.created_by = $1 OR s.id IS NULL)'}
      GROUP BY m.month_start
      ORDER BY m.month_start
    `, isAdmin ? [] : [userId]);

    // 2. Top Services (répartition)
    const topServices = await pool.query(`
      SELECT 
        sv.label as name,
        COUNT(*) as value
      FROM subscriptions sub
      JOIN services sv ON sub.service_id = sv.id
      ${isAdmin ? '' : 'JOIN clients c ON sub.client_id = c.id'}
      ${isAdmin ? '' : 'WHERE c.created_by = $1'}
      GROUP BY sv.label
      ORDER BY value DESC
      LIMIT 5
    `, isAdmin ? [] : [userId]);

    const colors = ["#2563EB", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];
    const pieData = topServices.rows.map((row, i) => ({
      ...row,
      value: parseInt(row.value),
      color: colors[i % colors.length]
    }));

    // 3. Activité Détaillée (Tableau)
    const detailedActivity = await pool.query(`
      SELECT 
        TO_CHAR(s.subscription_date, 'Month YYYY') as period,
        SUM(s.contract_cost) as gross,
        SUM(s.contract_cost) * 0.85 as net, -- Simulation net
        COUNT(*) as volume,
        CASE 
          WHEN COUNT(*) > 10 THEN 'Record'
          WHEN COUNT(*) > 5 THEN 'Hausse'
          ELSE 'Stable'
        END as status
      FROM subscriptions s
      ${isAdmin ? '' : 'JOIN clients c ON s.client_id = c.id'}
      ${isAdmin ? '' : 'WHERE c.created_by = $1'}
      GROUP BY period, DATE_TRUNC('month', s.subscription_date)
      ORDER BY DATE_TRUNC('month', s.subscription_date) DESC
      LIMIT 12
    `, isAdmin ? [] : [userId]);

    res.json({
      chartData: revenueByMonth.rows.map(r => ({ 
        name: r.name, 
        revenue: parseFloat(r.revenue || 0), 
        users: parseInt(r.users || 0), 
        installations: parseInt(r.installations || 0) 
      })),
      pieData,
      tableData: detailedActivity.rows.map(r => ({
        ...r,
        gross: parseFloat(r.gross || 0).toLocaleString('fr-FR') + ' F',
        net: parseFloat(r.net || 0).toLocaleString('fr-FR') + ' F',
      }))
    });
  } catch (error) {
    next(error);
  }
};
