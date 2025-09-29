import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        console.log('🗃️ Criando tabela employee_workbook_responses...')

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
        RETURNS TRIGGER AS \$\$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        \$\$ LANGUAGE plpgsql;

        -- Criar trigger para atualizar updated_at
        DROP TRIGGER IF EXISTS trigger_update_employee_workbook_responses_updated_at ON employee_workbook_responses;
        CREATE TRIGGER trigger_update_employee_workbook_responses_updated_at
            BEFORE UPDATE ON employee_workbook_responses
            FOR EACH ROW
            EXECUTE FUNCTION update_employee_workbook_responses_updated_at();
        `

        // Executar o SQL usando o supabaseAdmin
        const { data, error } = await supabaseAdmin.rpc('exec_sql', {
            sql_query: createTableSQL
        })

        if (error) {
            console.error('❌ Erro ao executar SQL:', error)

            // Tentar método alternativo usando query direto
            console.log('🔄 Tentando método alternativo...')

            const { error: directError } = await supabaseAdmin
                .from('employee_workbook_responses')
                .select('*')
                .limit(1)

            if (directError && directError.code === 'PGRST116') {
                // Tabela não existe, vamos criar usando SQL raw
                const { error: sqlError } = await supabaseAdmin.query(createTableSQL)

                if (sqlError) {
                    console.error('❌ Erro ao executar SQL direto:', sqlError)
                    return NextResponse.json({
                        error: 'Erro ao criar tabela',
                        details: sqlError
                    }, { status: 500 })
                }
            }
        }

        console.log('✅ Tabela employee_workbook_responses criada com sucesso!')

        // Testar se a tabela foi criada
        const { data: testData, error: testError } = await supabaseAdmin
            .from('employee_workbook_responses')
            .select('*')
            .limit(1)

        if (testError) {
            console.error('❌ Erro ao testar tabela:', testError)
            return NextResponse.json({
                error: 'Tabela criada mas não acessível',
                details: testError
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Tabela employee_workbook_responses criada com sucesso!',
            test: testData
        })

    } catch (error) {
        console.error('❌ Erro interno:', error)
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error
        }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Verificando se tabela employee_workbook_responses existe...')

        // Verificar se a tabela existe
        const { data, error } = await supabaseAdmin
            .from('employee_workbook_responses')
            .select('*')
            .limit(1)

        if (error) {
            console.error('❌ Tabela não existe:', error)
            return NextResponse.json({
                exists: false,
                error: error.message,
                suggestion: 'Execute POST /api/setup/workbook-table para criar a tabela'
            })
        }

        console.log('✅ Tabela existe e está acessível')
        return NextResponse.json({
            exists: true,
            message: 'Tabela employee_workbook_responses existe e está funcionando',
            sample: data
        })

    } catch (error) {
        console.error('❌ Erro interno:', error)
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error
        }, { status: 500 })
    }
}