import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { video_id, watched } = await request.json()

        console.log('Dados recebidos:', { video_id, watched })

        // Primeiro, vamos tentar buscar um funcionário existente
        const { data: employees, error: employeeError } = await supabase
            .from('employees')
            .select('id')
            .limit(1)

        let employee_id = '550e8400-e29b-41d4-a716-446655440000' // fallback

        if (!employeeError && employees && employees.length > 0) {
            employee_id = employees[0].id
            console.log('Usando employee_id real:', employee_id)
        } else {
            console.log('Nenhum funcionário encontrado, usando mock:', employee_id)
        }

        console.log('Tentando inserir no employee_progress:', {
            employee_id,
            video_id,
            completed: watched
        })

        // Inserir na tabela employee_progress
        const { data, error } = await supabase
            .from('employee_progress')
            .upsert({
                employee_id,
                video_id,
                completed: !!watched,
                completed_at: watched ? new Date().toISOString() : null
            })
            .select()

        console.log('Resultado do Supabase:', { data, error })

        if (error) {
            console.error('Erro específico do Supabase:', error)
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
