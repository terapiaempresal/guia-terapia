'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import VideoUploadModal from '@/components/VideoUploadModal'
import VideoAssignModal from '@/components/VideoAssignModal'
import VideoEditModal from '@/components/VideoEditModal'

interface Video {
    id: string
    title: string
    description: string
    duration: number
    video_url: string
    thumbnail_url?: string
    created_at: string
    updated_at: string
    created_by_type?: string
    created_by_id?: string
    company_id?: string
    display_order?: number
    category?: string
    is_public?: boolean
}

interface Employee {
    id: string
    name: string
    email: string
    department?: string
    is_active: boolean
}

interface VideoAssignment {
    id: string
    video_id: string
    employee_id: string
    assigned_at: string
    assigned_by: string
    status: 'pending' | 'watched' | 'skipped'
}

export default function VideoManagementPage() {
    const router = useRouter()
    const { showSuccess, showError } = useToast()
    const [loading, setLoading] = useState(true)
    const [videos, setVideos] = useState<Video[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [assignments, setAssignments] = useState<VideoAssignment[]>([])
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)

            // Verificar autenticação do gestor
            const userType = localStorage.getItem('userType')
            if (userType !== 'gestor') {
                showError('Acesso restrito a gestores')
                router.push('/login')
                return
            }

            // Carregar vídeos, funcionários e atribuições
            await Promise.all([
                loadVideos(),
                loadEmployees(),
                loadAssignments()
            ])
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
            showError('Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    const loadVideos = async () => {
        try {
            const response = await fetch('/api/videos/management')
            const data = await response.json()
            if (data.success) {
                setVideos(data.videos || [])
            }
        } catch (error) {
            console.error('Erro ao carregar vídeos:', error)
        }
    }

    const loadEmployees = async () => {
        try {
            // Pegar ID do gestor do localStorage
            const managerId = localStorage.getItem('userId')
            const url = managerId ? `/api/employees?manager_id=${managerId}` : '/api/employees'

            const response = await fetch(url)
            const data = await response.json()
            if (data.success) {
                setEmployees(data.employees || [])
            }
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error)
        }
    }

    const loadAssignments = async () => {
        try {
            const response = await fetch('/api/videos/assignments')
            const data = await response.json()
            if (data.success) {
                setAssignments(data.assignments || [])
            }
        } catch (error) {
            console.error('Erro ao carregar atribuições:', error)
        }
    }

    const handleUploadSuccess = () => {
        setShowUploadModal(false)
        loadVideos()
        showSuccess('Vídeo enviado com sucesso!')
    }

    const handleAssignSuccess = () => {
        setShowAssignModal(false)
        setSelectedVideo(null)
        loadAssignments()
        showSuccess('Vídeo atribuído com sucesso!')
    }

    const handleEditVideo = (video: any) => {
        setSelectedVideo(video)
        setShowEditModal(true)
    }

    const handleDeleteVideo = async (video: any) => {
        if (!confirm(`Tem certeza que deseja remover o vídeo "${video.title}"?`)) {
            return
        }

        try {
            const response = await fetch(`/api/videos/management?id=${video.id}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                showSuccess('Vídeo removido com sucesso!')
                loadVideos()
            } else {
                showError(data.error || 'Erro ao remover vídeo')
            }
        } catch (error) {
            console.error('Erro ao remover vídeo:', error)
            showError('Erro ao remover vídeo')
        }
    }

    const handleEditSuccess = () => {
        setShowEditModal(false)
        setSelectedVideo(null)
        loadVideos()
        showSuccess('Vídeo editado com sucesso!')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando gerenciamento de vídeos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/gestor')}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Voltar ao Dashboard
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Gerenciamento de Vídeos
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Envie vídeos e controle quem pode visualizar
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="btn-primary inline-flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Enviar Vídeo
                        </button>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total de Vídeos</p>
                                <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Funcionários</p>
                                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Vídeos */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Vídeos Enviados</h2>
                    </div>

                    {videos.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo enviado</h3>
                            <p className="text-gray-600 mb-4">Comece enviando seu primeiro vídeo para os funcionários</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="btn-primary"
                            >
                                Enviar Primeiro Vídeo
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {videos.map((video) => {
                                return (
                                    <div key={video.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
                                                <p className="text-sm text-gray-600">{video.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Enviado em {new Date(video.created_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditVideo(video)}
                                                    className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm"
                                                    title="Editar vídeo"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Editar
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedVideo(video)
                                                        setShowAssignModal(true)
                                                    }}
                                                    className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm"
                                                    title="Atribuir vídeo"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Atribuir
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteVideo(video)}
                                                    className="flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm"
                                                    title="Remover vídeo"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remover
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Upload */}
            {showUploadModal && (
                <VideoUploadModal
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}

            {/* Modal de Atribuição */}
            {showAssignModal && selectedVideo && (
                <VideoAssignModal
                    video={selectedVideo}
                    onClose={() => {
                        setShowAssignModal(false)
                        setSelectedVideo(null)
                    }}
                    onSuccess={handleAssignSuccess}
                />
            )}

            {/* Modal de Edição */}
            {showEditModal && selectedVideo && (
                <VideoEditModal
                    video={selectedVideo}
                    onClose={() => {
                        setShowEditModal(false)
                        setSelectedVideo(null)
                    }}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    )
}

// Componente de Upload Modal (será implementado)
