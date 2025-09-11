-- Script SQL para adicionar colunas à tabela employees
-- Execute este código no SQL Editor do Supabase Dashboard
-- Adicionar colunas necessárias para cadastro de funcionários
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS cpf TEXT;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS birth_date DATE;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Criar índice para busca por CPF (útil para vinculação com mapa de clareza)
CREATE INDEX IF NOT EXISTS employees_cpf_idx ON employees (cpf);

-- Atualizar funcionários existentes que têm apenas 'name' para copiar para 'full_name'
UPDATE employees
SET
    full_name = name
WHERE
    full_name IS NULL
    AND name IS NOT NULL;

-- Verificar a estrutura da tabela
SELECT
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_name = 'employees'
ORDER BY
    ordinal_position;