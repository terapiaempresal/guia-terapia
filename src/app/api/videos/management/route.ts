import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar vídeos com filtro por empresa
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const companyId = searchParams.get('company_id')
        const managerId = searchParams.get('manager_id')

        let query = supabase
            .from('videos')
            .select('*')
            .order('display_order', { ascending: true })

        if (companyId || managerId) {
            // Buscar vídeos do sistema + vídeos da empresa
            query = query.or(`created_by_type.eq.system,and(created_by_type.eq.company,company_id.eq.${companyId})`)
        }

        const { data: videos, error } = await query

        if (error) throw error

        console.log(`📺 Retornando ${videos?.length || 0} vídeos para empresa ${companyId}`)

        return NextResponse.json({
            success: true,
            videos: videos || []
        })

    } catch (error) {
        console.error('Erro ao buscar vídeos:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// POST - Criar novo vídeo
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Extrair dados do gestor
        const { manager_id, company_id } = body

        if (!manager_id || !company_id) {
            return NextResponse.json(
                { success: false, error: 'Manager ID e Company ID são obrigatórios' },
                { status: 400 }
            )
        }

        const {
            title,
            description,
            file_url,
            thumbnail_url,
            duration,
            youtube_url,
            youtube_video_id,
            type = 'upload'
        } = body

        // Validação baseada no tipo
        if (type === 'youtube') {
            if (!title || !youtube_url) {
                return NextResponse.json(
                    { success: false, error: 'Título e URL do YouTube são obrigatórios' },
                    { status: 400 }
                )
            }
        } else {
            if (!title || !file_url) {
                return NextResponse.json(
                    { success: false, error: 'Título e URL do arquivo são obrigatórios' },
                    { status: 400 }
                )
            }
        }

        // Preparar dados do vídeo básico (sem novas colunas por enquanto)
        const videoData = {
            title,
            description: description || '',
            video_url: type === 'youtube' ? youtube_url : file_url,
            thumbnail_url: thumbnail_url || null,
            duration: duration || null,
            category: type === 'youtube' ? 'youtube' : 'upload',
            is_public: true
        }

        console.log('📹 Criando vídeo da empresa:', { title, type })

        // Criar novo vídeo
        const { data: video, error } = await supabase
            .from('videos')
            .insert(videoData)
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar vídeo:', error)
            return NextResponse.json(
                { success: false, error: 'Erro ao criar vídeo' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            video
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// PUT - Editar vídeo existente
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            id,
            title,
            description,
            video_url,
            thumbnail_url,
            duration
        } = body

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID do vídeo é obrigatório' },
                { status: 400 }
            )
        }

        // Campos que podem ser editados
        const updateData: any = {}
        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (video_url !== undefined) updateData.video_url = video_url
        if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
        if (duration !== undefined) updateData.duration = duration

        console.log(`📝 Editando vídeo ${id}:`, updateData)

        const { data: updatedVideo, error } = await supabase
            .from('videos')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar vídeo:', error)
            return NextResponse.json(
                { success: false, error: 'Erro ao atualizar vídeo' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            video: updatedVideo
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// DELETE - Remover vídeo
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID do vídeo é obrigatório' },
                { status: 400 }
            )
        }

        console.log(`🗑️ Removendo vídeo ${id}`)

        // Remover vídeo
        const { error: deleteError } = await supabase
            .from('videos')
            .delete()
            .eq('id', id)

        if (deleteError) {
            console.error('Erro ao remover vídeo:', deleteError)
            return NextResponse.json(
                { success: false, error: 'Erro ao remover vídeo' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Vídeo removido com sucesso'
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}