import { NextResponse } from 'next/server'
// import prisma from '@/lib/prisma'

// NOTA: Esta rota não está sendo usada atualmente. O admin/page.tsx usa Supabase diretamente.
// Para usar esta rota, você precisa:
// 1. Configurar DATABASE_URL no .env com a senha real do banco
// 2. Executar: npx prisma generate
// 3. Descomentar o import do prisma acima e o código abaixo

export async function GET() {
    return NextResponse.json({
        error: 'Esta rota está desabilitada. Use o Supabase client diretamente.',
        message: 'O painel admin usa Supabase client ao invés desta API route.'
    }, { status: 501 })
}
