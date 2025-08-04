-- Calendaria - Datos iniciales para desarrollo y testing
-- Este archivo crea empresas y usuarios de ejemplo

-- ==============================================
-- 1. EMPRESA DE EJEMPLO - BASIC PLAN
-- ==============================================
INSERT INTO companies (
    id,
    name,
    email,
    phone,
    subscription_plan,
    subscription_status,
    max_users,
    max_storage_gb,
    subscription_expires_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Empresa Demo Básica',
    'demo@basiccompany.com',
    '+34 123 456 789',
    'basic',
    'active',
    5,
    1,
    NOW() + INTERVAL '1 year'
);

-- ==============================================
-- 2. EMPRESA DE EJEMPLO - PREMIUM PLAN
-- ==============================================
INSERT INTO companies (
    id,
    name,
    email,
    phone,
    website,
    subscription_plan,
    subscription_status,
    max_users,
    max_storage_gb,
    subscription_expires_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'TechCorp Premium',
    'admin@techcorp.com',
    '+34 987 654 321',
    'https://techcorp.com',
    'premium',
    'active',
    20,
    10,
    NOW() + INTERVAL '1 year'
);

-- ==============================================
-- 3. EMPRESA DE EJEMPLO - ENTERPRISE PLAN
-- ==============================================
INSERT INTO companies (
    id,
    name,
    email,
    phone,
    website,
    subscription_plan,
    subscription_status,
    max_users,
    max_storage_gb,
    subscription_expires_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'Enterprise Solutions Ltd',
    'contact@enterprise.com',
    '+34 555 123 456',
    'https://enterprise-solutions.com',
    'enterprise',
    'active',
    100,
    100,
    NOW() + INTERVAL '2 years'
);

-- ==============================================
-- 4. USUARIOS DE EJEMPLO
-- ==============================================

-- Super Admin para Empresa Básica
INSERT INTO users (
    id,
    company_id,
    email,
    full_name,
    role,
    is_active,
    email_verified
) VALUES (
    'a550e840-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'superadmin@basiccompany.com',
    'Juan Pérez (Super Admin)',
    'super_admin',
    true,
    true
);

-- Admin para Empresa Básica
INSERT INTO users (
    id,
    company_id,
    email,
    full_name,
    role,
    is_active,
    email_verified
) VALUES (
    'a550e840-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'admin@basiccompany.com',
    'María García (Admin)',
    'admin',
    true,
    true
);

-- Usuario normal para Empresa Básica
INSERT INTO users (
    id,
    company_id,
    email,
    full_name,
    role,
    is_active,
    email_verified
) VALUES (
    'a550e840-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'user@basiccompany.com',
    'Carlos López (Usuario)',
    'user',
    true,
    true
);

-- Super Admin para TechCorp Premium
INSERT INTO users (
    id,
    company_id,
    email,
    full_name,
    role,
    is_active,
    email_verified
) VALUES (
    'a550e840-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    'cto@techcorp.com',
    'Ana Martín (CTO)',
    'super_admin',
    true,
    true
);

-- Admin para TechCorp Premium
INSERT INTO users (
    id,
    company_id,
    email,
    full_name,
    role,
    is_active,
    email_verified
) VALUES (
    'a550e840-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'manager@techcorp.com',
    'David Rodríguez (Manager)',
    'admin',
    true,
    true
);

-- Super Admin para Enterprise
INSERT INTO users (
    id,
    company_id,
    email,
    full_name,
    role,
    is_active,
    email_verified
) VALUES (
    'a550e840-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440003',
    'ceo@enterprise.com',
    'Laura Fernández (CEO)',
    'super_admin',
    true,
    true
);

-- ==============================================
-- 5. PERMISOS DE EJEMPLO
-- ==============================================

-- Permisos para Super Admin (tienen todos los permisos)
INSERT INTO user_permissions (user_id, permission_name, is_granted) VALUES
    ('a550e840-e29b-41d4-a716-446655440001', 'manage_users', true),
    ('a550e840-e29b-41d4-a716-446655440001', 'manage_billing', true),
    ('a550e840-e29b-41d4-a716-446655440001', 'view_audit_logs', true),
    ('a550e840-e29b-41d4-a716-446655440001', 'manage_company', true),
    ('a550e840-e29b-41d4-a716-446655440001', 'access_all_features', true);

-- Permisos para Admin (permisos limitados)
INSERT INTO user_permissions (user_id, permission_name, is_granted) VALUES
    ('a550e840-e29b-41d4-a716-446655440002', 'manage_users', true),
    ('a550e840-e29b-41d4-a716-446655440002', 'view_billing', true),
    ('a550e840-e29b-41d4-a716-446655440002', 'manage_calendar', true);

-- Permisos para Usuario normal (solo básicos)
INSERT INTO user_permissions (user_id, permission_name, is_granted) VALUES
    ('a550e840-e29b-41d4-a716-446655440003', 'view_calendar', true),
    ('a550e840-e29b-41d4-a716-446655440003', 'manage_profile', true);

-- ==============================================
-- 6. CONFIGURAR CURRENT COMPANY (Para testing RLS)
-- ==============================================
-- Este setting se usará en las pruebas para simular el contexto de empresa actual
SELECT set_config('app.current_company_id', '550e8400-e29b-41d4-a716-446655440001', false);

-- ==============================================
-- 7. VERIFICACIONES
-- ==============================================

-- Mostrar resumen de lo creado
SELECT 
    'Empresas creadas' as tipo,
    COUNT(*) as cantidad
FROM companies
UNION ALL
SELECT 
    'Usuarios creados' as tipo,
    COUNT(*) as cantidad
FROM users
UNION ALL
SELECT 
    'Features automáticas' as tipo,
    COUNT(*) as cantidad
FROM company_features
UNION ALL
SELECT 
    'Permisos asignados' as tipo,
    COUNT(*) as cantidad
FROM user_permissions;

-- Mostrar estructura por empresa
SELECT 
    c.name as empresa,
    c.subscription_plan as plan,
    COUNT(u.id) as usuarios,
    COUNT(cf.id) as features_habilitadas
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
LEFT JOIN company_features cf ON c.id = cf.company_id AND cf.is_enabled = true
GROUP BY c.id, c.name, c.subscription_plan
ORDER BY c.name;
