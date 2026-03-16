import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { sendAccountCreatedEmail } from '../services/mailer.js';

export const listUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    let query = 'SELECT id, name, email, role, agent_id, phone, created_at FROM users';
    const params = [];
    const conditions = [];

    if (role) {
      conditions.push(`role = $${params.length + 1}`);
      params.push(role);
    }

    // Un admin local ne peut voir que les commerciaux qu'il a créés lui-même
    if (req.user.role === 'admin') {
      conditions.push(`role = $${params.length + 1}`);
      params.push('commercial');
      conditions.push(`created_by = $${params.length + 1}`);
      params.push(req.user.id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'commercial', agent_login } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Nom, email et mot de passe sont requis' });
    }

    if (!['super_admin', 'admin', 'commercial'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    if (req.user.role === 'admin' && role !== 'commercial') {
      return res.status(403).json({ message: 'Un admin ne peut créer que des comptes commerciaux' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    let agentId = null;
    if (agent_login) {
      const agentResult = await pool.query(
        'SELECT id FROM agents WHERE login = $1 LIMIT 1',
        [agent_login],
      );

      if (agentResult.rows.length === 0) {
        // Si aucun agent n'existe encore pour ce login, on le crée automatiquement
        const newAgent = await pool.query(
          `INSERT INTO agents (login, first_name, last_name, active)
           VALUES ($1, $2, '', true)
           RETURNING id`,
          [agent_login, name],
        );
        agentId = newAgent.rows[0].id;
      } else {
        agentId = agentResult.rows[0].id;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, agent_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, agent_id, created_at`,
      [name, email, hashedPassword, role, agentId, req.user.id],
    );

    // Email des accès au nouvel utilisateur (si SMTP configuré)
    try {
      await sendAccountCreatedEmail({
        to: email,
        userName: name,
        accountEmail: email,
        accountPassword: password,
        createdByName: req.user?.name,
      });
    } catch (e) {
      console.warn('[MAIL] Failed to send account credentials email:', e?.message || e);
    }

    // Notification
    import('./notificationController.js').then(m => {
      m.notifyAdmins({
        type: 'user_created',
        title: 'Nouveau compte créé',
        message: `L'utilisateur ${req.user.name} a créé le compte de ${name} (Rôle: ${role}) le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { userId: result.rows[0].id, page: '/admin' }
      });
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, agent_login, phone } = req.body;

    const userToUpdateResult = await pool.query('SELECT role, name FROM users WHERE id = $1', [id]);
    if (userToUpdateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const userToUpdate = userToUpdateResult.rows[0];

    // Permissions
    if (req.user.role === 'admin' && userToUpdate.role !== 'commercial') {
      return res.status(403).json({ message: 'Un admin peut seulement modifier des comptes commerciaux' });
    }

    let agentId = null;
    if (agent_login) {
      const agentResult = await pool.query(
        'SELECT id FROM agents WHERE login = $1 LIMIT 1',
        [agent_login]
      );
      if (agentResult.rows.length === 0) {
        const newAgent = await pool.query(
          `INSERT INTO agents (login, first_name, last_name, active) VALUES ($1, $2, '', true) RETURNING id`,
          [agent_login, name]
        );
        agentId = newAgent.rows[0].id;
      } else {
        agentId = agentResult.rows[0].id;
      }
    }

    let query = 'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), role = COALESCE($3, role), agent_id = COALESCE($4, agent_id), phone = COALESCE($5, phone)';
    let values = [name, email, role, agentId, phone];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = $6 WHERE id = $7 RETURNING id, name, email, role, agent_id, phone, created_at';
      values.push(hashedPassword, id);
    } else {
      query += ' WHERE id = $6 RETURNING id, name, email, role, agent_id, phone, created_at';
      values.push(id);
    }

    const result = await pool.query(query, values);

    // Notification
    import('./notificationController.js').then(m => {
      m.notifyAdmins({
        type: 'user_updated',
        title: 'Compte utilisateur modifié',
        message: `Le compte de ${userToUpdate.name} a été mis à jour par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { userId: id, page: '/admin' }
      });
    });

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userToDeleteResult = await pool.query('SELECT name, role FROM users WHERE id = $1', [id]);
    if (userToDeleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const userToDelete = userToDeleteResult.rows[0];

    if (userToDelete.role === 'super_admin') {
      return res.status(403).json({ message: 'Impossible de supprimer un super-admin' });
    }

    if (req.user.role === 'admin' && userToDelete.role !== 'commercial') {
      return res.status(403).json({ message: 'Un admin peut seulement supprimer des comptes commerciaux' });
    }

    if (userToDelete.role === 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Seul le super-admin peut supprimer un admin' });
    }

    console.log(`[DELETE] Attempting to delete user ${userToDelete.name} (${id})`);
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      console.log(`[DELETE] User ${id} deleted successfully from DB`);
    } catch (dbErr) {
      console.error(`[DELETE] DB Error deleting user ${id}:`, dbErr);
      throw dbErr;
    }

    // Notification
    import('./notificationController.js').then(m => {
      m.notifyAdmins({
        type: 'user_deleted',
        title: 'Compte utilisateur supprimé',
        message: `Le compte de ${userToDelete.name} (${userToDelete.role}) a été supprimé par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { page: '/admin' }
      });
    });

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
