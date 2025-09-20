-- SQL UNIFICADO - Execute este script no SQL Editor do Supabase
-- Copia e cola tudo de uma vez

-- ================================================================
-- 1. ADICIONAR COLUNA PASSWORD NA TABELA EMPLOYEES
-- ================================================================

-- Adicionar coluna password se não existir
ALTER TABLE app.employees ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Função para gerar senha inicial baseada na data de nascimento
CREATE OR REPLACE FUNCTION app.generate_initial_password_from_birthdate(birth_date DATE)
RETURNS VARCHAR(8) AS $$
BEGIN
    -- Converter data no formato DDMMAAAA (ex: 19/09/2004 -> 19092004)
    RETURN LPAD(EXTRACT(DAY FROM birth_date)::TEXT, 2, '0') || 
           LPAD(EXTRACT(MONTH FROM birth_date)::TEXT, 2, '0') || 
           EXTRACT(YEAR FROM birth_date)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Atualizar funcionários que não têm senha com a senha baseada na data de nascimento
UPDATE app.employees 
SET password = app.generate_initial_password_from_birthdate(birth_date::DATE)
WHERE password IS NULL AND birth_date IS NOT NULL;

-- ================================================================
-- 2. CRIAR/ATUALIZAR TABELA PASSWORD_RESET_TOKENS
-- ================================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS app.password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id UUID REFERENCES app.managers(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES app.employees(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que apenas um dos dois campos seja preenchido
    CONSTRAINT check_single_user CHECK (
        (manager_id IS NOT NULL AND employee_id IS NULL) OR 
        (manager_id IS NULL AND employee_id IS NOT NULL)
    )
);

-- Se a tabela já existir, adicionar colunas que podem estar faltando
DO $$
BEGIN
    -- Adicionar employee_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'app' 
        AND table_name = 'password_reset_tokens' 
        AND column_name = 'employee_id'
    ) THEN
        ALTER TABLE app.password_reset_tokens 
        ADD COLUMN employee_id UUID REFERENCES app.employees(id) ON DELETE CASCADE;
    END IF;
    
    -- Adicionar used_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'app' 
        AND table_name = 'password_reset_tokens' 
        AND column_name = 'used_at'
    ) THEN
        ALTER TABLE app.password_reset_tokens 
        ADD COLUMN used_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Tornar manager_id opcional (pode dar erro se já for opcional)
    BEGIN
        ALTER TABLE app.password_reset_tokens 
        ALTER COLUMN manager_id DROP NOT NULL;
    EXCEPTION
        WHEN others THEN NULL; -- Ignorar erro se já for opcional
    END;
    
    -- Adicionar constraint se não existir
    BEGIN
        ALTER TABLE app.password_reset_tokens 
        ADD CONSTRAINT check_single_user CHECK (
            (manager_id IS NOT NULL AND employee_id IS NULL) OR 
            (manager_id IS NULL AND employee_id IS NOT NULL)
        );
    EXCEPTION
        WHEN duplicate_object THEN NULL; -- Ignorar se já existir
    END;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON app.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS password_reset_tokens_manager_id_idx ON app.password_reset_tokens(manager_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_employee_id_idx ON app.password_reset_tokens(employee_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON app.password_reset_tokens(expires_at);

-- Habilitar RLS
ALTER TABLE app.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes e recriar
DROP POLICY IF EXISTS "managers_own_reset_tokens" ON app.password_reset_tokens;
DROP POLICY IF EXISTS "employees_own_reset_tokens" ON app.password_reset_tokens;

-- Políticas de segurança
CREATE POLICY "managers_own_reset_tokens" ON app.password_reset_tokens
FOR ALL USING (manager_id IN (SELECT id FROM app.managers WHERE auth_user_id = auth.uid()));

CREATE POLICY "employees_own_reset_tokens" ON app.password_reset_tokens
FOR ALL USING (employee_id IS NOT NULL);

-- ================================================================
-- 3. VERIFICAÇÃO FINAL
-- ================================================================

-- Mostrar status das tabelas
SELECT 
    'employees' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN password IS NOT NULL THEN 1 END) as com_senha,
    COUNT(CASE WHEN password IS NULL THEN 1 END) as sem_senha
FROM app.employees
UNION ALL
SELECT 
    'password_reset_tokens' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN manager_id IS NOT NULL THEN 1 END) as tokens_managers,
    COUNT(CASE WHEN employee_id IS NOT NULL THEN 1 END) as tokens_funcionarios
FROM app.password_reset_tokens;