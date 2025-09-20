'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EsqueciSenhaFuncionarioPage() {
    const [cpf, setCpf] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const formatCPF = (value: string) => {
        const cleanValue = value.replace(/\D/g, '')
        return cleanValue
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    }

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(formatCPF(e.target.value))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/employees/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf })
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(true)
            } else {
                setError(data.error || 'Erro ao enviar email de redefinição')
            }
        } catch (error) {
            console.error('Erro:', error)
            setError('Erro ao conectar com o servidor')
        } finally {
            setLoading(false)
        }
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
                            Email enviado!
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Se seu CPF estiver cadastrado no sistema, você receberá um email com as instruções para redefinir sua senha.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Verifique também sua caixa de spam.
                        </p>
                        <Link
                            href="/login"
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors inline-block text-center"
                        >
                            Voltar para o login
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
                        Esqueci minha senha
                    </h1>
                    <p className="text-gray-600">
                        Digite seu CPF para receber um link de redefinição
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                                CPF
                            </label>
                            <input
                                type="text"
                                id="cpf"
                                value={cpf}
                                onChange={handleCpfChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="000.000.000-00"
                                maxLength={14}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Digite o CPF cadastrado pela sua empresa
                            </p>
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
                            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
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

                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-xs text-blue-700">
                            <strong>Primeira vez?</strong> Sua senha inicial é sua data de nascimento no formato DDMMAAAA (ex: 19092004)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}