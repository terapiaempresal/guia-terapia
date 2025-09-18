import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { video_id, completed, employee_id } = await request.json()

        console.log('📥 Dados recebidos:', { video_id, completed, employee_id })

        if (!employee_id || !video_id) {
            return NextResponse.json(
                { error: 'employee_id e video_id são obrigatórios' },
                { status: 400 }
            )
        }

        console.log('💾 Atualizando progresso:', {
            employee_id,
            video_id,
            completed: !!completed
        })

        // Inserir/atualizar na tabela employee_progress
        const { data, error } = await supabase
            .from('employee_progress')
            .upsert({
                employee_id,
                video_id,
                completed: !!completed,
                completed_at: completed ? new Date().toISOString() : null
            })
            .select()

        console.log('🔄 Resultado do Supabase:', { data, error })

        if (error) {
            console.error('❌ Erro específico do Supabase:', error)
            return NextResponse.json(
                { error: `Erro no banco de dados: ${error.message}`, details: error },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Progresso salvo com sucesso',
            data
        })

    } catch (error) {
        console.error('Erro interno completo:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
            { status: 500 }
        )
    }
}
