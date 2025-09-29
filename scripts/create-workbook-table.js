#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function createWorkbookTable() {
    console.log('🗃️ Criando tabela employee_workbook_responses...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Variáveis de ambiente não encontradas!')
        console.error('Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão no .env.local')
        process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        // SQL para criar a tabela
        const createTableSQL = `
-- Criar tabela para armazenar respostas do Caderno de Clareza e Carreira dos funcionários
CREATE TABLE IF NOT EXISTS employee_workbook_responses (
    id BIGSERIAL PRIMARY KEY,
    employee_id UUID NOT NULL,
    section VARCHAR(100) NOT NULL, -- Ex: 'capsula_tempo', 'roda_vida_1', 'swot_1', etc.
    field_key VARCHAR(100) NOT NULL, -- Identificador único do campo 
    field_label TEXT NOT NULL, -- Texto da pergunta/label do campo
    field_type VARCHAR(20) NOT NULL DEFAULT 'textarea', -- 'textarea', 'input', 'number'
    value TEXT, -- Valor da resposta do funcionário
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para garantir que cada funcionário tenha uma resposta única por campo
    UNIQUE(employee_id, field_key),
    
    -- Foreign key para employees
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_employee_workbook_responses_employee_id 
ON employee_workbook_responses(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_workbook_responses_section 
ON employee_workbook_responses(section);

CREATE INDEX IF NOT EXISTS idx_employee_workbook_responses_field_key 
ON employee_workbook_responses(field_key);

-- Criar função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_employee_workbook_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_employee_workbook_responses_updated_at ON employee_workbook_responses;
CREATE TRIGGER trigger_update_employee_workbook_responses_updated_at
    BEFORE UPDATE ON employee_workbook_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_employee_workbook_responses_updated_at();
        `

        console.log('📝 Executando SQL...')

        // Usar rpc para executar SQL
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: createTableSQL
        })

        if (error) {
            console.error('❌ Erro ao executar SQL via RPC:', error)
            console.log('\n⚠️  Tentativa via RPC falhou. Use o método manual:')
            console.log('1. Acesse https://supabase.com/dashboard')
            console.log('2. Vá para SQL Editor')
            console.log('3. Execute o SQL que está em database/create-workbook-table.sql')
            return
        }

        console.log('✅ SQL executado com sucesso!')
        console.log('Data:', data)

        // Testar se a tabela foi criada
        console.log('🔍 Testando acesso à tabela...')

        const { data: testData, error: testError } = await supabase
            .from('employee_workbook_responses')
            .select('*')
            .limit(1)

        if (testError) {
            console.error('⚠️  Tabela criada mas ainda não acessível:', testError.message)
            console.log('\n💡 Soluções:')
            console.log('1. Aguarde 1-2 minutos para o cache do Supabase atualizar')
            console.log('2. Reinicie o servidor Next.js (npm run dev)')
            console.log('3. Se persistir, execute o SQL manualmente no Dashboard')
        } else {
            console.log('🎉 Tabela employee_workbook_responses criada e acessível!')
            console.log('✅ Agora você pode usar o sistema de caderno!')
        }

    } catch (error) {
        console.error('❌ Erro:', error)
        console.log('\n📋 Execute manualmente no Supabase Dashboard:')
        console.log('Cole o conteúdo de database/create-workbook-table.sql no SQL Editor')
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    createWorkbookTable()
        .then(() => {
            console.log('\n🏁 Script finalizado!')
            process.exit(0)
        })
        .catch((error) => {
            console.error('💥 Erro fatal:', error)
            process.exit(1)
        })
}

module.exports = { createWorkbookTable }