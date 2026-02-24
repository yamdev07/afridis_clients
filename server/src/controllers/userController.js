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
        return res.status(400).json({ message: 'Agent inexistant pour ce login' });
      }
      agentId = agentResult.rows[0].id;
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

