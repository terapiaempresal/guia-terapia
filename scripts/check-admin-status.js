const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://cnqxzyfimjnxvkjpiqfl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucXh6eWZpbWpueHZranBpcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMjczODQsImV4cCI6MjA1MDkwMzM4NH0.LJ5rXYJcOAhgGa7gKHKNWdN8WrZwN5YDqRZSGcGMXrU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdminStatus() {
    console.log('🔍 Verificando status de admin...\n')

    try {
        // Tentar buscar a coluna is_admin
        const { data: managers, error } = await supabase
            .from('managers')
            .select('email, full_name, is_admin, status')
            .limit(10)

        if (error) {
            console.log('❌ Erro ao buscar managers:', error.message)

            if (error.message.includes('is_admin') || error.code === '42703') {
                console.log('\n⚠️  A coluna is_admin NÃO EXISTE no banco!')
                console.log('\n📝 Você precisa executar este SQL no Supabase:\n')
                console.log('ALTER TABLE public.managers ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;')
                console.log('UPDATE public.managers SET is_admin = true WHERE email = \'lucas.henrique@zeeway.com.br\';')
                console.log('\n')
            }
            process.exit(1)
        }

        console.log('✅ Coluna is_admin existe!\n')
        console.log('📊 Managers encontrados:')
        console.log('─'.repeat(80))

        managers.forEach(m => {
            const adminBadge = m.is_admin ? '👑 ADMIN' : '👤 Normal'
            console.log(`${adminBadge} | ${m.email}`)
            console.log(`   Nome: ${m.full_name || 'N/A'}`)
            console.log(`   Status: ${m.status || 'N/A'}`)
            console.log(`   is_admin: ${m.is_admin}`)
            console.log('─'.repeat(80))
        })

        // Contar admins
        const adminCount = managers.filter(m => m.is_admin).length
        console.log(`\n📈 Total: ${managers.length} managers | ${adminCount} admins\n`)

        if (adminCount === 0) {
            console.log('⚠️  NENHUM ADMIN ENCONTRADO!')
            console.log('Execute este SQL para tornar alguém admin:')
            console.log('UPDATE public.managers SET is_admin = true WHERE email = \'lucas.henrique@zeeway.com.br\';\n')
        }

    } catch (err) {
        console.error('❌ Erro:', err)
        process.exit(1)
    }
}

checkAdminStatus()
