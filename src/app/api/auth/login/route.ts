import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                error: 'Email e senha são obrigatórios'
            }, { status: 400 })
        }

        // Buscar gestor no banco de dados
        const { data: manager, error } = await supabase
            .from('managers')
            .select('*')
            .eq('email', email)
            .single()

        if (error || !manager) {
            return NextResponse.json({
                success: false,
                error: 'Email ou senha incorretos'
            }, { status: 401 })
        }

        // Em um ambiente real, você compararia a senha com hash
        // Por simplicidade, vamos usar uma senha padrão ou a senha no banco
        const validPassword = password === '123456' || password === manager.password

        if (!validPassword) {
            return NextResponse.json({
                success: false,
                error: 'Email ou senha incorretos'
            }, { status: 401 })
        }

        // Gerar token JWT simples (em produção, use uma biblioteca como jsonwebtoken)
        const token = Buffer.from(JSON.stringify({
            id: manager.id,
            email: manager.email,
            type: 'manager',
            timestamp: Date.now()
        })).toString('base64')

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: manager.id,
                email: manager.email,
                name: manager.name,
                type: 'manager'
            }
        })

    } catch (error) {
        console.error('Erro na autenticação:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}
