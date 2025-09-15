'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cpfValidator, formatCPF } from '@/lib/utils'

function EmployeeFirstAccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [tokenValid, setTokenValid] = useState(false)
    const [tokenData, setTokenData] = useState<any>(null)

    const [formData, setFormData] = useState({
        full_name: '',
        cpf: '',
        birth_date: '',
        email: '',
        whatsapp: ''
    })

    useEffect(() => {
        const token = searchParams.get('token')
        if (!token) {
            alert('Token de acesso não fornecido')
            router.push('/')
            return
        }

        // Validar token via API
        validateToken(token)
    }, [searchParams, router])

    const validateToken = async (token: string) => {
        try {
            const response = await fetch('/api/auth/validate-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })

            const data = await response.json()

            if (response.ok && data.valid) {
                setTokenData(data.data)
                setTokenValid(true)

                // Pre-preencher email se disponível
                if (data.data.email) {
                    setFormData(prev => ({ ...prev, email: data.data.email || '' }))
                }
            } else {
                alert('Token de acesso inválido ou expirado')
                router.push('/')
            }
        } catch (error) {
            console.error('Erro ao validar token:', error)
            alert('Erro ao validar acesso')
            router.push('/')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Validações
        if (!formData.full_name || !formData.cpf || !formData.birth_date || !formData.email) {
            alert('Por favor, preencha todos os campos obrigatórios')
            setLoading(false)
            return
        }

        if (!cpfValidator(formData.cpf)) {
            alert('CPF inválido')
            setLoading(false)
            return
        }

        try {
            // Simular criação de conta e vinculação
            await new Promise(resolve => setTimeout(resolve, 1500))

            alert('✅ Perfil criado com sucesso! Redirecionando para sua área...')
            router.push('/funcionario')
        } catch (error) {
            alert('Erro ao criar perfil')
        } finally {
            setLoading(false)
        }
    }

    const handleCPFChange = (value: string) => {
        const cleaned = value.replace(/\D/g, '')
        if (cleaned.length <= 11) {
            setFormData(prev => ({ ...prev, cpf: formatCPF(cleaned) }))
        }
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando acesso...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Botão Sair */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => {
                            if (confirm('Tem certeza que deseja sair?')) {
                                window.location.href = '/'
                            }
                        }}
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                        title="Sair"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Bem-vindo!
                    </h1>

                    <p className="text-gray-600">
                        Complete seu perfil para acessar sua jornada de desenvolvimento
                    </p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                required
                                className="input"
                                value={formData.full_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CPF *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="000.000.000-00"
                                className="input"
                                value={formData.cpf}
                                onChange={(e) => handleCPFChange(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data de Nascimento *
                            </label>
                            <input
                                type="date"
                                required
                                className="input"
                                value={formData.birth_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                E-mail *
                            </label>
                            <input
                                type="email"
                                required
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                WhatsApp
                            </label>
                            <input
                                type="tel"
                                placeholder="(11) 99999-9999"
                                className="input"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary"
                        >
                            {loading ? 'Criando perfil...' : 'Concluir Cadastro'}
                        </button>
                    </form>
                </div>

                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                    <h3 className="font-medium text-primary-900 mb-2">
                        🎯 O que vem a seguir:
                    </h3>
                    <ul className="text-sm text-primary-800 space-y-1">
                        <li>• Acesso ao seu Mapa de Clareza personalizado</li>
                        <li>• Módulos de vídeo exclusivos</li>
                        <li>• Ferramentas para seu desenvolvimento</li>
                        <li>• Acompanhamento do seu progresso</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default function EmployeeFirstAccessPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <EmployeeFirstAccessContent />
        </Suspense>
    )
}
