const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Definida' : 'Não definida')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Definida' : 'Não definida')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkEmployeesTable() {
    try {
        // Primeiro vamos testar se conseguimos conectar
        console.log('Testando conexão...')

        // Tentar buscar as primeiras linhas da tabela employees para ver a estrutura
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .limit(1)

        if (error) {
            console.error('Erro ao consultar employees:', error)

            // Se a tabela não existir, vamos criá-la
            if (error.code === '42P01') {
                console.log('Tabela employees não existe, tentando criar...')

                const { data: createResult, error: createError } = await supabase.rpc('create_employees_table')

                if (createError) {
                    console.error('Erro ao criar tabela:', createError)
                } else {
                    console.log('Tabela criada com sucesso!')
                }
            }
        } else {
            console.log('Estrutura da tabela employees:')
            if (data && data.length > 0) {
                console.log('Colunas disponíveis:', Object.keys(data[0]))
            } else {
                console.log('Tabela existe mas está vazia')
            }
        }

        // Tentar adicionar as colunas que estão faltando se necessário
        console.log('\nVerificando se precisa adicionar colunas...')

        // Primeiro vamos verificar a estrutura atual da tabela
        const { data: tableInfo, error: tableError } = await supabase
            .from('employees')
            .select('*')
            .limit(0)

        if (!tableError) {
            console.log('Tabela employees existe e está acessível')

            // Como não conseguimos executar SQL direto, vamos tentar inserir um funcionário de teste
            // para verificar quais campos estão disponíveis
            console.log('\nTentando adicionar campos via INSERT para ver quais colunas existem...')

            const testEmployee = {
                company_id: '123e4567-e89b-12d3-a456-426614174000', // UUID fictício para teste
                manager_id: '123e4567-e89b-12d3-a456-426614174001', // UUID fictício para teste
                name: 'Teste',
                email: 'teste@teste.com',
                full_name: 'Teste Full Name',
                cpf: '12345678901',
                birth_date: '1990-01-01',
                whatsapp: '11999999999'
            }

            const { data: insertResult, error: insertError } = await supabase
                .from('employees')
                .insert(testEmployee)
                .select()

            if (insertError) {
                console.log('Erro ao inserir funcionário de teste:', insertError)

                // Se o erro foi por coluna inexistente, vamos identificar quais campos estão faltando
                if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
                    console.log('\n⚠️  Algumas colunas não existem na tabela employees')
                    console.log('Você precisa adicionar as seguintes colunas no Supabase Dashboard:')
                    console.log('- full_name TEXT')
                    console.log('- cpf TEXT')
                    console.log('- birth_date DATE')
                    console.log('- whatsapp TEXT')
                }
            } else {
                console.log('✅ Todas as colunas necessárias existem!')

                // Deletar o funcionário de teste
                if (insertResult && insertResult[0]) {
                    await supabase
                        .from('employees')
                        .delete()
                        .eq('id', insertResult[0].id)
                    console.log('Funcionário de teste removido')
                }
            }
        }

    } catch (error) {
        console.error('Erro:', error)
    }
}

checkEmployeesTable()
