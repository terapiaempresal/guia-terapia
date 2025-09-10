import { NextRequest, NextResponse } from 'next/server'
import { requireFeatureFlag } from '@/lib/feature-flags'
import EmailService from '@/lib/email'

export async function POST(request: NextRequest) {
    // Verificar se e-mails estão habilitados
    const flagCheck = requireFeatureFlag('FLAG_ENABLE_EMAILS')
    if (flagCheck) return flagCheck

    try {
        const { type, to, data } = await request.json()

        const emailService = new EmailService()
        let success = false

        if (type === 'manager_welcome') {
            const { managerName, companyName } = data
            const dashboardUrl = `${process.env.APP_URL}/gestor`

            success = await emailService.sendEmail({
                to,
                subject: `🎉 Bem-vindo ao Guia de Terapia - ${companyName}`,
                html: EmailService.getWelcomeManagerTemplate(managerName, companyName, dashboardUrl)
            })
        }

        else if (type === 'employee_invite') {
            const { employeeName, companyName, loginToken } = data
            const loginUrl = `${process.env.APP_URL}/acesso?token=${loginToken}`

            success = await emailService.sendEmail({
                to,
                subject: `🚀 Convite para Jornada de Desenvolvimento - ${companyName}`,
                html: EmailService.getEmployeeInviteTemplate(employeeName, companyName, loginUrl)
            })
        }

        else if (type === 'test') {
            success = await emailService.sendEmail({
                to,
                subject: '✅ Teste de E-mail - Guia de Terapia',
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">🎉 Teste de E-mail</h2>
            <p>Este é um e-mail de teste do sistema Guia de Terapia.</p>
            <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p><strong>Configuração SMTP:</strong></p>
            <ul>
              <li>Host: ${process.env.SMTP_HOST}</li>
              <li>Porta: ${process.env.SMTP_PORT}</li>
              <li>De: ${process.env.EMAIL_FROM}</li>
            </ul>
            <p style="color: #16a34a;">✅ Se você recebeu este e-mail, a configuração está funcionando corretamente!</p>
          </div>
        `
            })
        }

        if (success) {
            return NextResponse.json({
                success: true,
                message: 'E-mail enviado com sucesso!'
            })
        } else {
            return NextResponse.json({
                success: false,
                error: 'Falha ao enviar e-mail'
            }, { status: 500 })
        }

    } catch (error) {
        console.error('Erro na API de e-mail:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}
