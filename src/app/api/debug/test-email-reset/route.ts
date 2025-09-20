import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email é obrigatório'
            }, { status: 400 })
        }

        console.log('🧪 [Test Email] Testando envio de email para:', email)

        // Verificar configurações de email
        const emailService = new EmailService()

        console.log('🔧 [Test Email] Configurações SMTP:')
        console.log('- SMTP_HOST:', process.env.SMTP_HOST || 'NÃO CONFIGURADO')
        console.log('- SMTP_PORT:', process.env.SMTP_PORT || 'NÃO CONFIGURADO')
        console.log('- SMTP_USER:', process.env.SMTP_USER ? 'CONFIGURADO' : 'NÃO CONFIGURADO')
        console.log('- SMTP_PASS:', process.env.SMTP_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO')
        console.log('- EMAIL_FROM:', process.env.EMAIL_FROM || 'NÃO CONFIGURADO')

        // Tentar enviar email de teste
        const emailSent = await emailService.sendEmail({
            to: email,
            subject: '🧪 Teste de envio de email - Guia de Terapia',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1f2937;">🧪 Email de Teste</h2>
                    <p>Este é um email de teste para verificar se o sistema de envio está funcionando.</p>
                    <p><strong>Destinatário:</strong> ${email}</p>
                    <p><strong>Enviado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                    <p><strong>Ambiente:</strong> ${process.env.NODE_ENV || 'não definido'}</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #374151; margin-top: 0;">Configurações SMTP:</h3>
                        <ul style="color: #6b7280; font-size: 14px;">
                            <li>Host: ${process.env.SMTP_HOST || 'NÃO CONFIGURADO'}</li>
                            <li>Porta: ${process.env.SMTP_PORT || 'NÃO CONFIGURADO'}</li>
                            <li>Usuário: ${process.env.SMTP_USER ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}</li>
                            <li>Remetente: ${process.env.EMAIL_FROM || 'NÃO CONFIGURADO'}</li>
                        </ul>
                    </div>

                    <p style="color: #059669; font-weight: bold;">✅ Se você recebeu este email, o sistema está funcionando corretamente!</p>
                </div>
            `
        })

        console.log('📤 [Test Email] Resultado do envio:', emailSent ? 'SUCESSO' : 'FALHA')

        if (emailSent) {
            return NextResponse.json({
                success: true,
                message: 'Email de teste enviado com sucesso!',
                config: {
                    smtp_host: process.env.SMTP_HOST || 'NÃO CONFIGURADO',
                    smtp_port: process.env.SMTP_PORT || 'NÃO CONFIGURADO',
                    smtp_user: process.env.SMTP_USER ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
                    email_from: process.env.EMAIL_FROM || 'NÃO CONFIGURADO'
                }
            })
        } else {
            return NextResponse.json({
                success: false,
                error: 'Falha ao enviar email',
                config: {
                    smtp_host: process.env.SMTP_HOST || 'NÃO CONFIGURADO',
                    smtp_port: process.env.SMTP_PORT || 'NÃO CONFIGURADO',
                    smtp_user: process.env.SMTP_USER ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
                    email_from: process.env.EMAIL_FROM || 'NÃO CONFIGURADO'
                }
            }, { status: 500 })
        }

    } catch (error) {
        console.error('❌ [Test Email] Erro:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 })
    }
}