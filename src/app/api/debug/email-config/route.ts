import { NextRequest, NextResponse } from 'next/server'

// Força a rota a ser dinâmica pois usa searchParams
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // Verificar se é ambiente de desenvolvimento ou se tem uma chave de debug
        const debugKey = request.nextUrl.searchParams.get('debug_key')

        if (process.env.NODE_ENV === 'production' && debugKey !== process.env.DEBUG_KEY) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Informações de configuração do email
        const emailConfig = {
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),

            // Configurações SMTP
            smtp: {
                host: process.env.SMTP_HOST || 'NOT_SET',
                port: process.env.SMTP_PORT || 'NOT_SET',
                userConfigured: !!process.env.SMTP_USER,
                passConfigured: !!process.env.SMTP_PASS,
                emailFrom: process.env.EMAIL_FROM ?
                    process.env.EMAIL_FROM.replace(/(.{3}).*@/, '$1***@') : 'NOT_SET'
            },

            // Feature flags
            flags: {
                enableEmails: process.env.FLAG_ENABLE_EMAILS,
                hasDebugKey: !!process.env.DEBUG_KEY
            },

            // URLs e configurações gerais
            app: {
                url: process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'NOT_SET',
                nextPublicUrl: process.env.NEXT_PUBLIC_BASE_URL || 'NOT_SET'
            },

            // Verificar se há configurações alternativas (Resend, SendGrid, etc.)
            alternatives: {
                resendKey: !!process.env.RESEND_API_KEY,
                sendgridKey: !!process.env.SENDGRID_API_KEY,
                mailgunKey: !!process.env.MAILGUN_API_KEY
            }
        }

        console.log('🔍 [Debug] Configurações de email verificadas:', emailConfig)

        return NextResponse.json({
            success: true,
            message: 'Configurações de email verificadas',
            config: emailConfig
        })

    } catch (error) {
        console.error('❌ [Debug] Erro ao verificar configurações:', error)
        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        )
    }
}