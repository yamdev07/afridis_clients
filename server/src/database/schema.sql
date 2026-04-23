-- Script d'initialisation de la base de donnees ClientFlow
-- A executer sur la base de donnees PostgreSQL existante 'client_flow'

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'commercial' CHECK (role IN ('super_admin', 'admin_local', 'admin', 'commercial')),
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    company_name VARCHAR(255),
    company_description TEXT,
    company_rccm VARCHAR(255),
    company_ifu VARCHAR(255),
    email_verified_at TIMESTAMP,
    remember_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    commercial_login VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    status_id UUID NOT NULL REFERENCES statuses(id) ON DELETE CASCADE,
    line_number VARCHAR(50),
    subscription_date DATE,
    planned_installation_date DATE,
    installation_date DATE,
    contract_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS installation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    status_id UUID NOT NULL REFERENCES statuses(id) ON DELETE CASCADE,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS token_blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT false,
    meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_agent_id ON users(agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_commercial_login ON clients(commercial_login);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_service_id ON subscriptions(service_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_id ON subscriptions(status_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_line_number ON subscriptions(line_number);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created_at ON notifications(user_id, is_read, created_at DESC);

INSERT INTO statuses (code, label) VALUES
    ('pending', 'En attente'),
    ('installed', 'Installe'),
    ('suspended', 'Suspendu'),
    ('cancelled', 'Annule')
ON CONFLICT (code) DO NOTHING;

INSERT INTO services (code, label, description, monthly_price, is_active) VALUES
    ('email_pro', 'Creation Email Professionnel', 'Creation et configuration d''adresses emails professionnelles securisees', 5000, true),
    ('website', 'Creation Site Web', 'Developpement de sites web modernes et optimises SEO', 150000, true),
    ('mobile_app', 'Application Mobile', 'Developpement d''applications Android & iOS', 350000, true),
    ('internet_enterprise', 'Installation Internet Entreprise', 'Installation et configuration internet pour entreprises', 75000, true),
    ('fiber', 'Installation Fibre Optique', 'Installation fibre internet haut debit', 120000, true)
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statuses_updated_at BEFORE UPDATE ON statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
