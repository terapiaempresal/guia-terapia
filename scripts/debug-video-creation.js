// Debug para verificar como os vídeos estão sendo salvos
const debugVideoCreation = async () => {
    try {
        console.log('🔍 Verificando último vídeo criado...')

        // Buscar todos os vídeos para ver o último criado
        const response = await fetch('/api/videos/management')
        const data = await response.json()

        if (data.success && data.videos?.length > 0) {
            // Ordenar por data de criação (mais recente primeiro)
            const sortedVideos = data.videos.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )

            const lastVideo = sortedVideos[0]
            console.log('📹 Último vídeo criado:', {
                id: lastVideo.id,
                title: lastVideo.title,
                created_by_type: lastVideo.created_by_type,
                created_by_id: lastVideo.created_by_id,
                manager_id: lastVideo.manager_id,
                company_id: lastVideo.company_id,
                display_order: lastVideo.display_order,
                created_at: lastVideo.created_at
            })

            // Verificar dados do gestor atual
            const companyData = localStorage.getItem('company')
            const company = companyData ? JSON.parse(companyData) : null
            const managerData = localStorage.getItem('userId')

            console.log('👤 Dados do gestor atual:', {
                userId: managerData,
                company: company
            })

            // Verificar se o vídeo pertence ao gestor/empresa atual
            const belongsToCurrentManager = lastVideo.company_id === company?.id
            console.log(`🎯 Vídeo pertence à empresa atual? ${belongsToCurrentManager ? '✅ SIM' : '❌ NÃO'}`)

        } else {
            console.log('❌ Nenhum vídeo encontrado')
        }

    } catch (error) {
        console.error('❌ Erro no debug:', error)
    }
}

// Execute o debug
debugVideoCreation()