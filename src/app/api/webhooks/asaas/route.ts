import { NextRequest, NextResponse } from 'next/server'
import { requireFeatureFlag } from '@/lib/feature-flags'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    // Verificar se webhooks estão habilitados
    const flagCheck = requireFeatureFlag('FLAG_ENABLE_WEBHOOKS')
    if (flagCheck) return flagCheck

    try {
        const signature = request.headers.get('asaas-signature')
        const body = await request.text()

        // Verificar assinatura do webhook (implementar validação real)
        const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET
        if (!signature || !webhookSecret) {
            return NextResponse.json(
                { error: 'Assinatura inválida' },
                { status: 401 }
            )
        }

        const payload = JSON.parse(body)

        // Log do webhook
        await supabaseAdmin
            .from('app.webhook_logs')
            .insert({
                provider: 'asaas',
                event_type: payload.event,
                payload: payload,
                signature: signature,
                handled: false
            })

        // Processar apenas eventos de pagamento aprovado
        if (payload.event === 'PAYMENT_CONFIRMED' || payload.event === 'PAYMENT_RECEIVED') {
            await handlePaymentApproved(payload.payment)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Erro no webhook Asaas:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

async function handlePaymentApproved(payment: any) {
    try {
        // 1. Criar/atualizar empresa
        const { data: company, error: companyError } = await supabaseAdmin
            .from('app.companies')
            .upsert({
                name: payment.description || 'Empresa sem nome',
                employees_quota: Math.floor(payment.value / 18),
                plan: 'equipe',
                status: 'active'
            })
            .select()
            .single()

        if (companyError) throw companyError

        // 2. Criar pedido
        await supabaseAdmin
            .from('app.orders')
            .insert({
                provider: 'asaas',
                provider_order_id: payment.id,
                company_id: company.id,
                quantity: Math.floor(payment.value / 18),
                unit_price_cents: 1800,
                currency: 'BRL',
                status: 'paid',
                paid_at: new Date().toISOString()
            })

        // 3. TODO: Criar manager e enviar e-mail
        // Implementar quando tiver os dados do gestor no payload

        console.log('Pagamento processado com sucesso:', payment.id)

    } catch (error) {
        console.error('Erro ao processar pagamento aprovado:', error)
        throw error
    }
}
