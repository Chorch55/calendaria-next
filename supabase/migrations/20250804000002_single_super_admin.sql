-- Ajustar sistema de roles: UN super_admin por empresa
-- Migración para implementar el nuevo sistema de roles

-- 1. Actualizar el enum de roles (removemos readonly, mantenemos super_admin, admin, user)
-- No podemos alterar el enum directamente, así que creamos uno nuevo y migramos

-- Crear nuevo enum con los roles que queremos
CREATE TYPE user_role_new AS ENUM ('super_admin', 'admin', 'user');

-- Función para migrar los roles existentes
DO $$
BEGIN
    -- Actualizar cualquier 'readonly' a 'user'
    UPDATE users SET role = 'user' WHERE role = 'readonly';
END
$$;

-- Cambiar la columna para usar el nuevo enum
ALTER TABLE users ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;

-- Eliminar el enum viejo y renombrar el nuevo
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;

-- 2. Agregar constraint para asegurar UN SOLO super_admin por empresa
ALTER TABLE users ADD CONSTRAINT unique_super_admin_per_company 
    EXCLUDE (company_id WITH =) WHERE (role = 'super_admin' AND deleted_at IS NULL);

-- 3. Función para validar que solo puede haber un super_admin por empresa
CREATE OR REPLACE FUNCTION validate_single_super_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está intentando crear/actualizar a super_admin
    IF NEW.role = 'super_admin' AND (NEW.deleted_at IS NULL) THEN
        -- Verificar si ya existe otro super_admin en la empresa
        IF EXISTS (
            SELECT 1 FROM users 
            WHERE company_id = NEW.company_id 
            AND role = 'super_admin' 
            AND deleted_at IS NULL 
            AND id != NEW.id
        ) THEN
            RAISE EXCEPTION 'Ya existe un super_admin para esta empresa. Solo puede haber uno por empresa.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar super_admin único
CREATE TRIGGER enforce_single_super_admin
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION validate_single_super_admin();

-- 4. Actualizar la función de logging para reflejar el nuevo sistema
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (company_id, user_id, action, resource_type, resource_id, new_values, ip_address)
        VALUES (NEW.company_id, NEW.id, 'user_created', 'user', NEW.id, to_jsonb(NEW), inet_client_addr());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (company_id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address)
        VALUES (NEW.company_id, NEW.id, 'user_updated', 'user', NEW.id, to_jsonb(OLD), to_jsonb(NEW), inet_client_addr());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (company_id, user_id, action, resource_type, resource_id, old_values, ip_address)
        VALUES (OLD.company_id, OLD.id, 'user_deleted', 'user', OLD.id, to_jsonb(OLD), inet_client_addr());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 5. Función para promover usuario a admin (solo super_admin puede hacerlo)
CREATE OR REPLACE FUNCTION promote_user_to_admin(
    target_user_id uuid,
    promoted_by_user_id uuid
)
RETURNS json AS $$
DECLARE
    target_user users%ROWTYPE;
    promoter users%ROWTYPE;
    result json;
BEGIN
    -- Obtener información del usuario que va a ser promovido
    SELECT * INTO target_user FROM users WHERE id = target_user_id AND deleted_at IS NULL;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Usuario no encontrado');
    END IF;
    
    -- Obtener información del usuario que está promoviendo
    SELECT * INTO promoter FROM users WHERE id = promoted_by_user_id AND deleted_at IS NULL;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Usuario promotor no encontrado');
    END IF;
    
    -- Verificar que están en la misma empresa
    IF target_user.company_id != promoter.company_id THEN
        RETURN json_build_object('success', false, 'error', 'Los usuarios deben estar en la misma empresa');
    END IF;
    
    -- Verificar que el promotor es super_admin
    IF promoter.role != 'super_admin' THEN
        RETURN json_build_object('success', false, 'error', 'Solo el super_admin puede promover usuarios');
    END IF;
    
    -- Verificar que no se está intentando promover al super_admin
    IF target_user.role = 'super_admin' THEN
        RETURN json_build_object('success', false, 'error', 'No se puede cambiar el rol del super_admin');
    END IF;
    
    -- Promover el usuario
    UPDATE users SET role = 'admin', updated_at = NOW() WHERE id = target_user_id;
    
    -- Log de la acción
    INSERT INTO audit_logs (company_id, user_id, action, resource_type, resource_id, old_values, new_values)
    VALUES (
        target_user.company_id, 
        promoted_by_user_id, 
        'user_promoted_to_admin', 
        'user', 
        target_user_id,
        json_build_object('old_role', target_user.role),
        json_build_object('new_role', 'admin', 'promoted_by', promoted_by_user_id)
    );
    
    RETURN json_build_object('success', true, 'message', 'Usuario promovido a admin exitosamente');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para degradar admin a user
CREATE OR REPLACE FUNCTION demote_admin_to_user(
    target_user_id uuid,
    demoted_by_user_id uuid
)
RETURNS json AS $$
DECLARE
    target_user users%ROWTYPE;
    demoter users%ROWTYPE;
    result json;
BEGIN
    -- Obtener información del usuario que va a ser degradado
    SELECT * INTO target_user FROM users WHERE id = target_user_id AND deleted_at IS NULL;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Usuario no encontrado');
    END IF;
    
    -- Obtener información del usuario que está degradando
    SELECT * INTO demoter FROM users WHERE id = demoted_by_user_id AND deleted_at IS NULL;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Usuario que degrada no encontrado');
    END IF;
    
    -- Verificar que están en la misma empresa
    IF target_user.company_id != demoter.company_id THEN
        RETURN json_build_object('success', false, 'error', 'Los usuarios deben estar en la misma empresa');
    END IF;
    
    -- Verificar que el demoter es super_admin
    IF demoter.role != 'super_admin' THEN
        RETURN json_build_object('success', false, 'error', 'Solo el super_admin puede degradar usuarios');
    END IF;
    
    -- Verificar que no se está intentando degradar al super_admin
    IF target_user.role = 'super_admin' THEN
        RETURN json_build_object('success', false, 'error', 'No se puede cambiar el rol del super_admin');
    END IF;
    
    -- Degradar el usuario
    UPDATE users SET role = 'user', updated_at = NOW() WHERE id = target_user_id;
    
    -- Log de la acción  
    INSERT INTO audit_logs (company_id, user_id, action, resource_type, resource_id, old_values, new_values)
    VALUES (
        target_user.company_id, 
        demoted_by_user_id, 
        'user_demoted_to_user', 
        'user', 
        target_user_id,
        json_build_object('old_role', target_user.role),
        json_build_object('new_role', 'user', 'demoted_by', demoted_by_user_id)
    );
    
    RETURN json_build_object('success', true, 'message', 'Usuario degradado a user exitosamente');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
