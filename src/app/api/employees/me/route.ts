import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { employeeId } = await request.json()

        if (!employeeId) {
            return NextResponse.json({ error: 'ID do funcionário é obrigatório' }, { status: 400 })
        }

        // Buscar dados atualizados do funcionário
        const { data: employee, error } = await supabase
            .from('employees')
            .select(`
                id,
                name,
                cpf,
                birth_date,
                journey_filled,
                journey_filled_at,
                journey_result_html,
                company:companies(name),
                manager:managers(name, email)
            `)
            .eq('id', employeeId)
            .single()

        if (error) {
            console.error('Erro ao buscar funcionário:', error)
            return NextResponse.json({
                error: 'Funcionário não encontrado'
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            employee
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}