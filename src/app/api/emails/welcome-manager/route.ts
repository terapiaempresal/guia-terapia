import { NextRequest, NextResponse } from 'next/server'
import { requireFeatureFlag } from '@/lib/feature-flags'
import { EmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
    // Verificar se e-mails estão habilitados
    const flagCheck = requireFeatureFlag('FLAG_ENABLE_EMAILS')
    if (flagCheck) return flagCheck

    try {
        const body = await request.json()
        const { managerName, managerEmail, companyName } = body

        // Validações
        if (!managerName || !managerEmail || !companyName) {
            return NextResponse.json(
                { error: 'Dados obrigatórios não fornecidos' },
                { status: 400 }
            )
        }

        // URL do dashboard
        const dashboardUrl = `${process.env.APP_URL}/gestor`

        // Criar instância do serviço de e-mail
        const emailService = new EmailService()

        // Enviar e-mail de boas-vindas
        const emailSent = await emailService.sendEmail({
            to: managerEmail,
            subject: `Bem-vindo ao Guia de Terapia - ${companyName}`,
            html: EmailService.getWelcomeManagerTemplate(managerName, companyName, dashboardUrl)
        })

        if (emailSent) {
            return NextResponse.json({
                success: true,
                message: 'E-mail de boas-vindas enviado com sucesso'
            })
        } else {
            return NextResponse.json(
                { error: 'Falha ao enviar e-mail' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Erro ao enviar e-mail de boas-vindas:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
