require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configurar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Configurações encontradas:')
console.log('- SUPABASE_URL:', supabaseUrl ? 'CONFIGURADO' : 'NÃO CONFIGURADO')
console.log('- SERVICE_ROLE_KEY:', supabaseKey ? 'CONFIGURADO' : 'NÃO CONFIGURADO')

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Configurações do Supabase não encontradas!')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createTestEmployee() {
    try {
        console.log('🔧 Criando funcionário de teste para esqueci senha...')

        // Primeiro, verificar se existe alguma empresa
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('*')
            .limit(1)

        if (companiesError) {
            console.error('❌ Erro ao buscar empresas:', companiesError)
            return
        }

        if (!companies || companies.length === 0) {
            console.log('📋 Nenhuma empresa encontrada. Criando empresa de teste...')

            // Criar empresa de teste
            const { data: newCompany, error: companyError } = await supabase
                .from('companies')
                .insert({
                    name: 'Empresa Teste',
                    manager_email: 'gestor@teste.com',
                    created_at: new Date().toISOString()
                })
                .select()
                .single()

            if (companyError) {
                console.error('❌ Erro ao criar empresa:', companyError)
                return
            }

            console.log('✅ Empresa criada:', newCompany.name)
            companies.push(newCompany)
        }

        const companyId = companies[0].id
        console.log('🏢 Usando empresa:', companies[0].name, '(ID:', companyId, ')')

        // Verificar se já existe funcionário de teste
        const { data: existingEmployee } = await supabase
            .from('employees')
            .select('*')
            .eq('cpf', '12345678901')
            .single()

        if (existingEmployee) {
            console.log('👤 Funcionário de teste já existe:', existingEmployee.full_name)
            console.log('📧 Email:', existingEmployee.email)
            console.log('🆔 CPF:', existingEmployee.cpf)
            return
        }

        // Criar funcionário de teste
        const testEmployee = {
            name: 'João Teste', // Campo obrigatório
            full_name: 'João da Silva Teste',
            email: 'lucasprogramador1998@gmail.com', // Seu email para receber os testes
            cpf: '12345678901',
            birth_date: '1990-01-01',
            company_id: companyId,
            created_at: new Date().toISOString(),
            archived: false
        }

        const { data: newEmployee, error: employeeError } = await supabase
            .from('employees')
            .insert(testEmployee)
            .select()
            .single()

        if (employeeError) {
            console.error('❌ Erro ao criar funcionário:', employeeError)
            return
        }

        console.log('✅ Funcionário de teste criado com sucesso!')
        console.log('👤 Nome:', newEmployee.full_name)
        console.log('📧 Email:', newEmployee.email)
        console.log('🆔 CPF:', newEmployee.cpf)
        console.log('🏢 Empresa:', companies[0].name)

        console.log('\n🧪 Para testar esqueci senha:')
        console.log('1. Acesse: http://localhost:3001/login/funcionario/esqueci-senha')
        console.log('2. Digite o CPF: 123.456.789-01')
        console.log('3. Verifique seu email: joao.teste@email.com')

    } catch (error) {
        console.error('❌ Erro geral:', error)
    }
}

createTestEmployee()