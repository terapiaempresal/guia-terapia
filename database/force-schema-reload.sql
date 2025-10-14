-- FORÇAR RELOAD DO SCHEMA CACHE DO POSTGREST
-- Enviar notificação para recarregar schema
NOTIFY pgrst,
'reload schema';

-- Aguardar alguns segundos e verificar se as colunas estão visíveis
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'companies'
ORDER BY
    ordinal_position;