// Script de teste para criar funções SQL e testar cadastro
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Usando service role para criar funções
)

async function createSQLFunctions() {
    console.log('🔧 Criando funções SQL...\n')

    // 1. Função para atualizar company
    const updateCompanyFunction = `
    CREATE OR REPLACE FUNCTION public.update_company_fields(
      company_id uuid,
      emp_quota integer,
      company_plan text,
      company_status text
    ) RETURNS void AS $$
    BEGIN
      UPDATE public.companies
      SET 
        employees_quota = emp_quota,
        plan = company_plan,
        status = company_status
      WHERE id = company_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `

    const { error: error1 } = await supabase.rpc('exec_sql', { sql: updateCompanyFunction })
    if (error1) {
        // Tentar via query direta
        console.log('Tentando criar update_company_fields via SQL direto...')
    }

    // 2. Função para inserir manager
    const insertManagerFunction = `
    CREATE OR REPLACE FUNCTION public.insert_manager(
      p_auth_user_id uuid,
      p_company_id uuid,
      p_full_name text,
      p_email text,
      p_phone text,
      p_status text
    ) RETURNS uuid AS $$
    DECLARE
      new_manager_id uuid;
    BEGIN
      INSERT INTO public.managers (
        auth_user_id,
        company_id,
        full_name,
        email,
        phone,
        status
      ) VALUES (
        p_auth_user_id,
        p_company_id,
        p_full_name,
        p_email,
        p_phone,
        p_status
      )
      RETURNING id INTO new_manager_id;
      
      RETURN new_manager_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `

    console.log('✅ Funções SQL prontas (execute manualmente no SQL Editor)')
    console.log('\n📋 SQL para copiar e executar no Supabase:\n')
    console.log('--- FUNÇÃO 1: UPDATE COMPANY ---')
    console.log(updateCompanyFunction)
    console.log('\n--- FUNÇÃO 2: INSERT MANAGER ---')
    console.log(insertManagerFunction)
    console.log('\n--- GRANTS ---')
    console.log(`
    GRANT EXECUTE ON FUNCTION public.update_company_fields(uuid, integer, text, text) TO anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION public.insert_manager(uuid, uuid, text, text, text, text) TO anon, authenticated, service_role;
  `)
}

async function testRegistration() {
    console.log('\n\n🧪 Testando fluxo de cadastro...\n')

    const testData = {
        company: {
            name: 'Empresa Teste',
            employees_quota: 10
        },
        manager: {
            full_name: 'Lucas Henrique',
            email: 'lucas.teste.' + Date.now() + '@zeeway.com.br', // Email único
            password: 'senha123',
            phone: '11999999999'
        }
    }

    console.log('📝 Dados de teste:', JSON.stringify(testData, null, 2))

    // Fazer request para API local
    try {
        const response = await fetch('http://localhost:3000/api/companies/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('\n✅ SUCESSO! Cadastro realizado:')
            console.log(JSON.stringify(result, null, 2))
        } else {
            console.log('\n❌ ERRO no cadastro:')
            console.log(JSON.stringify(result, null, 2))
        }
    } catch (error) {
        console.log('\n❌ Erro ao fazer request:', error.message)
        console.log('💡 Certifique-se que o servidor está rodando: npm run dev')
    }
}

async function main() {
    console.log('🚀 Iniciando testes de cadastro\n')
    console.log('='.repeat(60))

    await createSQLFunctions()

    console.log('\n' + '='.repeat(60))
    console.log('\n⚠️  AÇÃO NECESSÁRIA:')
    console.log('1. Copie o SQL acima')
    console.log('2. Execute no SQL Editor do Supabase')
    console.log('3. Pressione ENTER para continuar com o teste\n')

    // Aguardar input do usuário
    process.stdin.once('data', async () => {
        await testRegistration()
        process.exit(0)
    })
}

main()
