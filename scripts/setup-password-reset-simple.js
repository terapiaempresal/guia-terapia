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

async function setupPasswordReset() {
    try {
        console.log('🔧 Configurando sistema de redefinição de senha...')

        // 1. Primeiro, vamos verificar/adicionar a coluna password na tabela managers
        console.log('📝 Adicionando coluna password na tabela managers...')

        const { data: managers, error: managersError } = await supabase
            .from('managers')
            .select('id, password')
            .limit(1)

        if (managersError && !managersError.message.includes('column "password" does not exist')) {
            console.error('❌ Erro ao verificar tabela managers:', managersError)
            return
        }

        // 2. Criar a tabela de tokens usando SQL raw
        console.log('📝 Criando tabela de tokens de redefinição...')

        // Como não temos exec_sql, vamos criar via API administrativa do Supabase
        // Por enquanto, vamos criar um teste simples
        const testToken = {
            manager_id: '00000000-0000-0000-0000-000000000000', // UUID fictício para teste
            token: 'test-token-' + Date.now(),
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            used: false
        }

        // Tentar inserir um token de teste (isso falhará se a tabela não existir)
        const { error: tokenError } = await supabase
            .from('password_reset_tokens')
            .insert(testToken)

        if (tokenError) {
            console.log('⚠️  Tabela password_reset_tokens não existe ainda.')
            console.log('📋 Por favor, execute o seguinte SQL no Supabase Dashboard > SQL Editor:')
            console.log('')
            console.log('--- COPIE E COLE O SQL ABAIXO ---')
            console.log(`
CREATE TABLE IF NOT EXISTS app.password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID NOT NULL REFERENCES app.managers(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON app.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS password_reset_tokens_manager_id_idx ON app.password_reset_tokens(manager_id);

ALTER TABLE app.password_reset_tokens ENABLE ROW LEVEL SECURITY;

ALTER TABLE app.managers ADD COLUMN IF NOT EXISTS password TEXT;
            `)
            console.log('--- FIM DO SQL ---')
            console.log('')
        } else {
            // Remover o token de teste
            await supabase
                .from('password_reset_tokens')
                .delete()
                .eq('token', testToken.token)

            console.log('✅ Tabela password_reset_tokens já existe e está funcionando!')
        }

        console.log('✅ Setup concluído!')

    } catch (error) {
        console.error('❌ Erro:', error.message)
    }
}

setupPasswordReset()
