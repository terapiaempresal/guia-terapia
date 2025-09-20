// Script para verificar o funcionário específico que está tentando fazer login
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente do Supabase não encontradas')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Definida' : 'Não definida')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Definida' : 'Não definida')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEmployee() {
    try {
        const cpf = '01932999680' // CPF limpo
        
        console.log('🔍 Buscando funcionário com CPF:', cpf)
        
        // Buscar funcionário
        const { data: employee, error } = await supabase
            .from('employees')
            .select('*')
            .eq('cpf', cpf)
            .single()

        if (error) {
            console.error('❌ Erro ao buscar funcionário:', error.message)
            
            // Vamos buscar todos os funcionários para ver o que temos
            console.log('\n📋 Listando todos os funcionários para debug:')
            const { data: allEmployees, error: allError } = await supabase
                .from('employees')
                .select('id, name, cpf, birth_date, password')
                .limit(10)

            if (allError) {
                console.error('❌ Erro ao listar funcionários:', allError.message)
            } else {
                console.table(allEmployees)
            }
            return
        }

        console.log('✅ Funcionário encontrado!')
        console.log('Nome:', employee.name)
        console.log('CPF:', employee.cpf)
        console.log('Data de nascimento:', employee.birth_date)
        console.log('Tem senha configurada:', employee.password ? 'SIM' : 'NÃO')
        
        if (employee.password) {
            console.log('Senha atual:', employee.password)
        }
        
        // Verificar se a senha esperada (19092004) bate com a data de nascimento
        if (employee.birth_date) {
            const birthDate = new Date(employee.birth_date)
            const expectedPassword = String(birthDate.getDate()).padStart(2, '0') + 
                                   String(birthDate.getMonth() + 1).padStart(2, '0') + 
                                   birthDate.getFullYear()
            
            console.log('Senha esperada baseada na data de nascimento:', expectedPassword)
            console.log('Senha tentada pelo usuário: 19092004')
            console.log('Senhas coincidem:', expectedPassword === '19092004' ? 'SIM' : 'NÃO')
        }

        // Verificar estrutura da tabela
        console.log('\n🔧 Verificando estrutura da tabela employees...')
        const { data: columns, error: columnsError } = await supabase
            .rpc('get_table_columns', { table_name: 'employees' })
            .catch(() => {
                // Se a função não existir, vamos fazer uma query simples
                return supabase
                    .from('employees')
                    .select('*')
                    .limit(1)
            })

        if (employee && typeof employee === 'object') {
            console.log('Colunas disponíveis:', Object.keys(employee))
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.message)
    }
}

checkEmployee()