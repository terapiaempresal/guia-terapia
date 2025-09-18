'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'

interface Video {
    id: string
    title: string
    description?: string
    video_url: string
    thumbnail_url?: string
    duration?: number
    category?: string
    youtube_id?: string // Para compatibilidade
}

export default function VideosPage() {
    const { user, logout } = useAuth()
    const [videos, setVideos] = useState<Video[]>([])
    const [progress, setProgress] = useState<{ [key: string]: boolean }>({})
    const [loading, setLoading] = useState(true)
    const [expandedVideos, setExpandedVideos] = useState<{ [key: string]: boolean }>({})

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
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header com logout */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar ao Dashboard
                    </button>
                    
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            Olá, {user?.name || localStorage.getItem('employeeName') || user?.email}
                        </span>
                        <button
                            onClick={logout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Módulo de Vídeos
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Assista aos vídeos e marque como assistido conforme progride
                    </p>
                    
                    {/* Barra de Progresso */}
                    {videos.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                    Progresso do Curso
                                </span>
                                <span className="text-sm text-gray-500">
                                    {Object.values(progress).filter(Boolean).length} de {videos.length} vídeos assistidos
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                        width: `${videos.length > 0 ? (Object.values(progress).filter(Boolean).length / videos.length) * 100 : 0}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {videos.map((video, index) => {
                        const isExpanded = expandedVideos[video.id]
                        const isWatched = progress[video.id] || false
                        const youtubeId = video.youtube_id || extractYouTubeId(video.video_url)
                        
                        return (
                            <div key={video.id} className="card overflow-hidden">
                                {/* Cabeçalho do Acordeão */}
                                <div
                                    onClick={() => toggleVideo(video.id)}
                                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                                >
                                    <div className="flex items-center space-x-4">
                                        {/* Thumbnail ou Número do Módulo */}
                                        <div className="flex-shrink-0">
                                            {video.thumbnail_url ? (
                                                <img 
                                                    src={video.thumbnail_url} 
                                                    alt={video.title}
                                                    className="w-16 h-12 object-cover rounded"
                                                />
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    isWatched 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-primary-100 text-primary-800'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            )}
                                        </div>

                                        {/* Título e Status */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {video.title}
                                            </h3>
                                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                                                <span>Módulo {index + 1}</span>
                                                {video.duration && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{formatDuration(video.duration)}</span>
                                                    </>
                                                )}
                                                {video.category && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="capitalize">{video.category}</span>
                                                    </>
                                                )}
                                                {isWatched && (
                                                    <>
                                                        <span>•</span>
                                                        <div className="flex items-center text-green-600">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="font-medium">Assistido</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ícone de Expandir/Contrair */}
                                    <div className="flex items-center space-x-4">
                                        <label 
                                            className="flex items-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isWatched}
                                                onChange={(e) => toggleWatched(video.id, e.target.checked)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                Marcar como assistido
                                            </span>
                                        </label>

                                        <svg 
                                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                                isExpanded ? 'rotate-180' : ''
                                            }`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Conteúdo do Vídeo (Expansível) */}
                                <div className={`transition-all duration-300 ease-in-out ${
                                    isExpanded 
                                        ? 'max-h-screen opacity-100' 
                                        : 'max-h-0 opacity-0 overflow-hidden'
                                }`}>
                                    <div className="p-6 pt-0">
                                        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                                            {youtubeId ? (
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                                    title={video.title}
                                                    className="w-full h-full"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white">
                                                    <div className="text-center">
                                                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                        <p className="text-gray-400">Vídeo não disponível</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Informações adicionais do vídeo */}
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">Sobre este módulo:</h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {video.description || 'Assista ao vídeo completo e marque como assistido quando terminar.'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Isso ajudará a acompanhar seu progresso no curso.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

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
