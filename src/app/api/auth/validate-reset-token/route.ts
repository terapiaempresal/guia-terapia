import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
            .select('*')
            .eq('token', token)
            .eq('used', false)
            .gte('expires_at', new Date().toISOString())
            .single()

        if (error || !resetToken) {
            return NextResponse.json({
                success: false,
                error: 'Token inválido ou expirado'
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: 'Token válido'
        })

    } catch (error) {
        console.error('Erro ao validar token:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}
