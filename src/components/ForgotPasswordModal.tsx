'use client'

import { useState } from 'react'
import { useToast } from '@/components/ToastProvider'

interface ForgotPasswordModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const { showSuccess, showError } = useToast()
    const [loading, setLoading] = useState(false)
    const [cpf, setCpf] = useState('')
    const [step, setStep] = useState<'form' | 'success'>('form')
    const [contactInfo, setContactInfo] = useState<any>(null)

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

        if (!cpf) {
            showError('Por favor, digite seu CPF')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/employees/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf })
            })

            const data = await response.json()

            if (data.success) {
                setContactInfo(data.contact)
                setStep('success')
                showSuccess('Solicitação registrada com sucesso!')
            } else {
                showError(data.error || 'Erro ao processar solicitação')
            }
        } catch (error) {
            console.error('Erro ao solicitar redefinição:', error)
            showError('Erro ao conectar com o servidor')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setCpf('')
        setStep('form')
        setContactInfo(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Esqueci minha senha
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {step === 'form' ? (
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

                        <div className="p-3 bg-yellow-50 rounded-md">
                            <div className="flex">
                                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <p className="text-sm text-yellow-800 font-medium">Importante</p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Sua empresa será notificada sobre esta solicitação e entrará em contato para redefinir sua senha.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : 'Solicitar'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center p-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Solicitação Enviada!
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Sua empresa foi notificada sobre a solicitação de redefinição de senha.
                            </p>
                        </div>

                        {contactInfo && (
                            <div className="p-3 bg-blue-50 rounded-md">
                                <p className="text-sm text-blue-800 font-medium mb-1">
                                    Informações para contato:
                                </p>
                                <p className="text-xs text-blue-700">
                                    Empresa: {contactInfo.companyName}
                                </p>
                                {contactInfo.managerEmail && (
                                    <p className="text-xs text-blue-700">
                                        Email: {contactInfo.managerEmail}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                onClick={handleClose}
                                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}