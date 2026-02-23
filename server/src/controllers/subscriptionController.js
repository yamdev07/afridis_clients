import pool from '../config/database.js';

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, client_id, service_id, status_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*,
             c.full_name as client_name, c.email as client_email, c.phone as client_phone,
             sv.code as service_code, sv.label as service_label,
             st.code as status_code, st.label as status_label,
             a.login as agent_login
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN services sv ON s.service_id = sv.id
      JOIN statuses st ON s.status_id = st.id
      LEFT JOIN agents a ON s.agent_id = a.id
    `;
    const params = [];
    const conditions = [];

    if (client_id) {
      conditions.push(`s.client_id = $${params.length + 1}`);
      params.push(client_id);
    }
    if (service_id) {
      conditions.push(`s.service_id = $${params.length + 1}`);
      params.push(service_id);
    }
    if (status_id) {
      conditions.push(`s.status_id = $${params.length + 1}`);
      params.push(status_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Compter le total
    let countQuery = 'SELECT COUNT(*) FROM subscriptions s';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT s.*,
              c.*,
              sv.*,
              st.*,
              a.login as agent_login, a.first_name as agent_first_name, a.last_name as agent_last_name
       FROM subscriptions s
       JOIN clients c ON s.client_id = c.id
       JOIN services sv ON s.service_id = sv.id
       JOIN statuses st ON s.status_id = st.id
       LEFT JOIN agents a ON s.agent_id = a.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const {
      client_id,
      service_id,
      status_id,
      agent_id,
      line_number,
      subscription_date,
      planned_installation_date,
      installation_date,
      contract_cost,
      notes,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO subscriptions (
        client_id, service_id, status_id, agent_id,
        line_number, subscription_date, planned_installation_date,
        installation_date, contract_cost, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        client_id,
        service_id,
        status_id,
        agent_id || null,
        line_number || null,
        subscription_date || null,
        planned_installation_date || null,
        installation_date || null,
        contract_cost || null,
        notes || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Référence invalide (client, service ou statut)' });
    }
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status_id,
      agent_id,
      line_number,
      subscription_date,
      planned_installation_date,
      installation_date,
      contract_cost,
      notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE subscriptions
       SET status_id = COALESCE($1, status_id),
           agent_id = COALESCE($2, agent_id),
           line_number = COALESCE($3, line_number),
           subscription_date = COALESCE($4, subscription_date),
           planned_installation_date = COALESCE($5, planned_installation_date),
           installation_date = COALESCE($6, installation_date),
           contract_cost = COALESCE($7, contract_cost),
           notes = COALESCE($8, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        status_id,
        agent_id,
        line_number,
        subscription_date,
        planned_installation_date,
        installation_date,
        contract_cost,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM subscriptions WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
