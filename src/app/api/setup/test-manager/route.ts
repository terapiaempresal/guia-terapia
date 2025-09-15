import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        // Verificar se já existe um gestor teste
        const { data: existingManager } = await supabaseAdmin
            .from('managers')
            .select('*')
            .eq('email', 'gestor@teste.com')
            .single()

        if (existingManager) {
            return NextResponse.json({
                success: true,
                message: 'Gestor teste já existe',
                credentials: {
                    email: 'gestor@teste.com',
                    password: '123456'
                }
            })
        }

        // Criar empresa teste
        const { data: company, error: companyError } = await supabaseAdmin
            .from('companies')
            .insert({
                name: 'Empresa Teste'
            })
            .select()
            .single()

        if (companyError) {
            return NextResponse.json({
                success: false,
                error: 'Erro ao criar empresa: ' + companyError.message
            }, { status: 500 })
        }

        // Criar gestor teste
        const { data: manager, error: managerError } = await supabaseAdmin
            .from('managers')
            .insert({
                name: 'Gestor Teste',
                email: 'gestor@teste.com',
                company_id: company.id
            })
            .select()
            .single()

        if (managerError) {
            return NextResponse.json({
                success: false,
                error: 'Erro ao criar gestor: ' + managerError.message
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Gestor teste criado com sucesso!',
            credentials: {
                email: 'gestor@teste.com',
                password: '123456'
            },
            data: {
                company,
                manager
            }
        })

    } catch (error) {
        console.error('Erro:', error)
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}
