import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json({
                success: false,
                error: 'Token e senha são obrigatórios'
            }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({
                success: false,
                error: 'A senha deve ter pelo menos 6 caracteres'
            }, { status: 400 })
        }

        // Verificar se o token existe e não expirou
        const { data: resetToken, error: tokenError } = await supabase
            .from('password_reset_tokens')
            .select('*')
            .eq('token', token)
            .eq('used', false)
            .gte('expires_at', new Date().toISOString())
            .single()

        if (tokenError || !resetToken) {
            return NextResponse.json({
                success: false,
                error: 'Token inválido ou expirado'
            }, { status: 400 })
        }

        // Hash da nova senha com bcrypt
        const hashedPassword = await bcrypt.hash(password, 12)

        // Atualizar a senha do gestor
        const { error: updateError } = await supabase
            .from('managers')
            .update({ password: hashedPassword })
            .eq('id', resetToken.manager_id)

        if (updateError) {
            console.error('Erro ao atualizar senha:', updateError)
            return NextResponse.json({
                success: false,
                error: 'Erro ao atualizar senha'
            }, { status: 500 })
        }

        // Marcar token como usado
        const { error: markUsedError } = await supabase
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('token', token)

        if (markUsedError) {
            console.error('Erro ao marcar token como usado:', markUsedError)
            // Não retornamos erro aqui pois a senha já foi alterada
        }

        return NextResponse.json({
            success: true,
            message: 'Senha redefinida com sucesso'
        })

    } catch (error) {
        console.error('Erro ao redefinir senha:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}
