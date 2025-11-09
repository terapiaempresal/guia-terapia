import { NextResponse } from 'next/server'
// import prisma from '@/lib/prisma'

// NOTA: Esta rota não está sendo usada atualmente. O admin/page.tsx usa Supabase diretamente.
// Para usar esta rota, você precisa configurar DATABASE_URL no .env e executar: npx prisma generate

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    return NextResponse.json({
        error: 'Esta rota está desabilitada. Use o Supabase client diretamente.',
        message: 'O painel admin usa Supabase client ao invés desta API route.'
    }, { status: 501 })
}