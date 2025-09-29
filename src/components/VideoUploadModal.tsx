'use client'

import { useState } from 'react'
import { useToast } from '@/components/ToastProvider'

interface VideoUploadModalProps {
    onClose: () => void
    onSuccess: () => void
}

export default function VideoUploadModal({ onClose, onSuccess }: VideoUploadModalProps) {
    const { showSuccess, showError, showWarning } = useToast()
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        youtube_url: ''
    })
    const [thumbnail, setThumbnail] = useState<string | null>(null)

    // Função para extrair ID do vídeo do YouTube
    const extractYouTubeVideoId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ]

        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }
        return null
    }

    // Função para gerar thumbnail do YouTube com fallback
    const generateThumbnail = async (videoId: string): Promise<string> => {
        // Tentar maxresdefault primeiro (alta qualidade)
        const maxres = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

        try {
            const response = await fetch(maxres, { method: 'HEAD' })
            if (response.ok) {
                return maxres
            }
        } catch (error) {
            console.log('maxresdefault não disponível, usando fallback')
        }

        // Fallback para hqdefault (sempre disponível)
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }

    // Validar URL do YouTube e gerar thumbnail
    const handleUrlChange = async (url: string) => {
        setFormData(prev => ({ ...prev, youtube_url: url }))

        if (url.trim()) {
            const videoId = extractYouTubeVideoId(url)
            if (videoId) {
                const thumbnailUrl = await generateThumbnail(videoId)
                setThumbnail(thumbnailUrl)

                // Auto-preencher título se estiver vazio
                if (!formData.title.trim()) {
                    setFormData(prev => ({
                        ...prev,
                        title: `Vídeo do YouTube - ${videoId}`
                    }))
                }
            } else {
                setThumbnail(null)
            }
        } else {
            setThumbnail(null)
        }
    }

    const validateYouTubeUrl = (url: string): boolean => {
        return extractYouTubeVideoId(url) !== null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.youtube_url.trim()) {
            showWarning('Digite a URL do vídeo do YouTube')
            return
        }

        if (!validateYouTubeUrl(formData.youtube_url)) {
            showError('URL do YouTube inválida. Use formatos como: https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID')
            return
        }

        if (!formData.title.trim()) {
            showWarning('Digite um título para o vídeo')
            return
        }

        setSaving(true)

        try {
            const videoId = extractYouTubeVideoId(formData.youtube_url)
            const managerId = localStorage.getItem('userId')
            let companyId = localStorage.getItem('companyId')

            console.log('🔍 Debug upload:', { managerId, companyId, videoId })

            // Se não tem companyId no localStorage, buscar da API
            if (!companyId && managerId) {
                try {
                    const managerResponse = await fetch(`/api/companies?manager_email=${localStorage.getItem('userEmail')}`)
                    const managerData = await managerResponse.json()
                    console.log('📊 Resposta da API companies:', managerData)

                    if (managerData.success && managerData.company?.id) {
                        companyId = managerData.company.id
                        if (companyId) {
                            localStorage.setItem('companyId', companyId)
                            console.log('✅ CompanyId encontrado e salvo:', companyId)
                        }
                    } else {
                        console.error('❌ Estrutura de resposta inesperada:', managerData)
                    }
                } catch (error) {
                    console.error('Erro ao buscar companyId:', error)
                }
            }

            // Validar dados obrigatórios
            if (!managerId) {
                showError('Erro: ID do gestor não encontrado. Faça login novamente.')
                return
            }

            if (!companyId) {
                showError('Erro: ID da empresa não encontrado. Contate o suporte.')
                return
            }

            const response = await fetch('/api/videos/management', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    youtube_url: formData.youtube_url.trim(),
                    youtube_video_id: videoId,
                    thumbnail_url: thumbnail,
                    type: 'youtube',
                    manager_id: managerId,
                    company_id: companyId
                })
            })

            const data = await response.json()

            if (data.success) {
                showSuccess('Vídeo adicionado com sucesso!')
                onSuccess()
            } else {
                showError(data.error || 'Erro ao adicionar vídeo')
            }
        } catch (error) {
            console.error('Erro ao salvar vídeo:', error)
            showError('Erro ao adicionar vídeo. Tente novamente.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Adicionar Vídeo do YouTube
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={saving}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* URL do YouTube */}
                        <div>
                            <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-700 mb-2">
                                URL do Vídeo do YouTube *
                            </label>
                            <input
                                type="url"
                                id="youtube_url"
                                value={formData.youtube_url}
                                onChange={(e) => handleUrlChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID"
                                required
                                disabled={saving}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Cole o link do vídeo do YouTube (suporte a youtube.com e youtu.be)
                            </p>
                        </div>

                        {/* Preview do Thumbnail */}
                        {thumbnail && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preview do Vídeo
                                </label>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <img
                                        src={thumbnail}
                                        alt="Thumbnail do vídeo"
                                        className="w-full max-w-sm mx-auto rounded"
                                        onError={(e) => {
                                            // Fallback para thumbnail padrão se a imagem não carregar
                                            const target = e.target as HTMLImageElement
                                            target.src = `https://img.youtube.com/vi/${extractYouTubeVideoId(formData.youtube_url)}/hqdefault.jpg`
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Título */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Título *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Digite o título do vídeo"
                                required
                                disabled={saving}
                            />
                        </div>

                        {/* Descrição */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Descrição
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Descreva o conteúdo do vídeo (opcional)"
                                disabled={saving}
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={saving || !formData.youtube_url.trim() || !formData.title.trim()}
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Salvando...
                                    </>
                                ) : (
                                    'Adicionar Vídeo'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}