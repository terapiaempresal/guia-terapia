'use client'

import { useState, useEffect } from 'react'

interface EmployeeData {
    id: string
    name: string
    cpf?: string
    journey_filled: boolean
    journey_filled_at: string | null
    journey_result_html: string | null
}

export default function ClarityMapPage() {
    const [employee, setEmployee] = useState<EmployeeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isDebugMode, setIsDebugMode] = useState(false)

    useEffect(() => {
        loadEmployeeData()

        // Verificar se está no modo debug
        setIsDebugMode(window.location.search.includes('debug=true'))

        // Atualizar cronômetro a cada segundo para countdown dinâmico
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000) // 1 segundo

        return () => clearInterval(timer)
    }, [])

    const loadEmployeeData = async () => {
        try {
            console.log('🔄 Iniciando carregamento dos dados do funcionário...')

            const employeeData = localStorage.getItem('employee')
            console.log('🔍 Dados do localStorage (employee):', employeeData)

            // Também verificar os dados individuais como debug
            const userType = localStorage.getItem('userType')
            const employeeId = localStorage.getItem('employeeId')
            const employeeName = localStorage.getItem('employeeName')
            console.log('🔍 Dados individuais:', { userType, employeeId, employeeName })

            if (employeeData) {
                const emp = JSON.parse(employeeData)
                console.log('👤 Dados parseados:', emp)

                setEmployee({
                    id: emp.id || 'temp-id',
                    name: emp.name || 'Funcionário',
                    cpf: emp.cpf || '000.000.000-00',
                    journey_filled: emp.journey_filled || false,
                    journey_filled_at: emp.journey_filled_at || null,
                    journey_result_html: emp.journey_result_html || null
                })
                console.log('✅ Dados do funcionário carregados do localStorage')
            } else {
                // Fallback: tentar ler dos itens individuais do localStorage
                const employeeId = localStorage.getItem('employeeId')
                const employeeName = localStorage.getItem('employeeName')

                console.log('🔍 Tentando dados individuais:', { employeeId, employeeName })

                if (employeeId) {
                    // Buscar dados completos do funcionário na API
                    console.log('📡 Buscando dados completos na API...')
                    const response = await fetch(`/api/employees/${employeeId}`)

                    if (response.ok) {
                        const employeeApiData = await response.json()
                        console.log('✅ Dados da API:', employeeApiData)

                        setEmployee({
                            id: employeeApiData.id,
                            name: employeeApiData.full_name || employeeApiData.name,
                            cpf: employeeApiData.cpf,
                            journey_filled: employeeApiData.journey_filled || false,
                            journey_filled_at: employeeApiData.journey_filled_at || null,
                            journey_result_html: employeeApiData.journey_result_html || null
                        })

                        // Salvar os dados completos para próximas vezes
                        localStorage.setItem('employee', JSON.stringify({
                            id: employeeApiData.id,
                            name: employeeApiData.full_name || employeeApiData.name,
                            cpf: employeeApiData.cpf,
                            journey_filled: employeeApiData.journey_filled || false,
                            journey_filled_at: employeeApiData.journey_filled_at || null,
                            journey_result_html: employeeApiData.journey_result_html || null
                        }))
                        console.log('💾 Dados salvos no localStorage para próximas vezes')
                    } else {
                        console.log('⚠️ Erro na API, usando dados padrão')
                        setEmployee({
                            id: employeeId,
                            name: employeeName || 'Funcionário',
                            cpf: '000.000.000-00',
                            journey_filled: false,
                            journey_filled_at: null,
                            journey_result_html: null
                        })
                    }
                } else {
                    // Mesmo sem dados do localStorage, mostrar interface
                    console.log('⚠️ Sem dados no localStorage, usando dados padrão')
                    setEmployee({
                        id: 'demo-id',
                        name: 'Funcionário',
                        cpf: '000.000.000-00',
                        journey_filled: false,
                        journey_filled_at: null,
                        journey_result_html: null
                    })
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error)
            // Sempre mostrar interface, mesmo com erro
            setEmployee({
                id: 'demo-id',
                name: 'Funcionário',
                cpf: '000.000.000-00',
                journey_filled: false,
                journey_filled_at: null,
                journey_result_html: null
            })
        } finally {
            setLoading(false)
        }
    }

    const handleStartJourney = () => {
        if (!employee) return

        // Redirecionar para formulário externo com CPF do funcionário
        const cpfForUrl = employee.cpf?.replace(/\D/g, '') || employee.id
        const url = `https://terapiaempresarial.com.br/formulario/?cpf=${cpfForUrl}`
        window.open(url, '_blank')
    }

    const canViewResult = () => {
        if (!employee?.journey_filled || !employee.journey_filled_at) return false

        const filledAt = new Date(employee.journey_filled_at)
        const now = new Date()
        const hoursPassed = (now.getTime() - filledAt.getTime()) / (1000 * 60 * 60)

        // DEBUG: Para testes, usar parâmetro debug=true na URL
        const debugMode = window.location.search.includes('debug=true')
        const requiredHours = debugMode ? 0 : 72 // 72 horas = 3 dias

        return hoursPassed >= requiredHours
    }

    const getTimeUntilResult = () => {
        if (!employee?.journey_filled_at) return null

        const filledAt = new Date(employee.journey_filled_at)
        const releaseTime = new Date(filledAt.getTime() + (72 * 60 * 60 * 1000)) // + 72 horas (3 dias)

        if (currentTime >= releaseTime) return null

        const timeDiff = releaseTime.getTime() - currentTime.getTime()

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

        return { days, hours, minutes, seconds }
    }

    const renderCleanTimer = () => {
        const timeLeft = getTimeUntilResult()
        if (!timeLeft) return null

        const { days, hours, minutes, seconds } = timeLeft
        const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds
        const totalOriginalSeconds = 72 * 60 * 60 // 3 dias em segundos
        const progress = ((totalOriginalSeconds - totalSeconds) / totalOriginalSeconds) * 100

        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        ⏰ Seu resultado estará disponível em:
                    </h3>

                    {/* Barra de progresso limpa */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                        Progresso: {progress.toFixed(1)}%
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                    {/* Dias */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {days}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                            {days === 1 ? 'Dia' : 'Dias'}
                        </div>
                    </div>

                    {/* Horas */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {hours}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                            {hours === 1 ? 'Hora' : 'Horas'}
                        </div>
                    </div>

                    {/* Minutos */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {minutes}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                            {minutes === 1 ? 'Minuto' : 'Minutos'}
                        </div>
                    </div>

                    {/* Segundos */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {seconds}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                            {seconds === 1 ? 'Segundo' : 'Segundos'}
                        </div>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                        📊 Nossos especialistas estão preparando seu relatório personalizado
                    </p>
                </div>
            </div>
        )
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Banner de Debug */}
            {isDebugMode && (
                <div className="max-w-4xl mx-auto mb-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div>
                                <div className="font-medium text-yellow-800">
                                    Modo Debug Ativo
                                </div>
                                <div className="text-sm text-yellow-700">
                                    Prazo de 3 dias ignorado para testes
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            Mapa de Jornada Comportamental
                        </h1>
                        {getStatusBadge()}
                    </div>

                    <p className="text-lg text-gray-600">
                        Descubra seu perfil comportamental completo e áreas de desenvolvimento
                    </p>
                </div>

                {/* Estado: Não iniciado */}
                {!employee?.journey_filled && (
                    <div className="space-y-6">
                        {/* Card principal de explicação */}
                        <div className="card text-center">
                            <div className="mb-6">
                                <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    Descubra Seu Perfil Comportamental
                                </h2>

                                <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                                    O Mapa de Jornada é uma ferramenta avançada de análise comportamental que
                                    identifica seu perfil único, pontos fortes e áreas de desenvolvimento.
                                    Receba um relatório personalizado com recomendações específicas para seu crescimento.
                                </p>
                            </div>

                            <button
                                onClick={handleStartJourney}
                                className="btn-primary text-lg px-8 py-4 inline-flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Iniciar Meu Mapa de Jornada
                            </button>
                        </div>

                        {/* Card informativo */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Análise Detalhada</h3>
                                <p className="text-gray-600 text-sm">
                                    Questionário completo que analisa seus padrões comportamentais e preferências
                                </p>
                            </div>

                            <div className="card text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Resultado em até 3 dias</h3>
                                <p className="text-gray-600 text-sm">
                                    Receba seu relatório personalizado após análise especializada
                                </p>
                            </div>

                            <div className="card text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recomendações</h3>
                                <p className="text-gray-600 text-sm">
                                    Estratégias específicas para desenvolver seu potencial
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estado: Preenchido, aguardando liberação */}
                {employee?.journey_filled && !canViewResult() && (
                    <div className="card text-center">
                        <div className="mb-6">
                            <div className="w-24 h-24 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Processando seu resultado
                            </h2>

                            <p className="text-gray-600 mb-6">
                                Recebemos suas respostas! Nossos especialistas estão analisando seu perfil para gerar
                                um relatório personalizado e detalhado.
                            </p>

                            {renderCleanTimer()}
                        </div>
                    </div>
                )}

                {/* Estado: Resultado disponível */}
                {employee?.journey_filled && canViewResult() && employee.journey_result_html && (
                    <div className="card">
                        <div className="mb-6 text-center">
                            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Seu Resultado está Pronto!
                            </h2>

                            <p className="text-gray-600 mb-6">
                                Preenchido em: {employee.journey_filled_at && new Date(employee.journey_filled_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        {/* Renderizar HTML do resultado */}
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: employee.journey_result_html }}
                        />
                    </div>
                )}

                {/* Estado: Resultado disponível mas sem HTML */}
                {employee?.journey_filled && canViewResult() && !employee.journey_result_html && (
                    <div className="card text-center">
                        <div className="mb-6">
                            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Resultado em processamento
                            </h2>

                            <p className="text-gray-600">
                                Seu mapa foi preenchido com sucesso, mas o resultado ainda está sendo processado.
                                Por favor, aguarde um pouco mais.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}