-- Crear función RPC para establecer contexto de empresa
CREATE OR REPLACE FUNCTION set_current_company(company_id uuid)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_company_id', company_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
