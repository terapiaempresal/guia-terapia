-- ========================================
-- SOLUÇÃO FINAL: Funções SQL com campo NAME incluído
-- ========================================

-- 1. Função para atualizar campos da empresa
CREATE OR REPLACE FUNCTION public.update_company_fields(
    company_id uuid,
    emp_quota integer,
    company_plan text,
    company_status text
) RETURNS void AS $$
BEGIN
    UPDATE public.companies
    SET 
        employees_quota = emp_quota,
        plan = company_plan,
        status = company_status
    WHERE id = company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para inserir manager (COM CAMPO NAME)
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
        name,           -- ✅ Adicionado para satisfazer NOT NULL
        full_name,
        email,
        phone,
        status
    ) VALUES (
        p_auth_user_id,
        p_company_id,
        p_full_name,    -- ✅ Usando full_name também em name
        p_full_name,
        p_email,
        p_phone,
        p_status
    )
    RETURNING id INTO new_manager_id;
    
    RETURN new_manager_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Garantir permissões de execução
GRANT EXECUTE ON FUNCTION public.update_company_fields(uuid, integer, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.insert_manager(uuid, uuid, text, text, text, text) TO anon, authenticated, service_role;

-- 4. Recarregar cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 5. Verificar funções criadas
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('update_company_fields', 'insert_manager')
ORDER BY routine_name;

-- ========================================
-- ✅ PRONTO! Agora execute: node scripts/test-direct.js
-- ========================================
