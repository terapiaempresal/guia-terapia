-- Recarregar o schema cache do PostgREST
-- 1. Verificar o schema atual da tabela
SELECT
    table_schema,
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_name = 'companies'
ORDER BY
    ordinal_position;

-- 2. Forçar recarga do schema cache enviando notificação NOTIFY
NOTIFY pgrst,
'reload schema';

-- 3. Verificar grants e permissões
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM
    information_schema.table_privileges
WHERE
    table_name = 'companies'
ORDER BY
    grantee,
    privilege_type;

-- 4. Se necessário, garantir que o schema 'app' está exposto
-- (só execute se o schema não estiver na lista de schemas expostos)
-- ALTER DATABASE postgres SET "app.settings.jwt_secret" = 'your-secret';