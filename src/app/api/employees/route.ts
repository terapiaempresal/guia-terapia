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

        // Para cada funcionário, buscar o progresso de vídeos
        const employeesWithProgress = await Promise.all(
            (employees || []).map(async (employee: any) => {
                // Buscar progresso de vídeos do funcionário
                const { data: progress, error: progressError } = await supabase
                    .from('employee_progress')
                    .select('video_id, completed')
                    .eq('employee_id', employee.id)
                    .eq('completed', true)

                if (progressError) {
                    console.error(`Erro ao buscar progresso do funcionário ${employee.id}:`, progressError)
                    return {
                        ...employee,
                        videosWatched: 0
                    }
                }

                return {
                    ...employee,
                    videosWatched: progress?.length || 0
                }
            })
        )

        return NextResponse.json({
            success: true,
            employees: employeesWithProgress
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

        console.log('🗑️ [API Delete] Recebida requisição para excluir funcionário:', employeeId)

        if (!employeeId) {
            console.error('❌ [API Delete] employee_id não fornecido')
            return NextResponse.json(
                { error: 'employee_id é obrigatório' },
                { status: 400 }
            )
        }

        // Verificar se funcionário existe
        console.log('🔍 [API Delete] Verificando se funcionário existe...')
        const { data: employee, error: fetchError } = await supabase
            .from('employees')
            .select('id, name, full_name')
            .eq('id', employeeId)
            .single()

        if (fetchError) {
            console.error('❌ [API Delete] Erro ao buscar funcionário:', fetchError)
            return NextResponse.json(
                { error: 'Erro ao buscar funcionário' },
                { status: 500 }
            )
        }

        if (!employee) {
            console.error('❌ [API Delete] Funcionário não encontrado:', employeeId)
            return NextResponse.json(
                { error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        console.log('✅ [API Delete] Funcionário encontrado:', employee.name || employee.full_name)

        // Excluir funcionário (CASCADE vai excluir progresso automaticamente)
        console.log('🗑️ [API Delete] Executando exclusão...')
        const { data: deletedData, error, count } = await supabase
            .from('employees')
            .delete()
            .eq('id', employeeId)
            .select()

        console.log('🔍 [API Delete] Resultado da exclusão:', {
            error: error,
            deletedData: deletedData,
            count: count,
            employeeId: employeeId
        })

        if (error) {
            console.error('❌ [API Delete] Erro ao excluir funcionário:', error)
            return NextResponse.json(
                { error: 'Erro ao excluir funcionário: ' + error.message },
                { status: 500 }
            )
        }

        if (!deletedData || deletedData.length === 0) {
            console.error('❌ [API Delete] Nenhum registro foi excluído - funcionário pode já ter sido removido')
            // Se o funcionário não existe mais, consideramos como sucesso
            // pois o objetivo (não ter o funcionário) foi alcançado
            return NextResponse.json({
                success: true,
                message: 'Funcionário já foi removido anteriormente',
                alreadyDeleted: true
            })
        }

        console.log('✅ [API Delete] Funcionário excluído com sucesso!')
        return NextResponse.json({
            success: true,
            message: `Funcionário ${employee.name || employee.full_name} excluído com sucesso`
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
