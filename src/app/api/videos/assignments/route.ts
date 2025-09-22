import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        // Retornar estrutura vazia temporariamente até a tabela ser criada
        return NextResponse.json({
            success: true,
            assignments: []
        })
    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { video_id, employee_ids } = body

        if (!video_id || !employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
            return NextResponse.json(
                { success: false, error: 'ID do vídeo e lista de funcionários são obrigatórios' },
                { status: 400 }
            )
        }

        // Verificar se o vídeo existe
        const { data: video, error: videoError } = await supabase
            .from('videos')
            .select('id, title')
            .eq('id', video_id)
            .single()

        if (videoError || !video) {
            return NextResponse.json(
                { success: false, error: 'Vídeo não encontrado' },
                { status: 404 }
            )
        }

        // Simular sucesso temporariamente até a tabela de atribuições ser criada
        return NextResponse.json({
            success: true,
            message: `Vídeo "${video.title}" atribuído a ${employee_ids.length} funcionário(s) (simulado)`,
            assignments: []
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}