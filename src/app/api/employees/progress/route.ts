import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const employeeId = searchParams.get('employee_id')

        if (!employeeId) {
            return NextResponse.json({
                error: 'employee_id é obrigatório'
            }, { status: 400 })
        }

        console.log('🔍 Buscando progresso detalhado do funcionário:', employeeId)

        // Buscar todos os vídeos
        const { data: videos, error: videosError } = await supabaseAdmin
            .from('videos')
            .select('*')
            .order('created_at', { ascending: true })

        if (videosError) {
            console.error('❌ Erro ao buscar vídeos:', videosError)
            return NextResponse.json({
                error: 'Erro ao buscar vídeos',
                details: videosError
            }, { status: 500 })
        }

        // Buscar progresso de vídeos do funcionário
        const { data: progress, error: progressError } = await supabaseAdmin
            .from('employee_progress')
            .select('*')
            .eq('employee_id', employeeId)

        if (progressError) {
            console.error('❌ Erro ao buscar progresso:', progressError)
            return NextResponse.json({
                error: 'Erro ao buscar progresso',
                details: progressError
            }, { status: 500 })
        }

        // Buscar dados do funcionário
        const { data: employee, error: employeeError } = await supabaseAdmin
            .from('employees')
            .select('id, full_name, name, email')
            .eq('id', employeeId)
            .single()

        if (employeeError) {
            console.error('❌ Erro ao buscar funcionário:', employeeError)
            return NextResponse.json({
                error: 'Funcionário não encontrado',
                details: employeeError
            }, { status: 404 })
        }

        // Buscar progresso do caderno/workbook
        const { data: workbookProgress, error: workbookError } = await supabaseAdmin
            .from('employee_workbook_responses')
            .select('section, field_key, value')
            .eq('employee_id', employeeId)

        if (workbookError) {
            console.error('❌ Erro ao buscar progresso do caderno:', workbookError)
            // Não retornar erro, apenas log, pois o caderno é opcional
        }

        // Mapear progresso dos vídeos
        const progressMap = new Map()
        progress?.forEach((p: any) => {
            progressMap.set(p.video_id, p)
        })

        // Combinar dados de vídeos com progresso
        const videosWithProgress = videos?.map((video: any, index: number) => {
            const videoProgress = progressMap.get(video.id)
            return {
                id: video.id,
                title: video.title,
                description: video.description,
                duration: video.duration,
                order_index: index + 1, // Usar índice do array como ordem
                is_watched: videoProgress?.completed || false,
                watched_duration: videoProgress?.watched_duration || 0,
                completed_at: videoProgress?.completed_at,
                progress_percentage: video.duration > 0
                    ? Math.round(((videoProgress?.watched_duration || 0) / video.duration) * 100)
                    : 0
            }
        }) || []

        // Buscar TODOS os field_keys únicos que existem no sistema para calcular total dinâmico
        const { data: allFieldKeys, error: fieldsError } = await supabaseAdmin
            .from('employee_workbook_responses')
            .select('field_key')
            .not('field_key', 'is', null)

        // Criar conjunto de todos os field_keys únicos possíveis
        const allUniqueFields = new Set()
        allFieldKeys?.forEach((record: any) => {
            if (record.field_key) {
                allUniqueFields.add(record.field_key)
            }
        })

        // Calcular estatísticas do caderno
        const workbookSections = workbookProgress?.reduce((acc: any, response: any) => {
            if (!acc[response.section]) {
                acc[response.section] = []
            }
            acc[response.section].push(response)
            return acc
        }, {} as Record<string, any[]>) || {}

        // Total dinâmico baseado em todos os field_keys únicos que existem no sistema
        const totalWorkbookFields = allUniqueFields.size > 0 ? allUniqueFields.size : 55 // Fallback para 55 se não encontrar

        // Contar apenas campos únicos preenchidos (evitar duplicatas por field_key)
        const uniqueCompletedFields = new Set()
        workbookProgress?.forEach((r: any) => {
            if (r.value && r.value.trim() !== '' && r.field_key) {
                uniqueCompletedFields.add(r.field_key)
            }
        })

        const completedWorkbookFields = uniqueCompletedFields.size
        const workbookProgressPercentage = totalWorkbookFields > 0
            ? Math.round((completedWorkbookFields / totalWorkbookFields) * 100)
            : 0

        console.log('📝 Caderno calculado:', {
            employee: employee.full_name || employee.name,
            progresso: `${completedWorkbookFields}/${totalWorkbookFields} (${workbookProgressPercentage}%)`
        })

        // Calcular estatísticas gerais
        const totalVideos = videos?.length || 0
        const watchedVideos = videosWithProgress.filter((v: any) => v.is_watched).length
        const videoProgressPercentage = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0

        // Progresso geral combinado
        const overallProgress = Math.round((videoProgressPercentage + workbookProgressPercentage) / 2)

        const result = {
            employee: {
                id: employee.id,
                name: employee.full_name || employee.name,
                email: employee.email
            },
            videos: {
                total: totalVideos,
                watched: watchedVideos,
                progress_percentage: videoProgressPercentage,
                list: videosWithProgress
            },
            workbook: {
                total_fields: totalWorkbookFields,
                completed_fields: completedWorkbookFields,
                progress_percentage: workbookProgressPercentage,
                sections: workbookSections
            },
            overall_progress_percentage: overallProgress
        }

        console.log('✅ Progresso detalhado calculado:', {
            employee: employee.full_name || employee.name,
            videosWatched: `${watchedVideos}/${totalVideos}`,
            workbookProgress: `${workbookProgressPercentage}%`,
            overallProgress: `${overallProgress}%`
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error('❌ Erro interno:', error)
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error
        }, { status: 500 })
    }
}