'use client'

import { useState } from 'react'

export default function TestEmailPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/debug/test-email-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()
            setResult(data)
        } catch (error) {
            setResult({
                success: false,
                error: 'Erro ao conectar com o servidor'
            })
        } finally {
            setLoading(false)
        }
    }

    const testForgotPassword = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/employees/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf: '12345678901' }) // CPF de teste
            })

            const data = await response.json()
            setResult({
                ...data,
                type: 'forgot-password-test'
            })
        } catch (error) {
            setResult({
                success: false,
                error: 'Erro ao testar esqueci senha',
                type: 'forgot-password-test'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        🧪 Teste de Email
                    </h1>

                    {/* Teste direto de email */}
                    <div className="border-b pb-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Teste Direto de Email</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email de destino
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar Email de Teste'}
                            </button>
                        </form>
                    </div>

                    {/* Teste de esqueci senha */}
                    <div className="pb-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Teste Esqueci Senha</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Testa o fluxo completo de esqueci senha com CPF fake
                        </p>
                        <button
                            onClick={testForgotPassword}
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Testando...' : 'Testar Esqueci Senha'}
                        </button>
                    </div>

                    {/* Resultado */}
                    {result && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Resultado:</h3>
                            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <pre className="text-sm overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}