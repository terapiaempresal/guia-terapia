'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EmployeeDashboard() {
    const [activeTab, setActiveTab] = useState<'mapa' | 'ferramentas' | 'videos'>('mapa')

    const employee = {
        name: 'João Silva',
        company: 'Empresa Tech Ltda'
    }

    const stats = {
        mapaStatus: 'done',
        videosWatched: 2,
        totalVideos: 6,
        documentUpdated: new Date('2024-01-15')
    }

    const getMapStatusBadge = () => {
        switch (stats.mapaStatus) {
            case 'not_started':
                return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Não iniciado</span>
            case 'in_progress':
                return <span className="bg-warning-100 text-warning-800 px-3 py-1 rounded-full text-sm">Em andamento</span>
            case 'done':
                return <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm">Concluído</span>
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
                                Olá, {employee.name}!
                            </h1>
                            <p className="text-gray-600">
                                {employee.company}
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">
                                    Último acesso: {new Date().toLocaleDateString()}
                                </p>
                            </div>

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

            {/* Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('mapa')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'mapa'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Mapa de Clareza
                        </button>
                        <button
                            onClick={() => setActiveTab('ferramentas')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'ferramentas'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Guia de Ferramentas
                        </button>
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'videos'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Módulos de Vídeo
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">Mapa de Clareza</h3>
                                <div className="flex items-center">
                                    {getMapStatusBadge()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-success-100 rounded-lg">
                                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">Progresso dos Vídeos</h3>
                                <div className="text-2xl font-bold text-gray-900">
                                    {stats.videosWatched}/{stats.totalVideos}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                        className="bg-success-600 h-2 rounded-full"
                                        style={{ width: `${(stats.videosWatched / stats.totalVideos) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="p-2 bg-warning-100 rounded-lg">
                                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500">Caderno Atualizado</h3>
                                <div className="text-lg font-semibold text-gray-900">
                                    {stats.documentUpdated.toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Link href="/funcionario/mapa" className="card hover:shadow-md transition-shadow">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Mapa de Clareza
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Veja seu perfil de liderança e áreas de desenvolvimento
                            </p>
                        </div>
                    </Link>

                    <Link href="/funcionario/ferramentas" className="card hover:shadow-md transition-shadow">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Guia de Ferramentas
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Faça anotações e exercícios práticos
                            </p>
                        </div>
                    </Link>

                    <Link href="/funcionario/videos" className="card hover:shadow-md transition-shadow">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Módulos de Vídeo
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Assista aos vídeos e marque seu progresso
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
