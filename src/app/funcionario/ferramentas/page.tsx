'use client'

import { useState } from 'react'

export default function EmployeeDocumentPage() {
    const [content, setContent] = useState('')
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Auto-save a cada 2 segundos quando há mudanças
    useState(() => {
        const timer = setInterval(async () => {
            if (content && !isSaving) {
                await saveDocument()
            }
        }, 2000)

        return () => clearInterval(timer)
    })

    const saveDocument = async () => {
        setIsSaving(true)
        try {
            // Mock - implementar API real
            await new Promise(resolve => setTimeout(resolve, 500))
            setLastSaved(new Date())
        } catch (error) {
            console.error('Erro ao salvar documento:', error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Botão Voltar */}
                <div className="mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar ao Dashboard
                    </button>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Caderno de Clareza e Ferramentas
                        </h1>

                        <div className="flex items-center text-sm text-gray-500">
                            {isSaving ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Salvando...
                                </span>
                            ) : lastSaved ? (
                                <span>Salvo em {lastSaved.toLocaleTimeString()}</span>
                            ) : (
                                <span>Não salvo</span>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-600">
                        Use este espaço para fazer anotações, reflexões e exercícios das ferramentas apresentadas
                    </p>
                </div>

                <div className="card">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Comece a escrever suas anotações aqui..."
                        className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        style={{ minHeight: '500px' }}
                    />

                    <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                        <h3 className="font-medium text-primary-900 mb-2">
                            💡 Dicas para usar seu caderno:
                        </h3>
                        <ul className="text-sm text-primary-800 space-y-1">
                            <li>• Anote insights importantes durante os vídeos</li>
                            <li>• Faça os exercícios práticos propostos</li>
                            <li>• Reflita sobre como aplicar as ferramentas no seu dia a dia</li>
                            <li>• Use como diário de desenvolvimento pessoal</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
