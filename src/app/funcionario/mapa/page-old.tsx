'use client'

import { useState, useEffect } from 'react'

interface EmployeeData {
    id: string
    name: string
    journey_filled: boolean
    journey_filled_at: string | null
    journey_result_html: string | null
}

export default function ClarityMapPage() {
    const [employee, setEmployee] = useState<EmployeeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadEmployeeData()
    }, [])

    const loadEmployeeData = async () => {
        try {
            const employeeData = localStorage.getItem('employee')
            if (!employeeData) {
                setError('Dados do funcionário não encontrados')
                return
            }

            const emp = JSON.parse(employeeData)
            
            // Buscar dados atualizados do servidor
            const response = await fetch('/api/employees/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId: emp.id })
            })

            if (response.ok) {
                const data = await response.json()
                setEmployee(data.employee)
            } else {
                setEmployee(emp)
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
            setError('Erro ao carregar dados do funcionário')
        } finally {
            setLoading(false)
        }
    }

    const handleStartJourney = () => {
        if (!employee) return
        
        // Redirecionar para formulário externo com ID do funcionário
        const url = `https://terapiaempresarial.com.br/formulario/?employee_id=${employee.id}`
        window.open(url, '_blank')
    }

    const canViewResult = () => {
        if (!employee?.journey_filled || !employee.journey_filled_at) return false
        
        const filledAt = new Date(employee.journey_filled_at)
        const now = new Date()
        const hoursPassed = (now.getTime() - filledAt.getTime()) / (1000 * 60 * 60)
        
        return hoursPassed >= 52 // 52 horas = 2 dias e 4 horas
    }

    const getStatusBadge = () => {
        if (!employee) return null

        if (!employee.journey_filled) {
            return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Não iniciado</span>
        }

        if (employee.journey_filled && !canViewResult()) {
            return <span className="bg-warning-100 text-warning-800 px-3 py-1 rounded-full text-sm">Processando resultado</span>
        }

        return <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm">Resultado disponível</span>
    }

    const getTimeUntilResult = () => {
        if (!employee?.journey_filled_at) return null
        
        const filledAt = new Date(employee.journey_filled_at)
        const releaseTime = new Date(filledAt.getTime() + (52 * 60 * 60 * 1000)) // + 52 horas
        const now = new Date()
        
        if (now >= releaseTime) return null
        
        const hoursLeft = Math.ceil((releaseTime.getTime() - now.getTime()) / (1000 * 60 * 60))
        return hoursLeft
    }

    const getStatusBadge = () => {
        switch (mapStatus) {
            case 'not_started':
                return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Não iniciado</span>
            case 'in_progress':
                return <span className="bg-warning-100 text-warning-800 px-3 py-1 rounded-full text-sm">Em andamento</span>
            case 'done':
                return <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm">Concluído</span>
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Botão Voltar */}
                <div className="mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar ao Dashboard
                    </button>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Mapa de Clareza
                        </h1>
                        {getStatusBadge()}
                    </div>

                    <p className="text-gray-600">
                        Descubra seu perfil de liderança e áreas de desenvolvimento
                    </p>
                </div>

                {mapStatus === 'not_started' && (
                    <div className="card text-center">
                        <div className="mb-6">
                            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Pronto para descobrir seu perfil?
                            </h2>

                            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                O Mapa de Clareza é uma ferramenta personalizada que identifica seus pontos fortes,
                                áreas de desenvolvimento e oferece recomendações específicas para seu crescimento.
                            </p>
                        </div>

                        <button
                            onClick={handleStartMap}
                            className="btn-primary inline-block"
                        >
                            Iniciar Mapa de Clareza
                        </button>
                    </div>
                )}

                {mapStatus === 'in_progress' && (
                    <div className="card text-center">
                        <div className="animate-pulse">
                            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="animate-spin w-8 h-8 text-warning-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Processando seu perfil...
                            </h2>

                            <p className="text-gray-600">
                                Estamos analisando suas respostas para gerar seu Mapa de Clareza personalizado
                            </p>
                        </div>
                    </div>
                )}

                {mapStatus === 'done' && mapResult && (
                    <div className="space-y-6">
                        {/* Perfil Principal */}
                        <div className="card">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {mapResult.perfil}
                                </h2>

                                <p className="text-gray-600">
                                    Seu perfil de liderança identificado
                                </p>
                            </div>
                        </div>

                        {/* Pontos Fortes */}
                        <div className="card">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <svg className="w-6 h-6 text-success-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Seus Pontos Fortes
                            </h3>

                            <div className="grid md:grid-cols-2 gap-3">
                                {mapResult.pontos_fortes.map((ponto, index) => (
                                    <div key={index} className="flex items-center p-3 bg-success-50 rounded-lg">
                                        <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-success-800">{ponto}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Áreas de Desenvolvimento */}
                        <div className="card">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <svg className="w-6 h-6 text-warning-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Áreas de Desenvolvimento
                            </h3>

                            <div className="space-y-3">
                                {mapResult.areas_desenvolvimento.map((area, index) => (
                                    <div key={index} className="flex items-center p-3 bg-warning-50 rounded-lg">
                                        <svg className="w-5 h-5 text-warning-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-warning-800">{area}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recomendações */}
                        <div className="card">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <svg className="w-6 h-6 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Recomendações Personalizadas
                            </h3>

                            <div className="space-y-3">
                                {mapResult.recomendacoes.map((recomendacao, index) => (
                                    <div key={index} className="flex items-start p-4 bg-primary-50 rounded-lg">
                                        <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                            <span className="text-primary-600 text-sm font-medium">{index + 1}</span>
                                        </div>
                                        <span className="text-primary-800">{recomendacao}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
