import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        console.log('🔧 Criando dados de teste...')

        // Inserir vídeos de teste
        const videos = [
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                title: 'Introdução ao Curso',
                description: 'Primeiro vídeo do curso',
                video_url: 'https://example.com/video1',
                duration: 300,
                category: 'introducao'
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440002',
                title: 'Conceitos Básicos',
                description: 'Segundo vídeo do curso',
                video_url: 'https://example.com/video2',
                duration: 450,
                category: 'basico'
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440003',
                title: 'Práticas Avançadas',
                description: 'Terceiro vídeo do curso',
                video_url: 'https://example.com/video3',
                duration: 600,
                category: 'avancado'
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440004',
                title: 'Estudos de Caso',
                description: 'Quarto vídeo do curso',
                video_url: 'https://example.com/video4',
                duration: 500,
                category: 'casos'
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440005',
                title: 'Conclusão',
                description: 'Quinto vídeo do curso',
                video_url: 'https://example.com/video5',
                duration: 200,
                category: 'conclusao'
            }
        ]

        // Inserir vídeos
        const { error: videosError } = await supabase
            .from('videos')
            .upsert(videos)

        if (videosError) {
            console.error('Erro ao inserir vídeos:', videosError)
        } else {
            console.log('✅ Vídeos criados')
        }

        // Inserir progresso de teste para Maria Silva
        const progress = [
            {
                employee_id: '60945cb2-6903-482e-9eab-c584619bcc27',
                video_id: '550e8400-e29b-41d4-a716-446655440001',
                watched_duration: 300,
                completed: true,
                completed_at: new Date().toISOString()
            },
            {
                employee_id: '60945cb2-6903-482e-9eab-c584619bcc27',
                video_id: '550e8400-e29b-41d4-a716-446655440002',
                watched_duration: 450,
                completed: true,
                completed_at: new Date().toISOString()
            },
            {
                employee_id: '60945cb2-6903-482e-9eab-c584619bcc27',
                video_id: '550e8400-e29b-41d4-a716-446655440003',
                watched_duration: 300,
                completed: false,
                completed_at: null
            }
        ]

        // Inserir progresso
        const { error: progressError } = await supabase
            .from('employee_progress')
            .upsert(progress, { onConflict: 'employee_id,video_id' })

        if (progressError) {
            console.error('Erro ao inserir progresso:', progressError)
        } else {
            console.log('✅ Progresso criado')
        }

        return NextResponse.json({
            success: true,
            message: 'Dados de teste criados com sucesso',
            videos_created: videos.length,
            progress_created: progress.length
        })

    } catch (error) {
        console.error('Erro geral:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}