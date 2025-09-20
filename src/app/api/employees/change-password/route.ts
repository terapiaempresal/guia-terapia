import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validatePasswordFormat } from '@/lib/password-utils'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { employeeId, newPassword, currentPassword } = body

        if (!employeeId || !newPassword) {
            return NextResponse.json(
                { error: 'ID do funcionário e nova senha são obrigatórios' },
                { status: 400 }
            )
        }

        // Validar formato da nova senha
        const passwordValidation = validatePasswordFormat(newPassword)
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { error: 'Senha inválida: ' + passwordValidation.errors.join(', ') },
                { status: 400 }
            )
        }

        // Buscar funcionário atual
        const { data: employee, error: fetchError } = await supabase
            .from('employees')
            .select('id, password, birth_date')
            .eq('id', employeeId)
            .single()

        if (fetchError || !employee) {
            console.error('Erro ao buscar funcionário:', fetchError)
            return NextResponse.json(
                { error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        // Se o funcionário já tem senha, verificar a senha atual
        if (employee.password && currentPassword) {
            if (employee.password !== currentPassword) {
                return NextResponse.json(
                    { error: 'Senha atual incorreta' },
                    { status: 401 }
                )
            }
        }

        // Atualizar senha
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
            return NextResponse.json(
                { error: 'Erro ao atualizar senha' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Senha atualizada com sucesso',
            employee: {
                id: updatedEmployee.id,
                hasPassword: true
            }
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}