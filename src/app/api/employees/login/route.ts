import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { cpf } = body

        if (!cpf) {
            return NextResponse.json(
                { error: 'CPF é obrigatório' },
                { status: 400 }
            )
        }

        // Limpar o CPF (remover pontos e traços)
        const cleanCPF = cpf.replace(/\D/g, '')

        // Buscar funcionário pelo CPF
        const { data: employee, error } = await supabase
            .from('employees')
            .select(`
                *,
                company:companies(name),
                manager:managers(name, email)
            `)
            .eq('cpf', cleanCPF)
            .single()

        if (error) {
            console.error('Erro ao buscar funcionário:', error)
            return NextResponse.json(
                { error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        if (!employee) {
            return NextResponse.json(
                { error: 'CPF não encontrado. Verifique se você está cadastrado.' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            employee
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
