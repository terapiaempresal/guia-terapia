'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'

export default function CadastroGestorPage() {
    const router = useRouter()
    const { showSuccess, showError, showWarning } = useToast()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'form' | 'success'>('form')

    const [formData, setFormData] = useState({
        // Dados da empresa
        company_name: '',
        employees_quota: 5,

        // Dados do gestor
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Validações
        if (!formData.company_name || !formData.full_name || !formData.email || !formData.password) {
            showWarning('Por favor, preencha todos os campos obrigatórios')
            setLoading(false)
            return
        }

        if (formData.employees_quota < 5) {
            showWarning('Número mínimo de funcionários é 5')
            setLoading(false)
            return
        }

        if (formData.password !== formData.confirm_password) {
            showError('As senhas não coincidem')
            setLoading(false)
            return
        }

        if (formData.password.length < 6) {
            showError('A senha deve ter no mínimo 6 caracteres')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/companies/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company: {
                        name: formData.company_name,
                        employees_quota: formData.employees_quota,
                        status: 'inactive' // Inativo até pagamento
                    },
                    manager: {
                        full_name: formData.full_name,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password,
                        status: 'inactive' // Inativo até pagamento
                    }
                })
            })

            const data = await response.json()

            if (response.ok) {
                setStep('success')
                showSuccess('Cadastro realizado com sucesso!')
            } else {
                showError(data.error || 'Erro ao realizar cadastro')
            }
        } catch (error) {
            console.error('Erro ao cadastrar:', error)
            showError('Erro ao realizar cadastro')
        } finally {
            setLoading(false)
        }
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
                <div className="card max-w-md w-full text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Cadastro Realizado!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Seu cadastro foi realizado com sucesso. Sua conta está aguardando ativação.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Em breve você receberá instruções no email cadastrado.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/login')}
                        className="btn-primary w-full"
                    >
                        Ir para Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Cadastro - Jornada de Equipe
                    </h1>
                    <p className="text-gray-600">
                        Preencha os dados abaixo para criar sua conta
                    </p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Dados da Empresa */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Dados da Empresa
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome da Empresa
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Número de Funcionários (mínimo 5)
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        required
                                        className="input"
                                        value={formData.employees_quota}
                                        onChange={(e) => setFormData({ ...formData, employees_quota: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dados do Gestor */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Seus Dados (Gestor)
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            E-mail
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="input"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Telefone
                                        </label>
                                        <input
                                            type="tel"
                                            className="input"
                                            placeholder="(00) 00000-0000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Senha (mínimo 6 caracteres)
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="input"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirmar Senha
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            className="input"
                                            value={formData.confirm_password}
                                            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Aviso */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">
                                        Conta Inativa
                                    </p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Após o cadastro, sua conta ficará inativa até a confirmação da nossa equipe. Você receberá as instruções por email.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="btn-secondary flex-1"
                                disabled={loading}
                            >
                                Voltar
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={loading}
                            >
                                {loading ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
