#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
    console.error('❌ Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRole)

const sql = `
-- Criar tabela de tokens de redefinição de senha
CREATE TABLE IF NOT EXISTS app.password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID NOT NULL REFERENCES app.managers(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON app.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS password_reset_tokens_manager_id_idx ON app.password_reset_tokens(manager_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON app.password_reset_tokens(expires_at);

-- Habilitar RLS
ALTER TABLE app.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Política de segurança (apenas managers podem ver seus próprios tokens)
CREATE POLICY "managers_own_reset_tokens" ON app.password_reset_tokens
FOR ALL USING (manager_id IN (SELECT id FROM app.managers WHERE auth_user_id = auth.uid()));

-- Adicionar campo password na tabela managers se não existir
ALTER TABLE app.managers ADD COLUMN IF NOT EXISTS password TEXT;
`

async function setupPasswordResetTable() {
    try {
        console.log('🔧 Criando tabela de tokens de redefinição de senha...')

        // Executar cada comando SQL separadamente
        const commands = [
            `CREATE TABLE IF NOT EXISTS app.password_reset_tokens (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              manager_id UUID NOT NULL REFERENCES app.managers(id) ON DELETE CASCADE,
              token TEXT NOT NULL UNIQUE,
              expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
              used BOOLEAN NOT NULL DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );`,

            `CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON app.password_reset_tokens(token);`,

            `CREATE INDEX IF NOT EXISTS password_reset_tokens_manager_id_idx ON app.password_reset_tokens(manager_id);`,

            `CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON app.password_reset_tokens(expires_at);`,

            `ALTER TABLE app.password_reset_tokens ENABLE ROW LEVEL SECURITY;`,

            `DROP POLICY IF EXISTS "managers_own_reset_tokens" ON app.password_reset_tokens;`,

            `CREATE POLICY "managers_own_reset_tokens" ON app.password_reset_tokens
             FOR ALL USING (manager_id IN (SELECT id FROM app.managers WHERE auth_user_id = auth.uid()));`,

            `ALTER TABLE app.managers ADD COLUMN IF NOT EXISTS password TEXT;`
        ]

        for (const command of commands) {
            const { error } = await supabase.rpc('exec_sql', { sql: command })
            if (error) {
                console.error('❌ Erro ao executar comando:', command, error)
            }
        }

        console.log('✅ Tabela de tokens de redefinição de senha criada com sucesso!')

    } catch (error) {
        console.error('❌ Erro:', error.message)
        process.exit(1)
    }
}

setupPasswordResetTable()
