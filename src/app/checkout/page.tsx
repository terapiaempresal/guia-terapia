'use client'

import { useState } from 'react'
import { getFeatureFlags } from '@/lib/feature-flags'
import { isUsingMockDB } from '@/lib/supabase'

interface CheckoutFormData {
    nomeEmpresa: string
    nomeGestor: string
    emailGestor: string
    tempoEmpresa: string
    qtdFuncionarios: number
}

interface LiderFormData {
    nome: string
    email: string
}

export default function CheckoutPage() {
    const [activeTab, setActiveTab] = useState<'equipe' | 'lider'>('equipe')
    const [loading, setLoading] = useState(false)
    const [equipeForm, setEquipeForm] = useState<CheckoutFormData>({
        nomeEmpresa: '',
        nomeGestor: '',
        emailGestor: '',
        tempoEmpresa: '',
        qtdFuncionarios: 5
    })
    const [liderForm, setLiderForm] = useState<LiderFormData>({
        nome: '',
        email: ''
    })

    const flags = getFeatureFlags()
    const precoTotal = equipeForm.qtdFuncionarios * 18

    const handleEquipeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Se pagamentos estão desabilitados, simular aprovação automática
            if (!flags.payments) {
                // Marcar como simulação
                sessionStorage.setItem('payment_simulation', 'true')

                // Salvar dados no Supabase
                try {
                    const companyResponse = await fetch('/api/companies', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            companyName: equipeForm.nomeEmpresa,
                            managerName: equipeForm.nomeGestor,
                            managerEmail: equipeForm.emailGestor,
                            employeeCount: equipeForm.qtdFuncionarios,
                            amount: precoTotal
                        })
                    })

                    const companyData = await companyResponse.json()

                    if (companyResponse.ok) {
                        // Salvar IDs na sessão para uso posterior
                        sessionStorage.setItem('company_id', companyData.company.id)
                        sessionStorage.setItem('manager_id', companyData.manager.id)
                        sessionStorage.setItem('manager_email', equipeForm.emailGestor)
                        console.log('✅ Dados salvos no Supabase:', companyData)
                    } else {
                        console.error('Erro ao salvar dados:', companyData.error)
                    }
                } catch (dbError) {
                    console.error('Erro ao salvar no banco:', dbError)
                }

                // Enviar e-mail de boas-vindas (se habilitado)
                try {
                    await fetch('/api/email/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'welcome-manager',
                            to: equipeForm.emailGestor,
                            data: {
                                managerName: equipeForm.nomeGestor,
                                companyName: equipeForm.nomeEmpresa
                            }
                        })
                    })
                } catch (emailError) {
                    console.log('E-mail não enviado (pode estar desabilitado):', emailError)
                }

                // Simular processamento
                setTimeout(() => {
                    alert('✅ Pagamento simulado com sucesso! Redirecionando...')
                    window.location.href = '/checkout/sucesso?simulation=true'
                }, 1500)
                return
            } const response = await fetch('/api/checkout/asaas/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(equipeForm)
            })

            const data = await response.json()

            if (response.ok) {
                window.location.href = data.checkoutUrl
            } else {
                alert(data.error || 'Erro ao processar pagamento')
            }
        } catch (error) {
            alert('Erro ao processar solicitação')
        } finally {
            setLoading(false)
        }
    }

    const handleLiderSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!liderForm.nome || !liderForm.email) {
            alert('Por favor, preencha todos os campos')
            return
        }

        // Redirecionar para Hotmart
        const hotmartUrl = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL || '#'
        window.location.href = hotmartUrl
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Aviso de desenvolvimento */}
                {isUsingMockDB && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                ⚠️
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Modo de Desenvolvimento
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        As variáveis do Supabase não estão configuradas.
                                        Os dados serão salvos temporariamente no navegador.
                                        Configure SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE no arquivo .env.local
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Escolha sua Jornada
                    </h1>
                    <p className="text-gray-600">
                        Selecione o programa ideal para seu desenvolvimento
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg p-1 shadow-sm border">
                        <button
                            onClick={() => setActiveTab('equipe')}
                            className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'equipe'
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Jornada de Equipe
                        </button>
                        <button
                            onClick={() => setActiveTab('lider')}
                            className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'lider'
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Jornada do Líder
                        </button>
                    </div>
                </div>

                {/* Jornada de Equipe */}
                {activeTab === 'equipe' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="card">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Jornada de Equipe
                            </h2>

                            <form onSubmit={handleEquipeSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome da Empresa
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={equipeForm.nomeEmpresa}
                                        onChange={(e) => setEquipeForm(prev => ({
                                            ...prev,
                                            nomeEmpresa: e.target.value
                                        }))}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nome do Gestor
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="input"
                                            value={equipeForm.nomeGestor}
                                            onChange={(e) => setEquipeForm(prev => ({
                                                ...prev,
                                                nomeGestor: e.target.value
                                            }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            E-mail do Gestor
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="input"
                                            value={equipeForm.emailGestor}
                                            onChange={(e) => setEquipeForm(prev => ({
                                                ...prev,
                                                emailGestor: e.target.value
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tempo na Empresa
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: 2 anos"
                                            className="input"
                                            value={equipeForm.tempoEmpresa}
                                            onChange={(e) => setEquipeForm(prev => ({
                                                ...prev,
                                                tempoEmpresa: e.target.value
                                            }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantidade de Funcionários (mínimo 5 funcionários)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="5"
                                            className="input"
                                            value={equipeForm.qtdFuncionarios}
                                            onChange={(e) => setEquipeForm(prev => ({
                                                ...prev,
                                                qtdFuncionarios: parseInt(e.target.value) || 5
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="bg-primary-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">
                                            {equipeForm.qtdFuncionarios} funcionários × R$ 18
                                        </span>
                                        <span className="text-2xl font-bold text-primary-600">
                                            R$ {precoTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary"
                                >
                                    {loading ? 'Processando...' : flags.payments ? 'Pagar com Asaas' : 'Simular Pagamento (Dev)'}
                                </button>

                                {!flags.payments && (
                                    <p className="text-sm text-warning-600 text-center bg-warning-50 p-3 rounded-lg">
                                        🧪 <strong>Modo Desenvolvimento:</strong> O pagamento será simulado automaticamente
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Jornada do Líder */}
                {activeTab === 'lider' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="card">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Jornada do Líder
                            </h2>

                            <form onSubmit={handleLiderSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={liderForm.nome}
                                        onChange={(e) => setLiderForm(prev => ({
                                            ...prev,
                                            nome: e.target.value
                                        }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="input"
                                        value={liderForm.email}
                                        onChange={(e) => setLiderForm(prev => ({
                                            ...prev,
                                            email: e.target.value
                                        }))}
                                    />
                                </div>

                                <button type="submit" className="btn-primary w-full">
                                    Ir para Hotmart
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
