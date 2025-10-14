-- SOLUÇÃO DEFINITIVA: Múltiplas tentativas de reload
-- Tentativa 1: NOTIFY padrão
NOTIFY pgrst,
'reload schema';

-- Tentativa 2: NOTIFY com config
NOTIFY pgrst,
'reload config';

-- Tentativa 3: Verificar se há views ou materialized views que precisam refresh
SELECT
    schemaname,
    viewname
FROM
    pg_views
WHERE
    schemaname = 'public';

-- Tentativa 4: Re-criar grants (às vezes resolve)
GRANT ALL ON public.companies TO anon,
authenticated,
service_role;

-- Tentativa 5: Verificar se há políticas RLS que podem estar bloqueando
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'companies';

-- IMPORTANTE: Após executar este script:
-- 1. Aguarde 10-15 segundos
-- 2. Vá em Settings > API > Restart Server (no dashboard do Supabase)
-- 3. Aguarde mais 30 segundos
-- 4. Teste o cadastro novamente