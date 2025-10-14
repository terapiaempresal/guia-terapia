import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Lista de emails de administradores
const ADMIN_EMAILS = [
    'lucas.henrique@zeeway.com.br',
    'rodrigofnaves@gmail.com',
    // Adicione mais emails de admins aqui
]

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            )
        }

        const token = authHeader.replace('Bearer ', '')

        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return NextResponse.json(
                { error: 'Token inválido' },
                { status: 401 }
            )
        }

        // Verificar se é admin
        const isAdmin = ADMIN_EMAILS.includes(user.email || '')

        return NextResponse.json({
            isAdmin,
            user: {
                id: user.id,
                email: user.email
            }
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro ao verificar permissões' },
            { status: 500 }
        )
    }
}
