'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'

// Lista de emails de administradores
const ADMIN_EMAILS = [
    'lucashlc.contato@gmail.com',
]

interface Company {
    id: string
    name: string
    employees_quota: number
    plan: string
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
}

interface Manager {
    id: string
    company_id: string
    auth_user_id: string
    name: string
    full_name: string
    email: string
    phone: string
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
}

interface Employee {
    id: string
    company_id: string
    manager_id?: string
    name: string // Campo real é 'name', não 'full_name'
    full_name?: string // Pode existir como alias
    email: string | null
    cpf?: string | null
    birth_date?: string | null
    whatsapp?: string | null
    password?: string
    status?: string
    archived?: boolean
    archived_at?: string | null
    invited_at?: string | null
    accepted_at?: string | null
    journey_filled?: boolean
    journey_filled_at?: string | null
    journey_result_html?: string | null
    respostas_mapa_jornada?: any // JSON das respostas do Typeform
    under_review?: boolean // Mapa em modo de revisão
    created_at: string
    updated_at?: string
}

interface CompanyWithManagers extends Company {
    managers: Manager[]
    employees_count?: number
    employees?: Employee[]
}

export default function AdminPage() {
    const router = useRouter()
    const { showSuccess, showError, showWarning } = useToast()
    const [companies, setCompanies] = useState<CompanyWithManagers[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCompany, setSelectedCompany] = useState<CompanyWithManagers | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null)
    const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
    const [editedHtml, setEditedHtml] = useState<{ [key: string]: string }>({})
    const [regeneratingMapId, setRegeneratingMapId] = useState<string | null>(null)

    useEffect(() => {
        checkAdminAccess()
    }, [])

    async function checkAdminAccess() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const emailFromStorage = sessionStorage.getItem('manager_email')
            const userEmail = session?.user?.email || emailFromStorage

            if (!userEmail) {

                // Salvar URL de retorno
                if (typeof window !== 'undefined') {
                    localStorage.setItem('redirectAfterLogin', '/admin')
                }

                router.push('/login')
                return
            }

            const { data: managerData, error: managerError } = await supabase
                .from('managers')
                .select('is_admin, full_name, status')
                .eq('email', userEmail)
                .single()

            if (managerError) {
                if (ADMIN_EMAILS.includes(userEmail)) {
                    setIsAdmin(true)
                    setCheckingAuth(false)
                    loadCompanies()
                    return
                }
                alert(`Acesso negado! Você não tem permissão para acessar o painel administrativo.`)
                router.push('/gestor')
                return
            }

            if (!managerData) {
                if (ADMIN_EMAILS.includes(userEmail)) {
                    setIsAdmin(true)
                    setCheckingAuth(false)
                    loadCompanies()
                    return
                }
                alert(`Acesso negado! Você não tem permissão para acessar o painel administrativo.`)
                router.push('/gestor')
                return
            }

            if (!managerData.is_admin) {
                alert(`Acesso negado! Apenas administradores podem acessar esta área.`)
                router.push('/gestor')
                return
            }

            setIsAdmin(true)
            setCheckingAuth(false)
            loadCompanies()
        } catch (error) {
            console.error('❌ Erro ao verificar acesso:', error)
            router.push('/login')
        }
    }
    async function loadCompanies() {
        try {
            setLoading(true)

            // Carregar empresas com managers
            const { data: companiesData, error: companiesError } = await supabase
                .from('companies')
                .select('*')
                .order('created_at', { ascending: false })

            if (companiesError) throw companiesError

            // Carregar managers de cada empresa
            const companiesWithManagers = await Promise.all(
                (companiesData || []).map(async (company: Company) => {
                    const { data: managers } = await supabase
                        .from('managers')
                        .select('*')
                        .eq('company_id', company.id)

                    const { data: employees } = await supabase
                        .from('employees')
                        .select('*')
                        .eq('company_id', company.id)
                        .order('created_at', { ascending: false })

                    return {
                        ...company,
                        managers: managers || [],
                        employees: employees || [],
                        employees_count: (employees || []).length
                    } as CompanyWithManagers
                })
            )

            setCompanies(companiesWithManagers)
        } catch (error) {
            console.error('Erro ao carregar empresas:', error)
            showError('Não foi possível carregar os dados das empresas', 'Erro ao Carregar')
        } finally {
            setLoading(false)
        }
    }

    async function toggleCompanyStatus(companyId: string, currentStatus: string) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

        const { error } = await supabase
            .from('companies')
            .update({ status: newStatus })
            .eq('id', companyId)

        if (error) {
            showError('Não foi possível atualizar o status da empresa', 'Erro')
            return
        }

        // Atualizar managers também
        await supabase
            .from('managers')
            .update({ status: newStatus })
            .eq('company_id', companyId)

        showSuccess(`Empresa ${newStatus === 'active' ? 'ativada' : 'desativada'} com sucesso!`, 'Status Atualizado')
        loadCompanies()
    }

    async function updateEmployeesQuota(companyId: string, newQuota: number) {
        if (newQuota < 5) {
            showWarning('A quota mínima de funcionários é 5', 'Quota Inválida')
            return
        }

        const { error } = await supabase
            .from('companies')
            .update({ employees_quota: newQuota })
            .eq('id', companyId)

        if (error) {
            showError('Não foi possível atualizar a quota de funcionários', 'Erro')
            return
        }

        showSuccess(`Quota atualizada para ${newQuota} funcionários`, 'Quota Atualizada')
        loadCompanies()
    }

    async function openDetails(company: CompanyWithManagers) {
        const { data: employees } = await supabase
            .from('employees')
            .select('*')
            .eq('company_id', company.id)
            .order('created_at', { ascending: false })

        const updatedCompany = {
            ...company,
            employees: employees || []
        }

        setSelectedCompany(updatedCompany)
        setShowModal(true)
        setExpandedEmployeeId(null)
        setEditingEmployeeId(null)
        setEditedHtml({})
    }

    async function saveEmployeeHtml(employeeId: string) {
        const htmlToSave = editedHtml[employeeId]

        if (!htmlToSave) {
            showWarning('Nenhuma alteração foi feita para salvar', 'Atenção')
            return
        }

        try {
            const { error } = await supabase
                .from('employees')
                .update({ journey_result_html: htmlToSave })
                .eq('id', employeeId)

            if (error) throw error

            // Atualizar o estado local
            if (selectedCompany) {
                const updatedEmployees = selectedCompany.employees?.map(emp =>
                    emp.id === employeeId ? { ...emp, journey_result_html: htmlToSave } : emp
                )
                setSelectedCompany({ ...selectedCompany, employees: updatedEmployees || [] })
            }

            setEditingEmployeeId(null)
            showSuccess('Mapa atualizado com sucesso!', '✅ Salvo')
        } catch (error) {
            console.error('Erro ao salvar:', error)
            showError('Não foi possível salvar as alterações. Tente novamente.', 'Erro ao Salvar')
        }
    }

    function startEditing(employeeId: string, currentHtml: string) {
        setEditingEmployeeId(employeeId)
        setEditedHtml({ ...editedHtml, [employeeId]: currentHtml })
    }

    function cancelEditing(employeeId: string) {
        setEditingEmployeeId(null)
        const newEditedHtml = { ...editedHtml }
        delete newEditedHtml[employeeId]
        setEditedHtml(newEditedHtml)
    }

    async function toggleReviewStatus(employeeId: string, currentStatus: boolean) {
        try {
            const { error } = await supabase
                .from('employees')
                .update({ under_review: !currentStatus })
                .eq('id', employeeId)

            if (error) throw error

            // Atualizar o estado local
            if (selectedCompany) {
                const updatedEmployees = selectedCompany.employees?.map(emp =>
                    emp.id === employeeId ? { ...emp, under_review: !currentStatus } : emp
                )
                setSelectedCompany({ ...selectedCompany, employees: updatedEmployees || [] })
            }

            if (!currentStatus) {
                showSuccess('Mapa marcado para revisão com sucesso!', '🔍 Em Revisão')
            } else {
                showSuccess('Mapa removido da revisão!', '✅ Revisão Concluída')
            }
        } catch (error) {
            console.error('Erro ao atualizar status de revisão:', error)
            showError('Não foi possível atualizar o status de revisão. Tente novamente.', 'Erro')
        }
    }

    async function regenerateMap(employeeId: string) {
        setRegeneratingMapId(employeeId)

        try {
            const response = await fetch('/api/employees/regenerate-map', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId })
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erro ao regenerar mapa')
            }

            if (!data.respostas) {
                showWarning('Funcionário não possui respostas salvas para regenerar o mapa', 'Sem Dados')
                return
            }

            // Aqui você pode:
            // 1. Enviar as respostas para o webhook externo
            // 2. Ou mostrar um modal com as respostas para o usuário enviar manualmente

            showSuccess('Respostas do mapa carregadas! Enviando para regeneração...', '🔄 Regenerando')

            // Enviar para o webhook externo
            const webhookUrl = 'https://webhook.terapiaempresarial.com.br/webhook/mapa-terapia'
            const webhookResponse = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data.respostas)
            })

            if (!webhookResponse.ok) {
                throw new Error('Erro ao enviar para o webhook de geração')
            }

            const webhookData = await webhookResponse.json()
            console.log('Resposta do webhook:', webhookData)

            showSuccess('Mapa regenerado com sucesso! Recarregue a página para ver as atualizações.', '✅ Concluído')

            // Recarregar os dados do funcionário
            if (selectedCompany) {
                const { data: employees } = await supabase
                    .from('employees')
                    .select('*')
                    .eq('company_id', selectedCompany.id)
                    .order('created_at', { ascending: false })

                setSelectedCompany({ ...selectedCompany, employees: employees || [] })
            }

        } catch (error) {
            console.error('Erro ao regenerar mapa:', error)
            showError(
                error instanceof Error ? error.message : 'Não foi possível regenerar o mapa',
                'Erro ao Regenerar'
            )
        } finally {
            setRegeneratingMapId(null)
        }
    }

    const filteredCompanies = companies
        .filter(c => filter === 'all' || c.status === filter)
        .filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.managers.some(m => m.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )

    if (checkingAuth || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        {checkingAuth ? 'Verificando permissões...' : 'Carregando dados...'}
                    </p>
                    {checkingAuth && (
                        <p className="mt-2 text-sm text-gray-500">
                            Se você não estiver logado, será redirecionado para o login
                        </p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Painel Administrativo
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gerencie empresas e gestores
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => window.location.href = '/gestor'}
                                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                title="Voltar para o Painel do Gestor"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Painel do Gestor
                            </button>
                            <button
                                onClick={loadCompanies}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Atualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-500 text-sm">Total de Empresas</div>
                        <div className="text-3xl font-bold text-gray-900 mt-2">{companies.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-500 text-sm">Empresas Ativas</div>
                        <div className="text-3xl font-bold text-green-600 mt-2">
                            {companies.filter(c => c.status === 'active').length}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-500 text-sm">Empresas Inativas</div>
                        <div className="text-3xl font-bold text-orange-600 mt-2">
                            {companies.filter(c => c.status === 'inactive').length}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-gray-500 text-sm">Total de Gestores</div>
                        <div className="text-3xl font-bold text-blue-600 mt-2">
                            {companies.reduce((acc, c) => acc + c.managers.length, 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-white p-4 rounded-lg shadow flex gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Buscar por empresa ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-4 py-2 rounded-lg ${filter === 'active'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Ativas
                        </button>
                        <button
                            onClick={() => setFilter('inactive')}
                            className={`px-4 py-2 rounded-lg ${filter === 'inactive'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Inativas
                        </button>
                    </div>
                </div>
            </div>

            {/* Companies List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empresa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gestores
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Funcionários
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Plano
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCompanies.map((company) => (
                                <tr key={company.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {company.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Criada em {new Date(company.created_at).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {company.managers.length} gestor(es)
                                        </div>
                                        {company.managers.map(m => (
                                            <div key={m.id} className="text-xs text-gray-500">
                                                {m.email}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {company.employees_count} / {company.employees_quota}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        ((company.employees_count || 0) / company.employees_quota) * 100
                                                    )}%`
                                                }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                            {company.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-orange-100 text-orange-800'
                                                }`}
                                        >
                                            {company.status === 'active' ? '✓ Ativa' : '⏸ Inativa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => toggleCompanyStatus(company.id, company.status)}
                                            className={`px-3 py-1 rounded ${company.status === 'active'
                                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                        >
                                            {company.status === 'active' ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button
                                            onClick={() => openDetails(company)}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                        >
                                            Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredCompanies.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Nenhuma empresa encontrada
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalhes */}
            {showModal && selectedCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {selectedCompany.name}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        ID: {selectedCompany.id}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Informações da Empresa */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    📊 Informações da Empresa
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600">Status</div>
                                        <div className="text-lg font-semibold mt-1">
                                            <span
                                                className={`px-3 py-1 rounded-full ${selectedCompany.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                    }`}
                                            >
                                                {selectedCompany.status === 'active' ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600">Plano</div>
                                        <div className="text-lg font-semibold mt-1">{selectedCompany.plan}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600">Quota de Funcionários</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="number"
                                                min="5"
                                                defaultValue={selectedCompany.employees_quota}
                                                onBlur={(e) => updateEmployeesQuota(selectedCompany.id, parseInt(e.target.value))}
                                                className="w-20 px-2 py-1 border rounded"
                                            />
                                            <span className="text-sm text-gray-600">
                                                ({selectedCompany.employees_count} em uso)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600">Criada em</div>
                                        <div className="text-lg font-semibold mt-1">
                                            {new Date(selectedCompany.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gestores */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    👥 Gestores ({selectedCompany.managers.length})
                                </h3>
                                <div className="space-y-3">
                                    {selectedCompany.managers.map((manager) => (
                                        <div key={manager.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {manager.full_name || manager.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">{manager.email}</div>
                                                    {manager.phone && (
                                                        <div className="text-sm text-gray-600">📱 {manager.phone}</div>
                                                    )}
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Criado em {new Date(manager.created_at).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 text-xs rounded-full ${manager.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-orange-100 text-orange-800'
                                                        }`}
                                                >
                                                    {manager.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Funcionários */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    🧑‍💼 Funcionários ({selectedCompany.employees?.length || 0})
                                </h3>
                                {selectedCompany.employees && selectedCompany.employees.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedCompany.employees.map((employee) => (
                                            <div key={employee.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            {employee.full_name || employee.name}
                                                        </div>
                                                        {employee.email && (
                                                            <div className="text-sm text-gray-600">📧 {employee.email}</div>
                                                        )}
                                                        {employee.whatsapp && (
                                                            <div className="text-sm text-gray-600">📱 {employee.whatsapp}</div>
                                                        )}
                                                        {employee.cpf && (
                                                            <div className="text-sm text-gray-600">🪪 CPF: {employee.cpf}</div>
                                                        )}
                                                        {employee.birth_date && (
                                                            <div className="text-sm text-gray-600">🎂 {new Date(employee.birth_date).toLocaleDateString('pt-BR')}</div>
                                                        )}
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Criado em {new Date(employee.created_at).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 items-end">
                                                        {employee.under_review && (
                                                            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                                                                🔍 Em Revisão
                                                            </span>
                                                        )}
                                                        {employee.archived && (
                                                            <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                                                📦 Arquivado
                                                            </span>
                                                        )}
                                                        {employee.journey_filled && (
                                                            <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                                                ✅ Jornada Preenchida
                                                            </span>
                                                        )}
                                                        {employee.accepted_at && (
                                                            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                                ✓ Aceito
                                                            </span>
                                                        )}
                                                        {employee.invited_at && !employee.accepted_at && (
                                                            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                                📧 Convidado
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Botões Ver Mapa, Editar e Revisão */}
                                                {employee.journey_result_html && (
                                                    <div className="mt-3 border-t pt-3">
                                                        <div className="flex gap-2 flex-wrap">
                                                            <button
                                                                onClick={() => setExpandedEmployeeId(
                                                                    expandedEmployeeId === employee.id ? null : employee.id
                                                                )}
                                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                                </svg>
                                                                {expandedEmployeeId === employee.id ? 'Ocultar Mapa' : 'Ver Mapa'}
                                                            </button>

                                                            <button
                                                                onClick={() => toggleReviewStatus(employee.id, employee.under_review || false)}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${employee.under_review
                                                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                                    : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                                                                    }`}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                                </svg>
                                                                {employee.under_review ? 'Remover de Revisão' : 'Marcar para Revisão'}
                                                            </button>

                                                            {employee.respostas_mapa_jornada && (
                                                                <button
                                                                    onClick={() => regenerateMap(employee.id)}
                                                                    disabled={regeneratingMapId === employee.id}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
                                                                >
                                                                    {regeneratingMapId === employee.id ? (
                                                                        <>
                                                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                            </svg>
                                                                            Regenerando...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                            </svg>
                                                                            Recarregar Mapa
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}

                                                            {expandedEmployeeId === employee.id && (
                                                                <>
                                                                    {editingEmployeeId === employee.id ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => saveEmployeeHtml(employee.id)}
                                                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                                Salvar
                                                                            </button>
                                                                            <button
                                                                                onClick={() => cancelEditing(employee.id)}
                                                                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                                Cancelar
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => startEditing(employee.id, employee.journey_result_html || '')}
                                                                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                            Editar HTML
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Journey Result HTML - expandível */}
                                                        {expandedEmployeeId === employee.id && (
                                                            <div className="mt-3">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="text-sm font-medium text-gray-700">
                                                                        📊 Resultado da Jornada de: <strong>{employee.full_name || employee.name}</strong>
                                                                    </div>
                                                                </div>

                                                                {editingEmployeeId === employee.id ? (
                                                                    <textarea
                                                                        value={editedHtml[employee.id] || ''}
                                                                        onChange={(e) => setEditedHtml({ ...editedHtml, [employee.id]: e.target.value })}
                                                                        className="w-full h-[600px] p-4 border rounded-lg font-mono text-sm"
                                                                        placeholder="Cole ou edite o HTML aqui..."
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className="bg-white p-6 rounded-lg max-h-[600px] overflow-y-auto border shadow-sm"
                                                                        style={{
                                                                            fontFamily: 'inherit',
                                                                            fontSize: 'inherit',
                                                                            lineHeight: '1.6',
                                                                            color: 'inherit'
                                                                        }}
                                                                        dangerouslySetInnerHTML={{ __html: employee.journey_result_html }}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                                        Nenhum funcionário cadastrado
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
