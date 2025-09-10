'use client'

import { useState } from 'react'

export default function EmailTestPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    const testEmail = async () => {
        if (!email) {
            alert('Por favor, insira um e-mail')
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'test',
                    to: email,
                    data: {}
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setResult('✅ E-mail enviado com sucesso! Verifique sua caixa de entrada.')
            } else {
                setResult(`❌ Erro: ${data.error}`)
            }
        } catch (error) {
            setResult('❌ Erro de conexão')
        } finally {
            setLoading(false)
        }
    }

    const testManagerEmail = async () => {
        if (!email) {
            alert('Por favor, insira um e-mail')
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'manager_welcome',
                    to: email,
                    data: {
                        managerName: 'Lucas Teste',
                        companyName: 'Empresa de Teste Ltda'
                    }
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setResult('✅ E-mail de boas-vindas do gestor enviado com sucesso!')
            } else {
                setResult(`❌ Erro: ${data.error}`)
            }
        } catch (error) {
            setResult('❌ Erro de conexão')
        } finally {
            setLoading(false)
        }
    }

    const testEmployeeEmail = async () => {
        if (!email) {
            alert('Por favor, insira um e-mail')
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'employee_invite',
                    to: email,
                    data: {
                        employeeName: 'João Silva',
                        companyName: 'Empresa de Teste Ltda',
                        loginToken: 'mock-token-123'
                    }
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setResult('✅ E-mail de convite do funcionário enviado com sucesso!')
            } else {
                setResult(`❌ Erro: ${data.error}`)
            }
        } catch (error) {
            setResult('❌ Erro de conexão')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="card">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        🧪 Teste de E-mails - Guia de Terapia
                    </h1>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            E-mail para teste:
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="input"
                        />
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={testEmail}
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Enviando...' : '📧 Enviar E-mail de Teste'}
                        </button>

                        <button
                            onClick={testManagerEmail}
                            disabled={loading}
                            className="btn-secondary w-full"
                        >
                            {loading ? 'Enviando...' : '👔 Testar E-mail de Boas-vindas (Gestor)'}
                        </button>

                        <button
                            onClick={testEmployeeEmail}
                            disabled={loading}
                            className="btn-secondary w-full"
                        >
                            {loading ? 'Enviando...' : '👤 Testar E-mail de Convite (Funcionário)'}
                        </button>
                    </div>

                    {result && (
                        <div className={`mt-6 p-4 rounded-lg ${result.includes('✅')
                                ? 'bg-success-50 text-success-800 border border-success-200'
                                : 'bg-error-50 text-error-800 border border-error-200'
                            }`}>
                            {result}
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-primary-50 rounded-lg">
                        <h3 className="font-medium text-primary-900 mb-2">
                            📋 Configurações atuais:
                        </h3>
                        <div className="text-sm text-primary-800 space-y-1">
                            <p><strong>SMTP Host:</strong> {process.env.NEXT_PUBLIC_SMTP_HOST || 'Não configurado'}</p>
                            <p><strong>E-mail From:</strong> {process.env.NEXT_PUBLIC_EMAIL_FROM || 'Não configurado'}</p>
                            <p><strong>Flag E-mails:</strong> {process.env.NEXT_PUBLIC_FLAG_ENABLE_EMAILS || 'false'}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <a href="/" className="btn-secondary inline-block">
                            ← Voltar ao Início
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
