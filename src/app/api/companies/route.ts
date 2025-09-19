import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Criar empresa e gestor (usado no checkout)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            companyName,
            managerName,
            managerEmail,
            employeeCount,
            amount
        } = body

        // Validações
        if (!companyName || !managerName || !managerEmail) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: companyName, managerName, managerEmail' },
                { status: 400 }
            )
        }

        // Verificar se gestor já existe
        const { data: existingManager } = await supabase
            .from('managers')
            .select('id, company_id, company:companies(name)')
            .eq('email', managerEmail)
            .single()

        if (existingManager) {
            return NextResponse.json({
                success: true,
                manager: existingManager,
                company: existingManager.company,
                message: 'Gestor já existe'
            })
        }

        // Criar empresa
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
                name: companyName
            })
            .select()
            .single()

        if (companyError) {
            console.error('Erro ao criar empresa:', companyError)
            return NextResponse.json(
                { error: 'Erro ao criar empresa' },
                { status: 500 }
            )
        }

        // Criar gestor
        const { data: manager, error: managerError } = await supabase
            .from('managers')
            .insert({
                company_id: company.id,
                name: managerName,
                email: managerEmail
            })
            .select()
            .single()

        if (managerError) {
            console.error('Erro ao criar gestor:', managerError)
            return NextResponse.json(
                { error: 'Erro ao criar gestor' },
                { status: 500 }
            )
        }

        // Criar pedido
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                company_id: company.id,
                manager_id: manager.id,
                amount: amount || 0,
                employee_count: employeeCount || 1,
                status: 'completed'
            })
            .select()
            .single()

        if (orderError) {
            console.error('Erro ao criar pedido:', orderError)
            // Não falhar se o pedido não for criado
        }

        return NextResponse.json({
            success: true,
            company,
            manager,
            order
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// GET - Buscar dados da empresa e gestor
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const managerEmail = searchParams.get('manager_email')
        const companyId = searchParams.get('company_id')

        let query = supabase
            .from('managers')
            .select(`
                *,
                company:companies(*)
            `)

        if (managerEmail) {
            query = query.eq('email', managerEmail)
        } else if (companyId) {
            query = query.eq('company_id', companyId)
        } else {
            return NextResponse.json(
                { error: 'manager_email ou company_id é obrigatório' },
                { status: 400 }
            )
        }

        const { data: manager, error } = await query.single()

        if (error) {
            console.error('Erro ao buscar gestor:', error)
            return NextResponse.json(
                { error: 'Gestor não encontrado' },
                { status: 404 }
            )
        }

        // Buscar dados do pedido mais recente para obter employee_count
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('employee_count, amount, status')
            .eq('company_id', manager.company_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (orderError && orderError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Erro ao buscar pedido:', orderError)
        }

        // Adicionar employee_count à empresa
        const companyWithQuota = {
            ...manager.company,
            quota: order?.employee_count || 50 // fallback para 50 se não encontrar pedido
        }

        return NextResponse.json({
            success: true,
            manager,
            company: companyWithQuota,
            order: order || null
        })

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
