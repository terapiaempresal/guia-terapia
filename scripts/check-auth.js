// Teste de autenticação - Verificar sessão atual
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

async function checkAuth() {
    console.log('🔍 Verificando autenticação...\n')

    // Verificar sessão
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
        console.log('❌ Erro ao verificar sessão:', error.message)
        return
    }

    if (!session) {
        console.log('❌ Nenhuma sessão ativa encontrada')
        console.log('\n💡 Para acessar o painel admin, você precisa:')
        console.log('1. Fazer login em http://localhost:3000/login')
        console.log('2. Usar um dos emails de admin:')
        console.log('   - lucas.henrique@zeeway.com.br')
        console.log('   - rodrigofnaves@gmail.com')
        return
    }

    console.log('✅ Sessão ativa encontrada!')
    console.log('👤 Usuário:', session.user.email)
    console.log('🔑 ID:', session.user.id)
    console.log('⏰ Expira em:', new Date(session.expires_at * 1000).toLocaleString('pt-BR'))

    // Verificar se é admin
    const adminEmails = [
        'lucas.henrique@zeeway.com.br',
        'rodrigofnaves@gmail.com',
    ]

    if (adminEmails.includes(session.user.email || '')) {
        console.log('\n✅ VOCÊ É UM ADMINISTRADOR!')
        console.log('🎯 Pode acessar: http://localhost:3000/admin')
    } else {
        console.log('\n⚠️  Você NÃO é um administrador')
        console.log('📧 Seu email:', session.user.email)
        console.log('📋 Emails autorizados:')
        adminEmails.forEach(email => console.log(`   - ${email}`))
    }
}

checkAuth()
