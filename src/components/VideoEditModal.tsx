'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ToastProvider'

interface Video {
    id: string
    title: string
    description: string
    video_url: string
    thumbnail_url?: string
    duration?: number
    created_by_type?: string
}

interface VideoEditModalProps {
    video: Video
    onClose: () => void
    onSuccess: () => void
}

export default function VideoEditModal({ video, onClose, onSuccess }: VideoEditModalProps) {
    const { showSuccess, showError } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: video.title || '',
        description: video.description || '',
        video_url: video.video_url || '',
        thumbnail_url: video.thumbnail_url || '',
        duration: video.duration || 0
    })

    // Determinar se é vídeo do sistema (só pode editar título e descrição)
    const isSystemVideo = video.created_by_type === 'system'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const managerId = localStorage.getItem('userId')

            const response = await fetch('/api/videos/management', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: video.id,
                    manager_id: managerId,
                    ...formData
                }),
            })

            const data = await response.json()

            if (data.success) {
                showSuccess('Vídeo atualizado com sucesso!')
                onSuccess()
            } else {
                showError(data.error || 'Erro ao atualizar vídeo')
            }
        } catch (error) {
            console.error('Erro ao atualizar vídeo:', error)
            showError('Erro ao atualizar vídeo')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Editar Vídeo
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {isSystemVideo && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Este é um vídeo do sistema. Você pode editar apenas o título e descrição.
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Título */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Título *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Digite o título do vídeo"
                            />
                        </div>

                        {/* Descrição */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Digite a descrição do vídeo"
                            />
                        </div>

                        {/* URL do Vídeo - só para vídeos da empresa */}
                        {!isSystemVideo && (
                            <div>
                                <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
                                    URL do Vídeo *
                                </label>
                                <input
                                    type="url"
                                    id="video_url"
                                    name="video_url"
                                    value={formData.video_url}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                        )}

                        {/* Duração - só para vídeos da empresa */}
                        {!isSystemVideo && (
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                                    Duração (segundos)
                                </label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: 300 (5 minutos)"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}