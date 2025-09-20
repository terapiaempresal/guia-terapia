import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Token é obrigatório'
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

        console.log('✅ Token válido para funcionário:', resetToken.employees.email)

        return NextResponse.json({
            success: true,
            employee: {
                id: resetToken.employees.id,
                name: resetToken.employees.full_name,
                email: resetToken.employees.email
            }
        })

    } catch (error) {
        console.error('Erro ao validar token:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}