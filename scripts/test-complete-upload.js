// Teste completo do upload de vídeo com schema atualizado
const testVideoUpload = async () => {
    try {
        console.log('🧪 Testando upload de vídeo com schema completo...')

        // Dados de teste
        const testVideo = {
            title: 'Teste Upload Schema Completo',
            description: 'Teste após atualização do schema',
            youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            type: 'youtube',
            manager_id: 1,
            company_id: 1
        }

        console.log('📤 Enviando dados:', testVideo)

        const response = await fetch('/api/videos/management', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testVideo)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Upload realizado com sucesso!')
            console.log('📋 Dados do vídeo criado:', result.video)

            // Verificar se as novas colunas foram preenchidas
            const video = result.video
            const requiredFields = [
                'created_by_type',
                'created_by_id',
                'manager_id',
                'company_id',
                'display_order'
            ]

            console.log('🔍 Verificando campos de ownership:')
            requiredFields.forEach(field => {
                const value = video[field]
                const status = value !== null && value !== undefined ? '✅' : '❌'
                console.log(`${status} ${field}: ${value}`)
            })

        } else {
            console.log('❌ Erro no upload:', response.status, result)
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error)
    }
}

// Execute o teste
testVideoUpload()