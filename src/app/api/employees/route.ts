import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - Listar funcionários de uma empresa
export async function GET(request: NextRequest) {
    try {
        // Pegar manager_id dos query parameters
        const { searchParams } = new URL(request.url)
        const managerId = searchParams.get('manager_id')

        console.log('🔍 Manager ID recebido:', managerId)

        let query = supabase
            .from('employees')
            .select(`
                id, 
                full_name, 
                name,
                email, 
                archived, 
                invited_at,
                accepted_at,
                journey_filled,
                journey_filled_at,
                created_at, 
                manager_id
            `)
            .order('created_at', { ascending: false })

        // Se tiver manager_id, filtrar por ele
        if (managerId) {
            query = query.eq('manager_id', managerId)
        }

        const { data: employees, error } = await query

        if (error) {
            console.error('Erro ao buscar funcionários:', error)
            return NextResponse.json(
                { success: false, error: 'Erro ao buscar funcionários' },
                { status: 500 }
            )
        }

        // Processar dados para incluir status calculados
        const processedEmployees = await Promise.all(employees?.map(async (emp: any) => {
            // Determinar status do funcionário
            let status = 'Convidado'
            if (emp.archived) {
                status = 'Arquivado'
            } else if (emp.accepted_at || emp.journey_filled) {
                // Se aceitou convite OU já preencheu o mapa, consideramos ativo
                status = 'Ativo'
            }

            // Determinar status do mapa de clareza
            let mapStatus = 'Não iniciado'
            if (emp.journey_filled) {
                mapStatus = 'Concluído'
            } else if (emp.invited_at && !emp.journey_filled) {
                mapStatus = 'Aguardando retorno'
            }

            // Buscar progresso de vídeos do funcionário
            let videosWatched = 0
            try {
                const { data: progress } = await supabase
                    .from('employee_progress')
                    .select('video_id, completed')
                    .eq('employee_id', emp.id)
                    .eq('completed', true)

                videosWatched = progress?.length || 0
            } catch (error) {
                console.error('Erro ao buscar progresso de vídeos:', error)
            }

            return {
                id: emp.id,
                full_name: emp.full_name || emp.name,
                email: emp.email,
                status,
                mapStatus,
                archived: emp.archived,
                created_at: emp.created_at,
                manager_id: emp.manager_id,
                videosWatched
            }
        }) || [])

        console.log('📊 Funcionários processados:', processedEmployees.length)
        console.log('👥 Funcionários:', processedEmployees.map((e: any) => `${e.full_name} (${e.status} - ${e.mapStatus})`))

        return NextResponse.json({
            success: true,
            employees: processedEmployees
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
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

// DELETE - Arquivar funcionário (soft delete)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const employeeId = searchParams.get('employee_id')

        console.log('� [API Archive] Recebida requisição para arquivar funcionário:', employeeId)

        if (!employeeId) {
            console.error('❌ [API Archive] employee_id não fornecido')
            return NextResponse.json(
                { error: 'employee_id é obrigatório' },
                { status: 400 }
            )
        }

        // Verificar se funcionário existe e não está arquivado
        console.log('🔍 [API Archive] Verificando se funcionário existe...')
        const { data: employee, error: fetchError } = await supabaseAdmin
            .from('employees')
            .select('id, name, full_name, archived')
            .eq('id', employeeId)
            .single()

        if (fetchError) {
            console.error('❌ [API Archive] Erro ao buscar funcionário:', fetchError)
            return NextResponse.json(
                { error: 'Erro ao buscar funcionário' },
                { status: 500 }
            )
        }

        if (!employee) {
            console.error('❌ [API Archive] Funcionário não encontrado:', employeeId)
            return NextResponse.json(
                { error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        if (employee.archived) {
            console.log('ℹ️ [API Archive] Funcionário já estava arquivado:', employee.name || employee.full_name)
            return NextResponse.json({
                success: true,
                message: 'Funcionário já foi arquivado anteriormente',
                alreadyArchived: true
            })
        }

        console.log('✅ [API Archive] Funcionário encontrado:', employee.name || employee.full_name)

        // Arquivar o funcionário (soft delete)
        const { data: archivedData, error: archiveError } = await supabaseAdmin
            .from('employees')
            .update({
                archived: true,
                archived_at: new Date().toISOString()
            })
            .eq('id', employeeId)
            .select();

        console.log('🔍 [API Archive] Resultado do arquivamento:', {
            error: archiveError,
            archivedData: archivedData,
            employeeId: employeeId
        })

        if (archiveError) {
            console.error('❌ [API Archive] Erro ao arquivar funcionário:', archiveError)
            return NextResponse.json(
                { error: 'Erro ao arquivar funcionário: ' + archiveError.message },
                { status: 500 }
            )
        }

        if (!archivedData || archivedData.length === 0) {
            console.error('❌ [API Archive] Nenhum registro foi arquivado')
            return NextResponse.json({
                success: false,
                message: 'Erro ao arquivar funcionário'
            }, { status: 500 })
        }

        console.log('✅ [API Archive] Funcionário arquivado com sucesso!')
        return NextResponse.json({
            success: true,
            message: `Funcionário ${employee.name || employee.full_name} arquivado com sucesso`,
            archived: true
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
