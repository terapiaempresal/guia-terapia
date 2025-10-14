import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

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

        // Buscar gestor no banco de dados com dados da empresa
        const { data: manager, error } = await supabase
            .from('managers')
            .select(`
                *,
                companies:company_id (
                    id,
                    name,
                    status,
                    plan
                )
            `)
            .eq('email', email)
            .single()

        if (error || !manager) {
            return NextResponse.json({
                success: false,
                error: 'Email ou senha incorretos'
            }, { status: 401 })
        }

        // Verificar se o gestor está ativo
        if (manager.status === 'inactive') {
            return NextResponse.json({
                success: false,
                error: 'Sua conta está inativa. Aguardando confirmação de pagamento.'
            }, { status: 403 })
        }

        // Verificar se a empresa está ativa
        const company = Array.isArray(manager.companies) ? manager.companies[0] : manager.companies
        if (company && company.status === 'inactive') {
            return NextResponse.json({
                success: false,
                error: 'Empresa inativa. Entre em contato com o suporte.'
            }, { status: 403 })
        }

        // Verificar senha
        let validPassword = false

        if (manager.password) {
            // Se há uma senha com hash (da redefinição), usar bcrypt
            validPassword = await bcrypt.compare(password, manager.password)
        } else {
            // Senha padrão para gestores sem senha definida
            validPassword = password === '123456'
        }

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
