// Verificar estrutura real das tabelas
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTables() {
    console.log('🔍 Verificando estrutura das tabelas\n')

    // Ver todas as tabelas
    const { data: tables, error } = await supabase
        .from('companies')
        .select('*')
        .limit(1)

    if (tables && tables[0]) {
        console.log('📊 ESTRUTURA DA TABELA COMPANIES:')
        console.log('Colunas disponíveis:', Object.keys(tables[0]))
        console.log('\nDados de exemplo:', tables[0])
    }

    const { data: managers } = await supabase
        .from('managers')
        .select('*')
        .limit(1)

    if (managers && managers[0]) {
        console.log('\n📊 ESTRUTURA DA TABELA MANAGERS:')
        console.log('Colunas disponíveis:', Object.keys(managers[0]))
        console.log('\nDados de exemplo:', managers[0])
    }

    const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .limit(1)

    if (employees && employees[0]) {
        console.log('\n📊 ESTRUTURA DA TABELA EMPLOYEES:')
        console.log('Colunas disponíveis:', Object.keys(employees[0]))
    }
}

checkTables()
