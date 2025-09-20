import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        console.log('🔍 Verificando schemas disponíveis...')

        // Tentar buscar funcionários sem especificar schema (deve usar public)
        const { data: employeesPublic, error: errorPublic } = await supabase
            .from('employees')
            .select('id, name, cpf')
            .limit(3)

        // Verificar estrutura da tabela
        const { data: sampleEmployee } = await supabase
            .from('employees')
            .select('*')
            .limit(1)
            .single()

        return NextResponse.json({
            public_schema: {
                error: errorPublic?.message || null,
                count: employeesPublic?.length || 0,
                employees: employeesPublic || [],
                sampleColumns: sampleEmployee ? Object.keys(sampleEmployee) : []
            }
        })

    } catch (error) {
        console.error('❌ Erro:', error)
        return NextResponse.json({
            error: 'Erro interno',
            debug: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}