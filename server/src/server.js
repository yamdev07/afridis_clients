import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import indexRoutes from './routes/index.js'; // Changed 'routes' to 'indexRoutes'
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import pool from './config/database.js';

dotenv.config();

// Run the ALTER TABLE queries to add created_by at the start.
pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL').catch(err => console.error(err));
pool.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL').catch(err => console.error(err));

const app = express();
const PORT = process.env.PORT;

// Middlewares de sécurité
app.use(helmet());
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting - assoupli pour développement (éviter les 429 côté frontend)
const limiter = rateLimit({
  windowMs: 35 * 60 * 1000, // 15 minutes
  max: 1000, // limite chaque IP à 1000 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
});

app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Routes
app.use('/api', indexRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
