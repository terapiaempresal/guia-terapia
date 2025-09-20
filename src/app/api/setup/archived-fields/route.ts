import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        console.log('🔧 [SETUP] Iniciando setup das colunas archived...')

        // Primeiro, verificar se as colunas já existem
        const { data: columns, error: checkError } = await supabaseAdmin
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'employees')
            .eq('table_schema', 'public')
            .in('column_name', ['archived', 'archived_at'])

        console.log('🔍 [SETUP] Colunas existentes:', columns)

        const existingColumns = columns?.map((c: any) => c.column_name) || []
        const needsArchived = !existingColumns.includes('archived')
        const needsArchivedAt = !existingColumns.includes('archived_at')

        console.log('🔍 [SETUP] Precisa criar:', { needsArchived, needsArchivedAt })

        const results = []

        // Adicionar coluna archived se necessário
        if (needsArchived) {
            console.log('🔧 [SETUP] Adicionando coluna archived...')
            const { error: archivedError } = await supabaseAdmin
                .from('employees')
                .update({
                    // Esta chamada vai falhar, mas vamos usar o SQL direto
                })
                .eq('id', 'fake-id-to-trigger-sql')

            // Executar SQL direto via query raw
            try {
                const { error: sqlError } = await supabaseAdmin.rpc('exec_raw_sql', {
                    query: 'ALTER TABLE public.employees ADD COLUMN archived BOOLEAN DEFAULT FALSE'
                })

                if (sqlError) {
                    console.error('❌ [SETUP] Erro ao criar coluna archived:', sqlError)
                    results.push({ action: 'add_archived', success: false, error: sqlError })
                } else {
                    console.log('✅ [SETUP] Coluna archived criada')
                    results.push({ action: 'add_archived', success: true })
                }
            } catch (e) {
                console.log('ℹ️ [SETUP] Função SQL customizada não disponível, tentando método alternativo...')
                results.push({ action: 'add_archived', success: false, error: 'SQL direto não disponível' })
            }
        } else {
            results.push({ action: 'add_archived', success: true, message: 'Coluna já existe' })
        }

        // Adicionar coluna archived_at se necessário
        if (needsArchivedAt) {
            console.log('🔧 [SETUP] Adicionando coluna archived_at...')
            try {
                const { error: sqlError } = await supabaseAdmin.rpc('exec_raw_sql', {
                    query: 'ALTER TABLE public.employees ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE'
                })

                if (sqlError) {
                    console.error('❌ [SETUP] Erro ao criar coluna archived_at:', sqlError)
                    results.push({ action: 'add_archived_at', success: false, error: sqlError })
                } else {
                    console.log('✅ [SETUP] Coluna archived_at criada')
                    results.push({ action: 'add_archived_at', success: true })
                }
            } catch (e) {
                results.push({ action: 'add_archived_at', success: false, error: 'SQL direto não disponível' })
            }
        } else {
            results.push({ action: 'add_archived_at', success: true, message: 'Coluna já existe' })
        }

        console.log('🔧 [SETUP] Setup concluído. Resultados:', results)

        return NextResponse.json({
            success: true,
            message: 'Setup verificado/executado',
            results,
            instructions: needsArchived || needsArchivedAt
                ? 'Execute manualmente no Supabase SQL Editor:\n\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;'
                : 'Todas as colunas já existem!'
        })

    } catch (error) {
        console.error('❌ [SETUP] Erro geral:', error)
        return NextResponse.json(
            { error: 'Erro no setup', details: error },
            { status: 500 }
        )
    }
}