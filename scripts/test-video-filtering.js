// Teste para verificar filtragem de vídeos por empresa
const testVideoFiltering = async () => {
    try {
        console.log('🧪 Testando filtragem de vídeos por empresa...')

        // Verificar dados do localStorage
        const companyData = localStorage.getItem('company')
        const company = companyData ? JSON.parse(companyData) : null
        console.log('🏢 Dados da empresa no localStorage:', company)

        if (!company?.id) {
            console.log('❌ Company ID não encontrado no localStorage')
            return
        }

        // Testar API sem filtro
        console.log('📡 Testando API sem filtro...')
        const responseAll = await fetch('/api/videos/management')
        const dataAll = await responseAll.json()
        console.log(`📺 Total de vídeos no sistema: ${dataAll.videos?.length || 0}`)

        // Testar API com filtro de empresa
        console.log(`📡 Testando API com filtro da empresa ${company.id}...`)
        const responseFiltered = await fetch(`/api/videos/management?company_id=${company.id}`)
        const dataFiltered = await responseFiltered.json()
        console.log(`📺 Vídeos filtrados para empresa: ${dataFiltered.videos?.length || 0}`)

        if (dataFiltered.videos?.length > 0) {
            console.log('📋 Vídeos encontrados:')
            dataFiltered.videos.forEach((video, index) => {
                console.log(`${index + 1}. "${video.title}" - Tipo: ${video.created_by_type} - Company ID: ${video.company_id}`)
            })
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error)
    }
}

// Execute o teste
testVideoFiltering()