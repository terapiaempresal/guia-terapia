'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import ChangePasswordModal from '@/components/ChangePasswordModal'
import { useToast } from '@/components/ToastProvider'

interface EmployeeData {
    id: string
    name: string
    company: string
}

interface EmployeeStats {
    videosWatched: number
    totalVideos: number
    mapCompleted: boolean
    journey_filled: boolean
    journey_filled_at: string | null
    journey_result_html: string | null
}

export default function EmployeeDashboard() {
    const { user, logout, isEmployee, loading: authLoading } = useAuth()
    const { showError } = useToast()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [employee, setEmployee] = useState<EmployeeData | null>(null)
    const [stats, setStats] = useState<EmployeeStats | null>(null)
    const [loading, setLoading] = useState(true)

    // Verificar autenticação e carregar dados
    useEffect(() => {
        console.log('🔍 Verificando autenticação do funcionário...')
        console.log('👤 User:', user)
        console.log('🔐 isEmployee:', isEmployee)
        console.log('⏳ authLoading:', authLoading)

        if (authLoading) {
            console.log('⏳ Ainda carregando dados de autenticação...')
            return
        }

        // Verificar se há dados de funcionário no localStorage
        const employeeId = localStorage.getItem('employeeId')
        const userType = localStorage.getItem('userType')

        if (!employeeId || userType !== 'funcionario') {
            console.log('❌ Funcionário não autenticado, redirecionando para login...')
            showError('Acesso restrito. Faça login para continuar.')
            window.location.href = '/login'
            return
        }

        console.log('✅ Funcionário autenticado, carregando dados...')
        loadEmployeeData()
    }, [isEmployee, user, authLoading])

    const loadEmployeeData = async () => {
        try {
            // Carregar dados do funcionário do localStorage
            const employeeId = localStorage.getItem('employeeId')
            const employeeName = localStorage.getItem('employeeName')
            const companyName = localStorage.getItem('companyName')

            if (!employeeId || !employeeName) {
                showError('Dados do funcionário não encontrados. Faça login novamente.')
                window.location.href = '/login'
                return
            }

            setEmployee({
                id: employeeId,
                name: employeeName,
                company: companyName || 'Empresa'
            })

            // Buscar progresso real dos vídeos
            await loadEmployeeProgress(employeeId)

        } catch (error) {
            console.error('Erro ao carregar dados do funcionário:', error)
            showError('Erro ao carregar dados. Tente novamente.')
            setLoading(false)
        }
    }

    const loadEmployeeProgress = async (employeeId: string) => {
        try {
            console.log('📊 Buscando progresso do funcionário:', employeeId)

            // Buscar dados completos do funcionário incluindo jornada
            const employeeResponse = await fetch(`/api/employees/${employeeId}`)
            const employeeData = await employeeResponse.json()

            // Buscar progresso do funcionário
            const progressResponse = await fetch(`/api/videos/progress/get?employee_id=${employeeId}`)
            const progressData = await progressResponse.json()

            // Buscar total de vídeos disponíveis
            const videosResponse = await fetch('/api/videos')
            const videosData = await videosResponse.json()

            if (progressData.success && videosData.videos) {
                // Contar vídeos assistidos
                const progress = progressData.progress || {}
                const videosWatched = Object.values(progress).filter((completed: any) => completed === true).length
                const totalVideos = videosData.videos.length // Total real de vídeos no banco

                console.log('📈 Progresso carregado:', {
                    videosWatched,
                    totalVideos,
                    progress,
                    totalVideosFromAPI: videosData.videos.length,
                    employeeJourneyData: {
                        journey_filled: employeeData.journey_filled,
                        journey_filled_at: employeeData.journey_filled_at,
                        journey_result_html: employeeData.journey_result_html
                    }
                })

                setStats({
                    videosWatched,
                    totalVideos,
                    mapCompleted: videosWatched >= Math.ceil(totalVideos * 0.8), // Mapa completo com 80% dos vídeos
                    // Adicionar dados da jornada
                    journey_filled: employeeData.journey_filled || false,
                    journey_filled_at: employeeData.journey_filled_at || null,
                    journey_result_html: employeeData.journey_result_html || null
                })
            } else {
                console.warn('⚠️ Não foi possível carregar dados, usando fallback')
                // Dados padrão se não conseguir buscar
                setStats({
                    videosWatched: 0,
                    totalVideos: 10, // Fallback para 10 vídeos (valor conhecido)
                    mapCompleted: false,
                    journey_filled: false,
                    journey_filled_at: null,
                    journey_result_html: null
                })
            }

            setLoading(false)
        } catch (error) {
            console.error('❌ Erro ao buscar progresso:', error)
            showError('Erro ao carregar progresso. Mostrando dados padrão.')

            // Dados padrão em caso de erro
            setStats({
                videosWatched: 0,
                totalVideos: 10, // Fallback para 10 vídeos (valor conhecido)
                mapCompleted: false,
                journey_filled: false,
                journey_filled_at: null,
                journey_result_html: null
            })

            setLoading(false)
        }
    }

    // Função para determinar o status da jornada
    const getJourneyStatus = () => {
        if (!stats) return { status: 'Pendente', progress: 0, color: 'yellow' }

        // 1. Pendente - não preencheu ainda
        if (!stats.journey_filled) {
            return { status: 'Pendente', progress: 0, color: 'yellow' }
        }

        // 2. Em Análise - preencheu mas ainda no prazo
        if (stats.journey_filled && stats.journey_filled_at) {
            const filledAt = new Date(stats.journey_filled_at)
            const now = new Date()
            const hoursPassed = (now.getTime() - filledAt.getTime()) / (1000 * 60 * 60)

            // Verificar modo debug
            const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true')
            const requiredHours = isDebugMode ? 0 : 52 // 52 horas = 3 dias

            if (hoursPassed < requiredHours) {
                return { status: 'Em Análise', progress: 50, color: 'blue' }
            }
        }

        // 3. Concluído - após 72 horas
        return { status: 'Concluído', progress: 100, color: 'green' }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!employee || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Erro ao carregar dados do funcionário.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Portal do Funcionário
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Olá, {employee.name}!
                            </span>
                            <span className="text-xs text-gray-500">
                                {employee.company}
                            </span>
                            <button
                                onClick={() => setShowChangePassword(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Alterar Senha
                            </button>
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Vídeos Assistidos */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Vídeos Assistidos</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.videosWatched}/{stats.totalVideos}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(stats.videosWatched / stats.totalVideos) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mapa da Jornada - Status Dinâmico */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Mapa da Jornada</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {getJourneyStatus().status}
                                </p>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getJourneyStatus().color === 'green' ? 'bg-green-100' :
                                    getJourneyStatus().color === 'blue' ? 'bg-blue-100' : 'bg-yellow-100'
                                }`}>
                                <svg className={`w-5 h-5 ${getJourneyStatus().color === 'green' ? 'text-green-600' :
                                        getJourneyStatus().color === 'blue' ? 'text-blue-600' : 'text-yellow-600'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {getJourneyStatus().color === 'green' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    ) : getJourneyStatus().color === 'blue' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${getJourneyStatus().color === 'green' ? 'bg-green-600' :
                                            getJourneyStatus().color === 'blue' ? 'bg-blue-600' : 'bg-yellow-500'
                                        }`}
                                    style={{ width: `${getJourneyStatus().progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Progresso Geral */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Progresso Geral</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {Math.round(((stats.videosWatched + (getJourneyStatus().progress / 100)) / (stats.totalVideos + 1)) * 100)}%
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((stats.videosWatched + (getJourneyStatus().progress / 100)) / (stats.totalVideos + 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ações Rápidas */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Acesso Rápido
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link href="/funcionario/mapa" className="card hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Mapa de Jornada
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Visualize seu progresso no curso
                                </p>
                            </div>
                        </Link>

                        <Link href="/funcionario/ferramentas" className="card hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Guia de Ferramentas
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Faça anotações e exercícios práticos
                                </p>
                            </div>
                        </Link>

                        <Link href="/funcionario/videos" className="card hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Módulos de Vídeo
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Assista aos vídeos e marque seu progresso
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Modal de Confirmação de Logout */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                title="Confirmar Saída"
                message="Tem certeza que deseja sair da sua área?"
                confirmText="Sair"
                cancelText="Continuar"
                type="warning"
                onConfirm={() => {
                    setShowLogoutConfirm(false)
                    // Limpar dados específicos do funcionário
                    localStorage.removeItem('employeeId')
                    localStorage.removeItem('employeeName')
                    localStorage.removeItem('employeeEmail')
                    localStorage.removeItem('companyId')
                    localStorage.removeItem('companyName')
                    localStorage.removeItem('userType')
                    window.location.href = '/'
                }}
                onCancel={() => setShowLogoutConfirm(false)}
            />

            {/* Modal de Alteração de Senha */}
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
                employeeId={employee?.id || ''}
            />
        </div>
    )
}