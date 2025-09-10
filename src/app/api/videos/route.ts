import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const { data: videos, error } = await supabase
            .from('videos')
            .select('*')
            .order('id')

        if (error) throw error

        return NextResponse.json({ videos })

    } catch (error) {
        console.error('Erro ao buscar vídeos:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
