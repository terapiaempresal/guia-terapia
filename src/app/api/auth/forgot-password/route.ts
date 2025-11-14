import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email é obrigatório'
            }, { status: 400 })
        }

        // Verificar se o gestor existe
        const { data: manager, error } = await supabase
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
        const { error: tokenError } = await supabase
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
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login/redefinir-senha?token=${resetToken}`

        try {
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'password_reset',
                    to: email,
                    data: {
                        managerName: manager.full_name || manager.name,
                        resetUrl: resetUrl
                    }
                })
            })

            if (!emailResponse.ok) {
                console.error('Erro ao enviar email')
                // Mesmo assim retornamos sucesso para não vazar informação
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
