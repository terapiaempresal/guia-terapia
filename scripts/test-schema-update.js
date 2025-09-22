const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testNewColumns() {
    try {
        console.log('🧪 Testando se as novas colunas foram criadas...')

        // Tentar fazer um INSERT com as novas colunas
        const testVideo = {
            title: 'TESTE - Video para verificar colunas',
            description: 'Video de teste',
            video_url: 'https://www.youtube.com/watch?v=test',
            category: 'test',
            is_public: true,
            created_by_type: 'system',
            created_by_id: null,
            company_id: null,
            display_order: 999
        }

        const { data, error } = await supabase
            .from('videos')
            .insert([testVideo])
            .select()

        if (error) {
            console.log('❌ Erro ao inserir vídeo de teste:', error.message)
            console.log('\n📋 Execute um dos scripts SQL:')
            console.log('- videos-schema-fixed.sql (versão com CTE)')
            console.log('- videos-schema-simple.sql (versão simples)')
        } else {
            console.log('✅ Colunas criadas com sucesso!')
            console.log('📊 Vídeo de teste inserido:', data[0])

            // Remover vídeo de teste
            await supabase.from('videos').delete().eq('title', 'TESTE - Video para verificar colunas')
            console.log('🧹 Vídeo de teste removido')

            // Verificar vídeos existentes
            const { data: videos } = await supabase
                .from('videos')
                .select('id, title, created_by_type, display_order')
                .limit(5)

            console.log('\n📋 Primeiros 5 vídeos:')
            videos?.forEach(v => {
                console.log(`- ${v.title} (${v.created_by_type || 'NULL'}) - ordem: ${v.display_order || 0}`)
            })
        }

    } catch (err) {
        console.error('💥 Erro geral:', err)
    }
}

testNewColumns()