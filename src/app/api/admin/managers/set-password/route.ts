import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { managerId, password } = await request.json()

        console.log('🔑 [SetManagerPassword] Definindo senha para gestor...')
        console.log('👤 [SetManagerPassword] Manager ID:', managerId)

        if (!managerId || !password) {
            return NextResponse.json({
                success: false,
                error: 'ID do gestor e senha são obrigatórios'
            }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({
                success: false,
                error: 'A senha deve ter pelo menos 6 caracteres'
            }, { status: 400 })
        }

        // Verificar se o gestor existe
        const { data: manager, error: managerError } = await supabaseAdmin
            .from('managers')
            .select('id, email, full_name')
            .eq('id', managerId)
            .single()

        if (managerError || !manager) {
            return NextResponse.json({
                success: false,
                error: 'Gestor não encontrado'
            }, { status: 404 })
        }

        // Hash da nova senha com bcrypt
        const hashedPassword = await bcrypt.hash(password, 12)

        // Atualizar a senha do gestor
        const { error: updateError } = await supabaseAdmin
            .from('managers')
            .update({ password: hashedPassword })
            .eq('id', managerId)

        if (updateError) {
            console.error('Erro ao atualizar senha:', updateError)
            return NextResponse.json({
                success: false,
                error: 'Erro ao atualizar senha'
            }, { status: 500 })
        }

        console.log('✅ [SetManagerPassword] Senha atualizada com sucesso')

        return NextResponse.json({
            success: true,
            message: 'Senha definida com sucesso'
        })

    } catch (error) {
        console.error('Erro ao definir senha:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}
