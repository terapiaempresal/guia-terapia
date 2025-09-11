require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLogin() {
    const { data, error } = await supabase
        .from('managers')
        .select('email, password')
        .eq('email', 'lucashlc.contato@gmail.com')
        .single();

    if (error) {
        console.log('❌ Erro:', error.message);
        return;
    }

    console.log('👤 Email:', data.email);
    console.log('🔐 Password exists:', !!data.password);
    console.log('🔐 Password length:', data.password ? data.password.length : 0);
    console.log('🔐 Password preview:', data.password ? data.password.substring(0, 20) + '...' : 'N/A');

    if (!data.password) {
        console.log('⚠️  Senha não definida no banco!');
        return;
    }

    console.log('🧪 Testando senha: Lucas@sites123');

    try {
        const isValid = await bcrypt.compare('Lucas@sites123', data.password);
        console.log('🔐 Resultado:', isValid ? '✅ SENHA VÁLIDA!' : '❌ Senha inválida');

        if (!isValid) {
            console.log('🔍 Vamos testar se é um hash bcrypt válido...');
            console.log('🔍 Hash completo:', data.password);

            // Verificar se começa com $2a$, $2b$ ou $2y$ (padrões bcrypt)
            const isBcryptHash = /^\$2[aby]\$/.test(data.password);
            console.log('🔍 É um hash bcrypt válido?', isBcryptHash);
        }
    } catch (err) {
        console.log('❌ Erro ao comparar senha:', err.message);
    }
}

testLogin();
