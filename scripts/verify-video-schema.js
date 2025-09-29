// Script para verificar se o schema foi atualizado
// Execute no Console do navegador

const checkVideoSchema = async () => {
    try {
        console.log('🔍 Verificando se o schema da tabela videos foi atualizado...')

        const response = await fetch('/api/videos/management')
        if (response.ok) {
            const data = await response.json()
            if (data.success && data.videos?.length > 0) {
                const firstVideo = data.videos[0]
                console.log('📋 Colunas atuais da tabela videos:', Object.keys(firstVideo))

                const requiredColumns = [
                    'created_by_type',
                    'created_by_id',
                    'manager_id',
                    'company_id',
                    'display_order'
                ]

                const missingColumns = requiredColumns.filter(col => !(col in firstVideo))

                if (missingColumns.length === 0) {
                    console.log('✅ Schema atualizado! Todas as colunas necessárias estão presentes.')
                    console.log('🔄 Agora você pode testar o upload de vídeos normalmente.')
                } else {
                    console.log('❌ Schema ainda não foi atualizado. Colunas faltando:', missingColumns)
                    console.log('📝 Execute o SQL no Supabase Dashboard primeiro.')
                }
            } else {
                console.log('⚠️ Nenhum vídeo encontrado para verificar o schema')
            }
        } else {
            console.log('❌ Erro ao buscar vídeos:', response.status)
        }
    } catch (error) {
        console.error('❌ Erro na verificação:', error)
    }
}

checkVideoSchema()