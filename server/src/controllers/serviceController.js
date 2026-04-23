import pool from '../config/database.js';
import { notifyAdmins } from './notificationController.js';

export const getAllServices = async (req, res, next) => {
  try {
    const { is_active } = req.query;
    let query = 'SELECT * FROM services';
    const params = [];

    if (is_active !== undefined) {
      query += ' WHERE is_active = $1';
      params.push(is_active === 'true');
    }

    query += ' ORDER BY label';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT s.*,
              json_agg(
                json_build_object(
                  'id', sub.id,
                  'client', json_build_object(
                    'id', c.id,
                    'full_name', c.full_name,
                    'email', c.email,
                    'phone', c.phone
                  ),
                  'subscription_date', sub.subscription_date,
                  'installation_date', sub.installation_date,
                  'contract_cost', sub.contract_cost,
                  'status', json_build_object('id', st.id, 'code', st.code, 'label', st.label),
                  'line_number', sub.line_number
                )
              ) FILTER (WHERE sub.id IS NOT NULL) as subscribers
       FROM services s
       LEFT JOIN subscriptions sub ON sub.service_id = s.id
       LEFT JOIN clients c ON sub.client_id = c.id
       LEFT JOIN statuses st ON sub.status_id = st.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getServiceClients = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
         c.id as client_id,
         c.full_name,
         c.email,
         c.phone,
         s.id as subscription_id,
         s.subscription_date,
         s.installation_date,
         s.contract_cost,
         s.line_number,
         st.code as status_code,
         st.label as status_label,
         a.login as agent_login
       FROM subscriptions s
       JOIN clients c ON s.client_id = c.id
       JOIN statuses st ON s.status_id = st.id
       LEFT JOIN agents a ON s.agent_id = a.id
       WHERE s.service_id = $1
       ORDER BY s.subscription_date DESC NULLS LAST, s.created_at DESC`,
      [id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const { code, label, description, monthly_price = 0, is_active = true } = req.body;

    const result = await pool.query(
      `INSERT INTO services (code, label, description, monthly_price, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [code, label, description || null, monthly_price, is_active]
    );

    const service = result.rows[0];

    // Notification
    import('./notificationController.js').then(m => {
      m.notifyAdmins({
        type: 'service_created',
        title: 'Nouveau service créé',
        message: `Le service "${label}" (${code}) a été créé par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { serviceId: service.id, page: '/services' }
      });
    });

    res.status(201).json(service);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Un service avec ce code existe déjà' });
    }
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, label, description, monthly_price, is_active, apply_price_to_existing = true } = req.body;

    const existingServiceResult = await pool.query('SELECT id, monthly_price, label FROM services WHERE id = $1', [id]);
    if (existingServiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    const existingService = existingServiceResult.rows[0];

    const result = await pool.query(
      `UPDATE services
       SET code = COALESCE($1, code),
           label = COALESCE($2, label),
           description = COALESCE($3, description),
           monthly_price = COALESCE($4, monthly_price),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [code, label, description, monthly_price, is_active, id]
    );

    const updatedService = result.rows[0];

    if (
      monthly_price !== undefined &&
      Number(monthly_price) !== Number(existingService.monthly_price) &&
      apply_price_to_existing !== false
    ) {
      await pool.query(
        `UPDATE subscriptions
         SET contract_cost = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE service_id = $2`,
        [monthly_price, id],
      );
    }

    // Notification
    import('./notificationController.js').then(m => {
      m.notifyAdmins({
        type: 'service_updated',
        title: 'Service modifié',
        message: `Le service "${updatedService.label}" a été mis à jour par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { serviceId: id, page: '/services' }
      });
    });

    res.json(updatedService);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Un service avec ce code existe déjà' });
    }
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Récupérer les infos avant suppression
    const serviceRes = await pool.query('SELECT label FROM services WHERE id = $1', [id]);
    if (serviceRes.rows.length === 0) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    const serviceLabel = serviceRes.rows[0].label;

    // Supprimer manuellement les abonnements liés à ce service
    await pool.query('DELETE FROM subscriptions WHERE service_id = $1', [id]);
    await pool.query('DELETE FROM services WHERE id = $1', [id]);

    // Notification (non-bloquant)
    notifyAdmins({
      type: 'service_deleted',
      title: 'Service supprimé',
      message: `Le service "${serviceLabel}" a été supprimé par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
      meta: { page: '/services' }
    }).catch(err => console.error('Error in notifyAdmins during service deletion:', err));

    console.log(`[DELETE] Service ${serviceLabel} (${id}) deleted successfully`);
    res.json({ success: true, message: 'Service supprimé avec succès' });
  } catch (error) {
    console.error(`[DELETE] Error deleting service ${id}:`, error);
    next(error);
  }
};
