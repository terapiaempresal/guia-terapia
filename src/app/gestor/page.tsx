'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/components/ToastProvider'
import ConfirmModal from '@/components/ConfirmModal'

interface Employee {
    id: string
    name: string
    full_name?: string
    email: string
    cpf?: string
    birth_date?: string
    whatsapp?: string
    invited_at: string
    accepted_at?: string
    created_at: string
    status?: 'invited' | 'active' | 'blocked'
    mapStatus?: 'not_started' | 'in_progress' | 'done'
    videosWatched?: number
    totalVideos?: number
    videos_watched?: number
    archived?: boolean
    archived_at?: string
}

interface Company {
    id: string
    name: string
    created_at: string
    activeEmployees?: number
    quota?: number
    completedMaps?: number
}

interface Manager {
    id: string
    company_id: string
    name: string
    full_name?: string
    email: string
    phone?: string
    status?: string
    company: Company
}

export default function ManagerDashboard() {
    const { user, logout, isManager, loading: authLoading } = useAuth()
    const { showSuccess, showError, showWarning, showInfo } = useToast()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [archivedEmployees, setArchivedEmployees] = useState<Employee[]>([])
    const [showArchivedEmployees, setShowArchivedEmployees] = useState(false)
    const [company, setCompany] = useState<Company | null>(null)
    const [manager, setManager] = useState<Manager | null>(null)
    const [loading, setLoading] = useState(true)
    const [employeesLoading, setEmployeesLoading] = useState(false)
    const [totalVideos, setTotalVideos] = useState(0)
    const [showAddEmployee, setShowAddEmployee] = useState(false)
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [employeeToArchive, setEmployeeToArchive] = useState<string | null>(null)
    const [generatedLink, setGeneratedLink] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [showProgressModal, setShowProgressModal] = useState(false)
    const [employeeProgress, setEmployeeProgress] = useState<any>(null)
    const [loadingProgress, setLoadingProgress] = useState(false)
    const [newEmployee, setNewEmployee] = useState({
        full_name: '',
        email: '',
        whatsapp: ''
    })

    // Estados para Mapa de Conformidade
    const [showComplianceMap, setShowComplianceMap] = useState(false)
    const [complianceMapGenerated, setComplianceMapGenerated] = useState(false)
    const [allManagers, setAllManagers] = useState<Manager[]>([])

    // Estado para verificar se é admin
    const [isAdmin, setIsAdmin] = useState(false)

    // Verificar autenticação e carregar dados
    useEffect(() => {
        console.log('🔍 Verificando autenticação no gestor...')
        console.log('👤 User:', user)
        console.log('🔐 isManager:', isManager)
        console.log('⏳ authLoading:', authLoading)

        if (authLoading) {
            console.log('⏳ Ainda carregando dados de autenticação...')
            return
        }

        if (!isManager && !user) {
            console.log('❌ Usuário não autenticado ou não é gestor, fazendo logout...')
            logout() // Redireciona para login
            return
        }

        console.log('✅ Usuário autenticado como gestor, carregando dados...')
        loadManagerData()
    }, [isManager, user, authLoading])    // Carregar funcionários quando a empresa for carregada
    useEffect(() => {
        if (company?.id) {
            console.log('🔄 [UseEffect] Company carregada, chamando loadEmployees automaticamente...')
            loadEmployees()
        }
    }, [company])

    // Carregar total de vídeos uma vez
    useEffect(() => {
        loadTotalVideos()
    }, [])

    const loadManagerData = async () => {
        try {
            console.log('📊 Carregando dados do gestor...')

            // Buscar dados da sessão primeiro
            const managerEmail = sessionStorage.getItem('manager_email')
            console.log('📧 Email do gestor:', managerEmail)

            if (!managerEmail) {
                console.log('❌ Email não encontrado no sessionStorage')
                showError('Sessão expirada. Faça login novamente.')
                window.location.href = '/'
                return
            }

            console.log('🔍 Fazendo requisição para /api/companies...')
            const response = await fetch(`/api/companies?manager_email=${managerEmail}`)
            console.log('📡 Status da resposta:', response.status)

            const data = await response.json()
            console.log('📋 Dados recebidos:', data)

            if (response.ok) {
                console.log('✅ Dados carregados com sucesso')
                setManager(data.manager)
                setCompany(data.company)

                // Verificar se é admin
                if (data.manager?.is_admin === true) {
                    console.log('👑 Gestor é ADMIN')
                    setIsAdmin(true)
                } else {
                    console.log('👤 Gestor é normal (não admin)')
                    setIsAdmin(false)
                }
            } else {
                console.error('❌ Erro ao carregar dados:', data.error)
                showError('Erro ao carregar dados do gestor')
            }
        } catch (error) {
            console.error('❌ Erro ao carregar gestor:', error)
        } finally {
            console.log('🏁 Finalizando carregamento, setLoading(false)')
            setLoading(false)
        }
    }

    const loadEmployees = async () => {
        // Pegar o ID do gestor do localStorage
        const managerId = localStorage.getItem('userId')
        if (!managerId) {
            console.log('⚠️ [LoadEmployees] Manager ID não disponível')
            return
        }

        console.log('🔄 [LoadEmployees] Carregando funcionários do gestor:', managerId)
        setEmployeesLoading(true)

        try {
            // Usar manager_id em vez de company_id
            const url = `/api/employees?manager_id=${managerId}&_t=${Date.now()}&_r=${Math.random()}`
            console.log('🌐 [LoadEmployees] Fazendo requisição para:', url)

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            })
            const data = await response.json()

            console.log('📝 [LoadEmployees] Resposta recebida:', {
                status: response.status,
                ok: response.ok,
                employeesCount: data.employees?.length || 0,
                employees: data.employees?.map((emp: Employee) => ({ id: emp.id, name: emp.name || emp.full_name })) || []
            })

            if (response.ok) {
                const newEmployees = data.employees || []
                console.log('📊 [LoadEmployees] Dados recebidos:', {
                    previousCount: employees.length,
                    newCount: newEmployees.length,
                    newEmployees: newEmployees.map((emp: Employee) => ({ id: emp.id, name: emp.name || emp.full_name }))
                })

                // Força um delay para garantir que o estado seja limpo
                setEmployees([])
                setTimeout(() => {
                    setEmployees(newEmployees)
                    console.log('✅ [LoadEmployees] Lista de funcionários atualizada')
                }, 100)
            } else {
                console.error('❌ [LoadEmployees] Erro ao carregar funcionários:', data.error)
            }
        } catch (error) {
            console.error('❌ [LoadEmployees] Erro de rede:', error)
        } finally {
            setEmployeesLoading(false)
        }
    }

    const loadArchivedEmployees = async () => {
        const managerId = localStorage.getItem('userId')
        if (!managerId) {
            console.log('⚠️ [LoadArchivedEmployees] Manager ID não disponível')
            return
        }

        console.log('🔄 [LoadArchivedEmployees] Carregando funcionários arquivados do gestor:', managerId)

        try {
            // Usar a rota principal com parâmetro para incluir arquivados
            const url = `/api/employees?manager_id=${managerId}&include_archived=true&archived_only=true`
            console.log('🌐 [LoadArchivedEmployees] Fazendo requisição para:', url)

            const response = await fetch(url)
            const data = await response.json()

            console.log('📝 [LoadArchivedEmployees] Resposta recebida:', {
                status: response.status,
                ok: response.ok,
                employeesCount: data.employees?.length || 0,
                employees: data.employees?.map((emp: Employee) => ({ id: emp.id, name: emp.name || emp.full_name })) || []
            })

            if (response.ok) {
                setArchivedEmployees(data.employees || [])
                console.log('✅ [LoadArchivedEmployees] Lista de funcionários arquivados atualizada')
            } else {
                console.error('❌ [LoadArchivedEmployees] Erro ao carregar funcionários arquivados:', data.error)
            }
        } catch (error) {
            console.error('❌ [LoadArchivedEmployees] Erro de rede:', error)
        }
    }

    const loadTotalVideos = async () => {
        try {
            const response = await fetch('/api/videos')
            const data = await response.json()

            if (response.ok && data.videos) {
                setTotalVideos(data.videos.length)
                console.log('📺 Total de vídeos carregado:', data.videos.length)
            } else {
                console.error('Erro ao carregar vídeos:', data.error)
                setTotalVideos(10) // Fallback
            }
        } catch (error) {
            console.error('Erro ao carregar total de vídeos:', error)
            setTotalVideos(10) // Fallback
        }
    }

    // Dados calculados
    const activeEmployees = employees.filter(e => e.status === 'active').length
    const quota = company?.quota || 50 // Agora vem dinamicamente da API, baseado na tabela orders
    const completedMaps = employees.filter(e => e.mapStatus === 'done').length

    // Calcular taxa de conclusão como média de progresso geral dos funcionários
    const calculateCompletionRate = () => {
        if (employees.length === 0) return 0

        const totalProgress = employees.reduce((acc, emp) => {
            // Progresso de vídeos (0-100%)
            const videoProgress = totalVideos > 0 ? ((emp.videosWatched || 0) / totalVideos) * 100 : 0

            // Progresso do mapa (0 ou 100%)
            const mapProgress = emp.mapStatus === 'done' ? 100 : 0

            // Média dos dois progressos
            const employeeProgress = (videoProgress + mapProgress) / 2

            return acc + employeeProgress
        }, 0)

        return Math.round(totalProgress / employees.length)
    }

    const completionRate = calculateCompletionRate()

    // Funções do Mapa de Conformidade
    const checkComplianceReadiness = () => {
        // Verificar se todos os funcionários têm os dados necessários preenchidos
        const incompleteEmployees = employees.filter(emp =>
            !emp.full_name || !emp.cpf || !emp.birth_date || !emp.email
        )

        return {
            ready: incompleteEmployees.length === 0,
            incompleteCount: incompleteEmployees.length,
            incompleteEmployees
        }
    }

    const loadAllManagers = async () => {
        if (!company?.id) return

        try {
            const response = await fetch(`/api/companies/${company.id}/managers`)
            const data = await response.json()

            if (response.ok) {
                setAllManagers(data.managers || [])
                console.log('👥 Gestores/Sócios carregados:', data.managers?.length || 0)
            } else {
                console.error('Erro ao carregar gestores:', data.error)
            }
        } catch (error) {
            console.error('Erro ao carregar gestores:', error)
        }
    }

    const handleGenerateComplianceMap = () => {
        console.log('🗺️ Gerando Mapa de Conformidade...')
        const readiness = checkComplianceReadiness()

        console.log('📊 Status da verificação:', readiness)

        if (!readiness.ready) {
            showWarning(
                `${readiness.incompleteCount} funcionário(s) com dados incompletos. ` +
                `Todos os funcionários precisam ter nome, CPF, data de nascimento e email preenchidos para gerar o mapa.`
            )
            return
        }

        // Carregar gestores/sócios
        loadAllManagers()

        // Mostrar o mapa
        setShowComplianceMap(true)
        setComplianceMapGenerated(true)
        showSuccess('Mapa de Conformidade gerado com sucesso!')
    }

    const handleCloseComplianceMap = () => {
        setShowComplianceMap(false)
    }

    // Log resumido dos dados
    console.log('📊 Painel:', {
        funcionarios: employees.length,
        ativos: activeEmployees,
        mapasConcluidos: completedMaps,
        taxaConclusao: `${completionRate}%`
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando dashboard...</p>
                </div>
            </div>
        )
    }

    if (!manager || !company) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Acesso não autorizado</h2>
                    <p className="text-gray-600 mb-4">Não foi possível carregar os dados do gestor.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="btn-primary"
                    >
                        Voltar ao início
                    </button>
                </div>
            </div>
        )
    }

    const getMapStatusBadge = (status: string) => {
        switch (status) {
            case 'not_started':
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Não iniciado</span>
            case 'in_progress':
                return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Em progresso</span>
            case 'done':
                return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Concluído</span>
            default:
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Não iniciado</span>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'invited':
                return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Convidado</span>
            case 'active':
                return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Ativo</span>
            case 'blocked':
                return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Bloqueado</span>
            default:
                return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Convidado</span>
        }
    }

    const handleAddEmployee = async () => {
        // Validação mais rigorosa dos campos obrigatórios
        const fullName = newEmployee.full_name.trim()
        const email = newEmployee.email.trim()
        const whatsapp = newEmployee.whatsapp.trim()

        if (!fullName || !email || !whatsapp) {
            showWarning('Por favor, preencha todos os campos obrigatórios (Nome Completo, E-mail e WhatsApp)')
            return
        }

        // Validação básica do formato do e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            showWarning('Por favor, digite um e-mail válido')
            return
        }

        // Validação básica do WhatsApp (deve ter pelo menos 10 dígitos)
        const whatsappNumbers = whatsapp.replace(/\D/g, '')
        if (whatsappNumbers.length < 10) {
            showWarning('Por favor, digite um número de WhatsApp válido')
            return
        }

        if (!company?.id || !manager?.id) {
            showError('Dados da empresa não carregados')
            return
        }

        try {
            // Criar funcionário no Supabase
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_id: company.id,
                    manager_id: manager.id,
                    name: fullName,
                    email: email,
                    whatsapp: whatsapp
                })
            })

            const data = await response.json()

            if (response.ok) {
                // Recarregar lista de funcionários
                await loadEmployees()

                // Enviar convite por e-mail
                try {
                    const inviteResponse = await fetch('/api/employees/invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            employeeName: fullName,
                            employeeEmail: email,
                            companyName: company.name,
                            companyId: company.id
                        })
                    })

                    const inviteData = await inviteResponse.json()

                    if (inviteResponse.ok) {
                        showSuccess('Funcionário adicionado e convite enviado com sucesso!')
                        console.log('Link de acesso (dev):', inviteData.loginUrl)
                    } else {
                        showWarning('Funcionário adicionado, mas falha ao enviar convite: ' + (inviteData.error || 'Erro desconhecido'))
                    }
                } catch (emailError) {
                    console.error('Erro ao enviar convite:', emailError)
                    showWarning('Funcionário adicionado, mas erro ao enviar convite. Verifique se o serviço de e-mail está configurado.')
                }
            } else {
                showError('Erro ao adicionar funcionário: ' + (data.error || 'Erro desconhecido'))
            }
        } catch (error) {
            console.error('Erro ao adicionar funcionário:', error)
            showError('Erro ao adicionar funcionário')
        }

        setNewEmployee({ full_name: '', email: '', whatsapp: '' })
        setShowAddEmployee(false)
    }

    const handleArchiveEmployee = async (employeeId: string) => {
        setEmployeeToArchive(employeeId)
        setShowDeleteConfirm(true)
    }

    const confirmArchiveEmployee = async () => {
        if (!employeeToArchive) return

        console.log('� [Archive] Iniciando arquivamento do funcionário:', employeeToArchive)

        try {
            const response = await fetch(`/api/employees?employee_id=${employeeToArchive}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            console.log('� [Archive] Resposta da API:', {
                status: response.status,
                ok: response.ok,
                data: data
            })

            if (response.ok && data.success) {
                if (data.alreadyArchived) {
                    console.log('ℹ️ [Archive] Funcionário já havia sido arquivado anteriormente')
                    showInfo('Funcionário já foi arquivado anteriormente')
                } else {
                    console.log('✅ [Archive] Funcionário arquivado com sucesso!')
                    showSuccess('Funcionário arquivado com sucesso!')
                }

                console.log('🔄 [Archive] Forçando limpeza da interface...')

                // Força remover da interface imediatamente
                setEmployees(prev => {
                    const filtered = prev.filter(emp => emp.id !== employeeToArchive)
                    console.log('🧹 [Archive] Removido da interface local:', {
                        original: prev.length,
                        filtered: filtered.length,
                        archivedId: employeeToArchive
                    })
                    return filtered
                })

                // Aguardar um pouco e recarregar do servidor para confirmar
                setTimeout(async () => {
                    console.log('🔄 [Archive] Recarregando do servidor para confirmar...')
                    await loadEmployees()
                    console.log('✅ [Archive] Sincronização com servidor concluída!')
                }, 500)

            } else {
                console.error('❌ [Archive] Erro na API:', data)
                showError('Erro ao arquivar funcionário: ' + (data.error || 'Erro desconhecido'))
            }
        } catch (error) {
            console.error('❌ [Archive] Erro de rede:', error)
            showError('Erro ao arquivar funcionário: Problema de conexão')
        } finally {
            setShowDeleteConfirm(false)
            setEmployeeToArchive(null)
        }
    }

    const generateEmployeeLink = async (employee: Employee) => {
        try {
            const response = await fetch('/api/employees/generate-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeName: employee.name,
                    employeeEmail: employee.email,
                    companyName: company?.name || '',
                    companyId: company?.id || ''
                })
            })

            const data = await response.json()

            if (response.ok) {
                setGeneratedLink(data.loginUrl)
                setSelectedEmployee(employee)
                setShowLinkModal(true)
            } else {
                showError(data.error || 'Erro ao gerar link')
            }
        } catch (error) {
            console.error('Erro ao gerar link:', error)
            showError('Erro ao gerar link de acesso.')
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            showSuccess('Link copiado para a área de transferência!')
        } catch (error) {
            // Fallback para navegadores que não suportam clipboard API
            const textArea = document.createElement('textarea')
            textArea.value = text
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            showSuccess('Link copiado para a área de transferência!')
        }
    }

    const handleResendInvite = async (employeeId: string) => {
        const employee = employees.find(emp => emp.id === employeeId)
        if (!employee) return

        try {
            const response = await fetch('/api/employees/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeName: employee.name,
                    employeeEmail: employee.email,
                    companyName: company?.name || '',
                    companyId: company?.id || ''
                })
            })

            const data = await response.json()

            if (response.ok) {
                showSuccess('Convite enviado com sucesso!')
                console.log('Link de acesso (dev):', data.loginUrl)
            } else {
                showError(data.error || 'Erro ao enviar convite')
            }
        } catch (error) {
            console.error('Erro ao enviar convite:', error)
            showError('Erro ao enviar convite. Verifique se o serviço de e-mail está configurado.')
        }
    }

    const handleShowProgress = async (employee: Employee) => {
        setSelectedEmployee(employee)
        setLoadingProgress(true)
        setShowProgressModal(true)
        setEmployeeProgress(null)

        try {
            console.log('🔍 Carregando progresso detalhado do funcionário:', employee.id)

            const response = await fetch(`/api/employees/progress?employee_id=${employee.id}`)
            const data = await response.json()

            if (response.ok) {
                setEmployeeProgress(data)
                console.log('✅ Progresso carregado:', data)
            } else {
                console.error('❌ Erro ao carregar progresso:', data.error)
                showError('Erro ao carregar progresso do funcionário')
            }
        } catch (error) {
            console.error('❌ Erro ao carregar progresso:', error)
            showError('Erro ao carregar dados')
        } finally {
            setLoadingProgress(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Painel do Gestor
                            </h1>
                            <p className="text-gray-600">
                                {company?.name || 'Carregando...'}
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowAddEmployee(true)}
                                    className="btn-primary"
                                >
                                    Adicionar Funcionário
                                </button>

                                <button
                                    onClick={() => window.location.href = '/gestor/videos'}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Gerenciar Vídeos
                                </button>

                                <button
                                    onClick={() => {
                                        setShowArchivedEmployees(!showArchivedEmployees)
                                        if (!showArchivedEmployees) {
                                            loadArchivedEmployees()
                                        }
                                    }}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${showArchivedEmployees
                                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    {showArchivedEmployees ? 'Ocultar Arquivados' : 'Ver Arquivados'}
                                </button>

                                <button
                                    onClick={loadEmployees}
                                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Atualizar lista de funcionários"
                                    disabled={employeesLoading}
                                >
                                    {employeesLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                                    ) : (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    )}
                                    Atualizar Lista
                                </button>

                                {/* Botão Admin - só aparece para admins */}
                                {isAdmin && (
                                    <button
                                        onClick={() => window.location.href = '/admin'}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-md"
                                        title="Acessar Painel Administrativo"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Painel Admin
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Sair"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">Funcionários Totais</h3>
                                <div className="text-2xl font-bold text-gray-900">
                                    {employees.length}/{quota}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-success-100 rounded-lg">
                                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">Taxa de Conclusão</h3>
                                <div className="text-2xl font-bold text-gray-900">
                                    {completionRate}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-warning-100 rounded-lg">
                                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">Mapas Concluídos</h3>
                                <div className="text-2xl font-bold text-gray-900">
                                    {completedMaps}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card do Botão Gerar Mapa */}
                    <button
                        onClick={handleGenerateComplianceMap}
                        className="card hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:border-purple-400"
                    >
                        <div className="flex flex-col items-center justify-center h-full py-2">

                            <h3 className="text-sm font-semibold text-purple-900 text-center">
                                Gerar Mapa de Conformidade
                            </h3>
                            <p className="text-xs text-purple-700 mt-1">Clique para gerar</p>
                        </div>
                    </button>
                </div>

                {/* Employee Table */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {showArchivedEmployees ? 'Funcionários Arquivados' : 'Funcionários'}
                        </h2>

                        <div className="text-sm text-gray-500">
                            {showArchivedEmployees
                                ? `${archivedEmployees.length} funcionários arquivados`
                                : `${employees.length} funcionários cadastrados`
                            }
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        E-mail
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mapa de Clareza
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progresso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {showArchivedEmployees ? 'Arquivado em' : 'Ações'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employeesLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
                                                <span className="text-gray-500">Atualizando lista de funcionários...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (showArchivedEmployees ? archivedEmployees : employees).length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                            {showArchivedEmployees
                                                ? 'Nenhum funcionário arquivado'
                                                : 'Nenhum funcionário cadastrado'
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    (showArchivedEmployees ? archivedEmployees : employees).map((employee) => (
                                        <tr key={employee.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {employee.full_name || employee.name}
                                                    {showArchivedEmployees && (
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                            Arquivado
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {employee.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(employee.status || 'Convidado')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getMapStatusBadge(employee.mapStatus || 'Não iniciado')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleShowProgress(employee)}
                                                    className="text-left hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                                                    title="Clique para ver detalhes dos vídeos"
                                                >
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {employee.videosWatched || 0}/{totalVideos || 10}
                                                    </div>
                                                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                                        <div
                                                            className="bg-primary-600 h-1.5 rounded-full"
                                                            style={{ width: `${totalVideos > 0 ? ((employee.videosWatched || 0) / totalVideos) * 100 : 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Ver detalhes
                                                    </div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {showArchivedEmployees ? (
                                                    <div className="text-sm text-gray-500">
                                                        {employee.archived_at ? new Date(employee.archived_at).toLocaleDateString('pt-BR') : '-'}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleArchiveEmployee(employee.id)}
                                                        className="text-orange-600 hover:text-orange-900"
                                                    >
                                                        Arquivar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Employee Modal */}
                {showAddEmployee && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Adicionar Funcionário
                                </h3>
                                <button
                                    onClick={() => setShowAddEmployee(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Opção 1: Link genérico da empresa */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                                        💡 Opção 1: Link de convite
                                    </h4>
                                    <p className="text-xs text-blue-700 mb-3">
                                        Compartilhe este link para que funcionários façam seu próprio cadastro
                                    </p>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${window.location.origin}/cadastro-funcionario?empresa=${company?.id}`}
                                            className="flex-1 text-xs p-2 bg-white border border-blue-200 rounded-md"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/cadastro-funcionario?empresa=${company?.id}`)
                                                showSuccess('Link copiado!')
                                            }}
                                            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-xs"
                                        >
                                            Copiar
                                        </button>
                                    </div>
                                </div>

                                {/* Divisor */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">OU</span>
                                    </div>
                                </div>

                                {/* Opção 2: Adicionar específico */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                        👤 Opção 2: Adicionar funcionário específico
                                    </h4>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nome Completo *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="input"
                                                value={newEmployee.full_name}
                                                onChange={(e) => setNewEmployee(prev => ({
                                                    ...prev,
                                                    full_name: e.target.value
                                                }))}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                E-mail *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                className="input"
                                                value={newEmployee.email}
                                                onChange={(e) => setNewEmployee(prev => ({
                                                    ...prev,
                                                    email: e.target.value
                                                }))}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                WhatsApp *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                className="input"
                                                placeholder="(11) 99999-9999"
                                                value={newEmployee.whatsapp}
                                                onChange={(e) => setNewEmployee(prev => ({
                                                    ...prev,
                                                    whatsapp: e.target.value
                                                }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={handleAddEmployee}
                                        className="btn-primary flex-1"
                                    >
                                        Adicionar e Enviar Convite
                                    </button>
                                    <button
                                        onClick={() => setShowAddEmployee(false)}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Link Gerado */}
                {showLinkModal && selectedEmployee && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-lg w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Link de Acesso - {selectedEmployee?.name || 'Funcionário'}
                                </h3>
                                <button
                                    onClick={() => setShowLinkModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link de acesso direto:
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={generatedLink}
                                            readOnly
                                            className="input flex-1 bg-gray-50 text-sm"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(generatedLink)}
                                            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copiar
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">
                                        📋 Como usar este link:
                                    </h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Copie o link acima</li>
                                        <li>• Envie por WhatsApp, e-mail ou outra forma de comunicação</li>
                                        <li>• O funcionário poderá acessar diretamente sem precisar de convite</li>
                                        <li>• O link é válido por 24 horas</li>
                                    </ul>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowLinkModal(false)}
                                        className="btn-secondary flex-1"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal do Mapa de Conformidade */}
            {showComplianceMap && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Mapa de Conformidade
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {company?.name}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseComplianceMap}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Sócios/Gestores */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Sócios/Gestores ({allManagers.length})
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {allManagers.map((mgr) => (
                                        <div key={mgr.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{mgr.full_name || mgr.name}</h4>
                                                    <p className="text-sm text-gray-600">{mgr.email}</p>
                                                    {mgr.phone && (
                                                        <p className="text-sm text-gray-600">{mgr.phone}</p>
                                                    )}
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${mgr.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {mgr.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Funcionários */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Funcionários ({employees.length})
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Nome
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    CPF
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Data Nascimento
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    WhatsApp
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {employees.map((emp) => (
                                                <tr key={emp.id} className={
                                                    !emp.full_name || !emp.cpf || !emp.birth_date || !emp.email
                                                        ? 'bg-yellow-50'
                                                        : ''
                                                }>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {emp.full_name || emp.name || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {emp.cpf || (
                                                                <span className="text-yellow-600 font-medium">Não preenchido</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {emp.birth_date ? new Date(emp.birth_date).toLocaleDateString('pt-BR') : (
                                                                <span className="text-yellow-600 font-medium">Não preenchido</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {emp.email || (
                                                                <span className="text-yellow-600 font-medium">Não preenchido</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {emp.whatsapp || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : emp.status === 'blocked'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {emp.status === 'active' ? 'Ativo' : emp.status === 'blocked' ? 'Bloqueado' : 'Convidado'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Legenda */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">
                                            Atenção
                                        </p>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Linhas destacadas em amarelo indicam funcionários com dados incompletos.
                                            Todos os campos (Nome, CPF, Data de Nascimento e Email) devem estar preenchidos.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Botão Fechar */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCloseComplianceMap}
                                    className="btn-primary"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Logout */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                title="Confirmar Saída"
                message="Tem certeza que deseja sair do painel de gestão?"
                confirmText="Sair"
                cancelText="Cancelar"
                type="warning"
                onConfirm={() => {
                    setShowLogoutConfirm(false)
                    window.location.href = '/'
                }}
                onCancel={() => setShowLogoutConfirm(false)}
            />

            {/* Modal de Confirmação de Arquivamento */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Arquivar Funcionário"
                message="Tem certeza que deseja arquivar este funcionário? Ele será removido da lista principal mas continuará com acesso ao portal."
                confirmText="Arquivar"
                cancelText="Cancelar"
                type="warning"
                onConfirm={() => {
                    confirmArchiveEmployee()
                }}
                onCancel={() => {
                    setShowDeleteConfirm(false)
                    setEmployeeToArchive(null)
                }}
            />

            {/* Modal de Progresso dos Vídeos */}
            {showProgressModal && selectedEmployee && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Progresso de {selectedEmployee.full_name || selectedEmployee.name}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowProgressModal(false)
                                        setSelectedEmployee(null)
                                        setEmployeeProgress(null)
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {loadingProgress ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
                                    <span className="text-gray-600">Carregando progresso...</span>
                                </div>
                            ) : employeeProgress ? (
                                <div className="space-y-6">
                                    {/* Resumo do Progresso */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-3">Resumo Geral</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-500">Vídeos Assistidos</div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {employeeProgress.videos.watched}/{employeeProgress.videos.total}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {employeeProgress.videos.progress_percentage}% completo
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Caderno de Clareza</div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {employeeProgress.workbook.completed_fields}/{employeeProgress.workbook.total_fields}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {employeeProgress.workbook.progress_percentage}% completo
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                                                <span>Progresso Geral</span>
                                                <span>{employeeProgress.overall_progress_percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${employeeProgress.overall_progress_percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lista de Vídeos */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Vídeos</h4>
                                        <div className="space-y-2">
                                            {employeeProgress.videos.list.map((video: any, index: number) => (
                                                <div
                                                    key={video.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg border ${video.is_watched
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${video.is_watched
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-gray-300 text-gray-600'
                                                            }`}>
                                                            {video.is_watched ? '✓' : index + 1}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {video.title}
                                                            </div>
                                                            {video.description && (
                                                                <div className="text-sm text-gray-500 truncate max-w-md">
                                                                    {video.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-sm font-medium ${video.is_watched ? 'text-green-600' : 'text-gray-400'
                                                            }`}>
                                                            {video.is_watched ? 'Assistido' : 'Não assistido'}
                                                        </div>
                                                        {video.completed_at && (
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(video.completed_at).toLocaleDateString('pt-BR')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status do Caderno */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Caderno de Clareza e Carreira</h4>
                                        <div className={`p-4 rounded-lg border ${employeeProgress.workbook.progress_percentage > 80
                                            ? 'bg-green-50 border-green-200'
                                            : employeeProgress.workbook.progress_percentage > 40
                                                ? 'bg-yellow-50 border-yellow-200'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-700">
                                                    Progresso do Caderno
                                                </span>
                                                <span className="text-sm font-medium text-gray-600">
                                                    {employeeProgress.workbook.completed_fields} de {employeeProgress.workbook.total_fields} campos preenchidos
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${employeeProgress.workbook.progress_percentage > 80
                                                        ? 'bg-green-500'
                                                        : employeeProgress.workbook.progress_percentage > 40
                                                            ? 'bg-yellow-500'
                                                            : 'bg-gray-400'
                                                        }`}
                                                    style={{ width: `${employeeProgress.workbook.progress_percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-2">
                                                {employeeProgress.workbook.progress_percentage > 80
                                                    ? '🎉 Caderno quase completo!'
                                                    : employeeProgress.workbook.progress_percentage > 40
                                                        ? '📝 Progresso bom, continue!'
                                                        : '📋 Início do preenchimento'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">Erro ao carregar dados do progresso</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
