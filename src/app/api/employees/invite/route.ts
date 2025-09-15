import { NextRequest, NextResponse } from 'next/server'
import { requireFeatureFlag } from '@/lib/feature-flags'
import { generateEmployeeLoginToken } from '@/lib/utils'
import { EmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
    // Verificar se e-mails estão habilitados
    const flagCheck = requireFeatureFlag('FLAG_ENABLE_EMAILS')
    if (flagCheck) return flagCheck

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

        // Criar instância do serviço de e-mail
        const emailService = new EmailService()

        // Enviar e-mail
        const emailSent = await emailService.sendEmail({
            to: employeeEmail,
            subject: `Convite: Jornada de Desenvolvimento - ${companyName}`,
            html: EmailService.getEmployeeInviteTemplate(employeeName, companyName, loginUrl)
        })

        if (emailSent) {
            return NextResponse.json({
                success: true,
                message: 'E-mail de convite enviado com sucesso',
                loginUrl: loginUrl // Para desenvolvimento/debug
            })
        } else {
            return NextResponse.json(
                { error: 'Falha ao enviar e-mail' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Erro ao enviar convite:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
