// Utilitários para autenticação

export interface User {
    id: string
    email: string
    name: string
    type: 'manager' | 'employee'
}

export const auth = {
    // Verificar se usuário está logado
    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false
        return !!localStorage.getItem('authToken')
    },

    // Obter dados do usuário logado
    getUser(): User | null {
        if (typeof window === 'undefined') return null
        
        const userType = localStorage.getItem('userType')
        const userId = localStorage.getItem('userId')
        const userEmail = localStorage.getItem('userEmail')
        const userName = localStorage.getItem('userName')

        if (!userType || !userId || !userEmail) return null

        return {
            id: userId,
            email: userEmail,
            name: userName || '',
            type: userType === 'gestor' ? 'manager' : 'employee'
        }
    },

    // Obter token de autenticação
    getToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('authToken')
    },

    // Fazer logout
    logout(): void {
        if (typeof window === 'undefined') return
        
        localStorage.removeItem('authToken')
        localStorage.removeItem('userType')
        localStorage.removeItem('userId')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
        localStorage.removeItem('employeeId')
        localStorage.removeItem('employeeName')
        localStorage.removeItem('employeeEmail')
        
        window.location.href = '/login'
    },

    // Verificar se é gestor
    isManager(): boolean {
        return this.getUser()?.type === 'manager'
    },

    // Verificar se é funcionário
    isEmployee(): boolean {
        return this.getUser()?.type === 'employee'
    }
}

// Hook para usar autenticação em componentes React
import { useState, useEffect } from 'react'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const currentUser = auth.getUser()
        setUser(currentUser)
        setLoading(false)
    }, [])

    return {
        user,
        loading,
        isAuthenticated: !!user,
        isManager: user?.type === 'manager',
        isEmployee: user?.type === 'employee',
        logout: auth.logout
    }
}
