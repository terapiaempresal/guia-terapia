import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { cpf } = body

        if (!cpf) {
            return NextResponse.json(
                { error: 'CPF é obrigatório' },
                { status: 400 }
            )
        }

        // Buscar funcionário pelo CPF
        const { data: employee, error: fetchError } = await supabase
            .from('employees')
            .select(`
                id,
                full_name,
                email,
                cpf,
                company_id,
                companies (
                    name,
                    manager_email
                )
            `)
            .eq('cpf', cpf.replace(/\D/g, ''))
            .single()

        if (fetchError || !employee) {
            return NextResponse.json(
                { error: 'CPF não encontrado no sistema' },
                { status: 404 }
            )
        }

        // Verificar se funcionário está arquivado
        if (employee.archived) {
            return NextResponse.json(
                { error: 'Funcionário não está mais ativo no sistema' },
                { status: 403 }
            )
        }

        // Log da solicitação (opcional - para auditoria)
        console.log(`🔐 Solicitação de redefinição de senha para funcionário: ${employee.full_name} (${employee.email})`)

        // Informações para contato com a empresa
        const response = {
            success: true,
            message: 'Solicitação registrada com sucesso',
            employee: {
                name: employee.full_name,
                company: employee.companies?.name
            },
            contact: {
                companyName: employee.companies?.name,
                managerEmail: employee.companies?.manager_email
            }
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('Erro ao solicitar redefinição de senha:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}