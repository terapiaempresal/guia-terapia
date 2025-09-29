// Verificar se as colunas de ownership foram adicionadas ao banco
const checkVideoSchemaColumns = async () => {
    try {
        console.log('🔍 Verificando se as colunas de ownership existem...')

        // Fazer uma consulta que tenta usar as colunas novas
        const response = await fetch('/api/videos/management')
        const data = await response.json()

        if (data.success && data.videos?.length > 0) {
            const firstVideo = data.videos[0]
            console.log('📋 Colunas disponíveis:', Object.keys(firstVideo))

            const requiredColumns = [
                'created_by_type',
                'created_by_id',
                'manager_id',
                'company_id',
                'display_order'
            ]

            const hasAllColumns = requiredColumns.every(col => col in firstVideo)

            if (hasAllColumns) {
                console.log('✅ Todas as colunas de ownership estão presentes!')
                console.log('🔧 A API pode ser atualizada para usar as colunas completas.')
                return true
            } else {
                const missingColumns = requiredColumns.filter(col => !(col in firstVideo))
                console.log('❌ Colunas faltando:', missingColumns)
                console.log('📝 Execute o SQL no Supabase Dashboard primeiro:')
                console.log(`
                    ALTER TABLE public.videos 
                    ADD COLUMN IF NOT EXISTS created_by_type VARCHAR DEFAULT 'system',
                    ADD COLUMN IF NOT EXISTS created_by_id UUID,
                    ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.managers(id),
                    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
                    ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
                `)
                return false
            }
        } else {
            console.log('⚠️ Nenhum vídeo encontrado para verificar schema')
            return false
        }

    } catch (error) {
        console.error('❌ Erro ao verificar schema:', error)
        return false
    }
}

// Execute a verificação
checkVideoSchemaColumns().then(hasColumns => {
    if (hasColumns) {
        console.log('🎯 Pronto para ativar funcionalidade completa de ownership!')
    } else {
        console.log('🔧 Execute o SQL primeiro, depois execute este script novamente.')
    }
})