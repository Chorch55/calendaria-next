-- Migración corregida para sistema de roles único
-- Arreglar el problema con el enum

-- 1. Eliminar el constraint de default temporalmente
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- 2. Crear nuevo enum
DROP TYPE IF EXISTS user_role_new CASCADE;
CREATE TYPE user_role_new AS ENUM ('super_admin', 'admin', 'user');

-- 3. Actualizar cualquier 'readonly' a 'user' primero
UPDATE users SET role = 'user' WHERE role = 'readonly';

-- 4. Cambiar la columna para usar el nuevo enum
ALTER TABLE users ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;

-- 5. Eliminar el enum viejo y renombrar el nuevo
DROP TYPE user_role CASCADE;
ALTER TYPE user_role_new RENAME TO user_role;

-- 6. Restaurar el default
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';

-- 7. Agregar constraint para asegurar UN SOLO super_admin por empresa
-- Primero verificamos si ya existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_super_admin_per_company'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT unique_super_admin_per_company 
            EXCLUDE (company_id WITH =) WHERE (role = 'super_admin' AND deleted_at IS NULL);
    END IF;
END
$$;

-- 8. Verificación y corrección de datos: asegurar que solo hay un super_admin por empresa
DO $$
DECLARE
    company_record RECORD;
    super_admin_count INTEGER;
    first_super_admin_id UUID;
BEGIN
    -- Para cada empresa, verificar cuántos super_admins hay
    FOR company_record IN SELECT DISTINCT company_id FROM users WHERE role = 'super_admin' AND deleted_at IS NULL
    LOOP
        SELECT COUNT(*), MIN(id) INTO super_admin_count, first_super_admin_id
        FROM users 
        WHERE company_id = company_record.company_id 
        AND role = 'super_admin' 
        AND deleted_at IS NULL;
        
        -- Si hay más de uno, convertir los extras a admin
        IF super_admin_count > 1 THEN
            UPDATE users 
            SET role = 'admin' 
            WHERE company_id = company_record.company_id 
            AND role = 'super_admin' 
            AND deleted_at IS NULL 
            AND id != first_super_admin_id;
            
            RAISE NOTICE 'Empresa %: % super_admins encontrados, manteniendo solo el primero', 
                company_record.company_id, super_admin_count;
        END IF;
    END LOOP;
END
$$;
