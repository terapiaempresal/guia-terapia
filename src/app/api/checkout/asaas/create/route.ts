import { NextRequest, NextResponse } from 'next/server'
import { requireFeatureFlag } from '@/lib/feature-flags'

export async function POST(request: NextRequest) {
    // Verificar se pagamentos estão habilitados
    const flagCheck = requireFeatureFlag('FLAG_ENABLE_PAYMENTS')
    if (flagCheck) return flagCheck

    try {
        const body = await request.json()
        const { nomeEmpresa, nomeGestor, emailGestor, tempoEmpresa, qtdFuncionarios } = body

        // Validações
        if (!nomeEmpresa || !nomeGestor || !emailGestor || !qtdFuncionarios) {
            return NextResponse.json(
                { error: 'Todos os campos são obrigatórios' },
                { status: 400 }
            )
        }

        if (qtdFuncionarios < 5) {
            return NextResponse.json(
                { error: 'Quantidade mínima de funcionários é 5' },
                { status: 400 }
            )
        }

        const amount = qtdFuncionarios * 18 // R$ 18 por funcionário

        // Mock da integração com Asaas (substituir pela implementação real)
        const mockAsaasResponse = {
            id: 'pay_' + Math.random().toString(36).substr(2, 9),
            status: 'PENDING',
            value: amount,
            invoiceUrl: `${process.env.APP_URL}/checkout/mock-payment?amount=${amount}&company=${encodeURIComponent(nomeEmpresa)}`
        }

        return NextResponse.json({
            success: true,
            checkoutUrl: mockAsaasResponse.invoiceUrl,
            orderId: mockAsaasResponse.id,
            amount: amount
        })

    } catch (error) {
        console.error('Erro no checkout Asaas:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// Implementação real do Asaas (comentada para referência)
/*
async function createAsaasPayment(data: any) {
  const asaasApiKey = process.env.ASAAS_API_KEY
  const asaasEnv = process.env.ASAAS_ENV || 'sandbox'
  const baseUrl = asaasEnv === 'production' 
    ? 'https://www.asaas.com/api/v3' 
    : 'https://sandbox.asaas.com/api/v3'

  const response = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey
    },
    body: JSON.stringify({
      customer: data.customer,
      billingType: 'PIX',
      value: data.amount,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 24h
      description: `Jornada de Equipe - ${data.nomeEmpresa}`,
      externalReference: data.orderId
    })
  })

  return await response.json()
}
*/
