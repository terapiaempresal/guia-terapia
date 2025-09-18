'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Toast, { ToastData, ToastType } from './Toast'

interface ToastContextType {
    showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void
    showSuccess: (message: string, title?: string) => void
    showError: (message: string, title?: string) => void
    showWarning: (message: string, title?: string) => void
    showInfo: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast deve ser usado dentro de um ToastProvider')
    }
    return context
}

interface ToastProviderProps {
    children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [toasts, setToasts] = useState<ToastData[]>([])

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    const showToast = (message: string, type: ToastType = 'info', title?: string, duration?: number) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast: ToastData = {
            id,
            type,
            title,
            message,
            duration
        }

        setToasts(prev => [...prev, newToast])
    }

    const showSuccess = (message: string, title?: string) => {
        showToast(message, 'success', title)
    }

    const showError = (message: string, title?: string) => {
        showToast(message, 'error', title)
    }

    const showWarning = (message: string, title?: string) => {
        showToast(message, 'warning', title)
    }

    const showInfo = (message: string, title?: string) => {
        showToast(message, 'info', title)
    }

    const value: ToastContextType = {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Container de Toasts */}
            <div
                aria-live="assertive"
                className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
            >
                <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            toast={toast}
                            onRemove={removeToast}
                        />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    )
}

export default ToastProvider