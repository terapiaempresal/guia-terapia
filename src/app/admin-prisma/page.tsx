'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Lista de emails de administradores
const ADMIN_EMAILS = [
    'lucashlc.contato@gmail.com',
]

interface Company {
    id: string
    name: string
    employees_quota: number
    plan: string
    status: string
    created_at: Date
    updated_at: Date
}

interface Manager {
    id: string
    company_id: string
    full_name: string
    email: string
    phone: string | null
    status: string
    created_at: Date
}

interface Employee {
    id: string
    company_id: string
    full_name: string
    email: string | null
    cpf: string | null
    whatsapp: string | null
    status: string
    journey_result_html: string | null
    created_at: Date
}

interface CompanyWithData extends Company {
    managers: Manager[]
    employees: Employee[]
    _count: {
        employees: number
    }
}

export default function AdminPagePrisma() {
    const router = useRouter()
    const [companies, setCompanies] = useState<CompanyWithData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCompany, setSelectedCompany] = useState<CompanyWithData | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)

    useEffect(() => {
        checkAdminAccess()
    }, [])

    async function checkAdminAccess() {
        try {
            console.log('🚀 [Prisma] Verificando acesso admin...')

            const { data: { session } } = await supabase.auth.getSession()
            const emailFromStorage = sessionStorage.getItem('manager_email')
            const userEmail = session?.user?.email || emailFromStorage

            if (!userEmail) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('redirectAfterLogin', '/admin')
                }
                router.push('/login')
                return
            }

            // Verificar is_admin no banco
            const { data: managerData } = await supabase
                .from('managers')
                .select('is_admin, full_name, status')
                .eq('email', userEmail)
                .single()

            if (!managerData?.is_admin && !ADMIN_EMAILS.includes(userEmail)) {
                alert(`Acesso negado! Apenas administradores podem acessar.`)
                router.push('/gestor')
                return
            }

            console.log('✅ [Prisma] Admin autorizado:', userEmail)
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
            console.log('📊 [Prisma] Carregando empresas...')

            // Usando fetch para chamar API route que usa Prisma
            const response = await fetch('/api/admin/companies')
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao carregar empresas')
            }

            console.log('✅ [Prisma] Empresas carregadas:', data.companies.length)
            setCompanies(data.companies)
        } catch (error) {
            console.error('❌ [Prisma] Erro ao carregar empresas:', error)
            alert('Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    async function toggleCompanyStatus(companyId: string, currentStatus: string) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

        try {
            const response = await fetch(`/api/admin/companies/${companyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) throw new Error('Erro ao atualizar status')

            loadCompanies()
        } catch (error) {
            console.error('Erro:', error)
            alert('Erro ao atualizar status')
        }
    }

    async function updateEmployeesQuota(companyId: string, newQuota: number) {
        if (newQuota < 5) {
            alert('Mínimo de 5 funcionários')
            return
        }

        try {
            const response = await fetch(`/api/admin/companies/${companyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employees_quota: newQuota })
            })

            if (!response.ok) throw new Error('Erro ao atualizar quota')

            loadCompanies()
        } catch (error) {
            console.error('Erro:', error)
            alert('Erro ao atualizar quota')
        }
    }

    async function openDetails(company: CompanyWithData) {
        console.log('🔍 [Prisma] Abrindo detalhes:', company.name)
        setSelectedCompany(company)
        setShowModal(true)
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
                                <span className="ml-3 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                    ⚡ Prisma ORM
                                </span>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gerencie empresas e gestores
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => window.location.href = '/gestor'}
                                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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

            {/* Companies Table - continuação no próximo arquivo... */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestores</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funcionários</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCompanies.map((company) => (
                                <tr key={company.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(company.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">{company.managers.length} gestor(es)</div>
                                        {company.managers.slice(0, 2).map(m => (
                                            <div key={m.id} className="text-xs text-gray-500">{m.email}</div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            {company._count.employees} / {company.employees_quota}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(100, (company._count.employees / company.employees_quota) * 100)}%`
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                            {company.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 text-xs font-semibold rounded-full ${company.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {company.status === 'active' ? '✓ Ativa' : '⏸ Inativa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button
                                            onClick={() => toggleCompanyStatus(company.id, company.status)}
                                            className={`px-3 py-1 rounded text-sm ${company.status === 'active'
                                                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                        >
                                            {company.status === 'active' ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button
                                            onClick={() => openDetails(company)}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
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

            {/* Modal - continua... */}
            {showModal && selectedCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h2>
                                    <p className="text-gray-600 mt-1">ID: {selectedCompany.id}</p>
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
                                <h3 className="text-lg font-semibold mb-4">📊 Informações da Empresa</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600">Status</div>
                                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${selectedCompany.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {selectedCompany.status === 'active' ? 'Ativa' : 'Inativa'}
                                        </span>
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
                                                ({selectedCompany._count.employees} em uso)
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
                                <h3 className="text-lg font-semibold mb-4">
                                    👥 Gestores ({selectedCompany.managers.length})
                                </h3>
                                <div className="space-y-3">
                                    {selectedCompany.managers.map((manager) => (
                                        <div key={manager.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between">
                                                <div>
                                                    <div className="font-semibold">{manager.full_name}</div>
                                                    <div className="text-sm text-gray-600">{manager.email}</div>
                                                    {manager.phone && <div className="text-sm text-gray-600">📱 {manager.phone}</div>}
                                                </div>
                                                <span className={`px-3 py-1 h-fit text-xs rounded-full ${manager.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {manager.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Funcionários */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">
                                    🧑‍💼 Funcionários ({selectedCompany.employees.length})
                                </h3>
                                {selectedCompany.employees.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedCompany.employees.map((employee) => (
                                            <div key={employee.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between mb-3">
                                                    <div>
                                                        <div className="font-semibold">{employee.full_name}</div>
                                                        {employee.email && <div className="text-sm text-gray-600">{employee.email}</div>}
                                                        {employee.whatsapp && <div className="text-sm text-gray-600">📱 {employee.whatsapp}</div>}
                                                        {employee.cpf && <div className="text-sm text-gray-600">CPF: {employee.cpf}</div>}
                                                    </div>
                                                    <span className={`px-3 py-1 h-fit text-xs rounded-full ${employee.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : employee.status === 'invited'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {employee.status === 'active' ? 'Ativo' : employee.status === 'invited' ? 'Convidado' : 'Bloqueado'}
                                                    </span>
                                                </div>

                                                {/* Journey Result HTML */}
                                                {employee.journey_result_html && (
                                                    <div className="mt-3 border-t pt-3">
                                                        <div className="text-sm font-medium text-gray-700 mb-2">
                                                            📊 Resultado da Jornada:
                                                        </div>
                                                        <div
                                                            className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto text-sm"
                                                            dangerouslySetInnerHTML={{ __html: employee.journey_result_html }}
                                                        />
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
