-- Migration: Mettre à jour la table notifications pour inclure les nouveaux champs (type, body, meta)
-- À exécuter sur la base de données PostgreSQL existante 'client_flow'

-- Ajout de la colonne type (obligatoire pour la logique applicative)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'type') THEN
        ALTER TABLE notifications ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM';
    END IF;
END $$;

-- Ajout de la colonne body (parfois les notifications plus anciennes ne l'ont pas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'body') THEN
        ALTER TABLE notifications ADD COLUMN body TEXT;
    END IF;
END $$;

-- Ajout de la colonne meta (essentielle pour la redirection)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'meta') THEN
        ALTER TABLE notifications ADD COLUMN meta JSONB;
    END IF;
END $$;

-- Mise à jour de l'index de performance pour inclure ces champs
DROP INDEX IF EXISTS idx_notifications_user_read_created_at;
CREATE INDEX idx_notifications_user_read_created_at ON notifications(user_id, is_read, created_at DESC);
