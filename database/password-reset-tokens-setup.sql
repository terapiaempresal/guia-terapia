-- SQL para adicionar funcionalidade de redefinição de senha para funcionários
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela password_reset_tokens já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'password_reset_tokens') THEN
        -- Criar tabela de tokens de redefinição de senha
        CREATE TABLE app.password_reset_tokens (
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
        
        RAISE NOTICE 'Tabela password_reset_tokens criada com sucesso';
    ELSE
        -- Adicionar colunas para funcionários se não existirem
        ALTER TABLE app.password_reset_tokens 
        ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES app.employees(id) ON DELETE CASCADE;
        
        ALTER TABLE app.password_reset_tokens 
        ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;
        
        -- Adicionar constraint se não existir
        DO $inner$
        BEGIN
            ALTER TABLE app.password_reset_tokens 
            ADD CONSTRAINT check_single_user CHECK (
                (manager_id IS NOT NULL AND employee_id IS NULL) OR 
                (manager_id IS NULL AND employee_id IS NOT NULL)
            );
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Constraint check_single_user já existe';
        END;
        $inner$;
        
        -- Tornar manager_id opcional
        ALTER TABLE app.password_reset_tokens 
        ALTER COLUMN manager_id DROP NOT NULL;
        
        RAISE NOTICE 'Tabela password_reset_tokens atualizada para suportar funcionários';
    END IF;
END $$;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON app.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS password_reset_tokens_manager_id_idx ON app.password_reset_tokens(manager_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_employee_id_idx ON app.password_reset_tokens(employee_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON app.password_reset_tokens(expires_at);

-- 3. Habilitar RLS
ALTER TABLE app.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes
DROP POLICY IF EXISTS "managers_own_reset_tokens" ON app.password_reset_tokens;
DROP POLICY IF EXISTS "employees_own_reset_tokens" ON app.password_reset_tokens;

-- 5. Criar políticas de segurança
-- Managers podem ver seus próprios tokens
CREATE POLICY "managers_own_reset_tokens" ON app.password_reset_tokens
FOR ALL USING (manager_id IN (SELECT id FROM app.managers WHERE auth_user_id = auth.uid()));

-- Funcionários podem ver seus próprios tokens (se necessário no futuro)
CREATE POLICY "employees_own_reset_tokens" ON app.password_reset_tokens
FOR ALL USING (employee_id IS NOT NULL);

-- 6. Função para limpar tokens expirados
CREATE OR REPLACE FUNCTION app.cleanup_expired_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM app.password_reset_tokens 
    WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Exibir resumo
SELECT 
    'password_reset_tokens' as tabela,
    COUNT(*) as total_tokens,
    COUNT(CASE WHEN manager_id IS NOT NULL THEN 1 END) as tokens_managers,
    COUNT(CASE WHEN employee_id IS NOT NULL THEN 1 END) as tokens_funcionarios,
    COUNT(CASE WHEN used = true THEN 1 END) as tokens_usados,
    COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as tokens_expirados
FROM app.password_reset_tokens;