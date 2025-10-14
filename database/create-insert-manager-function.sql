-- Criar função para inserir manager (bypassa cache do PostgREST)

CREATE OR REPLACE FUNCTION public.insert_manager(
    p_auth_user_id uuid,
    p_company_id uuid,
    p_full_name text,
    p_email text,
    p_phone text,
    p_status text
) RETURNS uuid AS $$
DECLARE
    new_manager_id uuid;
BEGIN
    INSERT INTO public.managers (
        auth_user_id,
        company_id,
        full_name,
        email,
        phone,
        status
    ) VALUES (
        p_auth_user_id,
        p_company_id,
        p_full_name,
        p_email,
        p_phone,
        p_status
    )
    RETURNING id INTO new_manager_id;
    
    RETURN new_manager_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que todos possam executar a função
GRANT EXECUTE ON FUNCTION public.insert_manager(uuid, uuid, text, text, text, text) TO anon, authenticated, service_role;

-- Testar a função
-- SELECT insert_manager(
--     'auth-user-uuid'::uuid, 
--     'company-uuid'::uuid, 
--     'João Silva', 
--     'joao@example.com', 
--     '11999999999', 
--     'inactive'
-- );
