import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import indexRoutes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import pool from './config/database.js';
import dns from 'dns';

dotenv.config();

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.warn('[DNS] Unable to set default result order:', e?.message || e);
}

async function runStartupMigrations() {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS app_migrations (name VARCHAR(255) PRIMARY KEY, executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL');
    await pool.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL');
    await pool.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS commercial_login VARCHAR(255)');
    await pool.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT');

    const migrationName = 'roles_admin_local_split_v1';
    const alreadyRan = await pool.query('SELECT 1 FROM app_migrations WHERE name = $1 LIMIT 1', [migrationName]);

    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await pool.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin_local', 'admin', 'commercial'))");

    if (alreadyRan.rows.length === 0) {
      await pool.query("UPDATE users SET role = 'admin_local' WHERE role = 'admin'");
      await pool.query(
        `WITH RECURSIVE ancestry AS (
           SELECT u.id AS user_id, u.id AS ancestor_id, u.created_by, u.role
           FROM users u
           UNION ALL
           SELECT ancestry.user_id, parent.id AS ancestor_id, parent.created_by, parent.role
           FROM ancestry
           JOIN users parent ON ancestry.created_by = parent.id
         ),
         org_owner AS (
           SELECT DISTINCT ON (user_id) user_id, ancestor_id AS admin_local_id
           FROM ancestry
           WHERE role = 'admin_local'
           ORDER BY user_id
         )
         UPDATE clients c
         SET created_by = org_owner.admin_local_id
         FROM org_owner
         WHERE c.created_by = org_owner.user_id
           AND c.created_by IS DISTINCT FROM org_owner.admin_local_id`,
      );
      await pool.query('INSERT INTO app_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [migrationName]);
    }

    const migrationInstalledStatus = 'fix_historical_installed_status_v1';
    const alreadyRanInstalled = await pool.query('SELECT 1 FROM app_migrations WHERE name = $1 LIMIT 1', [migrationInstalledStatus]);
    if (alreadyRanInstalled.rows.length === 0) {
      await pool.query(`
        UPDATE subscriptions 
        SET status_id = (SELECT id FROM statuses WHERE code = 'installed')
        WHERE installation_date IS NOT NULL 
          AND installation_date <= CURRENT_DATE 
          AND status_id != (SELECT id FROM statuses WHERE code = 'installed')
      `);
      await pool.query('INSERT INTO app_migrations (name) VALUES ($1)', [migrationInstalledStatus]);
    }

    await pool.query(
      `UPDATE clients c
       SET commercial_login = COALESCE(
         NULLIF(c.commercial_login, ''),
         CASE
           WHEN c.address IS NOT NULL AND btrim(c.address) LIKE '{%'
           THEN c.address::jsonb ->> 'commercial_login'
           ELSE NULL
         END,
         sub.agent_login
       )
       FROM (
         SELECT s.client_id, MAX(a.login) AS agent_login
         FROM subscriptions s
         LEFT JOIN agents a ON a.id = s.agent_id
         GROUP BY s.client_id
       ) sub
       WHERE c.id = sub.client_id
          OR (c.address IS NOT NULL AND btrim(c.address) LIKE '{%')`,
    );
  } catch (error) {
    console.error('[MIGRATIONS] Startup migration failed:', error);
    throw error;
  }
}

const app = express();
const PORT = process.env.PORT;

app.set('trust proxy', 1);
app.use(helmet());
app.use(cookieParser());

const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any localhost / 127.0.0.1 locally, or domains in allowedOrigins
      if (!origin || allowedOrigins.includes(origin) || (origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')))) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

const limiter = rateLimit({
  windowMs: 35 * 60 * 1000,
  max: 1000,
  message: 'Trop de requetes depuis cette IP, veuillez reessayer plus tard.',
});

app.use('/api/', limiter);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use('/api', indexRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  await runStartupMigrations();
  app.listen(PORT, () => {
    console.log(`Serveur demarre sur le port ${PORT}`);
    console.log(`API disponible sur http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

startServer().catch((error) => {
  console.error('[STARTUP] Server failed to start:', error);
  process.exit(1);
});
