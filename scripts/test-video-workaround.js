// Teste da nova implementação com workaround para constraint
const testVideoWorkaround = async () => {
    try {
        console.log('🧪 Testando implementação com workaround...')

        const managerId = localStorage.getItem('userId')
        const companyData = localStorage.getItem('company')
        const company = companyData ? JSON.parse(companyData) : null

        if (!managerId || !company?.id) {
            console.log('❌ Dados do gestor não encontrados')
            return
        }

        console.log('👤 Manager ID:', managerId)
        console.log('🏢 Company ID:', company.id)

        // 1. Testar criação de vídeo
        console.log('📤 Testando criação de vídeo...')
        const testVideo = {
            title: 'Teste Workaround - ' + new Date().toLocaleTimeString(),
            description: 'Teste com workaround para constraint',
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
                category: createData.video.category,
                created_by_type: createData.video.created_by_type,
                company_id: createData.video.company_id,
                manager_id: createData.video.manager_id
            })

            // Verificar se será identificado corretamente no frontend
            const isCompany = createData.video.category === 'company' ||
                createData.video.created_by_type === 'manager' ||
                (createData.video.company_id && createData.video.manager_id)

            console.log(`🎯 Será identificado como vídeo da empresa? ${isCompany ? '✅ SIM' : '❌ NÃO'}`)

            return createData.video.id

        } else {
            console.log('❌ Erro ao criar vídeo:', createData.error)
            return null
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error)
        return null
    }
}

// 2. Função para testar listagem
const testVideoListing = async () => {
    try {
        console.log('📡 Testando listagem de vídeos...')

        const companyData = localStorage.getItem('company')
        const company = companyData ? JSON.parse(companyData) : null

        const response = await fetch(`/api/videos/management?company_id=${company.id}`)
        const data = await response.json()

        if (data.success) {
            console.log(`📺 Total de vídeos: ${data.videos?.length || 0}`)

            // Aplicar a mesma lógica do frontend
            const companyVideos = data.videos?.filter(v =>
                v.category === 'company' ||
                v.created_by_type === 'manager' ||
                (v.company_id && v.manager_id)
            ) || []

            const systemVideos = data.videos?.filter(v =>
                !(v.category === 'company' ||
                    v.created_by_type === 'manager' ||
                    (v.company_id && v.manager_id))
            ) || []

            console.log(`🏢 Vídeos da empresa: ${companyVideos.length}`)
            console.log(`🔒 Vídeos do sistema: ${systemVideos.length}`)

            if (companyVideos.length > 0) {
                console.log('📋 Vídeos da empresa:')
                companyVideos.forEach((video, i) => {
                    console.log(`${i + 1}. "${video.title}" - Category: ${video.category}`)
                })
            }

        } else {
            console.log('❌ Erro ao listar vídeos:', data.error)
        }

    } catch (error) {
        console.error('❌ Erro no teste de listagem:', error)
    }
}

// Execute os testes
console.log('🚀 Iniciando testes...')
testVideoWorkaround().then(videoId => {
    if (videoId) {
        console.log('✅ Criação funcionou, testando listagem...')
        setTimeout(() => testVideoListing(), 1000)
    } else {
        console.log('❌ Criação falhou, testando listagem mesmo assim...')
        testVideoListing()
    }
})