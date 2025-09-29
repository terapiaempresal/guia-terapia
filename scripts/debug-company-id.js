// Script de debug rápido - execute no Console do navegador
console.log('🔍 Debug do localStorage:')
console.log('- userEmail:', localStorage.getItem('userEmail'))
console.log('- userId:', localStorage.getItem('userId'))
console.log('- companyId:', localStorage.getItem('companyId'))

// Testar busca do company_id
const testCompanyId = async () => {
    const userEmail = localStorage.getItem('userEmail')
    if (!userEmail) {
        console.log('❌ userEmail não encontrado no localStorage')
        return
    }

    console.log('🔍 Buscando company_id para:', userEmail)

    try {
        const response = await fetch(`/api/companies?manager_email=${userEmail}`)
        const data = await response.json()

        console.log('📊 Resposta completa da API:', data)

        if (data.success && data.company?.id) {
            console.log('✅ Company ID encontrado:', data.company.id)
            localStorage.setItem('companyId', data.company.id)
            console.log('💾 Company ID salvo no localStorage')
        } else {
            console.log('❌ Company ID não encontrado na resposta')
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error)
    }
}

testCompanyId()