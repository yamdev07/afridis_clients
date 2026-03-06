-- Migration: Ajouter la colonne phone à la table users
-- À exécuter sur la base de données PostgreSQL existante 'client_flow'

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Index optionnel pour recherche par téléphone
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
