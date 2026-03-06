import bcrypt from 'bcrypt';
import pool from '../config/database.js';

export const listUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    let query = 'SELECT id, name, email, role, agent_id, created_at FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
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
      `INSERT INTO users (name, email, password, role, agent_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, agent_id, created_at`,
      [name, email, hashedPassword, role, agentId],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, agent_login } = req.body;

    const userToUpdate = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (userToUpdate.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
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

    let query = 'UPDATE users SET name = $1, email = $2, role = $3, agent_id = $4';
    let values = [name, email, role, agentId];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = $5 WHERE id = $6 RETURNING id, name, email, role, agent_id, created_at';
      values.push(hashedPassword, id);
    } else {
      query += ' WHERE id = $5 RETURNING id, name, email, role, agent_id, created_at';
      values.push(id);
    }

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userToDelete = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (userToDelete.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const roleToDelete = userToDelete.rows[0].role;

    if (roleToDelete === 'super_admin') {
      return res.status(403).json({ message: 'Impossible de supprimer un super-admin' });
    }

    if (roleToDelete === 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Seul le super-admin peut supprimer un admin' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
