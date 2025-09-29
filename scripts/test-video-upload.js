// Script para testar upload de vídeo do YouTube
// Execute no Console do navegador na página de gerenciamento de vídeos

const testVideoUpload = async () => {
    try {
        // Simular dados do gestor (substitua pelos dados reais)
        const testData = {
            title: "Teste de Vídeo do YouTube",
            description: "Este é um vídeo de teste para verificar o sistema",
            youtube_url: "https://www.youtube.com/watch?v=PlVOFc3AAnw",
            youtube_video_id: "PlVOFc3AAnw",
            thumbnail_url: "https://img.youtube.com/vi/PlVOFc3AAnw/hqdefault.jpg",
            type: "youtube",
            manager_id: localStorage.getItem('userId'),
            company_id: localStorage.getItem('companyId')
        }

        console.log('🧪 Testando upload com dados:', testData)

        // Se não tem company_id, buscar da API
        if (!testData.company_id && testData.manager_id) {
            console.log('🔍 Buscando company_id...')
            const managerResponse = await fetch(`/api/companies?manager_email=${localStorage.getItem('userEmail')}`)
            const managerData = await managerResponse.json()
            console.log('📊 Resposta da API:', managerData)

            if (managerData.success && managerData.company?.id) {
                testData.company_id = managerData.company.id
                localStorage.setItem('companyId', testData.company_id)
                console.log('✅ CompanyId encontrado:', testData.company_id)
            } else {
                console.log('❌ Erro ao buscar company_id:', managerData)
                return
            }
        }

        const response = await fetch('/api/videos/management', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Vídeo criado com sucesso:', result)
        } else {
            console.log('❌ Erro ao criar vídeo:', result)
            console.log('📊 Status:', response.status)
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error)
    }
}

// Verificar dados do localStorage
console.log('📋 Dados do localStorage:')
console.log('- userId:', localStorage.getItem('userId'))
console.log('- userEmail:', localStorage.getItem('userEmail'))
console.log('- companyId:', localStorage.getItem('companyId'))
console.log('- userType:', localStorage.getItem('userType'))

// Executar o teste
testVideoUpload()