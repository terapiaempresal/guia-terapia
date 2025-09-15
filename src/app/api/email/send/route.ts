import { NextRequest, NextResponse } from 'next/server'
import { requireFeatureFlag } from '@/lib/feature-flags'
import { EmailService } from '@/lib/email'

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

        else if (type === 'password_reset') {
            const { managerName, resetUrl } = data

            success = await emailService.sendEmail({
                to,
                subject: '🔐 Redefinição de senha - Guia de Terapia',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #1f2937;">Redefinição de senha</h2>
                        <p>Olá ${managerName},</p>
                        <p>Você solicitou a redefinição de sua senha no Guia de Terapia.</p>
                        <p>Clique no botão abaixo para redefinir sua senha:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                Redefinir senha
                            </a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">
                            <strong>Este link expira em 1 hora.</strong><br>
                            Se você não solicitou esta redefinição, ignore este email.
                        </p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="color: #6b7280; font-size: 12px;">
                            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                            <a href="${resetUrl}" style="color: #3b82f6;">${resetUrl}</a>
                        </p>
                    </div>
                `
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
