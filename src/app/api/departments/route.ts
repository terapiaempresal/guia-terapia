import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar departamentos de uma empresa
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const companyId = searchParams.get('company_id')

        if (!companyId) {
            return NextResponse.json(
                { error: 'company_id é obrigatório' },
                { status: 400 }
            )
        }

        const { data: departments, error } = await supabase
            .from('departments')
            .select('*')
            .eq('company_id', companyId)
            .order('name')

        if (error) {
            console.error('Erro ao buscar departamentos:', error)
            return NextResponse.json(
                { error: 'Erro ao buscar departamentos' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            departments: departments || []
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// POST - Criar novo departamento
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { company_id, name, description } = body

        if (!company_id || !name) {
            return NextResponse.json(
                { error: 'company_id e name são obrigatórios' },
                { status: 400 }
            )
        }

        // Verificar se já existe departamento com esse nome na empresa
        const { data: existing } = await supabase
            .from('departments')
            .select('id')
            .eq('company_id', company_id)
            .eq('name', name)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'Já existe um departamento com este nome' },
                { status: 400 }
            )
        }

        const { data: department, error } = await supabase
            .from('departments')
            .insert({
                company_id,
                name,
                description: description || null
            })
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar departamento:', error)
            return NextResponse.json(
                { error: 'Erro ao criar departamento' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            department
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// DELETE - Remover departamento
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const departmentId = searchParams.get('id')

        if (!departmentId) {
            return NextResponse.json(
                { error: 'id é obrigatório' },
                { status: 400 }
            )
        }

        // Verificar se há funcionários vinculados
        const { data: employees } = await supabase
            .from('employee_departments')
            .select('id')
            .eq('department_id', departmentId)
            .limit(1)

        if (employees && employees.length > 0) {
            return NextResponse.json(
                { error: 'Não é possível excluir um departamento com funcionários vinculados' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('departments')
            .delete()
            .eq('id', departmentId)

        if (error) {
            console.error('Erro ao excluir departamento:', error)
            return NextResponse.json(
                { error: 'Erro ao excluir departamento' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Departamento excluído com sucesso'
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// PATCH - Atualizar departamento
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, name, description } = body

        if (!id) {
            return NextResponse.json(
                { error: 'id é obrigatório' },
                { status: 400 }
            )
        }

        const updates: any = {}
        if (name) updates.name = name
        if (description !== undefined) updates.description = description

        const { data: department, error } = await supabase
            .from('departments')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar departamento:', error)
            return NextResponse.json(
                { error: 'Erro ao atualizar departamento' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            department
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
