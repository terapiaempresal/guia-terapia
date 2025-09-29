// Script para diagnosticar e corrigir problema de constraint no banco
const diagnoseVideoConstraint = async () => {
    try {
        console.log('🔍 Diagnosticando problema de constraint...')

        // 1. Verificar estrutura atual dos vídeos
        console.log('📡 Buscando vídeos existentes para ver os valores aceitos...')
        const response = await fetch('/api/videos/management')
        const data = await response.json()

        if (data.success && data.videos?.length > 0) {
            console.log(`📺 ${data.videos.length} vídeos encontrados`)

            // Analisar valores únicos de created_by_type
            const types = [...new Set(data.videos.map(v => v.created_by_type))]
            console.log('📋 Valores atuais de created_by_type:', types)

            // Verificar se existe algum vídeo com created_by_type = 'manager'
            const managerVideos = data.videos.filter(v => v.created_by_type === 'manager')
            console.log(`🏢 Vídeos com created_by_type = 'manager': ${managerVideos.length}`)

            if (managerVideos.length === 0) {
                console.log('❌ PROBLEMA: Nenhum vídeo tem created_by_type = "manager"')
                console.log('🔧 Isso indica que a constraint no banco não permite este valor')
                console.log('📝 Execute este SQL no Supabase para corrigir:')
                console.log(`
                    -- Remover constraint antiga se existir
                    ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS check_created_by_type;
                    
                    -- Adicionar constraint correta
                    ALTER TABLE public.videos 
                    ADD CONSTRAINT check_created_by_type 
                    CHECK (created_by_type IN ('system', 'manager'));
                    
                    -- Verificar se funcionou
                    SELECT constraint_name, check_clause 
                    FROM information_schema.check_constraints 
                    WHERE constraint_name = 'check_created_by_type';
                `)
            } else {
                console.log('✅ Constraint parece estar funcionando')
            }

        } else {
            console.log('❌ Erro ao buscar vídeos:', data.error)
        }

        // 2. Tentar criar um vídeo de teste simples
        console.log('🧪 Testando criação com dados mínimos...')
        const testData = {
            title: 'Teste Constraint - ' + Date.now(),
            description: 'Teste',
            video_url: 'https://www.youtube.com/watch?v=test',
            type: 'youtube',
            manager_id: localStorage.getItem('userId'),
            company_id: JSON.parse(localStorage.getItem('company') || '{}').id
        }

        console.log('📤 Dados do teste:', testData)

        const testResponse = await fetch('/api/videos/management', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        })

        const testResult = await testResponse.json()

        if (testResult.success) {
            console.log('✅ Teste bem-sucedido! Constraint foi corrigida.')
        } else {
            console.log('❌ Teste falhou:', testResult.error)
            if (testResult.error?.includes('check_created_by_type')) {
                console.log('🔧 Execute o SQL acima no Supabase Dashboard')
            }
        }

    } catch (error) {
        console.error('❌ Erro no diagnóstico:', error)
    }
}

// Execute o diagnóstico
diagnoseVideoConstraint()