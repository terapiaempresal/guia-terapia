-- DIAGNÓSTICO COMPLETO DO PROBLEMA DE SCHEMA CACHE

-- 1. Verificar em qual schema a tabela companies existe
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'companies';

-- 2. Verificar as colunas da tabela (qualquer schema)
SELECT 
    table_schema,
    table_name,
    column_name, 
    data_type, 
    column_default, 
    is_nullable,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'companies'
ORDER BY table_schema, ordinal_position;

-- 3. Verificar roles e schemas expostos no PostgREST
SELECT 
    nspname as schema_name,
    nspowner::regrole as owner
FROM pg_namespace
WHERE nspname IN ('public', 'app', 'auth')
ORDER BY nspname;

-- 4. Verificar permissões da role anon (usada pelo Supabase)
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'companies'
AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_schema, grantee, privilege_type;

-- 5. SOLUÇÃO: Recarregar cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- 6. ALTERNATIVA: Se a tabela está no schema 'app', garantir grants
GRANT USAGE ON SCHEMA app TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA app TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO anon, authenticated;

-- 7. Se necessário, mover tabela para schema public
-- ALTER TABLE app.companies SET SCHEMA public;
