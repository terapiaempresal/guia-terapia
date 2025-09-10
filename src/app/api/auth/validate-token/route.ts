import { NextRequest, NextResponse } from 'next/server'
import { verifyEmployeeLoginToken } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = body

        if (!token) {
            return NextResponse.json(
                { error: 'Token não fornecido' },
                { status: 400 }
            )
        }

        // Verificar o token
        const decoded = verifyEmployeeLoginToken(token)

        return NextResponse.json({
            success: true,
            valid: true,
            data: decoded
        })

    } catch (error) {
        console.error('Erro ao validar token:', error)
        return NextResponse.json(
            { error: 'Token inválido ou expirado', valid: false },
            { status: 401 }
        )
    }
}
