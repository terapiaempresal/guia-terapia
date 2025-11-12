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
            email,
            full_name,
            cpf,
            birth_date,
            whatsapp
        } = body

        // Se é auto-cadastro (sem manager_id), buscar o manager da empresa
        let finalManagerId = manager_id
        if (!manager_id && company_id) {
            // Buscar o manager através da tabela managers filtrado por company_id
            const { data: manager } = await supabase
                .from('managers')
                .select('id')
                .eq('company_id', company_id)
                .single()

            if (manager) {
                finalManagerId = manager.id
            }
        }

        // Usar full_name se fornecido, senão usar name
        const finalName = full_name || name

        // Validações
        if (!company_id || !finalManagerId || !finalName || !email) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: company_id, name/full_name, email' },
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

        // Verificar se CPF já existe (se foi fornecido)
        if (cpf) {
            // Limpar o CPF (remover pontos e traços)
            const cleanCPF = cpf.replace(/\D/g, '')

            const { data: existingCPF } = await supabase
                .from('employees')
                .select('id, name, email, company_id')
                .eq('cpf', cleanCPF)
                .single()

            if (existingCPF) {
                return NextResponse.json(
                    {
                        error: 'CPF já cadastrado no sistema',
                        message: `Este CPF já está cadastrado para o funcionário "${existingCPF.name}" (${existingCPF.email})`,
                        existingEmployee: {
                            name: existingCPF.name,
                            email: existingCPF.email
                        }
                    },
                    { status: 409 }
                )
            }
        }

        // Criar funcionário
        const employeeData: any = {
            company_id,
            manager_id: finalManagerId,
            name: finalName,
            email,
            invited_at: new Date().toISOString()
        }

        // Adicionar campos opcionais se fornecidos
        if (cpf) {
            // Salvar CPF apenas com números (limpo)
            employeeData.cpf = cpf.replace(/\D/g, '')
        }
        if (birth_date) employeeData.birth_date = birth_date
        if (whatsapp) employeeData.whatsapp = whatsapp
        if (full_name) employeeData.full_name = full_name

        const { data: employee, error } = await supabase
            .from('employees')
            .insert(employeeData)
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
