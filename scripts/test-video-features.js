// Teste completo das funcionalidades de vídeo
const testVideoFeatures = async () => {
    try {
        console.log('🧪 Testando funcionalidades de vídeo...')

        const managerId = localStorage.getItem('userId')
        const companyData = localStorage.getItem('company')
        const company = companyData ? JSON.parse(companyData) : null

        if (!managerId || !company?.id) {
            console.log('❌ Dados do gestor não encontrados')
            return
        }

        console.log('👤 Manager ID:', managerId)
        console.log('🏢 Company ID:', company.id)

        // 1. Testar busca de vídeos com filtro
        console.log('📡 Testando busca de vídeos...')
        const response = await fetch(`/api/videos/management?company_id=${company.id}`)
        const data = await response.json()

        if (data.success) {
            console.log(`📺 Total de vídeos: ${data.videos?.length || 0}`)

            const systemVideos = data.videos?.filter(v => v.created_by_type === 'system') || []
            const managerVideos = data.videos?.filter(v => v.created_by_type === 'manager') || []

            console.log(`🔒 Vídeos do sistema: ${systemVideos.length}`)
            console.log(`🏢 Vídeos da empresa: ${managerVideos.length}`)

            // Mostrar vídeos da empresa
            if (managerVideos.length > 0) {
                console.log('📋 Vídeos da empresa:')
                managerVideos.forEach((video, i) => {
                    console.log(`${i + 1}. "${video.title}" - Order: ${video.display_order} - Company: ${video.company_id}`)
                })
            }

            // Verificar se algum vídeo da empresa tem company_id correto
            const correctOwnership = managerVideos.filter(v => v.company_id === company.id)
            console.log(`✅ Vídeos com ownership correto: ${correctOwnership.length}`)

            if (correctOwnership.length !== managerVideos.length) {
                console.log('⚠️ Alguns vídeos da empresa não têm company_id correto')
            }

        } else {
            console.log('❌ Erro ao buscar vídeos:', data.error)
        }

        // 2. Testar criação de vídeo de teste
        console.log('📤 Testando criação de vídeo...')
        const testVideo = {
            title: 'Teste Ownership - ' + new Date().toLocaleTimeString(),
            description: 'Vídeo de teste para verificar ownership',
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

        const createData = await createResponse.json()

        if (createData.success) {
            console.log('✅ Vídeo criado com sucesso!')
            console.log('📹 Dados do vídeo:', {
                id: createData.video.id,
                title: createData.video.title,
                created_by_type: createData.video.created_by_type,
                company_id: createData.video.company_id,
                manager_id: createData.video.manager_id
            })

            // Verificar se foi criado corretamente
            if (createData.video.created_by_type === 'manager' &&
                createData.video.company_id === company.id) {
                console.log('🎯 SUCESSO: Vídeo criado com ownership correto!')
            } else {
                console.log('❌ PROBLEMA: Ownership incorreto no vídeo criado')
            }

        } else {
            console.log('❌ Erro ao criar vídeo:', createData.error)
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error)
    }
}

// Execute o teste
testVideoFeatures()