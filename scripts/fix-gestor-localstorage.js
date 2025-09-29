// Script para verificar e corrigir dados do localStorage para gestores
const debugGestorLocalStorage = async () => {
    try {
        console.log('🔍 Verificando dados do localStorage...')

        // Verificar dados atuais
        const userType = localStorage.getItem('userType')
        const userId = localStorage.getItem('userId')
        const userName = localStorage.getItem('userName')
        const companyData = localStorage.getItem('company')

        console.log('📋 Dados atuais do localStorage:', {
            userType,
            userId,
            userName,
            company: companyData ? JSON.parse(companyData) : null
        })

        if (userType === 'gestor' && userId) {
            console.log('👤 Gestor logado, buscando dados da empresa...')

            // Buscar dados completos do gestor
            const response = await fetch(`/api/companies?manager_id=${userId}`)
            const data = await response.json()

            if (data.success && data.companies?.length > 0) {
                const company = data.companies[0]
                console.log('🏢 Empresa encontrada:', company)

                // Salvar no localStorage
                localStorage.setItem('company', JSON.stringify(company))
                console.log('✅ Dados da empresa salvos no localStorage')

                return company
            } else {
                console.log('❌ Empresa não encontrada para o gestor')
            }
        } else {
            console.log('❌ Usuário não é gestor ou não está logado')
        }

    } catch (error) {
        console.error('❌ Erro ao verificar localStorage:', error)
    }
}

// Execute o script
debugGestorLocalStorage().then(company => {
    if (company) {
        console.log('🎯 Agora teste novamente o upload de vídeo!')
    }
})