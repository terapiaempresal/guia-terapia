'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuth() {
    const [session, setSession] = useState<any>(null)
    const [manager, setManager] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [managerEmail, setManagerEmail] = useState<string | null>(null)

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        try {
            console.log('🔍 Verificando autenticação...')

            // 1. Verificar sessão do Supabase Auth
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()

            console.log('📊 Supabase Session:', {
                hasSession: !!session,
                user: session?.user,
                error: sessionError
            })

            setSession(session)

            // 2. Verificar sessionStorage (usado no sistema atual)
            const emailFromStorage = sessionStorage.getItem('manager_email')
            console.log('📧 Email do sessionStorage:', emailFromStorage)
            setManagerEmail(emailFromStorage)

            let email = session?.user?.email || emailFromStorage

            if (!email) {
                setError('Nenhuma sessão encontrada. Faça login primeiro.')
                setLoading(false)
                return
            }

            // 3. Buscar dados do manager
            console.log('🔍 Buscando manager com email:', email)

            const { data: managerData, error: managerError } = await supabase
                .from('managers')
                .select('*')
                .eq('email', email)
                .single()

            console.log('📋 Manager:', {
                data: managerData,
                error: managerError
            })

            if (managerError) {
                setError(`Erro ao buscar manager: ${managerError.message}`)

                if (managerError.code === '42703') {
                    setError('COLUNA is_admin NÃO EXISTE! Execute o SQL no Supabase.')
                }
            } else {
                setManager(managerData)
            }

            setLoading(false)

        } catch (err) {
            console.error('❌ Erro:', err)
            setError(String(err))
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">🔍 Teste de Autenticação</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <strong>Erro:</strong> {error}
                    </div>
                )}

                {/* SessionStorage */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {managerEmail ? '✅ Email no SessionStorage' : '❌ Sem Email no SessionStorage'}
                    </h2>
                    {managerEmail && (
                        <div className="space-y-2 text-sm">
                            <p><strong>Email:</strong> {managerEmail}</p>
                            <p className="text-xs text-gray-500">Este é o email usado no sistema atual</p>
                        </div>
                    )}
                </div>

                {/* Session */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {session ? '✅ Sessão Supabase Auth' : '❌ Sem Sessão Supabase'}
                    </h2>
                    {session && (
                        <div className="space-y-2 text-sm">
                            <p><strong>Email:</strong> {session.user.email}</p>
                            <p><strong>User ID:</strong> {session.user.id}</p>
                            <p><strong>Criado em:</strong> {new Date(session.user.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                    )}
                </div>

                {/* Manager */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {manager ? '✅ Manager Encontrado' : '❌ Manager Não Encontrado'}
                    </h2>
                    {manager && (
                        <div className="space-y-2 text-sm">
                            <p><strong>ID:</strong> {manager.id}</p>
                            <p><strong>Nome:</strong> {manager.full_name || manager.name}</p>
                            <p><strong>Email:</strong> {manager.email}</p>
                            <p><strong>Status:</strong> {manager.status}</p>
                            <p><strong>is_admin:</strong>
                                <span className={`ml-2 px-2 py-1 rounded ${manager.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {manager.is_admin ? '✅ SIM (ADMIN)' : '❌ NÃO'}
                                </span>
                            </p>
                            <p><strong>Company ID:</strong> {manager.company_id}</p>
                        </div>
                    )}
                </div>

                {/* Ações */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">🔧 Ações</h2>
                    <div className="space-y-3">
                        <a
                            href="/gestor"
                            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Ir para /gestor
                        </a>
                        <a
                            href="/admin"
                            className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Ir para /admin
                        </a>
                        <a
                            href="/login"
                            className="block w-full text-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Ir para /login
                        </a>
                        <button
                            onClick={() => {
                                supabase.auth.signOut()
                                window.location.href = '/login'
                            }}
                            className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            Fazer Logout
                        </button>
                    </div>
                </div>

                {/* JSON completo */}
                <details className="mt-6">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                        Ver JSON completo
                    </summary>
                    <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify({
                            managerEmail,
                            session: session ? {
                                email: session.user.email,
                                id: session.user.id
                            } : null,
                            manager
                        }, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    )
}
