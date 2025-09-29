// Script para testar o webhook do mapa de jornada
// Simula o envio de resultado da plataforma externa

const testWebhook = async () => {
    try {
        // Pegar ID do funcionário logado
        const employeeData = localStorage.getItem('employee')
        if (!employeeData) {
            console.log('❌ Funcionário não encontrado no localStorage')
            return
        }

        const employee = JSON.parse(employeeData)
        console.log('🧪 Testando webhook para funcionário:', employee.name)

        const resultado = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #2563eb;">Seu Perfil Comportamental</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #059669;">🎯 Perfil Principal: Líder Colaborativo</h3>
                <p>Você demonstra forte capacidade de trabalhar em equipe e liderar através da colaboração.</p>
            </div>
            
            <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #059669;">✅ Pontos Fortes</h4>
                <ul>
                    <li>Excelente comunicação interpessoal</li>
                    <li>Capacidade de trabalhar em equipe</li>
                    <li>Flexibilidade e adaptabilidade</li>
                    <li>Pensamento estratégico</li>
                </ul>
            </div>
            
            <div style="background: #fefce8; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #d97706;">⚡ Áreas de Desenvolvimento</h4>
                <ul>
                    <li>Tomada de decisão sob pressão</li>
                    <li>Gestão de conflitos</li>
                    <li>Delegação efetiva</li>
                </ul>
            </div>
            
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #2563eb;">💡 Recomendações</h4>
                <ol>
                    <li>Pratique técnicas de respiração para momentos de pressão</li>
                    <li>Estude métodos de mediação e resolução de conflitos</li>
                    <li>Desenvolva um sistema de delegação estruturado</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
                <p style="color: #6b7280; font-size: 14px;">
                    Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} por Terapia Empresarial
                </p>
            </div>
        </div>
        `

        const response = await fetch('/api/webhooks/journey-map', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cpf: employee.cpf || '01932999680', // Usar CPF do funcionário ou um padrão (apenas números)
                html_result: resultado,
                webhook_key: 'terapia_webhook_2024'
            })
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Webhook executado com sucesso:', result)
            console.log('🔄 Recarregue a página do mapa para ver o resultado!')
        } else {
            console.log('❌ Erro no webhook:', result)
        }

    } catch (error) {
        console.error('❌ Erro:', error)
    }
}

testWebhook()