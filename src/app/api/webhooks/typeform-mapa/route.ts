import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        console.log('📥 [Webhook Typeform] Recebendo dados...')

        const data = await request.json()
        console.log('📊 [Webhook Typeform] Dados recebidos')

        // O Typeform pode enviar um array ou objeto direto
        const webhookData = Array.isArray(data) ? data[0] : data
        const body = webhookData.body || webhookData

        // Extrair informações importantes
        const email = body.email?.toLowerCase().trim()
        const cpf = body.CPF?.replace(/\D/g, '') // Remove caracteres não numéricos
        const nome = body.nome
        const submittedAt = body.submittedAt

        console.log('👤 [Webhook Typeform] Identificação:', { email, cpf, nome })

        if (!email && !cpf) {
            console.error('❌ [Webhook Typeform] Email e CPF não fornecidos')
            return NextResponse.json({
                success: false,
                error: 'Email ou CPF são obrigatórios para identificar o funcionário'
            }, { status: 400 })
        }

        // Buscar o funcionário no banco por email ou CPF
        let query = supabase.from('employees').select('*')

        if (email) {
            query = query.eq('email', email)
        } else if (cpf) {
            query = query.eq('cpf', cpf)
        }

        const { data: employees, error: searchError } = await query

        if (searchError) {
            console.error('❌ [Webhook Typeform] Erro ao buscar funcionário:', searchError)
            throw searchError
        }

        if (!employees || employees.length === 0) {
            console.error('❌ [Webhook Typeform] Funcionário não encontrado:', { email, cpf })
            return NextResponse.json({
                success: false,
                error: 'Funcionário não encontrado no sistema',
                email,
                cpf
            }, { status: 404 })
        }

        const employee = employees[0]
        console.log('✅ [Webhook Typeform] Funcionário encontrado:', employee.id, employee.name)

        // Salvar o JSON completo das respostas
        const { error: updateError } = await supabase
            .from('employees')
            .update({
                respostas_mapa_jornada: body,
                journey_filled: true,
                journey_filled_at: submittedAt || new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', employee.id)

        if (updateError) {
            console.error('❌ [Webhook Typeform] Erro ao salvar respostas:', updateError)
            throw updateError
        }

        console.log('✅ [Webhook Typeform] Respostas salvas com sucesso!')

        // Retornar o JSON de volta para o webhook (conforme solicitado)
        return NextResponse.json({
            success: true,
            message: 'Respostas do mapa de jornada salvas com sucesso',
            employee_id: employee.id,
            employee_name: employee.name,
            saved_at: new Date().toISOString(),
            data: body // Retorna o JSON de volta
        }, { status: 200 })

    } catch (error) {
        console.error('❌ [Webhook Typeform] Erro geral:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro ao processar webhook',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 })
    }
}

// Permitir GET para teste
export async function GET() {
    return NextResponse.json({
        message: 'Webhook do Typeform - Mapa de Jornada',
        endpoint: '/api/webhooks/typeform-mapa',
        method: 'POST',
        description: 'Recebe respostas do Typeform e salva na tabela employees',
        required_fields: ['email ou CPF'],
        example: {
            email: 'funcionario@exemplo.com',
            CPF: '12345678900',
            nome: 'Nome do Funcionário',
            submittedAt: '2025-11-10T16:50:55.749Z',
            '1': 'Paciente',
            '2': 'Leal',
            // ... outras respostas
        }
    })
}
