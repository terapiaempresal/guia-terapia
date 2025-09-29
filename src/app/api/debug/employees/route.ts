import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Debug: Listar TODOS os funcionários sem filtros
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const companyId = searchParams.get('company_id')

        console.log('🔍 [DEBUG] Recebendo requisição para company_id:', companyId)

        if (!companyId) {
            return NextResponse.json(
                { error: 'company_id é obrigatório' },
                { status: 400 }
            )
        }

        // Buscar TODOS os funcionários sem filtros
        const { data: allEmployees, error: allError } = await supabase
            .from('employees')
            .select('*')
            .eq('company_id', companyId)

        console.log('🔍 [DEBUG] Todos os funcionários encontrados:', {
            count: allEmployees?.length || 0,
            employees: allEmployees?.map((emp: any) => ({
                id: emp.id,
                name: emp.name,
                email: emp.email,
                archived: emp.archived,
                created_at: emp.created_at
            })) || [],
            error: allError
        })

        // Buscar funcionários com relacionamentos
        const { data: employeesWithJoins, error: joinError } = await supabase
            .from('employees')
            .select(`
                *,
                company:companies(name),
                manager:managers(name, email)
            `)
            .eq('company_id', companyId)

        console.log('🔍 [DEBUG] Funcionários com joins:', {
            count: employeesWithJoins?.length || 0,
            error: joinError
        })

        return NextResponse.json({
            success: true,
            debug: {
                companyId,
                allEmployeesCount: allEmployees?.length || 0,
                allEmployees: allEmployees || [],
                joinEmployeesCount: employeesWithJoins?.length || 0,
                joinEmployees: employeesWithJoins || [],
                allError,
                joinError
            }
        })

    } catch (error) {
        console.error('🔍 [DEBUG] Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor', details: error },
            { status: 500 }
        )
    }
}