const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cnqxzyfimjnxvkjpiqfl.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucXh6eWZpbWpueHZranBpcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMjczODQsImV4cCI6MjA1MDkwMzM4NH0.LJ5rXYJcOAhgGa7gKHKNWdN8WrZwN5YDqRZSGcGMXrU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addAdminColumn() {
    console.log('🚀 Adicionando coluna is_admin na tabela managers...\n')

    try {
        // Verificar se a coluna já existe
        console.log('1️⃣ Verificando se a coluna já existe...')
        const { data: testData, error: testError } = await supabase
            .from('managers')
            .select('is_admin')
            .limit(1)

        if (!testError) {
            console.log('✅ Coluna is_admin já existe!\n')
        } else if (testError.message.includes('is_admin')) {
            console.log('⚠️  Coluna is_admin não existe, mas não posso criar via API.')
            console.log('\n📋 Execute este SQL manualmente no Supabase SQL Editor:\n')
            console.log('----------------------------------------')
            console.log(`
-- 1. Adicionar coluna
ALTER TABLE public.managers 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Tornar alguns gestores admin (por email)
UPDATE public.managers 
SET is_admin = true 
WHERE email IN (
  'lucas.henrique@zeeway.com.br',
  'rodrigofnaves@gmail.com',
  'lucashlc.contato@gmail.com'
);

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_managers_is_admin ON public.managers(is_admin);
            `)
            console.log('----------------------------------------\n')
            console.log('💡 Depois de executar, rode este script novamente.\n')
            process.exit(0)
        } else {
            console.log('❌ Erro ao verificar coluna:', testError.message)
            process.exit(1)
        }

        // Atualizar gestores para serem admin
        console.log('2️⃣ Atualizando gestores como admin...')
        const adminEmails = [
            'lucas.henrique@zeeway.com.br',
            'rodrigofnaves@gmail.com',
            'lucashlc.contato@gmail.com'
        ]

        for (const email of adminEmails) {
            const { data, error } = await supabase
                .from('managers')
                .update({ is_admin: true })
                .eq('email', email)
                .select()

            if (error) {
                console.log(`  ❌ Erro ao atualizar ${email}:`, error.message)
            } else if (data && data.length > 0) {
                console.log(`  ✅ ${email} agora é admin`)
            } else {
                console.log(`  ⚠️  ${email} não encontrado no banco`)
            }
        }

        // Verificar resultado
        console.log('\n3️⃣ Verificando resultado...')
        const { data: admins, error: adminsError } = await supabase
            .from('managers')
            .select('email, full_name, is_admin, status')
            .eq('is_admin', true)

        if (adminsError) {
            console.log('❌ Erro ao buscar admins:', adminsError.message)
        } else {
            console.log('\n📊 Administradores ativos:')
            console.log('----------------------------------------')
            admins.forEach(admin => {
                console.log(`✅ ${admin.full_name || admin.email}`)
                console.log(`   Email: ${admin.email}`)
                console.log(`   Status: ${admin.status}`)
                console.log(`   Is Admin: ${admin.is_admin}`)
                console.log('')
            })
        }

        console.log('✅ Processo concluído com sucesso!\n')

    } catch (error) {
        console.error('❌ Erro:', error)
        process.exit(1)
    }
}

addAdminColumn()
