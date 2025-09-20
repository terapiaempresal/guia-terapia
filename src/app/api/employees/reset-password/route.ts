import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validatePasswordFormat } from '@/lib/password-utils'

export async function POST(request: NextRequest) {
    try {
        const { token, newPassword } = await request.json()

        if (!token || !newPassword) {
            return NextResponse.json({
                success: false,
                error: 'Token e nova senha são obrigatórios'
            }, { status: 400 })
        }

        // Validar formato da senha
        const passwordValidation = validatePasswordFormat(newPassword)
        if (!passwordValidation.valid) {
            return NextResponse.json({
                success: false,
                error: 'Senha inválida: ' + passwordValidation.errors.join(', ')
            }, { status: 400 })
        }

        // Verificar se o token existe e não expirou
        const { data: resetToken, error } = await supabase
            .from('password_reset_tokens')
            .select(`
                *,
                employees (
                    id,
                    full_name,
                    email,
                    archived
                )
            `)
            .eq('token', token)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (error || !resetToken) {
            console.log('❌ Token inválido ou expirado:', error?.message)
            return NextResponse.json({
                success: false,
                error: 'Token inválido ou expirado'
            }, { status: 400 })
        }

        // Verificar se o funcionário ainda existe e não está arquivado
        if (!resetToken.employees || resetToken.employees.archived) {
            return NextResponse.json({
                success: false,
                error: 'Funcionário não encontrado ou inativo'
            }, { status: 400 })
        }

        const employeeId = resetToken.employees.id

        // Atualizar senha do funcionário
        const { data: updatedEmployee, error: updateError } = await supabase
            .from('employees')
            .update({
                password: newPassword,
                updated_at: new Date().toISOString()
            })
            .eq('id', employeeId)
            .select()
            .single()

        if (updateError) {
            console.error('Erro ao atualizar senha:', updateError)
            return NextResponse.json({
                success: false,
                error: 'Erro ao atualizar senha'
            }, { status: 500 })
        }

        // Marcar token como usado
        const { error: tokenUpdateError } = await supabase
            .from('password_reset_tokens')
            .update({
                used: true,
                used_at: new Date().toISOString()
            })
            .eq('id', resetToken.id)

        if (tokenUpdateError) {
            console.error('Erro ao marcar token como usado:', tokenUpdateError)
            // Não é crítico, continua o processo
        }

        console.log(`✅ Senha redefinida com sucesso para funcionário: ${resetToken.employees.email}`)

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