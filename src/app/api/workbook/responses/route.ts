import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-super-secreta-aqui'

interface WorkbookField {
    field_key: string
    field_label: string
    field_type: string
    section: string
    value?: string
}

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticação
        const authHeader = request.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
        }

        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, JWT_SECRET) as any

        if (decoded.type !== 'employee') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const employeeId = decoded.id
        const supabase = supabaseAdmin

        // Buscar respostas do funcionário
        const { data, error } = await supabase
            .from('employee_workbook_responses')
            .select('field_key, value')
            .eq('employee_id', employeeId)

        if (error) {
            console.error('Erro ao buscar respostas:', error)
            return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
        }

        return NextResponse.json(data || [])

    } catch (error) {
        console.error('Erro no GET /api/workbook/responses:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticação
        const authHeader = request.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
        }

        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, JWT_SECRET) as any

        if (decoded.type !== 'employee') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const employeeId = decoded.id
        const { field_key, value } = await request.json()

        if (!field_key) {
            return NextResponse.json({ error: 'field_key é obrigatório' }, { status: 400 })
        }

        // Mapear field_key para dados estruturados
        const fieldData = getFieldData(field_key)

        const supabase = supabaseAdmin

        // Upsert (insert or update)
        const { data, error } = await supabase
            .from('employee_workbook_responses')
            .upsert({
                employee_id: employeeId,
                field_key,
                field_label: fieldData.field_label,
                field_type: fieldData.field_type,
                section: fieldData.section,
                value: value || ''
            }, {
                onConflict: 'employee_id,field_key'
            })

        if (error) {
            console.error('Erro ao salvar resposta:', error)
            return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Erro no POST /api/workbook/responses:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

function getFieldData(fieldKey: string): { field_label: string; field_type: string; section: string } {
    const fieldMap: Record<string, { field_label: string; field_type: string; section: string }> = {
        // Cápsula do Tempo
        'capsula_desafio': {
            field_label: 'Qual é o maior desafio ou frustração que você sente na sua carreira hoje?',
            field_type: 'textarea',
            section: 'capsula_tempo'
        },
        'capsula_futuro': {
            field_label: 'Onde você gostaria de estar profissionalmente daqui a um ano?',
            field_type: 'textarea',
            section: 'capsula_tempo'
        },
        'capsula_sentimento': {
            field_label: 'Qual sentimento você mais busca no seu dia a dia de trabalho?',
            field_type: 'textarea',
            section: 'capsula_tempo'
        },

        // Roda da Vida Profissional
        'roda_realizacao': {
            field_label: '1. Realização com o Trabalho',
            field_type: 'radio',
            section: 'roda_vida'
        },
        'roda_remuneracao': {
            field_label: '2. Remuneração e Benefícios',
            field_type: 'radio',
            section: 'roda_vida'
        },
        'roda_crescimento': {
            field_label: '3. Oportunidades de Crescimento',
            field_type: 'radio',
            section: 'roda_vida'
        },
        'roda_lideranca': {
            field_label: '4. Relacionamento com a Liderança',
            field_type: 'radio',
            section: 'roda_vida'
        },
        'roda_pares': {
            field_label: '5. Relacionamento com Pares',
            field_type: 'radio',
            section: 'roda_vida'
        },
        'roda_equilibrio': {
            field_label: '6. Equilíbrio Vida/Trabalho',
            field_type: 'radio',
            section: 'roda_vida'
        },
        'roda_ambiente': {
            field_label: '7. Ambiente e Cultura',
            field_type: 'radio',
            section: 'roda_vida'
        },
        'roda_energia': {
            field_label: '8. Energia e Bem-estar Físico',
            field_type: 'radio',
            section: 'roda_vida'
        },
        'roda_analise_1': {
            field_label: 'Qual área da sua roda com a nota mais baixa mais te surpreendeu? Por quê?',
            field_type: 'textarea',
            section: 'roda_vida'
        },
        'roda_analise_2': {
            field_label: 'Qual única área, se você melhorasse em 10% nos próximos 90 dias, teria o maior impacto positivo em todas as outras?',
            field_type: 'textarea',
            section: 'roda_vida'
        },

        // Matriz de Habilidades
        'matriz_forcas': {
            field_label: 'Suas Principais FORÇAS',
            field_type: 'textarea',
            section: 'matriz_habilidades'
        },
        'matriz_paixoes': {
            field_label: 'Suas Principais PAIXÕES',
            field_type: 'textarea',
            section: 'matriz_habilidades'
        },
        'matriz_oportunidades': {
            field_label: 'Sua ZONA DE OPORTUNIDADE',
            field_type: 'textarea',
            section: 'matriz_habilidades'
        },

        // Plano de Ação 90 Dias
        'plano_prioridade': {
            field_label: 'Sua ÚNICA Prioridade',
            field_type: 'textarea',
            section: 'plano_90_dias'
        },
        'plano_acoes': {
            field_label: 'Ações Específicas',
            field_type: 'textarea',
            section: 'plano_90_dias'
        },
        'plano_medicao': {
            field_label: 'Como você vai medir o progresso?',
            field_type: 'textarea',
            section: 'plano_90_dias'
        },
        'plano_acompanhamento': {
            field_label: 'Qual será seu sistema de acompanhamento?',
            field_type: 'textarea',
            section: 'plano_90_dias'
        },

        // Compromisso e Reflexão Final
        'compromisso_pessoal': {
            field_label: 'Escreva seu compromisso pessoal com esta jornada',
            field_type: 'textarea',
            section: 'reflexao_final'
        },
        'mensagem_futuro': {
            field_label: 'Mensagem para o "Eu do Futuro"',
            field_type: 'textarea',
            section: 'reflexao_final'
        },
        'maior_insight': {
            field_label: 'Qual foi o maior insight ou descoberta ao preencher este caderno?',
            field_type: 'textarea',
            section: 'reflexao_final'
        }
    }

    return fieldMap[fieldKey] || {
        field_label: fieldKey,
        field_type: 'textarea',
        section: 'geral'
    }
}