'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'

interface Employee {
    id: string
    name: string
    full_name?: string
    email: string
    invited_at: string
    accepted_at?: string
    created_at: string
    status?: 'invited' | 'active' | 'blocked'
    mapStatus?: 'not_started' | 'in_progress' | 'done'
    videosWatched?: number
    totalVideos?: number
    videos_watched?: number
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
    email: string
    company: Company
}

export default function ManagerDashboard() {
    const { user, logout, isManager, loading: authLoading } = useAuth()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [company, setCompany] = useState<Company | null>(null)
    const [manager, setManager] = useState<Manager | null>(null)
    const [loading, setLoading] = useState(true)
    const [showAddEmployee, setShowAddEmployee] = useState(false)
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [generatedLink, setGeneratedLink] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [newEmployee, setNewEmployee] = useState({
        full_name: '',
        email: ''
    })

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
            loadEmployees()
        }
    }, [company])

    const loadManagerData = async () => {
        try {
            console.log('📊 Carregando dados do gestor...')

            // Buscar dados da sessão primeiro
            const managerEmail = sessionStorage.getItem('manager_email')
            console.log('📧 Email do gestor:', managerEmail)

            if (!managerEmail) {
                console.log('❌ Email não encontrado no sessionStorage')
                alert('Sessão expirada. Faça login novamente.')
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
            } else {
                console.error('❌ Erro ao carregar dados:', data.error)
                alert('Erro ao carregar dados do gestor')
            }
        } catch (error) {
            console.error('❌ Erro ao carregar gestor:', error)
        } finally {
            console.log('🏁 Finalizando carregamento, setLoading(false)')
            setLoading(false)
        }
    }

    const loadEmployees = async () => {
        if (!company?.id) return

        try {
            const response = await fetch(`/api/employees?company_id=${company.id}`)
            const data = await response.json()

            if (response.ok) {
                setEmployees(data.employees || [])
            } else {
                console.error('Erro ao carregar funcionários:', data.error)
            }
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error)
        }
    }

    // Dados calculados
    const activeEmployees = employees.filter(e => e.accepted_at).length
    const quota = 10 // Por enquanto fixo, pode vir do plano/pedido depois
    const completedMaps = employees.filter(e => e.mapStatus === 'done').length
    const completionRate = activeEmployees > 0 ? Math.round((completedMaps / activeEmployees) * 100) : 0

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
                return <span className="bg-warning-100 text-warning-800 px-2 py-1 rounded-full text-xs">Em andamento</span>
            case 'done':
                return <span className="bg-success-100 text-success-800 px-2 py-1 rounded-full text-xs">Concluído</span>
            default:
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Não iniciado</span>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'invited':
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Convidado</span>
            case 'active':
                return <span className="bg-success-100 text-success-800 px-2 py-1 rounded-full text-xs">Ativo</span>
            case 'blocked':
                return <span className="bg-error-100 text-error-800 px-2 py-1 rounded-full text-xs">Bloqueado</span>
            default:
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Convidado</span>
        }
    }

    const handleAddEmployee = async () => {
        if (!newEmployee.full_name || !newEmployee.email) {
            alert('Por favor, preencha todos os campos obrigatórios')
            return
        }

        if (!company?.id || !manager?.id) {
            alert('Dados da empresa não carregados')
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
                    name: newEmployee.full_name,
                    email: newEmployee.email
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
                            employeeName: newEmployee.full_name,
                            employeeEmail: newEmployee.email,
                            companyName: company.name,
                            companyId: company.id
                        })
                    })

                    const inviteData = await inviteResponse.json()

                    if (inviteResponse.ok) {
                        alert('✅ Funcionário adicionado e convite enviado com sucesso!')
                        console.log('Link de acesso (dev):', inviteData.loginUrl)
                    } else {
                        alert('Funcionário adicionado, mas falha ao enviar convite: ' + (inviteData.error || 'Erro desconhecido'))
                    }
                } catch (emailError) {
                    console.error('Erro ao enviar convite:', emailError)
                    alert('Funcionário adicionado, mas erro ao enviar convite. Verifique se o serviço de e-mail está configurado.')
                }
            } else {
                alert('Erro ao adicionar funcionário: ' + (data.error || 'Erro desconhecido'))
            }
        } catch (error) {
            console.error('Erro ao adicionar funcionário:', error)
            alert('Erro ao adicionar funcionário')
        }

        setNewEmployee({ full_name: '', email: '' })
        setShowAddEmployee(false)
    }

    const handleDeleteEmployee = async (employeeId: string) => {
        if (!confirm('Tem certeza que deseja remover este funcionário?')) {
            return
        }

        console.log('🗑️ [Delete] Iniciando exclusão do funcionário:', employeeId)

        try {
            const response = await fetch(`/api/employees?employee_id=${employeeId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            console.log('🗑️ [Delete] Resposta da API:', { status: response.status, data })

            if (response.ok) {
                console.log('✅ [Delete] Funcionário removido com sucesso!')
                alert('Funcionário removido com sucesso!')
                await loadEmployees() // Recarregar lista
            } else {
                console.error('❌ [Delete] Erro na API:', data)
                alert('Erro ao remover funcionário: ' + (data.error || 'Erro desconhecido'))
            }
        } catch (error) {
            console.error('❌ [Delete] Erro de rede:', error)
            alert('Erro ao remover funcionário: Problema de conexão')
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
                alert(data.error || 'Erro ao gerar link')
            }
        } catch (error) {
            console.error('Erro ao gerar link:', error)
            alert('Erro ao gerar link de acesso.')
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            alert('✅ Link copiado para a área de transferência!')
        } catch (error) {
            // Fallback para navegadores que não suportam clipboard API
            const textArea = document.createElement('textarea')
            textArea.value = text
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            alert('✅ Link copiado para a área de transferência!')
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
                alert('✅ Convite enviado com sucesso!')
                console.log('Link de acesso (dev):', data.loginUrl)
            } else {
                alert(data.error || 'Erro ao enviar convite')
            }
        } catch (error) {
            console.error('Erro ao enviar convite:', error)
            alert('Erro ao enviar convite. Verifique se o serviço de e-mail está configurado.')
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
                            <button
                                onClick={() => setShowAddEmployee(true)}
                                className="btn-primary"
                            >
                                Adicionar Funcionário
                            </button>

                            <button
                                onClick={() => {
                                    if (confirm('Tem certeza que deseja sair?')) {
                                        window.location.href = '/'
                                    }
                                }}
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
                                <h3 className="text-sm font-medium text-gray-500">Funcionários Ativos</h3>
                                <div className="text-2xl font-bold text-gray-900">
                                    {employees.length}/{company?.quota || 50}
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
                                    {employees.filter(emp => emp.mapStatus === 'done').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">Média de Vídeos</h3>
                                <div className="text-2xl font-bold text-gray-900">
                                    {employees.length > 0 ? Math.round(employees.reduce((acc, emp) => acc + (emp.videosWatched || 0), 0) / employees.length) : 0}/6
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employee Table */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Funcionários
                        </h2>

                        <div className="text-sm text-gray-500">
                            {employees.length} funcionários cadastrados
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
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {employee.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {employee.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(employee.status || 'invited')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getMapStatusBadge(employee.mapStatus || 'not_started')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {employee.videosWatched || 0}/{employee.totalVideos || 6}
                                            </div>
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-primary-600 h-1.5 rounded-full"
                                                    style={{ width: `${((employee.videosWatched || 0) / (employee.totalVideos || 6)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleResendInvite(employee.id)}
                                                className="text-primary-600 hover:text-primary-900 mr-3"
                                            >
                                                Reenviar
                                            </button>
                                            <button
                                                onClick={() => generateEmployeeLink(employee)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Gerar Link
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                className="text-red-600 hover:text-red-900 mr-3"
                                            >
                                                Remover
                                            </button>
                                            <button className="text-gray-600 hover:text-gray-900">
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
                                        💡 Opção 1: Link de convite genérico
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
                                                alert('Link copiado!')
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
        </div>
    )
}
