import pool from '../config/database.js';

export const getAllClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', line_number = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*,
             COUNT(DISTINCT s.id) as subscriptions_count
      FROM clients c
      LEFT JOIN subscriptions s ON s.client_id = c.id
    `;
    const queryParams = [];
    const conditions = [];

    if (search) {
      conditions.push(`(
        c.full_name ILIKE $${queryParams.length + 1} OR
        c.email ILIKE $${queryParams.length + 1} OR
        c.phone ILIKE $${queryParams.length + 1}
      )`);
      queryParams.push(`%${search}%`);
    }

    if (line_number) {
      conditions.push(`EXISTS (
        SELECT 1 FROM subscriptions s2
        WHERE s2.client_id = c.id AND s2.line_number ILIKE $${queryParams.length + 1}
      )`);
      queryParams.push(`%${line_number}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Compter le total pour la pagination
    let countQuery = 'SELECT COUNT(DISTINCT c.id) FROM clients c';
    const countParams = [];
    const countConditions = [];

    if (search) {
      countConditions.push(`(
        c.full_name ILIKE $${countParams.length + 1} OR
        c.email ILIKE $${countParams.length + 1} OR
        c.phone ILIKE $${countParams.length + 1}
      )`);
      countParams.push(`%${search}%`);
    }

    if (line_number) {
      countConditions.push(`EXISTS (
        SELECT 1 FROM subscriptions s2
        WHERE s2.client_id = c.id AND s2.line_number ILIKE $${countParams.length + 1}
      )`);
      countParams.push(`%${line_number}%`);
    }

    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }

    const countResult = await pool.query(countQuery, countParams);
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

export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*,
              json_agg(
                json_build_object(
                  'id', s.id,
                  'service', json_build_object('id', sv.id, 'code', sv.code, 'label', sv.label),
                  'status', json_build_object('id', st.id, 'code', st.code, 'label', st.label),
                  'line_number', s.line_number,
                  'subscription_date', s.subscription_date,
                  'installation_date', s.installation_date,
                  'contract_cost', s.contract_cost,
                  'notes', s.notes
                )
              ) FILTER (WHERE s.id IS NOT NULL) as subscriptions
       FROM clients c
       LEFT JOIN subscriptions s ON s.client_id = c.id
       LEFT JOIN services sv ON s.service_id = sv.id
       LEFT JOIN statuses st ON s.status_id = st.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getClientByLineNumber = async (req, res, next) => {
  try {
    const { line_number } = req.params;

    const result = await pool.query(
      `SELECT c.*,
              json_agg(
                json_build_object(
                  'id', s.id,
                  'service', json_build_object('id', sv.id, 'code', sv.code, 'label', sv.label),
                  'status', json_build_object('id', st.id, 'code', st.code, 'label', st.label),
                  'line_number', s.line_number,
                  'subscription_date', s.subscription_date,
                  'installation_date', s.installation_date,
                  'contract_cost', s.contract_cost,
                  'notes', s.notes
                )
              ) FILTER (WHERE s.id IS NOT NULL) as subscriptions
       FROM clients c
       LEFT JOIN subscriptions s ON s.client_id = c.id AND s.line_number = $1
       LEFT JOIN services sv ON s.service_id = sv.id
       LEFT JOIN statuses st ON s.status_id = st.id
       WHERE EXISTS (SELECT 1 FROM subscriptions WHERE client_id = c.id AND line_number = $1)
       GROUP BY c.id`,
      [line_number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aucun client trouvé pour ce numéro de ligne' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req, res, next) => {
  try {
    const { full_name, phone, email, address } = req.body;

    const result = await pool.query(
      `INSERT INTO clients (full_name, phone, email, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [full_name, phone || null, email || null, address || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email, address } = req.body;

    const result = await pool.query(
      `UPDATE clients
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           address = COALESCE($4, address),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [full_name, phone, email, address, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
