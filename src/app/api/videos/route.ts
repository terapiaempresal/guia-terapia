import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        // Pegar parâmetros da query
        const { searchParams } = request.nextUrl
        const companyId = searchParams.get('company_id')
        const managerId = searchParams.get('manager_id')

        let query = supabase
            .from('videos')
            .select('*')
            .order('display_order', { ascending: true })

        if (companyId || managerId) {
            // Se tem company_id ou manager_id, buscar:
            // 1. Vídeos do sistema (created_by_type = 'system')
            // 2. Vídeos específicos da empresa (created_by_type = 'company' AND company_id = empresa)
            query = query.or(`created_by_type.eq.system,and(created_by_type.eq.company,company_id.eq.${companyId})`)
        }

        const { data: videos, error } = await query

        if (error) throw error

        console.log(`📺 Retornando ${videos?.length || 0} vídeos para empresa ${companyId}`)

        return NextResponse.json({ videos })

    } catch (error) {
        console.error('Erro ao buscar vídeos:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
