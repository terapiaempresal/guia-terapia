import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTestEmployee() {
    try {
        // Buscar empresa existente
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .limit(1)
            .single()

        if (companyError) {
            console.error('Erro ao buscar empresa:', companyError)
            console.log('Por favor, execute primeiro create-test-manager.js')
            return
        }

        console.log('Empresa encontrada:', company.name)

        // Criar funcionário teste
        const { data: employee, error: employeeError } = await supabase
            .from('employees')
            .insert({
                full_name: 'Maria Funcionária',
                name: 'Maria Funcionária',
                email: 'maria@teste.com',
                cpf: '12345678901',
                company_id: company.id,
                status: 'active',
                invited_at: new Date().toISOString(),
                accepted_at: new Date().toISOString()
            })
            .select()
            .single()

        if (employeeError) {
            console.error('Erro ao criar funcionário:', employeeError)
            return
        }

        console.log('Funcionário criado:', employee)
        console.log('\n✅ Funcionário de teste criado com sucesso!')
        console.log('👤 Nome: Maria Funcionária')
        console.log('📧 Email: maria@teste.com')
        console.log('🆔 CPF: 123.456.789-01')
        console.log('🏢 Empresa:', company.name)

    } catch (error) {
        console.error('Erro:', error)
    }
}

createTestEmployee()