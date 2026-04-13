import pool from '../config/database.js';
import { getOrganizationOwnerId } from '../utils/access.js';

async function getScopeOwnerId(user) {
  if (!user || user.role === 'super_admin') return null;
  return getOrganizationOwnerId(pool, user.id);
}

async function resolveAgentIdByLogin(login, fallbackName = '') {
  if (!login) return null;

  const normalizedLogin = String(login).trim();
  if (!normalizedLogin) return null;

  const existing = await pool.query('SELECT id FROM agents WHERE login = $1 LIMIT 1', [normalizedLogin]);
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const created = await pool.query(
    `INSERT INTO agents (login, first_name, last_name, active)
     VALUES ($1, $2, '', true)
     RETURNING id`,
    [normalizedLogin, fallbackName || normalizedLogin],
  );

  return created.rows[0].id;
}

const createNotificationForSubscription = async (subscriptionId, type, title, message, authorName) => {
  const detailsResult = await pool.query(
    `SELECT s.id,
            s.client_id,
            s.service_id,
            s.agent_id,
            COALESCE(c.commercial_login, a.login) as agent_login,
            c.full_name as client_name,
            sv.label as service_label
     FROM subscriptions s
     JOIN clients c ON s.client_id = c.id
     JOIN services sv ON s.service_id = sv.id
     LEFT JOIN agents a ON s.agent_id = a.id
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

  if (details.agent_id) {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, meta)
       SELECT u.id, $1, $2, $3, $4::jsonb
       FROM users u
       WHERE u.agent_id = $5`,
      [
        type,
        title,
        message || (authorName
          ? `${authorName} a gere : Client ${details.client_name} - Service ${details.service_label} le ${new Date().toLocaleString('fr-FR')}`
          : `Client ${details.client_name} - Service ${details.service_label} le ${new Date().toLocaleString('fr-FR')}`),
        JSON.stringify(meta),
        details.agent_id,
      ],
    );
  }

  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, meta)
     SELECT u.id, $1, $2, $3, $4::jsonb
     FROM users u
     WHERE u.role IN ('admin_local', 'admin', 'super_admin')`,
    [
      type,
      title,
      message || (authorName
        ? `${authorName} a gere : Client ${details.client_name} - Service ${details.service_label} le ${new Date().toLocaleString('fr-FR')}`
        : `Client ${details.client_name} - Service ${details.service_label} le ${new Date().toLocaleString('fr-FR')}`),
      JSON.stringify(meta),
    ],
  );
};

export const getStatuses = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM statuses ORDER BY label');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      client_id,
      service_id,
      status_id,
      status_code,
      agent_login,
      from_date,
      to_date,
    } = req.query;
    const offset = (page - 1) * limit;
    const scopeOwnerId = await getScopeOwnerId(req.user);

    let query = `
      SELECT s.*,
             c.full_name as client_name,
             c.email as client_email,
             c.phone as client_phone,
             sv.code as service_code,
             sv.label as service_label,
             st.code as status_code,
             st.label as status_label,
             COALESCE(NULLIF(c.commercial_login, ''), a.login) as agent_login
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN services sv ON s.service_id = sv.id
      JOIN statuses st ON s.status_id = st.id
      LEFT JOIN agents a ON s.agent_id = a.id
    `;
    const params = [];
    const conditions = [];

    if (scopeOwnerId) {
      conditions.push(`c.created_by = $${params.length + 1}`);
      params.push(scopeOwnerId);
    }
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
    if (status_code) {
      conditions.push(`st.code = $${params.length + 1}`);
      params.push(status_code);
    }
    if (agent_login) {
      conditions.push(`COALESCE(NULLIF(c.commercial_login, ''), a.login) ILIKE $${params.length + 1}`);
      params.push(`%${String(agent_login).trim()}%`);
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

    let countQuery = `
      SELECT COUNT(*)
      FROM subscriptions s
      LEFT JOIN clients c ON s.client_id = c.id
      LEFT JOIN agents a ON s.agent_id = a.id
      LEFT JOIN statuses st ON s.status_id = st.id
    `;
    const countParams = [];
    const countConditions = [];

    if (scopeOwnerId) {
      countConditions.push(`c.created_by = $${countParams.length + 1}`);
      countParams.push(scopeOwnerId);
    }
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
    if (status_code) {
      countConditions.push(`st.code = $${countParams.length + 1}`);
      countParams.push(status_code);
    }
    if (agent_login) {
      countConditions.push(`COALESCE(NULLIF(c.commercial_login, ''), a.login) ILIKE $${countParams.length + 1}`);
      countParams.push(`%${String(agent_login).trim()}%`);
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
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
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
    const scopeOwnerId = await getScopeOwnerId(req.user);
    const params = [id];
    let scopeClause = '';

    if (scopeOwnerId) {
      params.push(scopeOwnerId);
      scopeClause = ` AND c.created_by = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT s.*, c.*, sv.*, st.*, COALESCE(c.commercial_login, a.login) as agent_login, a.first_name as agent_first_name, a.last_name as agent_last_name
       FROM subscriptions s
       JOIN clients c ON s.client_id = c.id
       JOIN services sv ON s.service_id = sv.id
       JOIN statuses st ON s.status_id = st.id
       LEFT JOIN agents a ON s.agent_id = a.id
       WHERE s.id = $1${scopeClause}`,
      params,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Abonnement non trouve ou acces refuse' });
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

    const scopeOwnerId = await getScopeOwnerId(req.user);
    if (scopeOwnerId) {
      const clientScope = await pool.query('SELECT id FROM clients WHERE id = $1 AND created_by = $2', [client_id, scopeOwnerId]);
      if (clientScope.rows.length === 0) {
        return res.status(403).json({ message: 'Ce client ne fait pas partie de votre perimetre' });
      }
    }

    // 🔥 Auto-détection du statut installé
    let finalInstallationDate = installation_date;

    if (status_id) {
      const statusRes = await pool.query(
        `SELECT code FROM statuses WHERE id = $1`,
        [status_id]
      );

      const statusCode = statusRes.rows[0]?.code;

      // Si on passe en "installed" et aucune date fournie
      if (statusCode === 'installed' && !installation_date) {
        finalInstallationDate = new Date().toISOString().split('T')[0];
      }
    }

    const result = await pool.query(
      `INSERT INTO subscriptions (
        client_id, service_id, status_id, agent_id,
        line_number, subscription_date, planned_installation_date,
        finalInstallationDate, contract_cost, notes
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
      ],
    );

    const created = result.rows[0];

    try {
      await createNotificationForSubscription(created.id, 'subscription_created', 'Nouvelle souscription', null, req.user?.name);
    } catch (notifyError) {
      console.error('Erreur lors de la creation de notification:', notifyError);
    }

    res.status(201).json(created);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Reference invalide (client, service ou statut)' });
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

    if (installation_date !== undefined && !status_id) {
      const today = new Date().toISOString().split('T')[0];
      const statusCode = (installation_date && installation_date <= today) ? 'installed' : 'pending';
      const statusRes = await pool.query('SELECT id FROM statuses WHERE code = $1', [statusCode]);
      if (statusRes.rows.length > 0) {
        status_id = statusRes.rows[0].id;
      }
    }

    const scopeOwnerId = await getScopeOwnerId(req.user);
    const existingSub = await pool.query(
      `SELECT s.line_number
       FROM subscriptions s
       JOIN clients c ON c.id = s.client_id
       WHERE s.id = $1${scopeOwnerId ? ' AND c.created_by = $2' : ''}`,
      scopeOwnerId ? [id, scopeOwnerId] : [id],
    );
    if (existingSub.rows.length === 0) {
      return res.status(404).json({ message: 'Abonnement non trouve' });
    }

    const finalLineNumber = line_number !== undefined ? line_number : existingSub.rows[0].line_number;
    if (line_number !== undefined && line_number !== existingSub.rows[0].line_number) {
      if (!['super_admin', 'admin_local', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Seul un administrateur peut modifier le numero de ligne' });
      }
    }

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
      [status_id, agent_id, finalLineNumber, subscription_date, planned_installation_date, installation_date, contract_cost, notes, id],
    );

    const updated = result.rows[0];

    try {
      await createNotificationForSubscription(updated.id, 'subscription_updated', 'Mise a jour d\'un abonnement', null, req.user?.name);
    } catch (notifyError) {
      console.error('Erreur lors de la creation de notification (update):', notifyError);
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scopeOwnerId = await getScopeOwnerId(req.user);

    const result = await pool.query(
      `DELETE FROM subscriptions s
       USING clients c
       WHERE s.client_id = c.id
         AND s.id = $1${scopeOwnerId ? ' AND c.created_by = $2' : ''}
       RETURNING s.id`,
      scopeOwnerId ? [id, scopeOwnerId] : [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Abonnement non trouve' });
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
      return res.status(400).json({ message: 'Aucune ligne a importer' });
    }

    const scopeOwnerId = await getScopeOwnerId(req.user);
    const ownerId = scopeOwnerId || req.user.id;
    const resultSummary = { created: 0, skipped: 0, errors: [] };

    const statusResult = await pool.query('SELECT id, code FROM statuses');
    const statuses = {};
    statusResult.rows.forEach((s) => {
      statuses[s.code] = s.id;
    });

    for (let index = 3; index < rows.length; index += 1) {
      const row = rows[index];
      if (!row) continue;

      const commercialLogin = row.__EMPTY_1 ? String(row.__EMPTY_1).trim() : '';
      const clientName = row.__EMPTY_2 ? String(row.__EMPTY_2).trim() : '';
      const lineNumber = row.__EMPTY_3 ? String(row.__EMPTY_3).trim() : '';
      const subscriptionDateRaw = row.__EMPTY_4;
      const installationDateRaw = row.__EMPTY_5;
      const email = row.__EMPTY_6 ? String(row.__EMPTY_6).trim() : '';
      const clientPhone = row.__EMPTY_7 ? String(row.__EMPTY_7).trim() : '';
      const notes = row.__EMPTY_17 ? String(row.__EMPTY_17).trim() : '';

      if (!lineNumber && !clientName) {
        resultSummary.skipped += 1;
        continue;
      }

      let offer = '';
      if (row.__EMPTY_10 === 1 || row.__EMPTY_10 === '1') offer = 'Pro 25Mbps';
      else if (row.__EMPTY_11 === 1 || row.__EMPTY_11 === '1') offer = 'Pro 50Mbps';
      else if (row.__EMPTY_12 === 1 || row.__EMPTY_12 === '1') offer = 'Pro 80Mbps';
      else if (row.__EMPTY_13 === 1 || row.__EMPTY_13 === '1') offer = 'Office 150Mbps';
      else if (row.__EMPTY_14 === 1 || row.__EMPTY_14 === '1') offer = 'Office 200Mbps';
      else if (row.__EMPTY_15 === 1 || row.__EMPTY_15 === '1') offer = 'HOME 20MBPS';
      else if (row.__EMPTY_16 === 1 || row.__EMPTY_16 === '1') offer = 'HOME 50MBPS';

      const excelToDate = (raw) => {
        if (!raw) return null;
        if (typeof raw === 'number') {
          const excelEpoch = new Date(1899, 11, 30);
          return new Date(excelEpoch.getTime() + raw * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }
        if (typeof raw === 'string') {
          const parts = raw.split(/[/\- ]/);
          if (parts.length >= 3) {
            if (parts[0].length === 4) {
              return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            }
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        return raw ? String(raw).split(' ')[0] : null;
      };

      const subscriptionDate = excelToDate(subscriptionDateRaw);
      const installationDate = excelToDate(installationDateRaw);
      const finalStatusId = installationDate ? statuses.installed : statuses.pending;

      if (lineNumber) {
        const existingSub = await pool.query('SELECT id FROM subscriptions WHERE line_number = $1', [lineNumber]);
        if (existingSub.rows.length > 0) {
          resultSummary.skipped += 1;
          continue;
        }
      }

      let clientId = null;
      if (!lineNumber && (clientPhone || email)) {
        const clientRes = await pool.query(
          `SELECT id FROM clients WHERE created_by = $1 AND ((phone = $2 AND $2 IS NOT NULL) OR (email = $3 AND $3 IS NOT NULL)) LIMIT 1`,
          [ownerId, clientPhone || null, email || null],
        );
        if (clientRes.rows.length > 0) {
          clientId = clientRes.rows[0].id;
          if (commercialLogin) {
            await pool.query(
              `UPDATE clients
               SET commercial_login = COALESCE(NULLIF(commercial_login, ''), $1),
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $2`,
              [commercialLogin, clientId],
            );
          }
        }
      }

      if (!clientId) {
        const insertRes = await pool.query(
          `INSERT INTO clients (full_name, phone, email, commercial_login, created_by)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [clientName || 'Client Inconnu', clientPhone || null, email || null, commercialLogin || null, ownerId],
        );
        clientId = insertRes.rows[0].id;
      }

      let serviceId = null;
      const serviceRes = await pool.query(`SELECT id FROM services WHERE label ILIKE $1 OR code ILIKE $1 LIMIT 1`, [`%${offer || 'default'}%`]);
      if (serviceRes.rows.length > 0) {
        serviceId = serviceRes.rows[0].id;
      } else {
        const newSer = await pool.query(
          `INSERT INTO services (code, label) VALUES ($1, $2) RETURNING id`,
          [(offer || 'default').toLowerCase().replace(/\s+/g, '_'), offer || 'Default Service'],
        );
        serviceId = newSer.rows[0].id;
      }

      const agentId = commercialLogin ? await resolveAgentIdByLogin(commercialLogin, clientName) : null;

      await pool.query(
        `INSERT INTO subscriptions (
          client_id, service_id, status_id, agent_id,
          line_number, subscription_date, installation_date, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [clientId, serviceId, finalStatusId, agentId, lineNumber || null, subscriptionDate, installationDate, notes],
      );

      resultSummary.created += 1;
    }

    import('./notificationController.js').then((m) => {
      m.notifyAdmins({
        type: 'import_completed',
        title: 'Importation terminee',
        message: `L'utilisateur ${req.user.name} a importe un fichier contenant ${resultSummary.created} nouveaux clients le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { page: '/dashboard' },
      });
    });

    res.status(201).json(resultSummary);
  } catch (error) {
    next(error);
  }
};
