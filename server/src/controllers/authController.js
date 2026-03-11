import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/database.js';
import jwtConfig from '../config/jwt.js';

const generateTokens = (userId) => {
  const jti = crypto.randomUUID();
  const accessToken = jwt.sign(
    { userId, jti },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
  const refreshToken = jwt.sign(
    { userId, jti, type: 'refresh' },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  );
  return { accessToken, refreshToken, jti };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'commercial' } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Stocker le refresh token dans un cookie httpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.agent_id, u.phone, a.login as agent_login 
       FROM users u 
       LEFT JOIN agents a ON u.agent_id = a.id 
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Stocker le refresh token dans un cookie httpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agent_id: user.agent_id,
        phone: user.phone,
        agent_login: user.agent_login
      },
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }

    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Token invalide' });
    }

    // Vérifier si l'utilisateur existe toujours
    const userResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const user = userResult.rows[0];

    // Générer un nouveau access token
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    // Mettre à jour le refresh token dans le cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expiré' });
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.decode(token);
        const jti = decoded?.jti || token.substring(0, 50);
        const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 15 * 60 * 1000);

        // Ajouter le token à la blacklist
        await pool.query(
          'INSERT INTO token_blacklist (token_id, expires_at) VALUES ($1, $2) ON CONFLICT (token_id) DO NOTHING',
          [jti, expiresAt]
        );
      } catch (err) {
        console.error('Erreur lors de la révocation du token:', err);
      }
    }

    // Supprimer le cookie refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.agent_id, u.created_at,
              a.login as agent_login, a.first_name as agent_first_name, a.last_name as agent_last_name
       FROM users u
       LEFT JOIN agents a ON u.agent_id = a.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    // Vérifier l’unicité de l’email si modifié
    if (email) {
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id <> $2',
        [email, req.user.id]
      );
      if (existing.rows.length > 0) {
        return res
          .status(400)
          .json({ message: 'Cet email est déjà utilisé par un autre compte' });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, role, agent_id, phone`,
      [name, email, phone || null, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const changeOwnPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit faire au moins 6 caractères' });
    }

    const userResult = await pool.query(
      'SELECT id, password FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!isValid) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashed, req.user.id]
    );

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Email et nouveau mot de passe sont requis' });
    }

    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Aucun utilisateur trouvé avec cet email' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE email = $2`,
      [hashedPassword, email]
    );

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    next(error);
  }
};
