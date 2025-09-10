import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar funcionários de uma empresa
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const companyId = searchParams.get('company_id')

        if (!companyId) {
            return NextResponse.json(
                { error: 'company_id é obrigatório' },
                { status: 400 }
            )
        }

        const { data: employees, error } = await supabase
            .from('employees')
            .select(`
                *,
                company:companies(name),
                manager:managers(name, email)
            `)
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar funcionários:', error)
            return NextResponse.json(
                { error: 'Erro ao buscar funcionários' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            employees: employees || []
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// POST - Adicionar novo funcionário
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            company_id,
            manager_id,
            name,
            email
        } = body

        // Validações
        if (!company_id || !manager_id || !name || !email) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: company_id, manager_id, name, email' },
                { status: 400 }
            )
        }

        // Verificar se email já existe na empresa
        const { data: existingEmployee } = await supabase
            .from('employees')
            .select('id')
            .eq('company_id', company_id)
            .eq('email', email)
            .single()

        if (existingEmployee) {
            return NextResponse.json(
                { error: 'Funcionário com este e-mail já existe nesta empresa' },
                { status: 409 }
            )
        }

        // Criar funcionário
        const { data: employee, error } = await supabase
            .from('employees')
            .insert({
                company_id,
                manager_id,
                name,
                email,
                invited_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar funcionário:', error)
            return NextResponse.json(
                { error: 'Erro ao criar funcionário' },
                { status: 500 }
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

// DELETE - Excluir funcionário
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const employeeId = searchParams.get('employee_id')

        if (!employeeId) {
            return NextResponse.json(
                { error: 'employee_id é obrigatório' },
                { status: 400 }
            )
        }

        // Verificar se funcionário existe
        const { data: employee } = await supabase
            .from('employees')
            .select('id, name')
            .eq('id', employeeId)
            .single()

        if (!employee) {
            return NextResponse.json(
                { error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        // Excluir funcionário (CASCADE vai excluir progresso automaticamente)
        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', employeeId)

        if (error) {
            console.error('Erro ao excluir funcionário:', error)
            return NextResponse.json(
                { error: 'Erro ao excluir funcionário' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: `Funcionário ${employee.name} excluído com sucesso`
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
