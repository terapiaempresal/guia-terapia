'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function CadastroFuncionarioContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const empresaId = searchParams.get('empresa')

    console.log('Página carregada - empresaId:', empresaId)

    const [loading, setLoading] = useState(false)
    const [empresa, setEmpresa] = useState<any>(null)
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        cpf: '',
        birth_date: '',
        whatsapp: ''
    })

    useEffect(() => {
        if (empresaId) {
            carregarEmpresa()
        }
    }, [empresaId])

    const carregarEmpresa = async () => {
        try {
            const response = await fetch(`/api/companies/${empresaId}`)
            const data = await response.json()
            if (data.success) {
                setEmpresa(data.company)
            }
        } catch (error) {
            console.error('Erro ao carregar empresa:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        console.log('=== DADOS DO FORMULÁRIO ===')
        console.log('full_name:', formData.full_name)
        console.log('email:', formData.email)
        console.log('cpf:', formData.cpf)
        console.log('birth_date:', formData.birth_date)
        console.log('whatsapp:', formData.whatsapp)
        console.log('empresaId:', empresaId)
        console.log('empresa:', empresa)

        // Validação básica antes de enviar
        if (!formData.full_name) {
            alert('Nome completo é obrigatório')
            setLoading(false)
            return
        }

        if (!formData.email) {
            alert('E-mail é obrigatório')
            setLoading(false)
            return
        }

        if (!empresaId) {
            alert('ID da empresa não encontrado no link')
            setLoading(false)
            return
        }

        try {
            const requestBody = {
                full_name: formData.full_name,
                email: formData.email,
                cpf: formData.cpf,
                birth_date: formData.birth_date,
                whatsapp: formData.whatsapp,
                company_id: empresaId
            }

            console.log('=== ENVIANDO PARA API ===')
            console.log('Request body:', JSON.stringify(requestBody, null, 2))

            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })

            const data = await response.json()
            console.log('=== RESPOSTA DA API ===')
            console.log('Status:', response.status)
            console.log('Data:', data)

            if (data.success) {
                alert('Cadastro realizado com sucesso! Bem-vindo à equipe!')
                router.push('/funcionario/videos')
            } else {
                alert(data.error || 'Erro ao realizar cadastro')
            }
        } catch (error) {
            console.error('=== ERRO DE REDE ===')
            console.error('Erro:', error)
            alert('Erro ao conectar com o servidor')
        } finally {
            setLoading(false)
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

    const formatPhone = (value: string) => {
        const cleanValue = value.replace(/\D/g, '')
        return cleanValue
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1')
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (name === 'cpf') {
            setFormData(prev => ({ ...prev, [name]: formatCPF(value) }))
        } else if (name === 'whatsapp') {
            setFormData(prev => ({ ...prev, [name]: formatPhone(value) }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    if (!empresaId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Inválido</h1>
                    <p className="text-gray-600 mb-6">
                        Este link de convite não é válido ou expirou.
                    </p>
                    <a href="/" className="btn-primary">
                        Voltar para início
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Seja bem-vindo!
                    </h1>
                    <p className="text-gray-600">
                        {empresa ? `Você foi convidado para fazer parte da equipe da ${empresa.name}` : 'Carregando...'}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Seu nome completo"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                E-mail *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="seu.email@exemplo.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                                CPF *
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
                        </div>

                        <div>
                            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Nascimento *
                            </label>
                            <input
                                type="date"
                                id="birth_date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                                WhatsApp (opcional)
                            </label>
                            <input
                                type="text"
                                id="whatsapp"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="(11) 99999-9999"
                                maxLength={15}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Cadastrando...' : 'Fazer Cadastro'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Ao se cadastrar, você concorda em fazer parte da equipe e participar do programa de desenvolvimento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CadastroFuncionarioPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <CadastroFuncionarioContent />
        </Suspense>
    )
}
