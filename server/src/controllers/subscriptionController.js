import pool from '../config/database.js';

const createNotificationForSubscription = async (subscriptionId, type, title, body) => {
  // Crée des notifications pour le commercial lié (si présent)
  const detailsResult = await pool.query(
    `SELECT s.id,
            s.client_id,
            s.service_id,
            s.agent_id,
            c.full_name as client_name,
            sv.label as service_label
     FROM subscriptions s
     JOIN clients c ON s.client_id = c.id
     JOIN services sv ON s.service_id = sv.id
     WHERE s.id = $1`,
    [subscriptionId],
  );

  if (detailsResult.rows.length === 0) {
    return;
  }

  const details = detailsResult.rows[0];

  const meta = {
    subscription_id: details.id,
    client_id: details.client_id,
    service_id: details.service_id,
  };

  // Notification pour le(s) commercial(aux) lié(s) via agent_id
  if (details.agent_id) {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, meta)
       SELECT u.id, $1, $2, $3, $4::jsonb
       FROM users u
       WHERE u.agent_id = $5`,
      [
        type,
        title,
        body || `Client ${details.client_name} – Service ${details.service_label}`,
        JSON.stringify(meta),
        details.agent_id,
      ],
    );
  }

  // Notifications pour tous les admins et super admins
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, meta)
     SELECT u.id, $1, $2, $3, $4::jsonb
     FROM users u
     WHERE u.role IN ('admin', 'super_admin')`,
    [
      type,
      title,
      body || `Client ${details.client_name} – Service ${details.service_label}`,
      JSON.stringify(meta),
    ],
  );
};

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      client_id,
      service_id,
      status_id,
      agent_login,
      from_date,
      to_date,
    } = req.query;
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
    if (agent_login) {
      conditions.push(`a.login = $${params.length + 1}`);
      params.push(agent_login);
    }
    if (from_date) {
      conditions.push(`s.subscription_date >= $${params.length + 1}`);
      params.push(from_date);
    }
    if (to_date) {
      conditions.push(`s.subscription_date <= $${params.length + 1}`);
      params.push(to_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY s.subscription_date DESC NULLS LAST, s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Compter le total
    let countQuery = 'SELECT COUNT(*) FROM subscriptions s LEFT JOIN agents a ON s.agent_id = a.id';
    const countParams = [];
    const countConditions = [];

    if (client_id) {
      countConditions.push(`s.client_id = $${countParams.length + 1}`);
      countParams.push(client_id);
    }
    if (service_id) {
      countConditions.push(`s.service_id = $${countParams.length + 1}`);
      countParams.push(service_id);
    }
    if (status_id) {
      countConditions.push(`s.status_id = $${countParams.length + 1}`);
      countParams.push(status_id);
    }
    if (agent_login) {
      countConditions.push(`a.login = $${countParams.length + 1}`);
      countParams.push(agent_login);
    }
    if (from_date) {
      countConditions.push(`s.subscription_date >= $${countParams.length + 1}`);
      countParams.push(from_date);
    }
    if (to_date) {
      countConditions.push(`s.subscription_date <= $${countParams.length + 1}`);
      countParams.push(to_date);
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

    const created = result.rows[0];

    // Notifications : nouvelle souscription
    try {
      await createNotificationForSubscription(
        created.id,
        'subscription_created',
        'Nouvelle souscription',
        null,
      );
    } catch (notifyError) {
      // On log mais on ne bloque pas la réponse principale
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la création de notification:', notifyError);
    }

    res.status(201).json(created);
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

    const updated = result.rows[0];

    // Notifications : mise à jour de l'abonnement (changement de statut / installation)
    try {
      await createNotificationForSubscription(
        updated.id,
        'subscription_updated',
        'Mise à jour d’un abonnement',
        null,
      );
    } catch (notifyError) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la création de notification (update):', notifyError);
    }

    res.json(updated);
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

export const bulkImportSubscriptions = async (req, res, next) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'Aucune ligne à importer' });
    }

    const resultSummary = {
      created: 0,
      skipped: 0,
      errors: [],
    };

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index] || {};
      try {
        const clientName = (row.Client || '').trim();
        if (!clientName) {
          resultSummary.skipped += 1;
          continue;
        }

        const clientPhone = row['Téléphone'] || null;
        const clientEmail = row.Email || null;
        const serviceLabelOrCode = row.Service;
        const statusLabelOrCode = row.Statut;
        const lineNumber = row['Numéro de ligne'] || null;
        const amountRaw = row['Montant contrat'];
        const notes = row.Notes || null;
        const commercialLogin = row.Commercial;
        const dateRaw = row.Date;

        // Trouver ou créer le client
        let clientId;
        const clientResult = await pool.query(
          `SELECT id FROM clients WHERE phone = $1 OR email = $2 LIMIT 1`,
          [clientPhone || null, clientEmail || null],
        );
        if (clientResult.rows.length > 0) {
          clientId = clientResult.rows[0].id;
        } else {
          const createdClient = await pool.query(
            `INSERT INTO clients (full_name, phone, email, address)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [clientName, clientPhone || null, clientEmail || null, null],
          );
          clientId = createdClient.rows[0].id;
        }

        // Trouver le service
        let serviceId = null;
        if (serviceLabelOrCode) {
          const serviceResult = await pool.query(
            `SELECT id FROM services WHERE code = $1 OR label = $2 LIMIT 1`,
            [serviceLabelOrCode, serviceLabelOrCode],
          );
          if (serviceResult.rows.length > 0) {
            serviceId = serviceResult.rows[0].id;
          }
        }

        // Trouver le statut
        let statusId = null;
        if (statusLabelOrCode) {
          const statusResult = await pool.query(
            `SELECT id FROM statuses WHERE code = $1 OR label = $2 LIMIT 1`,
            [statusLabelOrCode, statusLabelOrCode],
          );
          if (statusResult.rows.length > 0) {
            statusId = statusResult.rows[0].id;
          }
        }

        // Trouver l'agent via son login
        let agentId = null;
        if (commercialLogin) {
          const agentResult = await pool.query(
            `SELECT id FROM agents WHERE login = $1 LIMIT 1`,
            [commercialLogin],
          );
          if (agentResult.rows.length > 0) {
            agentId = agentResult.rows[0].id;
          }
        }

        // Parse de la date et du montant
        let subscriptionDate = null;
        if (dateRaw) {
          const parsed = new Date(dateRaw);
          if (!Number.isNaN(parsed.getTime())) {
            subscriptionDate = parsed.toISOString().slice(0, 10);
          }
        }

        let contractCost = null;
        if (amountRaw !== undefined && amountRaw !== null && amountRaw !== '') {
          const normalized = String(amountRaw).replace(/\s/g, '').replace(',', '.');
          const parsedAmount = parseFloat(normalized);
          if (!Number.isNaN(parsedAmount)) {
            contractCost = parsedAmount;
          }
        }

        // Tous les champs critiques doivent être présents
        if (!serviceId || !statusId) {
          resultSummary.skipped += 1;
          continue;
        }

        await pool.query(
          `INSERT INTO subscriptions (
            client_id,
            service_id,
            status_id,
            agent_id,
            line_number,
            subscription_date,
            contract_cost,
            notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            clientId,
            serviceId,
            statusId,
            agentId,
            lineNumber,
            subscriptionDate,
            contractCost,
            notes,
          ],
        );

        resultSummary.created += 1;
      } catch (error) {
        resultSummary.errors.push({
          index,
          message: error.message,
        });
      }
    }

    res.status(201).json(resultSummary);
  } catch (error) {
    next(error);
  }
};
