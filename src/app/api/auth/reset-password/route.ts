import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        console.log('🔑 [ResetPassword] Iniciando reset de senha...')
        console.log('🎫 [ResetPassword] Token recebido:', token ? '***' : 'NONE')
        console.log('🔒 [ResetPassword] Password recebido:', password ? '***' : 'NONE')

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
        const { data: resetToken, error: tokenError } = await supabaseAdmin
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
        const { error: updateError } = await supabaseAdmin
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
        const { error: markUsedError } = await supabaseAdmin
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
