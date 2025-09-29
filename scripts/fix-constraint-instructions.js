// Instruções para corrigir definitivamente a constraint do banco
console.log(`
🔧 PARA CORRIGIR DEFINITIVAMENTE A CONSTRAINT:
==============================================

📝 Execute este SQL no Supabase Dashboard → SQL Editor:

-- 1. Remover constraint antiga que só aceita 'system'
ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS check_created_by_type;

-- 2. Adicionar constraint correta que aceita 'system' e 'manager'
ALTER TABLE public.videos 
ADD CONSTRAINT check_created_by_type 
CHECK (created_by_type IN ('system', 'manager'));

-- 3. Verificar se funcionou
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'check_created_by_type';

-- 4. Atualizar vídeos da empresa que estão marcados incorretamente
UPDATE public.videos 
SET created_by_type = 'manager' 
WHERE category = 'company' AND manager_id IS NOT NULL;

==============================================

🎯 APÓS EXECUTAR O SQL:

1. Teste criação de vídeo no painel
2. Verifique se aparece como "Sua Empresa"
3. Confirme que botões de editar/deletar funcionam
4. Teste reordenação de vídeos

⚠️  ENQUANTO NÃO EXECUTAR O SQL:
O sistema funciona com workaround usando category='company'
`)

// Função para testar após correção
const testAfterFix = async () => {
    console.log('🧪 Testando após correção da constraint...')

    const testVideo = {
        title: 'Teste Pós-Correção',
        description: 'Teste com created_by_type = manager',
        youtube_url: 'https://www.youtube.com/watch?v=test',
        type: 'youtube',
        manager_id: localStorage.getItem('userId'),
        company_id: JSON.parse(localStorage.getItem('company')).id
    }

    const response = await fetch('/api/videos/management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testVideo)
    })

    const result = await response.json()

    if (result.success && result.video.created_by_type === 'manager') {
        console.log('✅ CONSTRAINT CORRIGIDA! created_by_type = manager funcionando')
    } else {
        console.log('❌ Constraint ainda não foi corrigida:', result.error)
    }
}

console.log('💡 Execute testAfterFix() após aplicar o SQL para verificar se funcionou')
window.testAfterFix = testAfterFix