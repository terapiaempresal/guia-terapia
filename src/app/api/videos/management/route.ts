import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar vídeos com filtro por empresa
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const companyId = searchParams.get('company_id')
        const managerId = searchParams.get('manager_id')

        let query = supabase
            .from('videos')
            .select('*')
            .order('display_order', { ascending: true })

        if (companyId || managerId) {
            // Buscar vídeos do sistema + vídeos da empresa
            query = query.or(`created_by_type.eq.system,and(created_by_type.eq.manager,company_id.eq.${companyId})`)
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

        // Preparar dados do vídeo (workaround para constraint)
        const videoData = {
            title,
            description: description || '',
            video_url: type === 'youtube' ? youtube_url : file_url,
            thumbnail_url: thumbnail_url || null,
            duration: duration || null,
            category: 'company', // Usar category para identificar vídeos da empresa
            is_public: true,
            created_by_type: 'system', // Temporário - constraint só aceita 'system'
            created_by_id: manager_id,
            manager_id: manager_id,
            company_id: company_id,
            display_order: 100
        }

        console.log('📹 Criando vídeo da empresa (workaround):', {
            title,
            type,
            category: 'company', // Identificador temporário
            manager_id: manager_id,
            company_id: company_id,
            display_order: 100,
            note: 'Usando category=company até corrigir constraint'
        })

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
            duration,
            display_order,
            manager_id // Para validação
        } = body

        console.log('🔄 PUT /api/videos/management - Dados recebidos:', {
            id,
            title,
            description,
            video_url,
            thumbnail_url,
            duration,
            display_order,
            manager_id,
            manager_id_type: typeof manager_id
        })

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID do vídeo é obrigatório' },
                { status: 400 }
            )
        }

        // Primeiro, verificar o vídeo e sua propriedade
        const { data: existingVideo, error: fetchError } = await supabase
            .from('videos')
            .select('id, created_by_type, created_by_id, manager_id')
            .eq('id', id)
            .single()

        console.log('📺 Vídeo existente encontrado:', {
            existingVideo,
            fetchError
        })

        if (fetchError || !existingVideo) {
            console.error('❌ Vídeo não encontrado:', fetchError)
            return NextResponse.json(
                { success: false, error: 'Vídeo não encontrado' },
                { status: 404 }
            )
        }

        // Verificar permissões de edição
        const isSystemVideo = existingVideo.created_by_type === 'system'
        const isManagerVideo = existingVideo.created_by_type === 'manager'
        const isOwner = isManagerVideo && existingVideo.manager_id === manager_id

        console.log('🔍 Verificação de permissões:', {
            isSystemVideo,
            isManagerVideo,
            isOwner,
            existingVideo_manager_id: existingVideo.manager_id,
            existingVideo_manager_id_type: typeof existingVideo.manager_id,
            requested_manager_id: manager_id,
            requested_manager_id_type: typeof manager_id,
            comparison: existingVideo.manager_id === manager_id
        })

        // Campos que podem ser editados baseado no tipo
        const updateData: any = {}

        // Título e descrição sempre podem ser editados
        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description

        // Para vídeos do sistema, só pode editar título e descrição
        if (isSystemVideo) {
            console.log(`📝 Editando vídeo do sistema ${id}: apenas título/descrição`)
        }
        // Para vídeos do gestor, pode editar tudo (se for o proprietário)
        else if (isManagerVideo && isOwner) {
            if (video_url !== undefined) updateData.video_url = video_url
            if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
            if (duration !== undefined) updateData.duration = duration
            if (display_order !== undefined) updateData.display_order = display_order
            console.log(`📝 Editando vídeo do gestor ${id}:`, updateData)
        }
        // Se não for o proprietário do vídeo do gestor, bloquear
        else if (isManagerVideo && !isOwner) {
            return NextResponse.json(
                { success: false, error: 'Você só pode editar seus próprios vídeos' },
                { status: 403 }
            )
        }

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
        const { searchParams } = request.nextUrl
        const id = searchParams.get('id')
        const manager_id = searchParams.get('manager_id')

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID do vídeo é obrigatório' },
                { status: 400 }
            )
        }

        if (!manager_id) {
            return NextResponse.json(
                { success: false, error: 'ID do gestor é obrigatório' },
                { status: 400 }
            )
        }

        // Verificar se o vídeo existe e se o gestor é o proprietário
        const { data: video, error: fetchError } = await supabase
            .from('videos')
            .select('id, created_by_type, manager_id, company_id, category, title')
            .eq('id', id)
            .single()

        if (fetchError || !video) {
            return NextResponse.json(
                { success: false, error: 'Vídeo não encontrado' },
                { status: 404 }
            )
        }

        // Verificar se é vídeo da empresa (identificação por category ou manager_id)
        const isCompanyVideo = video.category === 'company' || video.manager_id

        if (!isCompanyVideo) {
            return NextResponse.json(
                { success: false, error: 'Apenas vídeos da empresa podem ser excluídos' },
                { status: 403 }
            )
        }

        // Verificar se o gestor é o proprietário
        if (video.manager_id !== manager_id) {
            return NextResponse.json(
                { success: false, error: 'Você só pode excluir seus próprios vídeos' },
                { status: 403 }
            )
        }

        console.log(`🗑️ Removendo vídeo ${id} (${video.title}) do gestor ${manager_id}`)

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