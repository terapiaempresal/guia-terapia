import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar funcionários arquivados de uma empresa
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

        const { data: employees, error } = await supabase
            .from('employees')
            .select(`
                *,
                company:companies(name),
                manager:managers(name, email)
            `)
            .eq('company_id', companyId)
            .eq('archived', true) // Filtrar apenas funcionários arquivados
            .order('archived_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar funcionários arquivados:', error)
            return NextResponse.json(
                { error: 'Erro ao buscar funcionários arquivados' },
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

// POST - Desarquivar funcionário
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { employeeId } = body

        if (!employeeId) {
            return NextResponse.json(
                { error: 'employeeId é obrigatório' },
                { status: 400 }
            )
        }

        // Desarquivar o funcionário
        const { data: unarchivedData, error: unarchiveError } = await supabase
            .from('employees')
            .update({
                archived: false,
                archived_at: null
            })
            .eq('id', employeeId)
            .eq('archived', true) // Só desarquivar se estiver arquivado
            .select()

        if (unarchiveError) {
            console.error('Erro ao desarquivar funcionário:', unarchiveError)
            return NextResponse.json(
                { error: 'Erro ao desarquivar funcionário' },
                { status: 500 }
            )
        }

        if (!unarchivedData || unarchivedData.length === 0) {
            return NextResponse.json(
                { error: 'Funcionário não encontrado ou não estava arquivado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Funcionário desarquivado com sucesso',
            employee: unarchivedData[0]
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}