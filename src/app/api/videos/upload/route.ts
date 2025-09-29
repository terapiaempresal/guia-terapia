import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('video') as File
        const title = formData.get('title') as string
        const description = formData.get('description') as string

        if (!file || !title) {
            return NextResponse.json(
                { success: false, error: 'Arquivo de vídeo e título são obrigatórios' },
                { status: 400 }
            )
        }

        // Validar tipo de arquivo
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Formato de vídeo não suportado' },
                { status: 400 }
            )
        }

        // Validar tamanho do arquivo (máximo 500MB)
        const maxSize = 500 * 1024 * 1024 // 500MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'Arquivo muito grande. Máximo 500MB' },
                { status: 400 }
            )
        }

        // Gerar nome único para o arquivo
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const extension = file.name.split('.').pop()
        const fileName = `videos/${timestamp}_${randomString}.${extension}`

        // Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('videos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Erro no upload:', uploadError)
            return NextResponse.json(
                { success: false, error: 'Erro ao fazer upload do vídeo' },
                { status: 500 }
            )
        }

        // Obter URL pública do arquivo
        const { data: { publicUrl } } = supabase.storage
            .from('videos')
            .getPublicUrl(fileName)

        // Criar entrada no banco de dados
        const { data: video, error: dbError } = await supabase
            .from('videos')
            .insert({
                title,
                description: description || '',
                file_url: publicUrl,
                file_path: fileName,
                file_size: file.size,
                file_type: file.type,
                duration: 0, // Será calculado posteriormente
                created_by: 'temp-manager-id', // TODO: Usar ID real do gestor
                is_active: true
            })
            .select()
            .single()

        if (dbError) {
            console.error('Erro ao salvar no banco:', dbError)

            // Tentar remover arquivo do storage se falhou no banco
            await supabase.storage
                .from('videos')
                .remove([fileName])

            return NextResponse.json(
                { success: false, error: 'Erro ao salvar informações do vídeo' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            video,
            message: 'Vídeo enviado com sucesso!'
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// Endpoint para obter URL de upload pré-assinada (para uploads grandes)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const fileName = searchParams.get('fileName')
        const fileType = searchParams.get('fileType')

        if (!fileName || !fileType) {
            return NextResponse.json(
                { success: false, error: 'Nome e tipo do arquivo são obrigatórios' },
                { status: 400 }
            )
        }

        // Validar tipo de arquivo
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
        if (!allowedTypes.includes(fileType)) {
            return NextResponse.json(
                { success: false, error: 'Formato de vídeo não suportado' },
                { status: 400 }
            )
        }

        // Gerar nome único
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const extension = fileName.split('.').pop()
        const uniqueFileName = `videos/${timestamp}_${randomString}.${extension}`

        // Criar URL pré-assinada para upload
        const { data, error } = await supabase.storage
            .from('videos')
            .createSignedUploadUrl(uniqueFileName)

        if (error) {
            console.error('Erro ao criar URL de upload:', error)
            return NextResponse.json(
                { success: false, error: 'Erro ao preparar upload' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            uploadUrl: data.signedUrl,
            fileName: uniqueFileName,
            token: data.token
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}