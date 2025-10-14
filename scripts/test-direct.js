// Teste direto via SQL - Bypass completo do PostgREST
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

async function testWithFunctions() {
    console.log('🧪 Testando cadastro com funções SQL\n')

    // 1. Criar usuário auth
    const email = 'lucas.test.' + Date.now() + '@zeeway.com.br'
    const password = 'senha123456'

    console.log('1️⃣ Criando usuário auth...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: 'Lucas Henrique Test',
                role: 'manager'
            }
        }
    })

    if (authError || !authData.user) {
        console.log('❌ Erro ao criar auth:', authError)
        return
    }
    console.log('✅ Auth criado:', authData.user.id)

    // 2. Criar empresa (só name)
    console.log('\n2️⃣ Criando empresa...')
    const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({ name: 'Empresa Test ' + Date.now() })
        .select()
        .single()

    if (companyError || !companyData) {
        console.log('❌ Erro ao criar empresa:', companyError)
        return
    }
    console.log('✅ Empresa criada:', companyData.id)

    // 3. Atualizar campos via função SQL
    console.log('\n3️⃣ Atualizando campos da empresa via SQL...')
    const { error: updateError } = await supabase.rpc('update_company_fields', {
        company_id: companyData.id,
        emp_quota: 10,
        company_plan: 'equipe',
        company_status: 'inactive'
    })

    if (updateError) {
        console.log('⚠️  Erro ao atualizar empresa:', updateError.message)
        console.log('💡 A função update_company_fields precisa ser criada no SQL Editor!')
    } else {
        console.log('✅ Campos atualizados')
    }

    // 4. Criar manager via função SQL
    console.log('\n4️⃣ Criando manager via SQL...')
    const { data: managerId, error: managerError } = await supabase.rpc('insert_manager', {
        p_auth_user_id: authData.user.id,
        p_company_id: companyData.id,
        p_full_name: 'Lucas Henrique Test',
        p_email: email,
        p_phone: '11999999999',
        p_status: 'inactive'
    })

    if (managerError) {
        console.log('⚠️  Erro ao criar manager:', managerError.message)
        console.log('💡 A função insert_manager precisa ser criada no SQL Editor!')
    } else {
        console.log('✅ Manager criado:', managerId)
    }

    // 5. Verificar resultado final
    console.log('\n5️⃣ Verificando dados finais...')

    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyData.id)
        .single()

    console.log('\n📊 Empresa final:', company)

    if (!updateError && !managerError) {
        console.log('\n🎉 SUCESSO COMPLETO! Tudo funcionando!')
    } else {
        console.log('\n⚠️  PARCIALMENTE FUNCIONAL - Execute os SQLs das funções!')
    }
}

testWithFunctions()
