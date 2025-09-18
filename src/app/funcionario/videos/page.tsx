'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface Video {
    id: string
    title: string
    description?: string
    video_url: string
    thumbnail_url?: string
    duration?: number
    category?: string
}

export default function VideosPage() {
    const { logout } = useAuth()
    const router = useRouter()
    const [videos, setVideos] = useState<Video[]>([])
    const [progress, setProgress] = useState<{ [key: string]: boolean }>({})
    const [loading, setLoading] = useState(true)
    const [expandedVideos, setExpandedVideos] = useState<{ [key: string]: boolean }>({})

    // Função para voltar à área do funcionário
    const handleBackToHome = () => {
        router.push('/funcionario')
    }

    // Função para extrair o ID do YouTube da URL
    const extractYouTubeId = (url: string): string | null => {
        if (!url) return null

        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)

        return (match && match[2].length === 11) ? match[2] : null
    }

    // Função para formatar duração em minutos
    const formatDuration = (seconds?: number): string => {
        if (!seconds) return ''
        const minutes = Math.floor(seconds / 60)
        return `${minutes} min`
    }

    useEffect(() => {
        // Verificar se é funcionário logado
        const employeeId = localStorage.getItem('employeeId')
        const userType = localStorage.getItem('userType')

        if (!employeeId || userType !== 'funcionario') {
            logout() // Redireciona para login
            return
        }

        loadVideos()
        loadProgress(employeeId)
    }, [])

    const loadProgress = async (employeeId: string) => {
        try {
            console.log('📊 Carregando progresso para funcionário:', employeeId)
            const response = await fetch(`/api/videos/progress/get?employee_id=${employeeId}`)
            const data = await response.json()

            if (data.success && data.progress) {
                setProgress(data.progress)
                console.log('Progresso carregado:', data.progress)
            } else {
                console.log('Nenhum progresso encontrado')
                setProgress({})
            }
        } catch (error) {
            console.error('Erro ao carregar progresso:', error)
        }
    }

    const loadVideos = async () => {
        try {
            const response = await fetch('/api/videos')
            const data = await response.json()
            const videosList = data.videos || []
            setVideos(videosList)

            // Expandir o primeiro vídeo automaticamente
            if (videosList.length > 0) {
                setExpandedVideos({ [videosList[0].id]: true })
            }
        } catch (error) {
            console.error('Erro ao carregar vídeos:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleWatched = async (videoId: string, watched: boolean) => {
        try {
            const employeeId = localStorage.getItem('employeeId')

            if (!employeeId) {
                console.error('Employee ID não encontrado')
                return
            }

            console.log('🔄 Atualizando progresso:', { videoId, watched, employeeId })

            await fetch('/api/videos/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_id: videoId,
                    completed: watched,
                    employee_id: employeeId
                })
            })

            setProgress(prev => ({ ...prev, [videoId]: watched }))
            console.log('✅ Progresso atualizado')
        } catch (error) {
            console.error('Erro ao atualizar progresso:', error)
        }
    }

    const toggleVideo = (videoId: string) => {
        setExpandedVideos(prev => ({
            ...prev,
            [videoId]: !prev[videoId]
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-gray-300 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <div className="bg-primary-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBackToHome}
                            className="flex items-center space-x-2 text-primary-100 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Voltar à Área do Funcionário</span>
                        </button>
                        <button
                            onClick={logout}
                            className="text-primary-100 hover:text-white transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Módulos de Vídeo
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Assista aos vídeos e marque como assistido quando concluir
                    </p>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {videos.map((video) => {
                        const isWatched = progress[video.id] || false
                        const isExpanded = expandedVideos[video.id] || false
                        const youtubeId = extractYouTubeId(video.video_url)

                        return (
                            <div
                                key={video.id}
                                className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${isWatched
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {/* Header do vídeo */}
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => toggleVideo(video.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {/* Status */}
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isWatched ? 'bg-green-500' : 'bg-gray-300'
                                                }`}>
                                                {isWatched ? (
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Título e info */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {video.title}
                                                </h3>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    {video.duration && (
                                                        <span className="text-sm text-gray-500">
                                                            {formatDuration(video.duration)}
                                                        </span>
                                                    )}
                                                    {video.category && (
                                                        <span className="text-sm text-blue-600 capitalize">
                                                            {video.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ícone de expansão */}
                                        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                            }`}>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Conteúdo expandido */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 p-6">
                                        {/* Descrição */}
                                        {video.description && (
                                            <p className="text-gray-600 mb-6">
                                                {video.description}
                                            </p>
                                        )}

                                        {/* Player de vídeo */}
                                        <div className="mb-6">
                                            {youtubeId ? (
                                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${youtubeId}`}
                                                        title={video.title}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="w-full h-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <div className="text-center text-gray-500">
                                                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        <p>Vídeo não disponível</p>
                                                        <p className="text-sm">URL: {video.video_url}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Botão de marcar como assistido */}
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleWatched(video.id, !isWatched)
                                                }}
                                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isWatched
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                    }`}
                                            >
                                                {isWatched ? (
                                                    <>
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Assistido</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>Marcar como assistido</span>
                                                    </>
                                                )}
                                            </button>

                                            <div className="text-sm text-gray-500">
                                                <p>
                                                    Marque como assistido após concluir o vídeo.
                                                </p>
                                                <p>
                                                    Isso ajudará a acompanhar seu progresso no curso.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Estado vazio */}
                {videos.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum vídeo disponível
                        </h3>
                        <p className="text-gray-600">
                            Os vídeos serão liberados em breve
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}