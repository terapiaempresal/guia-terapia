'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loginType, setLoginType] = useState<'gestor' | 'funcionario'>('gestor')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        cpf: ''
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
            alert('Erro ao fazer login. Tente novamente.')
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

            if (data.success) {
                // Salvar token e dados do usuário
                localStorage.setItem('authToken', data.token)
                localStorage.setItem('userType', 'gestor')
                localStorage.setItem('userId', data.user.id)
                localStorage.setItem('userEmail', data.user.email)
                localStorage.setItem('userName', data.user.name)
                
                router.push('/gestor')
            } else {
                alert(data.error || 'Erro ao fazer login')
            }
        } catch (error) {
            console.error('Erro no login:', error)
            alert('Erro ao conectar com o servidor')
        }
    }

    const handleEmployeeLogin = async () => {
        try {
            const response = await fetch('/api/employees')
            const data = await response.json()

            if (data.success) {
                // Procurar funcionário pelo CPF
                const employee = data.employees.find((emp: any) => 
                    emp.cpf?.replace(/\D/g, '') === formData.cpf.replace(/\D/g, '')
                )

                if (employee) {
                    // Salvar dados do funcionário na sessão
                    localStorage.setItem('userType', 'funcionario')
                    localStorage.setItem('employeeId', employee.id)
                    localStorage.setItem('employeeName', employee.full_name)
                    localStorage.setItem('employeeEmail', employee.email)
                    
                    router.push('/funcionario/videos')
                } else {
                    alert('CPF não encontrado. Verifique se você está cadastrado.')
                }
            }
        } catch (error) {
            console.error('Erro ao buscar funcionário:', error)
            alert('Erro ao verificar CPF. Tente novamente.')
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
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                loginType === 'gestor'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Gestor
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginType('funcionario')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                loginType === 'funcionario'
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
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Sua senha"
                                        required
                                    />
                                </div>
                            </>
                        ) : (
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
                            href="/"
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
