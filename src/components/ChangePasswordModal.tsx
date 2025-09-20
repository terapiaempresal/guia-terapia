'use client'

import { useState } from 'react'
import { useToast } from '@/components/ToastProvider'

interface ChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
    employeeId: string
}

export default function ChangePasswordModal({ isOpen, onClose, employeeId }: ChangePasswordModalProps) {
    const { showSuccess, showError } = useToast()
    const [loading, setLoading] = useState(false)
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswords(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (passwords.newPassword !== passwords.confirmPassword) {
            showError('As senhas não coincidem')
            return
        }

        if (passwords.newPassword.length < 6) {
            showError('A nova senha deve ter pelo menos 6 caracteres')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/employees/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: employeeId,
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            })

            const data = await response.json()

            if (data.success) {
                showSuccess('Senha alterada com sucesso!')
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
                onClose()
            } else {
                showError(data.error || 'Erro ao alterar senha')
            }
        } catch (error) {
            console.error('Erro ao alterar senha:', error)
            showError('Erro ao conectar com o servidor')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Alterar Senha
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Senha Atual
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwords.currentPassword}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Digite sua senha atual"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Se é seu primeiro acesso, use sua data de nascimento (DDMMAAAA)
                        </p>
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Nova Senha
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handleChange}
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
                            Confirmar Nova Senha
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Confirme sua nova senha"
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Alterando...' : 'Alterar Senha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}