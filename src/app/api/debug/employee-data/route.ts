import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { cpf } = await request.json()

        if (!cpf) {
            return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 })
        }

        // Limpar o CPF
        const cleanCPF = cpf.replace(/\D/g, '')

        console.log('🔍 Buscando funcionário com CPF:', cleanCPF)

        // Buscar funcionário
        const { data: employee, error } = await supabase
            .from('employees')
            .select('id, name, cpf, birth_date, password, created_at')
            .eq('cpf', cleanCPF)
            .single()

        if (error) {
            console.error('❌ Erro ao buscar funcionário:', error)

            // Listar todos os funcionários para debug
            const { data: allEmployees } = await supabase
                .from('employees')
                .select('id, name, cpf, birth_date, password')
                .limit(5)

            return NextResponse.json({
                error: 'Funcionário não encontrado',
                debug: {
                    searchedCpf: cleanCPF,
                    allEmployees: allEmployees || [],
                    supabaseError: error.message
                }
            })
        }

        // Calcular senha esperada baseada na data de nascimento
        let expectedPassword = null
        if (employee.birth_date) {
            const birthDate = new Date(employee.birth_date)
            expectedPassword = String(birthDate.getDate()).padStart(2, '0') +
                String(birthDate.getMonth() + 1).padStart(2, '0') +
                birthDate.getFullYear()
        }

        return NextResponse.json({
            success: true,
            employee: {
                id: employee.id,
                name: employee.name,
                cpf: employee.cpf,
                birth_date: employee.birth_date,
                has_password: !!employee.password,
                stored_password: employee.password,
                expected_password: expectedPassword,
                passwords_match: employee.password === expectedPassword,
                created_at: employee.created_at
            }
        })

    } catch (error) {
        console.error('❌ Erro interno:', error)
        return NextResponse.json({
            error: 'Erro interno',
            debug: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}