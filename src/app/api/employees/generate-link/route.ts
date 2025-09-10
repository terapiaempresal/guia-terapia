import { NextRequest, NextResponse } from 'next/server'
import { generateEmployeeLoginToken } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { employeeName, employeeEmail, companyName, companyId } = body

        // Validações
        if (!employeeName || !employeeEmail || !companyName) {
            return NextResponse.json(
                { error: 'Dados obrigatórios não fornecidos' },
                { status: 400 }
            )
        }

        // Gerar token de login
        const loginToken = generateEmployeeLoginToken({
            company_id: companyId || 'mock-company-id',
            email: employeeEmail
        })

        // URL de login
        const loginUrl = `${process.env.APP_URL}/acesso?token=${loginToken}`

        return NextResponse.json({
            success: true,
            message: 'Link gerado com sucesso',
            loginUrl: loginUrl,
            employeeName,
            employeeEmail
        })

    } catch (error) {
        console.error('Erro ao gerar link:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
