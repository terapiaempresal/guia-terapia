'use client'

import { useEffect, useState } from 'react'

export default function CheckoutSuccessPage() {
    const [isSimulation, setIsSimulation] = useState(false)

    useEffect(() => {
        // Verifica se veio de uma simulação (pode usar sessionStorage ou URL params)
        const urlParams = new URLSearchParams(window.location.search)
        setIsSimulation(urlParams.get('simulation') === 'true' ||
            sessionStorage.getItem('payment_simulation') === 'true')

        // Limpa o sessionStorage
        sessionStorage.removeItem('payment_simulation')
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center">
                    <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {isSimulation ? 'Pagamento Simulado!' : 'Pagamento Realizado!'}
                    </h1>

                    {isSimulation && (
                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-warning-800">
                                🧪 <strong>Modo Desenvolvimento:</strong> Este foi um pagamento simulado para testes
                            </p>
                        </div>
                    )}

                    <p className="text-gray-600 mb-6">
                        {isSimulation
                            ? 'A simulação foi processada com sucesso. Em produção, você receberia um e-mail com as instruções de acesso.'
                            : 'Seu pagamento foi processado com sucesso. Em breve você receberá um e-mail com as instruções de acesso.'
                        }
                    </p>

                    <div className="space-y-3">
                        <a href="/gestor" className="btn-primary w-full text-center block">
                            Ir para Painel do Gestor
                        </a>

                        <a href="/" className="btn-secondary w-full text-center block">
                            Voltar ao Início
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
