import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { EmailService } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const { cpf } = await request.json()

        if (!cpf) {
            return NextResponse.json({
                success: false,
                error: 'CPF é obrigatório'
            }, { status: 400 })
        }

        // Limpar CPF (remover pontos e traços)
        const cleanCpf = cpf.replace(/\D/g, '')

        // Verificar se o funcionário existe
        console.log('🔍 [ForgotPassword] Buscando funcionário com CPF:', cleanCpf)

        const { data: employee, error } = await supabase
            .from('employees')
            .select(`
                *,
                companies (
                    name
                )
            `)
            .eq('cpf', cleanCpf)
            .eq('archived', false)
            .single()

        console.log('📋 [ForgotPassword] Resultado da busca:', {
            found: !!employee,
            error: error?.message,
            hasEmail: !!employee?.email,
            employeeName: employee?.full_name || employee?.name,
            companyName: employee?.companies?.name
        })

        if (error || !employee) {
            // Por segurança, retornamos sucesso mesmo se o CPF não existir
            // para não vazar informações sobre quais CPFs estão cadastrados
            return NextResponse.json({
                success: true,
                message: 'Se o CPF estiver cadastrado, você receberá um link de redefinição'
            })
        }

        // Verificar se funcionário tem email
        if (!employee.email) {
            return NextResponse.json({
                success: true,
                message: 'Se o CPF estiver cadastrado, você receberá um link de redefinição'
            })
        }

        // Gerar token de redefinição
        const resetToken = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

        // Salvar token no banco
        const { error: tokenError } = await supabase
            .from('password_reset_tokens')
            .insert({
                employee_id: employee.id,
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

        // Enviar email
        try {
            const emailService = new EmailService()
            const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login/funcionario/redefinir-senha?token=${resetToken}`

            const emailSent = await emailService.sendEmail({
                to: employee.email,
                subject: '🔐 Redefinição de senha - Guia de Terapia',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #1f2937;">🔐 Redefinição de senha</h2>
                        <p>Olá <strong>${employee.full_name || employee.name}</strong>,</p>
                        <p>Você solicitou a redefinição de sua senha no Guia de Terapia.</p>
                        <p>Empresa: <strong>${employee.companies?.name}</strong></p>
                        <p>Clique no botão abaixo para redefinir sua senha:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
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
                            <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
                        </p>
                        <p style="color: #6b7280; font-size: 11px; margin-top: 20px;">
                            <em>Enviado em: ${new Date().toLocaleString('pt-BR')} | Ambiente: ${process.env.NODE_ENV}</em>
                        </p>
                    </div>
                `
            })

            if (emailSent) {
                console.log(`✅ Email de redefinição enviado para funcionário: ${employee.email}`)
            } else {
                console.error(`❌ Falha ao enviar email para funcionário: ${employee.email}`)
            }

        } catch (emailError) {
            console.error('Erro ao enviar email:', emailError)
            // Mesmo com erro no email, não revelamos isso ao usuário
        }

        return NextResponse.json({
            success: true,
            message: 'Se o CPF estiver cadastrado, você receberá um link de redefinição'
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}