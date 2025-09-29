import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        console.log('🗃️ Criando tabela usando RPC create_workbook_table...')

        // Usar uma RPC function para criar a tabela
        const { data, error } = await supabaseAdmin.rpc('create_workbook_table')

        if (error) {
            console.error('❌ Erro na RPC:', error)
            return NextResponse.json({
                error: 'Erro ao executar função create_workbook_table',
                details: error,
                suggestion: 'Você precisa criar a função RPC no Supabase Dashboard primeiro'
            }, { status: 500 })
        }

        console.log('✅ Função RPC executada com sucesso!')

        // Aguardar um pouco e tentar acessar a tabela
        await new Promise(resolve => setTimeout(resolve, 2000))

        const { data: testData, error: testError } = await supabaseAdmin
            .from('employee_workbook_responses')
            .select('*')
            .limit(1)

        if (testError) {
            console.error('❌ Tabela ainda não acessível:', testError)
            return NextResponse.json({
                warning: 'Tabela criada mas ainda não acessível no cache',
                rpc_result: data,
                cache_error: testError,
                suggestion: 'Aguarde alguns minutos ou reinicie o servidor Next.js'
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Tabela employee_workbook_responses criada e acessível!',
            rpc_result: data,
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