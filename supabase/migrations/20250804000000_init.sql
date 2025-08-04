-- Calendaria Multi-tenant Database Schema
-- This migration creates a complete multi-tenant SaaS structure

-- ==============================================
-- 1. EXTENSIONS
-- ==============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 2. ENUMS
-- ==============================================
CREATE TYPE subscription_plan AS ENUM ('basic', 'premium', 'enterprise');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user', 'readonly');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'expired');

-- ==============================================
-- 3. COMPANIES (TENANTS)
-- ==============================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    logo_url TEXT,
    website TEXT,
    subscription_plan subscription_plan DEFAULT 'basic',
    subscription_status subscription_status DEFAULT 'active',
    max_users INTEGER DEFAULT 5, -- Límite según el plan
    max_storage_gb INTEGER DEFAULT 1, -- Límite de almacenamiento
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================
-- 4. COMPANY FEATURES
-- ==============================================
CREATE TABLE company_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL, -- 'calendar', 'billing', 'reports', etc.
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, feature_name)
);

-- ==============================================
-- 5. USERS (MULTI-TENANT)
-- ==============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255), -- Para usuarios locales
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(company_id, email) -- Email único por empresa
);

-- ==============================================
-- 6. USER PERMISSIONS
-- ==============================================
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_name VARCHAR(100) NOT NULL, -- 'manage_users', 'view_billing', etc.
    is_granted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, permission_name)
);

-- ==============================================
-- 7. SUBSCRIPTION HISTORY
-- ==============================================
CREATE TABLE subscription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    old_plan subscription_plan,
    new_plan subscription_plan,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 8. BILLING (Optional - para futuro)
-- ==============================================
CREATE TABLE billing_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, cancelled
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 9. AUDIT LOG
-- ==============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'user_created', 'user_deleted', etc.
    resource_type VARCHAR(50), -- 'user', 'company', etc.
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 10. INDEXES para PERFORMANCE
-- ==============================================
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_subscription_status ON companies(subscription_status);
CREATE INDEX idx_companies_deleted_at ON companies(deleted_at);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_email ON users(company_id, email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

CREATE INDEX idx_company_features_company_id ON company_features(company_id);
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ==============================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ==============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 12. RLS POLICIES
-- ==============================================

-- Companies: Solo pueden ver su propia empresa
CREATE POLICY "Companies can only see their own data" ON companies
    FOR ALL USING (id = (current_setting('app.current_company_id', true))::uuid);

-- Users: Solo pueden ver usuarios de su empresa
CREATE POLICY "Users can only see users from their company" ON users
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- Company Features: Solo pueden ver features de su empresa
CREATE POLICY "Company features isolation" ON company_features
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- User Permissions: Solo pueden ver permisos de usuarios de su empresa
CREATE POLICY "User permissions isolation" ON user_permissions
    FOR ALL USING (user_id IN (
        SELECT id FROM users WHERE company_id = (current_setting('app.current_company_id', true))::uuid
    ));

-- Subscription History: Solo pueden ver historial de su empresa
CREATE POLICY "Subscription history isolation" ON subscription_history
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- Billing Invoices: Solo pueden ver facturas de su empresa
CREATE POLICY "Billing invoices isolation" ON billing_invoices
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- Audit Logs: Solo pueden ver logs de su empresa
CREATE POLICY "Audit logs isolation" ON audit_logs
    FOR ALL USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- ==============================================
-- 13. FUNCTIONS
-- ==============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_features_updated_at BEFORE UPDATE ON company_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at BEFORE UPDATE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear features por defecto cuando se crea una empresa
CREATE OR REPLACE FUNCTION create_default_company_features()
RETURNS TRIGGER AS $$
BEGIN
    -- Features básicas para todas las empresas
    INSERT INTO company_features (company_id, feature_name, is_enabled) VALUES
        (NEW.id, 'user_management', true),
        (NEW.id, 'basic_calendar', true),
        (NEW.id, 'profile_management', true);
    
    -- Features premium según el plan
    IF NEW.subscription_plan IN ('premium', 'enterprise') THEN
        INSERT INTO company_features (company_id, feature_name, is_enabled) VALUES
            (NEW.id, 'advanced_calendar', true),
            (NEW.id, 'billing_management', true),
            (NEW.id, 'reports', true);
    END IF;
    
    -- Features enterprise
    IF NEW.subscription_plan = 'enterprise' THEN
        INSERT INTO company_features (company_id, feature_name, is_enabled) VALUES
            (NEW.id, 'audit_logs', true),
            (NEW.id, 'api_access', true);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_company_features_trigger
    AFTER INSERT ON companies
    FOR EACH ROW EXECUTE FUNCTION create_default_company_features();

-- Función para logging automático
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (company_id, user_id, action, resource_type, resource_id, new_values)
        VALUES (NEW.company_id, NEW.id, 'user_created', 'user', NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (company_id, user_id, action, resource_type, resource_id, old_values, new_values)
        VALUES (NEW.company_id, NEW.id, 'user_updated', 'user', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (company_id, user_id, action, resource_type, resource_id, old_values)
        VALUES (OLD.company_id, OLD.id, 'user_deleted', 'user', OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_user_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_user_changes();
