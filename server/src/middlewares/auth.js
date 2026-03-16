import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';
import pool from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Token d\'accès manquant' });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Vérifier si le token est dans la blacklist
    const blacklistCheck = await pool.query(
      'SELECT * FROM token_blacklist WHERE token_id = $1 AND expires_at > NOW()',
      [decoded.jti || token.substring(0, 50)]
    );

    if (blacklistCheck.rows.length > 0) {
      return res.status(401).json({ message: 'Token révoqué' });
    }

    // Récupérer l'utilisateur
    const userResult = await pool.query(
      'SELECT id, name, email, role, agent_id FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    return res.status(403).json({ message: 'Token invalide' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé: rôle insuffisant' });
    }
    next();
  };
};
