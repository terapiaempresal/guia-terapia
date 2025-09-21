import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { cpf, html_result, webhook_key } = body

        // Validação básica de segurança
        const expectedKey = process.env.JOURNEY_WEBHOOK_KEY || 'terapia_webhook_2024'
        if (webhook_key !== expectedKey) {
            return NextResponse.json({
                error: 'Chave de webhook inválida'
            }, { status: 401 })
        }

        if (!cpf) {
            return NextResponse.json({
                error: 'CPF é obrigatório'
            }, { status: 400 })
        }

        if (!html_result) {
            return NextResponse.json({
                error: 'html_result é obrigatório'
            }, { status: 400 })
        }

        // Limpar o CPF (remover pontos e traços)
        const cleanCPF = cpf.replace(/\D/g, '')

        // Buscar funcionário pelo CPF
        const { data: employee, error: findError } = await supabase
            .from('employees')
            .select('id, name, cpf')
            .eq('cpf', cleanCPF)
            .single()

        if (findError || !employee) {
            console.error('Erro ao buscar funcionário:', findError)
            return NextResponse.json({
                error: 'Funcionário não encontrado com este CPF',
                cpf_searched: cleanCPF
            }, { status: 404 })
        }

        // Atualizar dados do funcionário
        const { error: updateError } = await supabase
            .from('employees')
            .update({
                journey_filled: true,
                journey_filled_at: new Date().toISOString(),
                journey_result_html: html_result
            })
            .eq('id', employee.id)

        if (updateError) {
            console.error('Erro ao atualizar funcionário:', updateError)
            return NextResponse.json({
                error: 'Erro ao atualizar dados do funcionário',
                details: updateError.message
            }, { status: 500 })
        }

        console.log(`✅ Mapa de jornada atualizado para funcionário ${employee.name} (CPF: ${cleanCPF})`)

        return NextResponse.json({
            success: true,
            message: 'Mapa de jornada atualizado com sucesso',
            employee: {
                id: employee.id,
                name: employee.name,
                cpf: employee.cpf
            },
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Erro no webhook:', error)
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}