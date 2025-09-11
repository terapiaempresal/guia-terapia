-- SQL para adicionar funcionalidade de redefinição de senha
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de tokens de redefinição de senha
CREATE TABLE IF NOT EXISTS app.password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID NOT NULL REFERENCES app.managers(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON app.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS password_reset_tokens_manager_id_idx ON app.password_reset_tokens(manager_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON app.password_reset_tokens(expires_at);

-- 3. Habilitar RLS
ALTER TABLE app.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 4. Remover política existente se houver
DROP POLICY IF EXISTS "managers_own_reset_tokens" ON app.password_reset_tokens;

-- 5. Criar política de segurança (apenas managers podem ver seus próprios tokens)
CREATE POLICY "managers_own_reset_tokens" ON app.password_reset_tokens
FOR ALL USING (manager_id IN (SELECT id FROM app.managers WHERE auth_user_id = auth.uid()));

-- 6. Adicionar campo password na tabela managers se não existir
ALTER TABLE app.managers ADD COLUMN IF NOT EXISTS password TEXT;

-- 7. Função para limpar tokens expirados (opcional - para manutenção)
CREATE OR REPLACE FUNCTION app.cleanup_expired_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM app.password_reset_tokens 
  WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
