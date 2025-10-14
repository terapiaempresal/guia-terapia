'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Department {
    id: string
    company_id: string
    name: string
    description?: string
    created_at: string
}

export default function DepartmentsPage() {
    const router = useRouter()
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [companyId, setCompanyId] = useState<string | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newDepartment, setNewDepartment] = useState({
        name: '',
        description: ''
    })

    useEffect(() => {
        loadDepartments()
    }, [])

    async function loadDepartments() {
        try {
            // Buscar company_id do localStorage
            const managerId = localStorage.getItem('userId')

            if (!managerId) {
                alert('Sessão expirada. Faça login novamente.')
                router.push('/login')
                return
            }

            // Buscar dados do manager para obter company_id
            const managerEmail = sessionStorage.getItem('manager_email')
            const response = await fetch(`/api/companies?manager_email=${managerEmail}`)
            const data = await response.json()

            if (!response.ok || !data.company) {
                throw new Error('Erro ao buscar empresa')
            }

            setCompanyId(data.company.id)

            // Buscar departamentos
            const depsResponse = await fetch(`/api/departments?company_id=${data.company.id}`)
            const depsData = await depsResponse.json()

            if (depsResponse.ok) {
                setDepartments(depsData.departments || [])
            }

        } catch (error) {
            console.error('Erro ao carregar departamentos:', error)
            alert('Erro ao carregar departamentos')
        } finally {
            setLoading(false)
        }
    }

    async function handleAddDepartment(e: React.FormEvent) {
        e.preventDefault()

        if (!companyId) {
            alert('Erro: ID da empresa não encontrado')
            return
        }

        if (!newDepartment.name.trim()) {
            alert('Nome do departamento é obrigatório')
            return
        }

        try {
            const response = await fetch('/api/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_id: companyId,
                    name: newDepartment.name.trim(),
                    description: newDepartment.description.trim() || null
                })
            })

            const data = await response.json()

            if (response.ok) {
                alert('Departamento adicionado com sucesso!')
                setShowAddModal(false)
                setNewDepartment({ name: '', description: '' })
                loadDepartments()
            } else {
                alert(data.error || 'Erro ao adicionar departamento')
            }

        } catch (error) {
            console.error('Erro ao adicionar departamento:', error)
            alert('Erro ao adicionar departamento')
        }
    }

    async function handleDeleteDepartment(departmentId: string, departmentName: string) {
        if (!confirm(`Tem certeza que deseja excluir o departamento "${departmentName}"?`)) {
            return
        }

        try {
            const response = await fetch(`/api/departments?id=${departmentId}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (response.ok) {
                alert('Departamento excluído com sucesso!')
                loadDepartments()
            } else {
                alert(data.error || 'Erro ao excluir departamento')
            }

        } catch (error) {
            console.error('Erro ao excluir departamento:', error)
            alert('Erro ao excluir departamento')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Áreas de Atuação / Departamentos
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gerencie as áreas de atuação da sua empresa
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => router.push('/gestor')}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                + Adicionar Área
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {departments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma área cadastrada</h3>
                        <p className="mt-1 text-gray-500">Comece adicionando as áreas de atuação da sua empresa</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Adicionar Primeira Área
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((dept) => (
                            <div key={dept.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                                        {dept.description && (
                                            <p className="mt-2 text-sm text-gray-600">{dept.description}</p>
                                        )}
                                        <p className="mt-3 text-xs text-gray-400">
                                            Criado em {new Date(dept.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                        className="ml-4 text-red-600 hover:text-red-800"
                                        title="Excluir"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Adicionar */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Adicionar Área de Atuação</h2>

                        <form onSubmit={handleAddDepartment}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome da Área *
                                </label>
                                <input
                                    type="text"
                                    value={newDepartment.name}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Recursos Humanos, Comercial..."
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição (opcional)
                                </label>
                                <textarea
                                    value={newDepartment.description}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Breve descrição da área..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setNewDepartment({ name: '', description: '' })
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
