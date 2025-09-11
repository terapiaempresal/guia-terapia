import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'ID da empresa é obrigatório'
            }, { status: 400 })
        }

        const { data: company, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Erro ao buscar empresa:', error)
            return NextResponse.json({
                success: false,
                error: 'Empresa não encontrada'
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            company
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}
