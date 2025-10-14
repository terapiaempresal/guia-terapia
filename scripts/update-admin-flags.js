const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://cnqxzyfimjnxvkjpiqfl.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucXh6eWZpbWpueHZranBpcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTMyNzM4NCwiZXhwIjoyMDUwOTAzMzg0fQ.TbXAs_TLJSz5rj1Nca_U7L-C5WvS6WlnuNj_qXTPHI4'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateAdminFlags() {
    console.log('🚀 Atualizando flags de admin...\n')

    const adminEmails = [
        'lucashlc.contato@gmail.com'
    ]

    try {
        for (const email of adminEmails) {
            console.log(`🔄 Atualizando ${email}...`)

            const { data, error } = await supabase
                .from('managers')
                .update({ is_admin: true })
                .eq('email', email)
                .select('email, full_name, is_admin')

            if (error) {
                console.log(`  ❌ Erro: ${error.message}`)
                if (error.code === '42703') {
                    console.log(`  🔴 COLUNA is_admin NÃO EXISTE!`)
                    console.log(`  📝 Execute no Supabase SQL Editor:`)
                    console.log(`     ALTER TABLE public.managers ADD COLUMN is_admin boolean DEFAULT false;`)
                }
            } else if (data && data.length > 0) {
                console.log(`  ✅ ${data[0].full_name || email} agora é admin`)
            } else {
                console.log(`  ⚠️  Email não encontrado no banco`)
            }
        }

        console.log('\n📊 Verificando admins atuais...')
        const { data: admins, error: adminsError } = await supabase
            .from('managers')
            .select('email, full_name, is_admin, status')
            .eq('is_admin', true)

        if (adminsError) {
            console.log('❌ Erro ao buscar admins:', adminsError.message)
        } else if (admins && admins.length > 0) {
            console.log('\n👑 Administradores:')
            admins.forEach(admin => {
                console.log(`  ✅ ${admin.full_name || admin.email} (${admin.email})`)
            })
        } else {
            console.log('⚠️  Nenhum admin encontrado')
        }

        console.log('\n✅ Processo concluído!\n')

    } catch (error) {
        console.error('❌ Erro:', error)
        process.exit(1)
    }
}

updateAdminFlags()
