import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTestManager() {
    try {
        // Criar empresa teste
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
                name: 'Empresa Teste',
                quota: 50
            })
            .select()
            .single()

        if (companyError) {
            console.error('Erro ao criar empresa:', companyError)
            return
        }

        console.log('Empresa criada:', company)

        // Criar gestor teste
        const { data: manager, error: managerError } = await supabase
            .from('managers')
            .insert({
                name: 'Gestor Teste',
                email: 'gestor@teste.com',
                password: '123456',
                company_id: company.id
            })
            .select()
            .single()

        if (managerError) {
            console.error('Erro ao criar gestor:', managerError)
            return
        }

        console.log('Gestor criado:', manager)
        console.log('\n✅ Dados de login criados com sucesso!')
        console.log('📧 Email: gestor@teste.com')
        console.log('🔑 Senha: 123456')

    } catch (error) {
        console.error('Erro:', error)
    }
}

createTestManager()
