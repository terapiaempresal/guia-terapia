'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ToastProvider'

export default function LoginPage() {
    const router = useRouter()
    const { showSuccess, showError, showWarning } = useToast()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [loginType, setLoginType] = useState<'gestor' | 'funcionario'>('gestor')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        cpf: '',
        employeePassword: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (loginType === 'gestor') {
                await handleManagerLogin()
            } else {
                await handleEmployeeLogin()
            }
        } catch (error) {
            console.error('Erro no login:', error)
            showError('Erro ao fazer login. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleManagerLogin = async () => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            })

            const data = await response.json()
            console.log('🔍 Resposta da API:', data)

            if (data.success) {
                console.log('✅ Login bem-sucedido, salvando dados...')

                // Salvar token e dados do usuário no localStorage
                localStorage.setItem('authToken', data.token)
                localStorage.setItem('userType', 'gestor')
                localStorage.setItem('userId', data.user.id)
                localStorage.setItem('userEmail', data.user.email)
                localStorage.setItem('userName', data.user.name)

                // Também salvar no sessionStorage (usado pela página do gestor)
                sessionStorage.setItem('manager_email', data.user.email)

                console.log('💾 Dados salvos no localStorage e sessionStorage')
                console.log('🔄 Redirecionando para /gestor...')

                // Aguardar um pouco para garantir que os dados foram salvos
                await new Promise(resolve => setTimeout(resolve, 100))

                // Usar window.location como fallback
                try {
                    await router.push('/gestor')
                    console.log('✅ Router.push executado')
                } catch (routerError) {
                    console.error('❌ Erro no router.push:', routerError)
                    console.log('🔄 Tentando redirecionamento manual...')
                    window.location.href = '/gestor'
                }
            } else {
                console.log('❌ Erro no login:', data.error)
                showError(data.error || 'Erro ao fazer login')
            }
        } catch (error) {
            console.error('Erro no login:', error)
            showError('Erro ao conectar com o servidor')
        }
    }

    const handleEmployeeLogin = async () => {
        if (!formData.cpf) {
            showWarning('Por favor, digite seu CPF')
            return
        }

        if (loginType === 'funcionario' && !formData.employeePassword) {
            showWarning('Por favor, digite sua senha')
            return
        }

        try {
            const response = await fetch('/api/employees/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cpf: formData.cpf,
                    password: formData.employeePassword
                })
            })

            const data = await response.json()

            if (data.success && data.employee) {
                // Salvar dados do funcionário na sessão
                localStorage.setItem('userType', 'funcionario')
                localStorage.setItem('employeeId', data.employee.id)
                localStorage.setItem('employeeName', data.employee.full_name || data.employee.name)
                localStorage.setItem('employeeEmail', data.employee.email)
                localStorage.setItem('companyId', data.employee.company_id)
                localStorage.setItem('companyName', data.employee.company?.name || '')

                showSuccess(`Bem-vindo, ${data.employee.full_name || data.employee.name}!`)

                // Se é primeira senha (baseada na data de nascimento), mostrar aviso
                if (data.firstTimeLogin) {
                    showWarning('Esta é sua primeira senha. Você pode alterá-la nas configurações.')
                }

                router.push('/funcionario') // Redirecionar para home do funcionário
            } else {
                showError(data.error || 'CPF ou senha incorretos. Verifique os dados.')
            }
        } catch (error) {
            console.error('Erro ao verificar CPF:', error)
            showError('Erro ao verificar CPF. Tente novamente.')
        }
    }

    const formatCPF = (value: string) => {
        const cleanValue = value.replace(/\D/g, '')
        return cleanValue
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (name === 'cpf') {
            setFormData(prev => ({ ...prev, [name]: formatCPF(value) }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Guia de Terapia
                    </h1>
                    <p className="text-gray-600">
                        Faça login para acessar sua conta
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Seletor de tipo de login */}
                    <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => setLoginType('gestor')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${loginType === 'gestor'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Gestor
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginType('funcionario')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${loginType === 'funcionario'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Funcionário
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {loginType === 'gestor' ? (
                            <>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="seu.email@empresa.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Sua senha"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <Link
                                        href="/login/esqueci-senha"
                                        className="text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        Esqueci minha senha
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                                        CPF
                                    </label>
                                    <input
                                        type="text"
                                        id="cpf"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Use o CPF cadastrado pela sua empresa
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="employeePassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="employeePassword"
                                            name="employeePassword"
                                            value={formData.employeePassword}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Sua senha"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Primeira vez? Sua senha inicial é sua data de nascimento no formato DDMMAAAA (ex: 19092004)
                                    </p>
                                </div>

                                <div className="text-right">
                                    <Link
                                        href="/login/funcionario/esqueci-senha"
                                        className="text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        Esqueci minha senha
                                    </Link>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="https://terapiaempresarial.com.br/"
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            Voltar para página inicial
                        </Link>
                    </div>

                    {loginType === 'funcionario' && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-md">
                            <p className="text-xs text-blue-700">
                                <strong>Primeiro acesso?</strong> Use o link enviado por email pela sua empresa para fazer o cadastro inicial.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
