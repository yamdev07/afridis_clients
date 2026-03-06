import pool from '../config/database.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    // Total clients
    const clientsResult = await pool.query('SELECT COUNT(*) as count FROM clients');
    const totalClients = parseInt(clientsResult.rows[0].count);

    // Clients installés : installation_date existe et est <= aujourd'hui
    const installedResult = await pool.query(
      `SELECT COUNT(DISTINCT client_id) as count
       FROM subscriptions
       WHERE installation_date IS NOT NULL AND installation_date <= CURRENT_DATE`
    );
    const installed = parseInt(installedResult.rows[0].count);

    // Clients en attente : pas d'installation effective (date nulle ou future)
    const pendingResult = await pool.query(
      `SELECT COUNT(DISTINCT client_id) as count
       FROM subscriptions s
       WHERE s.installation_date IS NULL OR s.installation_date > CURRENT_DATE`
    );
    const pending = parseInt(pendingResult.rows[0].count);

    // Services actifs
    const servicesResult = await pool.query(
      'SELECT COUNT(*) as count FROM services WHERE is_active = true'
    );
    const activeServices = parseInt(servicesResult.rows[0].count);

    // Revenus totaux (somme des contract_cost)
    const revenueResult = await pool.query(
      'SELECT COALESCE(SUM(contract_cost), 0) as total FROM subscriptions WHERE contract_cost IS NOT NULL'
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0;

    // ─── Données graphique : 30 derniers jours ───
    // Clients créés par jour (sur 30 jours)
    const createdByDayResult = await pool.query(
      `SELECT 
         DATE(created_at) as day,
         COUNT(*) as count
       FROM clients
       WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
       GROUP BY DATE(created_at)
       ORDER BY day`
    );

    // Clients installés par jour (date d'installation effective)
    const installedByDayResult = await pool.query(
      `SELECT 
         installation_date as day,
         COUNT(DISTINCT client_id) as count
       FROM subscriptions
       WHERE installation_date IS NOT NULL
         AND installation_date >= CURRENT_DATE - INTERVAL '29 days'
         AND installation_date <= CURRENT_DATE
       GROUP BY installation_date
       ORDER BY installation_date`
    );

    // Construire les 30 derniers jours
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    // Indexer les résultats par date
    const createdMap = {};
    createdByDayResult.rows.forEach(r => {
      const key = r.day instanceof Date ? r.day.toISOString().split('T')[0] : String(r.day).substring(0, 10);
      createdMap[key] = parseInt(r.count);
    });

    const installedMap = {};
    installedByDayResult.rows.forEach(r => {
      const key = r.day instanceof Date ? r.day.toISOString().split('T')[0] : String(r.day).substring(0, 10);
      installedMap[key] = parseInt(r.count);
    });

    // Labels courts pour le graphe (afficher seulement 1 jour sur 5 ou les jours du mois)
    const chartData = days.map(day => {
      const dateObj = new Date(day);
      const label = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      return {
        name: label,
        date: day,
        créés: createdMap[day] || 0,
        installés: installedMap[day] || 0,
      };
    });

    res.json({
      clients: totalClients,
      installed,
      pending,
      tv: activeServices,
      totalRevenue,
      chartData,
    });
  } catch (error) {
    next(error);
  }
};
