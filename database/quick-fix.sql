-- Execute este SQL no Supabase Dashboard (SQL Editor)
-- Adicionar colunas necessárias
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS cpf TEXT;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS birth_date DATE;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Atualizar funcionários existentes
UPDATE employees
SET
    full_name = name
WHERE
    full_name IS NULL
    AND name IS NOT NULL;