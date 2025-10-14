import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET - Listar departamentos de um funcionário
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const employeeId = searchParams.get('employee_id')

        if (!employeeId) {
            return NextResponse.json(
                { error: 'employee_id é obrigatório' },
                { status: 400 }
            )
        }

        // Buscar departamentos do funcionário
        const { data, error } = await supabase
            .from('employee_departments')
            .select(`
                id,
                department_id,
                departments (
                    id,
                    name,
                    description
                )
            `)
            .eq('employee_id', employeeId)

        if (error) {
            console.error('Erro ao buscar departamentos do funcionário:', error)
            return NextResponse.json(
                { error: 'Erro ao buscar departamentos do funcionário' },
                { status: 500 }
            )
        }

        // Formatar dados
        const departments = data.map((item: any) => ({
            id: item.departments.id,
            name: item.departments.name,
            description: item.departments.description
        }))

        return NextResponse.json({ departments })
    } catch (error) {
        console.error('Erro no GET /api/employees/departments:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// POST - Vincular funcionário a departamento
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { employee_id, department_id } = body

        if (!employee_id || !department_id) {
            return NextResponse.json(
                { error: 'employee_id e department_id são obrigatórios' },
                { status: 400 }
            )
        }

        // Verificar se o vínculo já existe
        const { data: existing } = await supabase
            .from('employee_departments')
            .select('id')
            .eq('employee_id', employee_id)
            .eq('department_id', department_id)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'Funcionário já está vinculado a este departamento' },
                { status: 400 }
            )
        }

        // Criar vínculo
        const { data, error } = await supabase
            .from('employee_departments')
            .insert({
                employee_id,
                department_id
            })
            .select()
            .single()

        if (error) {
            console.error('Erro ao vincular funcionário ao departamento:', error)
            return NextResponse.json(
                { error: 'Erro ao vincular funcionário ao departamento' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            link: data
        })
    } catch (error) {
        console.error('Erro no POST /api/employees/departments:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// DELETE - Remover vínculo entre funcionário e departamento
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const employeeId = searchParams.get('employee_id')
        const departmentId = searchParams.get('department_id')

        if (!employeeId || !departmentId) {
            return NextResponse.json(
                { error: 'employee_id e department_id são obrigatórios' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('employee_departments')
            .delete()
            .eq('employee_id', employeeId)
            .eq('department_id', departmentId)

        if (error) {
            console.error('Erro ao remover vínculo:', error)
            return NextResponse.json(
                { error: 'Erro ao remover vínculo' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erro no DELETE /api/employees/departments:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
