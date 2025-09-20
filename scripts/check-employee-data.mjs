// Script para verificar dados do funcionário específico usando a API do Supabase
async function checkEmployee() {
    try {
        console.log('🔍 Verificando funcionário CPF: 019.329.996-80')
        
        // Fazer requisição para API de debug que criamos
        const response = await fetch('http://localhost:3000/api/debug/employee-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf: '019.329.996-80' })
        })
        
        const result = await response.json()
        console.log('Resultado:', result)
        
    } catch (error) {
        console.error('❌ Erro:', error.message)
    }
}

checkEmployee()