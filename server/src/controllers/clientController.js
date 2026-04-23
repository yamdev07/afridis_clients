import pool from '../config/database.js';
import { notifyAdmins } from './notificationController.js';
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

export const getAllClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', line_number = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    const scopeOwnerId = await getScopeOwnerId(req.user);

    let query = `
      SELECT c.id,
             c.full_name,
             c.phone,
             c.email,
             c.address,
             c.created_at,
             c.updated_at,
             c.created_by,
             COALESCE(MAX(NULLIF(c.commercial_login, '')), MAX(a.login)) as commercial_login,
             COUNT(DISTINCT s.id) as subscriptions_count,
             MIN(s.line_number) as main_line_number,
             MAX(s.installation_date) as installation_date,
             MAX(s.subscription_date) as subscription_date,
             MAX(sv.label) as offer,
             ARRAY_REMOVE(ARRAY_AGG(DISTINCT sv.code), NULL) as service_codes,
             ARRAY_REMOVE(ARRAY_AGG(DISTINCT sv.label), NULL) as service_labels
      FROM clients c
      LEFT JOIN subscriptions s ON s.client_id = c.id
      LEFT JOIN services sv ON s.service_id = sv.id
      LEFT JOIN agents a ON s.agent_id = a.id
    `;
    const queryParams = [];
    const conditions = [];

    if (scopeOwnerId) {
      conditions.push(`c.created_by = $${queryParams.length + 1}`);
      queryParams.push(scopeOwnerId);
    }

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

    if (status) {
      conditions.push(`EXISTS (
        SELECT 1 FROM subscriptions sub
        JOIN statuses st ON sub.status_id = st.id
        WHERE sub.client_id = c.id AND st.code = $${queryParams.length + 1}
      )`);
      queryParams.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY c.id, c.full_name, c.phone, c.email, c.address, c.created_at, c.updated_at, c.created_by
      ORDER BY c.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    let countQuery = 'SELECT COUNT(DISTINCT c.id) FROM clients c';
    const countParams = [];
    const countConditions = [];

    if (scopeOwnerId) {
      countConditions.push(`c.created_by = $${countParams.length + 1}`);
      countParams.push(scopeOwnerId);
    }

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

    if (status) {
      countConditions.push(`EXISTS (
        SELECT 1 FROM subscriptions sub
        JOIN statuses st ON sub.status_id = st.id
        WHERE sub.client_id = c.id AND st.code = $${countParams.length + 1}
      )`);
      countParams.push(status);
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

export const getClientById = async (req, res, next) => {
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
                  'notes', s.notes,
                  'agent_login', COALESCE(c.commercial_login, a.login)
                )
              ) FILTER (WHERE s.id IS NOT NULL) as subscriptions
       FROM clients c
       LEFT JOIN subscriptions s ON s.client_id = c.id
       LEFT JOIN services sv ON s.service_id = sv.id
       LEFT JOIN statuses st ON s.status_id = st.id
       LEFT JOIN agents a ON s.agent_id = a.id
       WHERE c.id = $1${scopeClause}
       GROUP BY c.id`,
      params,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouve ou acces refuse' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getClientByLineNumber = async (req, res, next) => {
  try {
    const { line_number } = req.params;
    const scopeOwnerId = await getScopeOwnerId(req.user);
    const params = [line_number];
    let scopeClause = '';

    if (scopeOwnerId) {
      params.push(scopeOwnerId);
      scopeClause = ` AND c.created_by = $${params.length}`;
    }

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
                  'notes', s.notes,
                  'agent_login', COALESCE(c.commercial_login, a.login)
                )
              ) FILTER (WHERE s.id IS NOT NULL) as subscriptions
       FROM clients c
       LEFT JOIN subscriptions s ON s.client_id = c.id AND s.line_number = $1
       LEFT JOIN services sv ON s.service_id = sv.id
       LEFT JOIN statuses st ON s.status_id = st.id
       LEFT JOIN agents a ON s.agent_id = a.id
       WHERE EXISTS (SELECT 1 FROM subscriptions WHERE client_id = c.id AND line_number = $1)${scopeClause}
       GROUP BY c.id`,
      params,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aucun client trouve pour ce numero de ligne' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req, res, next) => {
  try {
    const { full_name, phone, email, address } = req.body;
    const scopeOwnerId = await getScopeOwnerId(req.user);
    const ownerId = scopeOwnerId || req.user?.id;

    let meta = {};
    try {
      meta = typeof address === 'string' ? JSON.parse(address) : address || {};
    } catch {
      meta = {};
    }

    const commercialLogin = meta?.commercial_login ? String(meta.commercial_login).trim() : null;

    const clientResult = await pool.query(
      `INSERT INTO clients (full_name, phone, email, commercial_login, address, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [full_name, phone || null, email || null, commercialLogin || null, address || null, ownerId],
    );

    const client = clientResult.rows[0];

    import('./notificationController.js').then((m) => {
      m.notifyAdmins({
        type: 'client_created',
        title: 'Nouveau client cree',
        message: `${req.user.name} a cree le client ${full_name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { clientId: client.id, page: '/clients' },
      });
    });

    if (address) {
      try {
        const requestedServiceCodes = Array.isArray(meta?.service_codes)
          ? meta.service_codes.filter(Boolean).map((code) => String(code).trim())
          : [];
        const offerCode = meta?.offer;
        if (offerCode && !requestedServiceCodes.includes(offerCode)) {
          requestedServiceCodes.push(offerCode);
        }

        if (requestedServiceCodes.length > 0) {
          const serviceRes = await pool.query(
            'SELECT id, code, monthly_price FROM services WHERE code = ANY($1::text[])',
            [requestedServiceCodes],
          );

          if (serviceRes.rows.length > 0) {
            const installDate = meta.installation_date;
            const today = new Date().toISOString().split('T')[0];
            const statusCode = installDate && installDate <= today ? 'installed' : 'pending';
            const statusRes = await pool.query('SELECT id FROM statuses WHERE code = $1', [statusCode]);

            if (statusRes.rows.length > 0) {
              const statusId = statusRes.rows[0].id;
              const agentId = commercialLogin
                ? await resolveAgentIdByLogin(commercialLogin, full_name)
                : (await pool.query('SELECT agent_id FROM users WHERE id = $1', [req.user.id])).rows[0]?.agent_id || null;

              for (const service of serviceRes.rows) {
                await pool.query(
                  `INSERT INTO subscriptions (
                    client_id, agent_id, service_id, status_id,
                    line_number, subscription_date, installation_date, contract_cost, notes
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                  [
                    client.id,
                    agentId || null,
                    service.id,
                    statusId,
                    meta.line_number || null,
                    meta.subscription_date || today,
                    installDate || null,
                    meta.tarif || service.monthly_price,
                    meta.notes || null,
                  ],
                );
              }

              import('./notificationController.js').then((m) => {
                m.notifyAdmins({
                  type: 'client_subscribed',
                  title: 'Nouveaux services souscrits',
                  message: `Le client ${client.full_name} a ete inscrit a ${serviceRes.rows.length} service(s) par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
                  meta: { clientId: client.id, serviceCodes: requestedServiceCodes, page: '/clients' },
                });
              });
            }
          }
        }
      } catch (e) {
        console.warn("Erreur lors de la creation auto de l'abonnement:", e.message);
      }
    }

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email, address } = req.body;
    const scopeOwnerId = await getScopeOwnerId(req.user);

    let meta = {};
    try {
      meta = typeof address === 'string' ? JSON.parse(address) : address || {};
    } catch {
      meta = {};
    }

    const commercialLogin = meta?.commercial_login ? String(meta.commercial_login).trim() : null;

    const params = [full_name, phone, email, commercialLogin || null, address, id];
    let scopeClause = '';

    if (scopeOwnerId) {
      params.push(scopeOwnerId);
      scopeClause = ` AND created_by = $${params.length}`;
    }

    const result = await pool.query(
      `UPDATE clients
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           commercial_login = COALESCE($4, commercial_login),
           address = COALESCE($5, address),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6${scopeClause}
       RETURNING *`,
      params,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouve' });
    }

    if (address) {
      try {
        const installDate = meta?.installation_date || null;
        const lineNumber = meta?.line_number || null;
        const requestedServiceCodes = Array.isArray(meta?.service_codes)
          ? meta.service_codes.filter(Boolean).map((code) => String(code).trim())
          : [];
        if (meta?.offer && !requestedServiceCodes.includes(meta.offer)) {
          requestedServiceCodes.push(meta.offer);
        }
        const updateParts = [];
        const updateValues = [];
        let idx = 1;

        if (installDate !== undefined) {
          updateParts.push(`installation_date = $${idx++}`);
          updateValues.push(installDate || null);

          // Update status based on installation date
          const today = new Date().toISOString().split('T')[0];
          const newStatus = (installDate && installDate <= today) ? 'installed' : 'pending';
          updateParts.push(`status_id = (SELECT id FROM statuses WHERE code = $${idx++})`);
          updateValues.push(newStatus);
        }
        if (lineNumber !== undefined) {
          if (lineNumber !== undefined && !['super_admin', 'admin_local', 'admin'].includes(req.user?.role)) {
            const existingSub = await pool.query('SELECT line_number FROM subscriptions WHERE client_id = $1 LIMIT 1', [id]);
            if (existingSub.rows.length > 0 && existingSub.rows[0].line_number && existingSub.rows[0].line_number !== lineNumber) {
              return res.status(403).json({ message: 'Seul un administrateur peut modifier le numero de ligne' });
            }
          }
          updateParts.push(`line_number = $${idx++}`);
          updateValues.push(lineNumber || null);
        }
        if (commercialLogin) {
          const agentId = await resolveAgentIdByLogin(commercialLogin, full_name || result.rows[0].full_name);
          updateParts.push(`agent_id = $${idx++}`);
          updateValues.push(agentId || null);
        }

        if (updateParts.length > 0) {
          updateValues.push(id);
          await pool.query(
            `UPDATE subscriptions SET ${updateParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE client_id = $${idx}`,
            updateValues,
          );
        }

        const shouldSyncServices =
          Array.isArray(meta?.service_codes)
          || Object.prototype.hasOwnProperty.call(meta || {}, 'offer');

        if (shouldSyncServices) {
          const requestedCodes = [...new Set(requestedServiceCodes)];
          const servicesRes = requestedCodes.length > 0
            ? await pool.query(
              'SELECT id, code, monthly_price FROM services WHERE code = ANY($1::text[])',
              [requestedCodes],
            )
            : { rows: [] };
          const requestedById = new Map(servicesRes.rows.map((row) => [row.id, row]));

          const existingSubsRes = await pool.query(
            'SELECT id, service_id FROM subscriptions WHERE client_id = $1',
            [id],
          );
          const existingByServiceId = new Map(existingSubsRes.rows.map((row) => [row.service_id, row]));

          const today = new Date().toISOString().split('T')[0];
          const statusCode = installDate && installDate <= today ? 'installed' : 'pending';
          const statusRes = await pool.query('SELECT id FROM statuses WHERE code = $1', [statusCode]);
          const statusId = statusRes.rows[0]?.id;

          const resolvedAgentId = commercialLogin
            ? await resolveAgentIdByLogin(commercialLogin, full_name || result.rows[0].full_name)
            : (await pool.query('SELECT agent_id FROM users WHERE id = $1', [req.user.id])).rows[0]?.agent_id || null;

          for (const [serviceId] of existingByServiceId) {
            if (!requestedById.has(serviceId)) {
              await pool.query('DELETE FROM subscriptions WHERE id = $1', [existingByServiceId.get(serviceId).id]);
            }
          }

          if (statusId) {
            for (const [serviceId, service] of requestedById) {
              const existing = existingByServiceId.get(serviceId);
              if (existing) {
                await pool.query(
                  `UPDATE subscriptions
                   SET status_id = $1,
                       agent_id = COALESCE($2, agent_id),
                       line_number = COALESCE($3, line_number),
                       subscription_date = COALESCE($4, subscription_date),
                       installation_date = $5,
                       contract_cost = COALESCE($6, contract_cost),
                       notes = COALESCE($7, notes),
                       updated_at = CURRENT_TIMESTAMP
                   WHERE id = $8`,
                  [
                    statusId,
                    resolvedAgentId,
                    lineNumber || null,
                    meta?.subscription_date || null,
                    installDate || null,
                    meta?.tarif || service.monthly_price,
                    meta?.notes || null,
                    existing.id,
                  ],
                );
              } else {
                await pool.query(
                  `INSERT INTO subscriptions (
                    client_id, service_id, status_id, agent_id, line_number, subscription_date, installation_date, contract_cost, notes
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                  [
                    id,
                    serviceId,
                    statusId,
                    resolvedAgentId,
                    lineNumber || null,
                    meta?.subscription_date || today,
                    installDate || null,
                    meta?.tarif || service.monthly_price,
                    meta?.notes || null,
                  ],
                );
              }
            }
          }
        }
      } catch (parseErr) {
        console.warn('Sync subscription: impossible de parser address JSON:', parseErr.message);
      }
    }

    const updatedClient = result.rows[0];

    import('./notificationController.js').then((m) => {
      m.notifyAdmins({
        type: 'client_updated',
        title: 'Fiche client modifiee',
        message: `Les informations de ${updatedClient.full_name} ont ete mises a jour par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { clientId: id, page: '/clients' },
      });
    });

    res.json(updatedClient);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scopeOwnerId = await getScopeOwnerId(req.user);
    const params = [id];
    let scopeClause = '';

    if (scopeOwnerId) {
      params.push(scopeOwnerId);
      scopeClause = ` AND created_by = $${params.length}`;
    }

    const clientRes = await pool.query(`SELECT full_name FROM clients WHERE id = $1${scopeClause}`, params);
    if (clientRes.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouve' });
    }
    const clientName = clientRes.rows[0].full_name;

    await pool.query('DELETE FROM subscriptions WHERE client_id = $1', [id]);
    await pool.query(`DELETE FROM clients WHERE id = $1${scopeClause}`, params);

    notifyAdmins({
      type: 'client_deleted',
      title: 'Client supprime',
      message: `Le client ${clientName} a ete supprime par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
      meta: { page: '/clients' },
    }).catch((err) => console.error('Error in notifyAdmins during client deletion:', err));

    return res.status(200).json({ success: true, message: 'Client supprime avec succes' });
  } catch (error) {
    next(error);
  }
};
