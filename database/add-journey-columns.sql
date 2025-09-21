-- Script para adicionar colunas do mapa de jornada na tabela employees
-- Execute este script no SQL Editor do Supabase
-- Adicionar colunas para mapa de jornada
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS journey_filled BOOLEAN DEFAULT FALSE;

ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS journey_filled_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS journey_result_html TEXT;

-- Verificar se as colunas foram adicionadas
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'employees'
    AND column_name IN (
        'journey_filled',
        'journey_filled_at',
        'journey_result_html'
    )
ORDER BY
    column_name;