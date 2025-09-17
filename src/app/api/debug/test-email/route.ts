import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'

// Força a rota a ser dinâmica pois usa searchParams
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        // Verificar se é ambiente de desenvolvimento ou se tem uma chave de debug
        const debugKey = request.nextUrl.searchParams.get('debug_key')

        if (process.env.NODE_ENV === 'production' && debugKey !== process.env.DEBUG_KEY) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { to, subject = 'Teste de Email - Debug' } = body

        if (!to) {
            return NextResponse.json(
                { error: 'Email destinatário (to) é obrigatório' },
                { status: 400 }
            )
        }

        console.log('🧪 [Debug] Iniciando teste de envio de email...')
        console.log('📧 [Debug] Destinatário:', to)
        console.log('📝 [Debug] Assunto:', subject)

        // Criar instância do serviço de email
        const emailService = new EmailService()

        // Template de teste simples
        const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Teste de Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #3b82f6;">🧪 Teste de Email - Debug</h1>
            <p>Este é um email de teste enviado em: <strong>${new Date().toLocaleString('pt-BR')}</strong></p>
            <p>Ambiente: <strong>${process.env.NODE_ENV}</strong></p>
            <p>Se você recebeu este email, a configuração está funcionando corretamente! ✅</p>
            
            <hr style="margin: 20px 0;">
            
            <h3>Informações de Debug:</h3>
            <ul>
                <li>SMTP Host: ${process.env.SMTP_HOST || 'Não configurado'}</li>
                <li>SMTP Port: ${process.env.SMTP_PORT || 'Não configurado'}</li>
                <li>Email From: ${process.env.EMAIL_FROM || 'Não configurado'}</li>
                <li>Flag Emails: ${process.env.FLAG_ENABLE_EMAILS || 'Não configurado'}</li>
            </ul>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Este email foi enviado automaticamente para teste. Não responda este email.
            </p>
        </body>
        </html>
        `

        // Tentar enviar o email
        const emailSent = await emailService.sendEmail({
            to,
            subject,
            html: testHtml
        })

        if (emailSent) {
            console.log('✅ [Debug] Email de teste enviado com sucesso!')
            return NextResponse.json({
                success: true,
                message: 'Email de teste enviado com sucesso!',
                timestamp: new Date().toISOString(),
                to,
                subject
            })
        } else {
            console.error('❌ [Debug] Falha ao enviar email de teste')
            return NextResponse.json(
                {
                    error: 'Falha ao enviar email de teste',
                    message: 'Verifique os logs para mais detalhes'
                },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('❌ [Debug] Erro no teste de email:', error)
        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        )
    }
}