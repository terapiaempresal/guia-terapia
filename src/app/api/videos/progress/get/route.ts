import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Força a rota a ser dinâmica pois usa request.url
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const employeeId = searchParams.get('employee_id')

        if (!employeeId) {
            return NextResponse.json(
                { error: 'employee_id é obrigatório' },
                { status: 400 }
            )
        }

        console.log('📊 Buscando progresso para funcionário:', employeeId)

        // Buscar progresso do funcionário específico
        const { data: progress, error } = await supabase
            .from('employee_progress')
            .select('video_id, completed')
            .eq('employee_id', employeeId)

        if (error) {
            console.error('Erro ao buscar progresso:', error)
            return NextResponse.json(
                { error: 'Erro ao buscar progresso' },
                { status: 500 }
            )
        }

        console.log('📈 Progresso encontrado:', progress)

        // Converter para objeto { video_id: completed }
        const progressMap = progress.reduce((acc: { [key: string]: boolean }, item: { video_id: string; completed: boolean }) => {
            acc[item.video_id] = item.completed
            return acc
        }, {} as { [key: string]: boolean })

        return NextResponse.json({
            success: true,
            progress: progressMap,
            employee_id: employeeId
        })

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
