// Script para ativar empresa e gestores
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function activateAccount() {
    console.log('🔧 Ativação de Contas\n')

    // Buscar empresas inativas
    const { data: companies, error: compError } = await supabase
        .from('companies')
        .select('id, name, status')
        .eq('status', 'inactive')

    if (compError) {
        console.log('❌ Erro ao buscar empresas:', compError.message)
        return
    }

    if (!companies || companies.length === 0) {
        console.log('✅ Não há empresas inativas')
        return
    }

    console.log(`📋 Empresas Inativas: ${companies.length}\n`)

    companies.forEach((company, index) => {
        console.log(`${index + 1}. ${company.name} (${company.id})`)
    })

    console.log('\n' + '='.repeat(60))
    console.log('💡 Para ativar uma empresa, execute:')
    console.log('node scripts/activate-company.js <numero>')
    console.log('\nExemplo: node scripts/activate-company.js 1')
    console.log('='.repeat(60))
}

async function activateCompanyById(companyIndex) {
    const index = parseInt(companyIndex) - 1

    // Buscar empresas inativas
    const { data: companies } = await supabase
        .from('companies')
        .select('id, name, status')
        .eq('status', 'inactive')

    if (!companies || !companies[index]) {
        console.log('❌ Empresa não encontrada')
        return
    }

    const company = companies[index]
    console.log(`\n🔄 Ativando: ${company.name}...\n`)

    // Ativar empresa
    const { error: compError } = await supabase
        .from('companies')
        .update({ status: 'active' })
        .eq('id', company.id)

    if (compError) {
        console.log('❌ Erro ao ativar empresa:', compError.message)
        return
    }

    console.log('✅ Empresa ativada!')

    // Ativar gestores
    const { data: managers, error: manError } = await supabase
        .from('managers')
        .select('email, full_name, name')
        .eq('company_id', company.id)

    if (managers && managers.length > 0) {
        const { error: updateError } = await supabase
            .from('managers')
            .update({ status: 'active' })
            .eq('company_id', company.id)

        if (updateError) {
            console.log('⚠️  Erro ao ativar gestores:', updateError.message)
        } else {
            console.log(`✅ ${managers.length} gestor(es) ativado(s):`)
            managers.forEach(m => {
                console.log(`   - ${m.full_name || m.name} (${m.email})`)
            })
        }
    }

    console.log('\n🎉 CONTA ATIVADA COM SUCESSO!')
    console.log('🔓 O gestor já pode fazer login em: http://localhost:3000/login')
}

// Verificar argumentos
const args = process.argv.slice(2)

if (args.length === 0) {
    activateAccount()
} else {
    activateCompanyById(args[0])
}
