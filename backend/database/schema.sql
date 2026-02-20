-- CRM Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'sales')),
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('B2B', 'B2C')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('new', 'contacted', 'offer_sent', 'negotiation', 'won', 'lost')),
    source_level1 VARCHAR(100) NOT NULL,
    source_level2 VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    value DECIMAL(12, 2) DEFAULT 0,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead contacts (embedded in leads for simplicity)
CREATE TABLE IF NOT EXISTS lead_contacts (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    person VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead company info (for B2B leads)
CREATE TABLE IF NOT EXISTS lead_companies (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    eik VARCHAR(50),
    mol VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timeline events
CREATE TABLE IF NOT EXISTS timeline_events (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('created', 'assigned', 'status_change', 'comment', 'file', 'email', 'call', 'meeting')),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Files
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('offer', 'contract', 'other')),
    file_path VARCHAR(500),
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    uploaded_by_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE files 
ADD COLUMN IF NOT EXISTS original_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API integrations log (for future use)
CREATE TABLE IF NOT EXISTS api_logs (
    id SERIAL PRIMARY KEY,
    integration_type VARCHAR(100) NOT NULL,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_timeline_lead_id ON timeline_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON timeline_events(created_at);
CREATE INDEX IF NOT EXISTS idx_files_lead_id ON files(lead_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers (DROP IF EXISTS first to avoid duplicate trigger error)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample users (ON CONFLICT DO NOTHING = safe to run multiple times)
INSERT INTO users (name, email, password_hash, role, region) VALUES
('Админ', 'admin@company.com', '$2b$10$rKzW8qVvK5qV5xZ5YqXqXeYqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'admin', 'Всички'),
('Иван Петров', 'ivan@company.com', '$2b$10$rKzW8qVvK5qV5xZ5YqXqXeYqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'manager', 'София'),
('Мария Георгиева', 'maria@company.com', '$2b$10$rKzW8qVvK5qV5xZ5YqXqXeYqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'sales', 'Пловдив'),
('Георги Димитров', 'georgi@company.com', '$2b$10$rKzW8qVvK5qV5xZ5YqXqXeYqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'sales', 'Варна'),
('Елена Костова', 'elena@company.com', '$2b$10$rKzW8qVvK5qV5xZ5YqXqXeYqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'sales', 'София')
ON CONFLICT (email) DO NOTHING;
