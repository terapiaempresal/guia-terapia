// Teste para verificar se o sistema de vídeos está funcionando
const testVideoSystem = async () => {
    try {
        console.log('🧪 Testando sistema de vídeos...')

        // Verificar dados do localStorage
        const managerId = localStorage.getItem('userId')
        const companyData = localStorage.getItem('company')
        const company = companyData ? JSON.parse(companyData) : null

        console.log('👤 Manager ID:', managerId)
        console.log('🏢 Company:', company)

        if (!managerId || !company?.id) {
            console.log('❌ Dados do gestor não estão completos no localStorage')

            // Tentar corrigir localStorage
            if (managerId && !company) {
                console.log('🔧 Tentando buscar dados da empresa...')
                const companyResponse = await fetch(`/api/companies?manager_id=${managerId}`)
                const companyResult = await companyResponse.json()

                if (companyResult.success && companyResult.companies?.[0]) {
                    localStorage.setItem('company', JSON.stringify(companyResult.companies[0]))
                    console.log('✅ Dados da empresa salvos no localStorage')
                    location.reload()
                    return
                }
            }
            return
        }

        // 1. Testar busca de vídeos
        console.log('📡 Testando busca de vídeos...')
        const videosResponse = await fetch(`/api/videos/management?company_id=${company.id}`)
        const videosData = await videosResponse.json()

        if (videosData.success) {
            console.log(`📺 Total de vídeos: ${videosData.videos?.length || 0}`)

            // Categorizar vídeos
            const systemVideos = videosData.videos?.filter(v =>
                v.category !== 'company' &&
                v.created_by_type !== 'manager' &&
                !v.manager_id
            ) || []

            const companyVideos = videosData.videos?.filter(v =>
                v.category === 'company' ||
                v.created_by_type === 'manager' ||
                (v.company_id && v.manager_id)
            ) || []

            console.log(`🔒 Vídeos do sistema: ${systemVideos.length}`)
            console.log(`🏢 Vídeos da empresa: ${companyVideos.length}`)

            if (companyVideos.length > 0) {
                console.log('📋 Vídeos da empresa:')
                companyVideos.forEach((video, i) => {
                    console.log(`${i + 1}. "${video.title}" - Category: ${video.category}`)
                })
            }
        }

        // 2. Testar criação de vídeo
        console.log('🎬 Testando criação de vídeo...')
        const testVideo = {
            title: 'Teste Sistema - ' + new Date().toLocaleTimeString(),
            description: 'Vídeo de teste para verificar funcionamento',
            youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            type: 'youtube',
            manager_id: managerId,
            company_id: company.id
        }

        const createResponse = await fetch('/api/videos/management', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testVideo)
        })

        const createResult = await createResponse.json()

        if (createResponse.ok && createResult.success) {
            console.log('✅ Vídeo criado com sucesso!')
            console.log('📹 Dados:', {
                id: createResult.video.id,
                title: createResult.video.title,
                category: createResult.video.category,
                created_by_type: createResult.video.created_by_type
            })

            // Verificar se foi identificado corretamente como vídeo da empresa
            const isCompanyVideo = createResult.video.category === 'company' ||
                createResult.video.created_by_type === 'manager' ||
                (createResult.video.company_id && createResult.video.manager_id)

            console.log(isCompanyVideo ? '🎯 SUCESSO: Identificado como vídeo da empresa!' : '❌ PROBLEMA: Não identificado como vídeo da empresa')

        } else {
            console.log('❌ Erro ao criar vídeo:', createResult.error)
            console.log('📝 Status:', createResponse.status)
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error)
    }
}

// Execute o teste
testVideoSystem()