import pool from '../config/database.js';
import { notifyAdmins } from './notificationController.js';

export const getAllClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', line_number = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*,
             COUNT(DISTINCT s.id) as subscriptions_count,
             MIN(s.line_number) as main_line_number,
             MAX(s.installation_date) as installation_date,
             MAX(s.subscription_date) as subscription_date,
             MAX(sv.label) as offer,
             MAX(a.login) as commercial_login
      FROM clients c
      LEFT JOIN subscriptions s ON s.client_id = c.id
      LEFT JOIN services sv ON s.service_id = sv.id
      LEFT JOIN agents a ON s.agent_id = a.id
    `;
    const queryParams = [];
    const conditions = [];

    // Filter by created_by for non-super admins. Admins and commercials see only their clients. 
    if (req.user && req.user.role !== 'super_admin') {
      conditions.push(`c.created_by = $${queryParams.length + 1}`);
      queryParams.push(req.user.id);
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

    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Compter le total pour la pagination
    let countQuery = 'SELECT COUNT(DISTINCT c.id) FROM clients c';
    const countParams = [];
    const countConditions = [];

    if (req.user && req.user.role !== 'super_admin') {
      countConditions.push(`c.created_by = $${countParams.length + 1}`);
      countParams.push(req.user.id);
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
        WHERE c.id = $1 ${req.user.role === 'super_admin' ? '' : `AND c.created_by = '${req.user.id}'`}
        GROUP BY c.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé ou accès refusé' });
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
    const currentUserId = req.user?.id;

    // 1. Créer le client
    const clientResult = await pool.query(
      `INSERT INTO clients (full_name, phone, email, address, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [full_name, phone || null, email || null, address || null, currentUserId]
    );

    const client = clientResult.rows[0];

    // Notification
    import('./notificationController.js').then(m => {
      m.notifyAdmins({
        type: 'client_created',
        title: 'Nouveau client créé',
        message: `${req.user.name} a créé le client ${full_name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { clientId: client.id, page: '/clients' }
      });
    });

    // 2. Si une offre est spécifiée dans address, créer un abonnement automatiquement
    if (address) {
      try {
        const meta = typeof address === 'string' ? JSON.parse(address) : address;
        const offerCode = meta?.offer;

        if (offerCode) {
          // Trouver le service par son code
          const serviceRes = await pool.query('SELECT id, monthly_price FROM services WHERE code = $1', [offerCode.trim()]);

          if (serviceRes.rows.length > 0) {
            const service = serviceRes.rows[0];

            // Trouver le statut par défaut (pending si pas d'installation_date, installed si date passée)
            const installDate = meta.installation_date;
            const today = new Date().toISOString().split('T')[0];
            const statusCode = (installDate && installDate <= today) ? 'installed' : 'pending';

            const statusRes = await pool.query('SELECT id FROM statuses WHERE code = $1', [statusCode]);

            if (statusRes.rows.length > 0) {
              const statusId = statusRes.rows[0].id;

              // Récupérer l'agent_id du createur si c'est un commercial
              const userRes = await pool.query('SELECT agent_id FROM users WHERE id = $1', [currentUserId]);
              const agentId = userRes.rows[0]?.agent_id;

              // Créer l'abonnement
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
                  meta.notes || null
                ]
              );

              // Notification specific to service addition
              import('./notificationController.js').then(m => {
                m.notifyAdmins({
                  type: 'client_subscribed',
                  title: 'Nouveau service souscrit',
                  message: `Le client ${client.full_name} a été automatiquement inscrit au service "${offerCode}" par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
                  meta: { clientId: client.id, serviceCode: offerCode, page: '/clients' }
                });
              });
            }
          }
        }
      } catch (e) {
        console.warn("Erreur lors de la création auto de l'abonnement:", e.message);
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

    // Synchroniser installation_date et line_number depuis le JSON address → table subscriptions
    if (address) {
      try {
        const meta = typeof address === 'string' ? JSON.parse(address) : address;
        const installDate = meta?.installation_date || null;
        const lineNumber = meta?.line_number || null;

        // Mettre à jour les abonnements de ce client avec les nouvelles dates / numéro de ligne
        if (installDate !== undefined || lineNumber !== undefined) {
          if (lineNumber !== undefined && !['super_admin', 'admin'].includes(req.user?.role)) {
            const existingSub = await pool.query('SELECT line_number FROM subscriptions WHERE client_id = $1 LIMIT 1', [id]);
            if (existingSub.rows.length > 0 && existingSub.rows[0].line_number && existingSub.rows[0].line_number !== lineNumber) {
               return res.status(403).json({ message: 'Seul un administrateur peut modifier le numéro de ligne' });
            }
          }

          let updateParts = [];
          let updateValues = [];
          let idx = 1;

          if (installDate !== undefined) {
            updateParts.push(`installation_date = $${idx++}`);
            updateValues.push(installDate || null);
          }
          if (lineNumber !== undefined) {
            updateParts.push(`line_number = $${idx++}`);
            updateValues.push(lineNumber || null);
          }

          if (updateParts.length > 0) {
            updateValues.push(id);
            await pool.query(
              `UPDATE subscriptions SET ${updateParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE client_id = $${idx}`,
              updateValues
            );
          }
        }
      } catch (parseErr) {
        // Si le JSON est malformé, on ignore la sync — on ne bloque pas la réponse
        console.warn('Sync subscription: impossible de parser address JSON:', parseErr.message);
      }
    }

    const updatedClient = result.rows[0];

    // Notification
    import('./notificationController.js').then(m => {
      m.notifyAdmins({
        type: 'client_updated',
        title: 'Fiche client modifiée',
        message: `Les informations de ${updatedClient.full_name} ont été mises à jour par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { clientId: id, page: '/clients' }
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

    // Récupérer le nom avant suppression pour la notification
    const clientRes = await pool.query('SELECT full_name FROM clients WHERE id = $1', [id]);
    if (clientRes.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    const clientName = clientRes.rows[0].full_name;

    console.log(`[DELETE] Attempting to delete client ${clientName} (${id})`);
    try {
      // Supprimer manuellement les abonnements si CASCADE pose souci
      await pool.query('DELETE FROM subscriptions WHERE client_id = $1', [id]);
      await pool.query('DELETE FROM clients WHERE id = $1', [id]);
      console.log(`[DELETE] Client ${id} and subscriptions deleted successfully`);
    } catch (dbErr) {
      console.error(`[DELETE] DB Error deleting client ${id}:`, dbErr);
      throw dbErr;
    }

    // Notification (non-bloquant)
    notifyAdmins({
      type: 'client_deleted',
      title: 'Client supprimé',
      message: `Le client ${clientName} a été supprimé par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
      meta: { page: '/clients' }
    }).catch(err => console.error('Error in notifyAdmins during client deletion:', err));

    return res.status(200).json({ success: true, message: 'Client supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
