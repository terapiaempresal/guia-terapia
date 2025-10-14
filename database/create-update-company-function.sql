-- Criar função para atualizar campos da empresa (bypassa cache do PostgREST)

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

-- Garantir que todos possam executar a função
GRANT EXECUTE ON FUNCTION public.update_company_fields(uuid, integer, text, text) TO anon, authenticated, service_role;

-- Testar a função
-- SELECT update_company_fields('algum-uuid'::uuid, 10, 'equipe', 'inactive');
