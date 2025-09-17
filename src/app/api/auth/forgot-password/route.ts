import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { EmailService } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email é obrigatório'
            }, { status: 400 })
        }

        // Verificar se o gestor existe
        const { data: manager, error } = await supabaseAdmin
            .from('managers')
            .select('*')
            .eq('email', email)
            .single()

        if (error || !manager) {
            // Por segurança, retornamos sucesso mesmo se o email não existir
            // para não vazar informações sobre quais emails estão cadastrados
            return NextResponse.json({
                success: true,
                message: 'Se o email estiver cadastrado, você receberá um link de redefinição'
            })
        }

        // Gerar token de redefinição
        const resetToken = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

        // Salvar token no banco (vamos criar uma tabela para isso)
        const { error: tokenError } = await supabaseAdmin
            .from('password_reset_tokens')
            .insert({
                manager_id: manager.id,
                token: resetToken,
                expires_at: expiresAt.toISOString(),
                used: false
            })

        if (tokenError) {
            console.error('Erro ao salvar token:', tokenError)
            return NextResponse.json({
                success: false,
                error: 'Erro interno do servidor'
            }, { status: 500 })
        }

        // Enviar email com o link de redefinição
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || 'http://app.terapiaempresarial.com.br'}/login/redefinir-senha?token=${resetToken}`

        console.log('🔑 [ForgotPassword] Iniciando envio de email de reset...')
        console.log('📧 [ForgotPassword] Email destinatário:', email)
        console.log('🔗 [ForgotPassword] URL de reset:', resetUrl)
        console.log('👤 [ForgotPassword] Nome do manager:', manager.full_name || manager.name)

        // Verificar se emails estão habilitados
        if (process.env.FLAG_ENABLE_EMAILS === 'false') {
            console.warn('⚠️ [ForgotPassword] FLAG_ENABLE_EMAILS está desabilitada!')
            return NextResponse.json({
                success: true,
                message: 'Se o email estiver cadastrado, você receberá um link de redefinição',
                debug: 'Emails desabilitados por feature flag'
            })
        }

        try {
            // Usar EmailService diretamente
            const emailService = new EmailService()

            const emailSent = await emailService.sendEmail({
                to: email,
                subject: '🔐 Redefinição de senha - Guia de Terapia',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #1f2937;">🔐 Redefinição de senha</h2>
                        <p>Olá <strong>${manager.full_name || manager.name}</strong>,</p>
                        <p>Você solicitou a redefinição de sua senha no Guia de Terapia.</p>
                        <p>Clique no botão abaixo para redefinir sua senha:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                Redefinir senha
                            </a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">
                            <strong>⏰ Este link expira em 1 hora.</strong><br>
                            Se você não solicitou esta redefinição, ignore este email.
                        </p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="color: #6b7280; font-size: 12px;">
                            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                            <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
                        </p>
                        <p style="color: #6b7280; font-size: 11px; margin-top: 20px;">
                            <em>Enviado em: ${new Date().toLocaleString('pt-BR')} | Ambiente: ${process.env.NODE_ENV}</em>
                        </p>
                    </div>
                `
            })

            if (emailSent) {
                console.log('✅ [ForgotPassword] Email de reset enviado com sucesso!')
            } else {
                console.error('❌ [ForgotPassword] Falha ao enviar email de reset')
            }
        } catch (emailError) {
            console.error('Erro ao enviar email:', emailError)
            // Mesmo assim retornamos sucesso para não vazar informação
        }

        return NextResponse.json({
            success: true,
            message: 'Se o email estiver cadastrado, você receberá um link de redefinição'
        })

    } catch (error) {
        console.error('Erro no forgot-password:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}
