import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const companyId = params.id

        if (!companyId) {
            return NextResponse.json(
                { success: false, error: 'ID da empresa é obrigatório' },
                { status: 400 }
            )
        }

        // Buscar todos os gestores/sócios da empresa
        const { data: managers, error } = await supabase
            .from('managers')
            .select('id, full_name, email, phone, created_at, status')
            .eq('company_id', companyId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Erro ao buscar gestores:', error)
            return NextResponse.json(
                { success: false, error: 'Erro ao buscar gestores' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            managers: managers || []
        })

    } catch (error) {
        console.error('Erro ao buscar gestores:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
