// Script para recarregar lista de funcionários no painel do gestor
const reloadEmployeesList = async () => {
    try {
        console.log('🔄 Forçando reload da lista de funcionários...')

        // Simular o que a função loadEmployees faz
        const managerId = localStorage.getItem('userId')
        if (!managerId) {
            console.log('❌ Manager ID não encontrado')
            return
        }

        console.log('👤 Manager ID:', managerId)

        // Fazer requisição como o sistema faz
        const url = `/api/employees?manager_id=${managerId}&_t=${Date.now()}&_r=${Math.random()}`
        console.log('📡 Fazendo requisição para:', url)

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })

        const data = await response.json()

        if (response.ok) {
            console.log(`📊 Funcionários retornados: ${data.employees?.length || 0}`)

            if (data.employees?.length > 0) {
                console.log('📋 Lista de funcionários:')
                data.employees.forEach((emp, i) => {
                    const status = emp.archived ? '🗄️ ARQUIVADO' : '✅ ATIVO'
                    console.log(`${i + 1}. ${emp.name || emp.full_name} - ${status}`)
                })

                // Verificar se há arquivados na lista
                const archived = data.employees.filter(emp => emp.archived)
                if (archived.length > 0) {
                    console.log(`❌ PROBLEMA: ${archived.length} funcionário(s) arquivado(s) ainda aparecem na lista!`)
                    console.log('🔧 Recarregue a página do painel para ver se foi corrigido.')
                } else {
                    console.log('✅ SUCESSO: Nenhum funcionário arquivado na lista principal!')
                }
            } else {
                console.log('ℹ️ Nenhum funcionário encontrado')
            }
        } else {
            console.log('❌ Erro na requisição:', data)
        }

    } catch (error) {
        console.error('❌ Erro:', error)
    }
}

// Execute o teste
reloadEmployeesList()