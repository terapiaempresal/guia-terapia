import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Força a rota a ser dinâmica pois usa request.url
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const employeeId = searchParams.get('employee_id')

        if (!employeeId) {
            // Se não tem employee_id, buscar um funcionário existente
            const { data: employees, error: employeeError } = await supabase
                .from('employees')
                .select('id')
                .limit(1)

            if (!employeeError && employees && employees.length > 0) {
                const employee_id = employees[0].id

                // Buscar progresso deste funcionário
                const { data: progress, error } = await supabase
                    .from('employee_progress')
                    .select('video_id, completed')
                    .eq('employee_id', employee_id)

                if (error) {
                    console.error('Erro ao buscar progresso:', error)
                    return NextResponse.json({ progress: {} })
                }

                // Converter para objeto { video_id: completed }
                const progressMap = progress.reduce((acc: { [key: string]: boolean }, item: { video_id: string; completed: boolean }) => {
                    acc[item.video_id] = item.completed
                    return acc
                }, {} as { [key: string]: boolean })

                return NextResponse.json({
                    success: true,
                    progress: progressMap,
                    employee_id
                })
            }
        }

        return NextResponse.json({
            success: true,
            progress: {},
            message: 'Nenhum funcionário encontrado'
        })

    } catch (error) {
        console.error('Erro ao buscar progresso:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor', progress: {} },
            { status: 500 }
        )
    }
}
