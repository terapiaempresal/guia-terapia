import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { employeeId } = await request.json()

        if (!employeeId) {
            return NextResponse.json({
                success: false,
                error: 'employeeId é obrigatório'
            }, { status: 400 })
        }

        // Buscar o funcionário e suas respostas
        const { data: employee, error: fetchError } = await supabase
            .from('employees')
            .select('id, name, email, respostas_mapa_jornada, journey_result_html')
            .eq('id', employeeId)
            .single()

        if (fetchError || !employee) {
            console.error('❌ Erro ao buscar funcionário:', fetchError)
            return NextResponse.json({
                success: false,
                error: 'Funcionário não encontrado'
            }, { status: 404 })
        }

        if (!employee.respostas_mapa_jornada) {
            return NextResponse.json({
                success: false,
                error: 'Funcionário não possui respostas salvas para regenerar o mapa'
            }, { status: 400 })
        }

        console.log('🔄 Regenerando mapa para:', employee.name)

        // Aqui você faria a chamada para o serviço que gera o HTML
        // Por enquanto, vou preparar a estrutura para você integrar depois

        // OPÇÃO 1: Chamar webhook externo que gera o HTML
        // const webhookUrl = 'https://webhook.terapiaempresarial.com.br/generate-map'
        // const response = await fetch(webhookUrl, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(employee.respostas_mapa_jornada)
        // })
        // const { html } = await response.json()

        // OPÇÃO 2: Retornar as respostas para o webhook externo processar
        return NextResponse.json({
            success: true,
            message: 'Respostas prontas para regeneração',
            employee: {
                id: employee.id,
                name: employee.name,
                email: employee.email
            },
            respostas: employee.respostas_mapa_jornada,
            instructions: 'Envie estas respostas para o serviço de geração de HTML'
        })

    } catch (error) {
        console.error('❌ Erro ao regenerar mapa:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro ao processar regeneração do mapa',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 })
    }
}
