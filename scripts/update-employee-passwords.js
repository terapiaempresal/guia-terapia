#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function updateEmployeePasswords() {
    console.log('🔑 Atualizando senhas dos funcionários...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Variáveis de ambiente não encontradas!')
        process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        // Buscar funcionários sem senha que têm data de nascimento
        console.log('🔍 Buscando funcionários sem senha...')

        const { data: employees, error: fetchError } = await supabase
            .from('employees')
            .select('id, full_name, name, birth_date, password')
            .is('password', null)
            .not('birth_date', 'is', null)

        if (fetchError) {
            console.error('❌ Erro ao buscar funcionários:', fetchError)
            return
        }

        if (!employees || employees.length === 0) {
            console.log('✅ Nenhum funcionário sem senha encontrado!')
            return
        }

        console.log(`📊 Encontrados ${employees.length} funcionários sem senha:`)

        // Atualizar cada funcionário
        for (const emp of employees) {
            try {
                // Gerar senha baseada na data de nascimento (DDMMAAAA)
                const date = new Date(emp.birth_date)
                const day = String(date.getDate()).padStart(2, '0')
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const year = String(date.getFullYear())
                const password = `${day}${month}${year}`

                console.log(`🔑 ${emp.full_name || emp.name}: ${password}`)

                // Atualizar no banco
                const { error: updateError } = await supabase
                    .from('employees')
                    .update({ password })
                    .eq('id', emp.id)

                if (updateError) {
                    console.error(`❌ Erro ao atualizar ${emp.full_name || emp.name}:`, updateError)
                } else {
                    console.log(`✅ ${emp.full_name || emp.name} - senha atualizada`)
                }

            } catch (error) {
                console.error(`❌ Erro ao processar ${emp.full_name || emp.name}:`, error)
            }
        }

        console.log('\n🎉 Atualização de senhas concluída!')

    } catch (error) {
        console.error('❌ Erro:', error)
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    updateEmployeePasswords()
        .then(() => {
            console.log('\n🏁 Script finalizado!')
            process.exit(0)
        })
        .catch((error) => {
            console.error('💥 Erro fatal:', error)
            process.exit(1)
        })
}

module.exports = { updateEmployeePasswords }