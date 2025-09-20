'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function RedefinirSenhaContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [validatingToken, setValidatingToken] = useState(true)
    const [tokenValid, setTokenValid] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    })

    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            setError('Token de redefinição não encontrado')
            setValidatingToken(false)
            return
        }

        validateToken()
    }, [token])

    const validateToken = async () => {
        try {
            const response = await fetch('/api/employees/validate-reset-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })

            const data = await response.json()

            if (data.success) {
                setTokenValid(true)
            } else {
                setError(data.error || 'Token inválido ou expirado')
            }
        } catch (error) {
            console.error('Erro ao validar token:', error)
            setError('Erro ao validar token')
        } finally {
            setValidatingToken(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswords(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('As senhas não coincidem')
            setLoading(false)
            return
        }

        if (passwords.newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/employees/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword: passwords.newPassword
                })
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(true)
            } else {
                setError(data.error || 'Erro ao redefinir senha')
            }
        } catch (error) {
            console.error('Erro:', error)
            setError('Erro ao conectar com o servidor')
        } finally {
            setLoading(false)
        }
    }

    if (validatingToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Validando token...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Token inválido
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {error || 'O link de redefinição não é válido ou já expirou.'}
                        </p>
                        <Link
                            href="/login/funcionario/esqueci-senha"
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors inline-block text-center"
                        >
                            Solicitar novo link
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Senha redefinida!
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Sua senha foi redefinida com sucesso. Você já pode fazer login com sua nova senha.
                        </p>
                        <Link
                            href="/login"
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors inline-block text-center"
                        >
                            Fazer login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Redefinir senha
                    </h1>
                    <p className="text-gray-600">
                        Digite sua nova senha
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Nova senha
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Digite sua nova senha"
                                minLength={6}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Mínimo de 6 caracteres
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar senha
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Confirme sua nova senha"
                                minLength={6}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Redefinindo...' : 'Redefinir senha'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function RedefinirSenhaFuncionarioPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando...</p>
                    </div>
                </div>
            </div>
        }>
            <RedefinirSenhaContent />
        </Suspense>
    )
}