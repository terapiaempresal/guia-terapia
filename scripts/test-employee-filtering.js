// Teste para verificar se funcionários arquivados não aparecem na lista principal
const testEmployeeFiltering = async () => {
    try {
        console.log('🧪 Testando filtragem de funcionários...')

        const managerId = localStorage.getItem('userId')
        if (!managerId) {
            console.log('❌ Manager ID não encontrado')
            return
        }

        console.log('👤 Manager ID:', managerId)

        // Testar lista principal (sem arquivados)
        console.log('📡 Buscando funcionários ativos...')
        const responseActive = await fetch(`/api/employees?manager_id=${managerId}`)
        const dataActive = await responseActive.json()

        console.log(`👥 Funcionários ativos: ${dataActive.employees?.length || 0}`)
        dataActive.employees?.forEach((emp, i) => {
            console.log(`${i + 1}. ${emp.name || emp.full_name} - Arquivado: ${emp.archived}`)
        })

        // Testar lista de arquivados
        console.log('📡 Buscando funcionários arquivados...')
        const responseArchived = await fetch(`/api/employees?manager_id=${managerId}&archived_only=true`)
        const dataArchived = await responseArchived.json()

        console.log(`🗄️ Funcionários arquivados: ${dataArchived.employees?.length || 0}`)
        dataArchived.employees?.forEach((emp, i) => {
            console.log(`${i + 1}. ${emp.name || emp.full_name} - Arquivado: ${emp.archived}`)
        })

        // Verificar se algum ativo está marcado como arquivado
        const archivedInActiveList = dataActive.employees?.filter(emp => emp.archived)
        if (archivedInActiveList?.length > 0) {
            console.log('❌ PROBLEMA: Funcionários arquivados na lista ativa:', archivedInActiveList)
        } else {
            console.log('✅ SUCESSO: Nenhum funcionário arquivado na lista ativa')
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error)
    }
}

// Execute o teste
testEmployeeFiltering()