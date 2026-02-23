export const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  // Erreur de validation
  if (err.name === 'ValidationError' || err.errors) {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: err.errors || err.message,
    });
  }

  // Erreur PostgreSQL
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      message: 'Erreur de contrainte de base de données',
      error: err.detail || err.message,
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token invalide' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expiré' });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
};
