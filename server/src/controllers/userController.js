import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { sendAccountCreatedEmail } from '../services/mailer.js';
import { getCreatableRoles, getOrganizationOwnerId, ROLES } from '../utils/access.js';

async function getManagedUser(actor, targetUserId) {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.agent_id, u.phone, u.created_at, u.created_by,
            u.company_name, u.company_description, u.company_rccm, u.company_ifu,
            COALESCE(u.is_suspended, false) AS is_suspended,
            u.suspended_at,
            u.suspended_by,
            a.login AS agent_login
     FROM users u
     LEFT JOIN agents a ON a.id = u.agent_id
     WHERE u.id = $1`,
    [targetUserId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const target = result.rows[0];

  if (actor.role === 'super_admin') {
    return target;
  }

  if (actor.role === 'admin_local') {
    const actorOrgId = await getOrganizationOwnerId(pool, actor.id);
    const targetOrgId = await getOrganizationOwnerId(pool, target.id);
    return actorOrgId === targetOrgId ? target : null;
  }

  if (actor.role === 'admin') {
    return target.created_by === actor.id && target.role === 'commercial' ? target : null;
  }

  return null;
}

function canCreateRole(actorRole, targetRole) {
  return getCreatableRoles(actorRole).includes(targetRole);
}

function canAssignRole(actorRole, targetRole) {
  if (actorRole === 'admin_local' && ['admin', 'admin_local', 'commercial'].includes(targetRole)) {
    return true;
  }
  return getCreatableRoles(actorRole).includes(targetRole);
}

export const listUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    if (role && !ROLES.includes(role)) {
      return res.status(400).json({ message: 'Role invalide' });
    }

    let result;

    if (req.user.role === 'super_admin') {
      const params = [];
      let query = `SELECT u.id, u.name, u.email, u.role, u.agent_id, u.phone, u.created_at, u.created_by,
                          u.company_name, u.company_description, u.company_rccm, u.company_ifu,
                          COALESCE(u.is_suspended, false) AS is_suspended,
                          u.suspended_at,
                          u.suspended_by,
                          a.login AS agent_login
                   FROM users u
                   LEFT JOIN agents a ON a.id = u.agent_id`;

      if (role) {
        params.push(role);
        query += ` WHERE u.role = $${params.length}`;
      }

      query += ' ORDER BY u.created_at DESC';
      result = await pool.query(query, params);
      return res.json(result.rows);
    }

    if (req.user.role === 'admin_local') {
      const params = [req.user.id];
      let query = `WITH RECURSIVE descendants AS (
                     SELECT id, name, email, role, agent_id, phone, created_at, created_by, company_name, company_description, company_rccm, company_ifu
                     FROM users
                     WHERE id = $1
                     UNION ALL
                     SELECT u.id, u.name, u.email, u.role, u.agent_id, u.phone, u.created_at, u.created_by, u.company_name, u.company_description, u.company_rccm, u.company_ifu
                     FROM users u
                     JOIN descendants d ON u.created_by = d.id
                   )
                 SELECT d.id, d.name, d.email, d.role, d.agent_id, d.phone, d.created_at, d.created_by,
                        d.company_name, d.company_description, d.company_rccm, d.company_ifu,
                         COALESCE(u.is_suspended, false) AS is_suspended,
                         u.suspended_at,
                         u.suspended_by,
                          a.login AS agent_login
                   FROM descendants d
                  JOIN users u ON u.id = d.id
                   LEFT JOIN agents a ON a.id = d.agent_id
                   WHERE d.id <> $1`;

      if (role) {
        params.push(role);
        query += ` AND d.role = $${params.length}`;
      }

      query += ' ORDER BY d.created_at DESC';
      result = await pool.query(query, params);
      return res.json(result.rows);
    }

    if (req.user.role === 'admin') {
      const params = [req.user.id, 'commercial'];
      let query = `SELECT u.id, u.name, u.email, u.role, u.agent_id, u.phone, u.created_at, u.created_by,
                          u.company_name, u.company_description, u.company_rccm, u.company_ifu,
                          COALESCE(u.is_suspended, false) AS is_suspended,
                          u.suspended_at,
                          u.suspended_by,
                          a.login AS agent_login
                   FROM users u
                   LEFT JOIN agents a ON a.id = u.agent_id
                   WHERE u.created_by = $1 AND u.role = $2`;

      if (role) {
        params.push(role);
        query += ` AND u.role = $${params.length}`;
      }

      query += ' ORDER BY u.created_at DESC';
      result = await pool.query(query, params);
      return res.json(result.rows);
    }

    return res.status(403).json({ message: 'Acces refuse' });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'commercial',
      agent_login,
      company_name,
      company_description,
      company_rccm,
      company_ifu,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nom, email et mot de passe sont requis' });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: 'Role invalide' });
    }

    if (!canCreateRole(req.user.role, role)) {
      return res.status(403).json({ message: 'Vous ne pouvez pas creer ce type de compte' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est deja utilise' });
    }

    let agentId = null;
    if (agent_login) {
      const agentResult = await pool.query('SELECT id FROM agents WHERE login = $1 LIMIT 1', [agent_login]);

      if (agentResult.rows.length === 0) {
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
    if (role === 'admin_local' && (!company_name || !company_rccm || !company_ifu)) {
      return res.status(400).json({ message: "Les informations entreprise (nom, RCCM, IFU) sont obligatoires pour un admin local" });
    }

    const result = await pool.query(
      `INSERT INTO users (
        name, email, password, role, agent_id, created_by,
        company_name, company_description, company_rccm, company_ifu
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, email, role, agent_id, created_at, created_by, company_name, company_description, company_rccm, company_ifu`,
      [
        name,
        email,
        hashedPassword,
        role,
        agentId,
        req.user.id,
        company_name || null,
        company_description || null,
        company_rccm || null,
        company_ifu || null,
      ],
    );

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

    import('./notificationController.js').then((m) => {
      m.notifyAdmins({
        type: 'user_created',
        title: 'Nouveau compte cree',
        message: `L'utilisateur ${req.user.name} a cree le compte de ${name} (Role: ${role}) le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { userId: result.rows[0].id, page: '/admin/users' },
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
    const { name, email, password, role, agent_login, phone, company_name, company_description, company_rccm, company_ifu } = req.body;

    const userToUpdate = await getManagedUser(req.user, id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'Utilisateur non trouve ou acces refuse' });
    }

    if (userToUpdate.role === 'super_admin') {
      return res.status(403).json({ message: 'Impossible de modifier un super-admin' });
    }

    if (email) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, id]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: 'Cet email est deja utilise' });
      }
    }

    const nextRole = role || userToUpdate.role;
    if (!ROLES.includes(nextRole)) {
      return res.status(400).json({ message: 'Role invalide' });
    }

    if (nextRole !== userToUpdate.role && !canAssignRole(req.user.role, nextRole)) {
      return res.status(403).json({ message: 'Vous ne pouvez pas attribuer ce role' });
    }

    if (req.user.role === 'admin' && nextRole !== 'commercial') {
      return res.status(403).json({ message: 'Un admin simple ne peut gerer que des commerciaux' });
    }

    let agentId = userToUpdate.agent_id || null;
    if (agent_login !== undefined) {
      if (!agent_login) {
        agentId = null;
      } else {
        const agentResult = await pool.query('SELECT id FROM agents WHERE login = $1 LIMIT 1', [agent_login]);
        if (agentResult.rows.length === 0) {
          const newAgent = await pool.query(
            `INSERT INTO agents (login, first_name, last_name, active)
             VALUES ($1, $2, '', true)
             RETURNING id`,
            [agent_login, name || userToUpdate.name],
          );
          agentId = newAgent.rows[0].id;
        } else {
          agentId = agentResult.rows[0].id;
        }
      }
    }

    const effectiveCompanyName = company_name ?? userToUpdate.company_name;
    const effectiveCompanyRccm = company_rccm ?? userToUpdate.company_rccm;
    const effectiveCompanyIfu = company_ifu ?? userToUpdate.company_ifu;
    if (nextRole === 'admin_local' && (!effectiveCompanyName || !effectiveCompanyRccm || !effectiveCompanyIfu)) {
      return res.status(400).json({ message: "Les informations entreprise (nom, RCCM, IFU) sont obligatoires pour un admin local" });
    }

    let query = `UPDATE users
                 SET name = COALESCE($1, name),
                     email = COALESCE($2, email),
                     role = COALESCE($3, role),
                     agent_id = $4,
                     phone = COALESCE($5, phone),
                     company_name = COALESCE($6, company_name),
                     company_description = COALESCE($7, company_description),
                     company_rccm = COALESCE($8, company_rccm),
                     company_ifu = COALESCE($9, company_ifu),
                     updated_at = CURRENT_TIMESTAMP`;
    const values = [name, email, role, agentId, phone, company_name, company_description, company_rccm, company_ifu];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = $10 WHERE id = $11 RETURNING id, name, email, role, agent_id, phone, created_at, created_by, company_name, company_description, company_rccm, company_ifu';
      values.push(hashedPassword, id);
    } else {
      query += ' WHERE id = $10 RETURNING id, name, email, role, agent_id, phone, created_at, created_by, company_name, company_description, company_rccm, company_ifu';
      values.push(id);
    }

    const result = await pool.query(query, values);

    import('./notificationController.js').then((m) => {
      m.notifyAdmins({
        type: 'user_updated',
        title: 'Compte utilisateur modifie',
        message: `Le compte de ${userToUpdate.name} a ete mis a jour par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { userId: id, page: '/admin/users' },
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

    const userToDelete = await getManagedUser(req.user, id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Utilisateur non trouve ou acces refuse' });
    }

    if (userToDelete.role === 'super_admin') {
      return res.status(403).json({ message: 'Impossible de supprimer un super-admin' });
    }

    if (userToDelete.id === req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    if (req.user.role === 'admin' && userToDelete.role !== 'commercial') {
      return res.status(403).json({ message: 'Un admin simple peut seulement supprimer des comptes commerciaux' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    import('./notificationController.js').then((m) => {
      m.notifyAdmins({
        type: 'user_deleted',
        title: 'Compte utilisateur supprime',
        message: `Le compte de ${userToDelete.name} (${userToDelete.role}) a ete supprime par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { page: '/admin/users' },
      });
    });

    res.json({ message: 'Utilisateur supprime avec succes' });
  } catch (error) {
    next(error);
  }
};

