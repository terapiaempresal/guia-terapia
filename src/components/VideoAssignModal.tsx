'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ToastProvider'

interface Employee {
    id: string
    full_name: string
    email: string
    status: string  // 'Convidado' | 'Ativo' | 'Arquivado'
    mapStatus: string  // 'Não iniciado' | 'Aguardando retorno' | 'Concluído'
    created_at: string
}

interface Video {
    id: string
    title: string
    description?: string
    duration?: number
    created_at: string
}

interface VideoAssignModalProps {
    video: Video
    onClose: () => void
    onSuccess: () => void
}

export default function VideoAssignModal({ video, onClose, onSuccess }: VideoAssignModalProps) {
    const { showSuccess, showError, showWarning } = useToast()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all'>('all')
    const [loading, setLoading] = useState(true)
    const [assigning, setAssigning] = useState(false)

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            // Pegar ID do gestor do localStorage
            const managerId = localStorage.getItem('userId')
            const url = managerId ? `/api/employees?manager_id=${managerId}` : '/api/employees'

            const response = await fetch(url)
            const data = await response.json()

            if (data.success) {
                console.log('👥 Funcionários carregados:', data.employees.map((emp: any) => ({ name: emp.full_name, status: emp.status })))
                setEmployees(data.employees)
            } else {
                showError('Erro ao carregar funcionários')
            }
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error)
            showError('Erro ao carregar funcionários')
        } finally {
            setLoading(false)
        }
    }

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesSearch
    })

    const handleEmployeeToggle = (employeeId: string) => {
        const newSelected = new Set(selectedEmployees)
        if (newSelected.has(employeeId)) {
            newSelected.delete(employeeId)
        } else {
            newSelected.add(employeeId)
        }
        setSelectedEmployees(newSelected)
    }

    const handleSelectAll = () => {
        if (selectedEmployees.size === filteredEmployees.length) {
            setSelectedEmployees(new Set())
        } else {
            setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.id)))
        }
    }

    const handleAssign = async () => {
        if (selectedEmployees.size === 0) {
            showWarning('Selecione ao menos um funcionário')
            return
        }

        setAssigning(true)

        try {
            const response = await fetch('/api/videos/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    video_id: video.id,
                    employee_ids: Array.from(selectedEmployees)
                })
            })

            const data = await response.json()

            if (data.success) {
                showSuccess(`Vídeo atribuído a ${selectedEmployees.size} funcionário(s)`)
                onSuccess()
            } else {
                showError(data.error || 'Erro ao atribuir vídeo')
            }
        } catch (error) {
            console.error('Erro na atribuição:', error)
            showError('Erro ao atribuir vídeo. Tente novamente.')
        } finally {
            setAssigning(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const badges = {
            'Ativo': 'bg-green-100 text-green-800',
            'Convidado': 'bg-yellow-100 text-yellow-800',
            'Arquivado': 'bg-red-100 text-red-800'
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        )
    }

    const getMapStatusBadge = (mapStatus: string) => {
        const badges = {
            'Não iniciado': 'bg-gray-100 text-gray-800',
            'Aguardando retorno': 'bg-blue-100 text-blue-800',
            'Concluído': 'bg-purple-100 text-purple-800'
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[mapStatus as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
                {mapStatus}
            </span>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR')
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Atribuir Vídeo
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {video.title}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={assigning}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Filtros */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={assigning}
                        />
                    </div>

                    {/* Seleção em massa */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                                disabled={assigning || filteredEmployees.length === 0}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                                    onChange={() => { }}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <span>
                                    {selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0
                                        ? 'Desmarcar todos'
                                        : 'Selecionar todos'
                                    }
                                </span>
                            </button>
                        </div>
                        <div className="text-sm text-gray-600">
                            {selectedEmployees.size} de {filteredEmployees.length} selecionados
                        </div>
                    </div>

                    {/* Lista de funcionários */}
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Carregando funcionários...</p>
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Nenhum funcionário encontrado com os filtros aplicados'
                                    : 'Nenhum funcionário cadastrado'
                                }
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredEmployees.map((employee) => (
                                    <div
                                        key={employee.id}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedEmployees.has(employee.id) ? 'bg-blue-50' : ''
                                            }`}
                                        onClick={() => handleEmployeeToggle(employee.id)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployees.has(employee.id)}
                                                onChange={() => { }}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                disabled={assigning}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {employee.full_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {employee.email}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs text-gray-400">
                                                            {formatDate(employee.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end space-x-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={assigning}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleAssign}
                            className="btn-primary"
                            disabled={assigning || selectedEmployees.size === 0}
                        >
                            {assigning ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Atribuindo...
                                </>
                            ) : (
                                `Atribuir a ${selectedEmployees.size} funcionário(s)`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}