export const setUserSuspension = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { suspended, reason } = req.body;

    if (typeof suspended !== 'boolean') {
      return res.status(400).json({ message: 'Le champ "suspended" doit etre un booleen' });
    }

    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Seul le super-admin peut suspendre des comptes entreprise' });
    }

    const userToManage = await getManagedUser(req.user, id);
    if (!userToManage) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    if (userToManage.role !== 'admin_local') {
      return res.status(400).json({ message: 'La suspension est reservee aux comptes admin_local' });
    }

    if (userToManage.role === 'super_admin') {
      return res.status(403).json({ message: 'Impossible de suspendre un super-admin' });
    }

    const result = await pool.query(
      `UPDATE users
       SET is_suspended = $1,
           suspended_at = CASE WHEN $1 THEN CURRENT_TIMESTAMP ELSE NULL END,
           suspended_by = CASE WHEN $1 THEN $2 ELSE NULL END,
           suspended_reason = CASE WHEN $1 THEN $3 ELSE NULL END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, role, agent_id, phone, created_at, created_by, COALESCE(is_suspended, false) AS is_suspended`,
      [suspended, req.user.id, reason || null, id],
    );

    import('./notificationController.js').then((m) => {
      m.notifyAdmins({
        type: suspended ? 'user_suspended' : 'user_unsuspended',
        title: suspended ? 'Compte entreprise suspendu' : 'Compte entreprise reactive',
        message: `Le compte ${userToManage.name} a ete ${suspended ? 'suspendu' : 'reactive'} par ${req.user.name} le ${new Date().toLocaleString('fr-FR')}.`,
        meta: { userId: id, page: '/admin/users', reason: reason || null },
      });
    });

    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

