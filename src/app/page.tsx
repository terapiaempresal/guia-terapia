'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ToastProvider'

export default function HomePage() {
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
                body: JSON.stringify({ email: formData.email, password: formData.password })
            })
            const data = await response.json()
            if (data.success) {
                localStorage.setItem('authToken', data.token)
                localStorage.setItem('userType', 'gestor')
                localStorage.setItem('userId', data.user.id)
                localStorage.setItem('userEmail', data.user.email)
                localStorage.setItem('userName', data.user.name)
                sessionStorage.setItem('manager_email', data.user.email)
                await new Promise(resolve => setTimeout(resolve, 100))
                try { await router.push('/gestor') } catch { window.location.href = '/gestor' }
            } else {
                showError(data.error || 'Erro ao fazer login')
            }
        } catch { showError('Erro ao conectar com o servidor') }
    }

    const handleEmployeeLogin = async () => {
        if (!formData.cpf) { showWarning('Por favor, digite seu CPF'); return }
        if (!formData.employeePassword) { showWarning('Por favor, digite sua senha'); return }
        try {
            const response = await fetch('/api/employees/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf: formData.cpf, password: formData.employeePassword })
            })
            const data = await response.json()
            if (data.success && data.employee) {
                localStorage.setItem('userType', 'funcionario')
                localStorage.setItem('employeeId', data.employee.id)
                localStorage.setItem('employeeName', data.employee.full_name || data.employee.name)
                localStorage.setItem('employeeEmail', data.employee.email)
                localStorage.setItem('companyId', data.employee.company_id)
                localStorage.setItem('companyName', data.employee.company?.name || '')
                if (data.token) localStorage.setItem('employeeToken', data.token)
                localStorage.setItem('employee', JSON.stringify({
                    id: data.employee.id,
                    name: data.employee.full_name || data.employee.name,
                    cpf: data.employee.cpf,
                    journey_filled: data.employee.journey_filled || false,
                    journey_filled_at: data.employee.journey_filled_at || null,
                    journey_result_html: data.employee.journey_result_html || null
                }))
                showSuccess(`Bem-vindo, ${data.employee.full_name || data.employee.name}!`)
                if (data.firstTimeLogin) showWarning('Esta e sua primeira senha. Voce pode altera-la nas configuracoes.')
                router.push('/funcionario')
            } else {
                showError(data.error || 'CPF ou senha incorretos.')
            }
        } catch { showError('Erro ao verificar CPF. Tente novamente.') }
    }

    const formatCPF = (value: string) => {
        return value.replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: name === 'cpf' ? formatCPF(value) : value }))
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* ===== MARQUEE BAR ===== */}
            <div className="bg-primary-800 text-white overflow-hidden relative z-50 border-b border-white/5">
                <div className="py-2 whitespace-nowrap">
                    <div
                        className="inline-flex gap-20 items-center"
                        style={{ animation: 'marquee 30s linear infinite', willChange: 'transform' }}
                    >
                        {[...Array(8)].map((_, i) => (
                            <span key={i} className="flex items-center gap-4 text-[13px]">
                                <span className="text-white/60">
                                    Fiscalizacao da NR-1 inicia em <strong className="text-white/90">26/05/2025</strong>. Sua empresa esta adequada?
                                </span>
                                <Link href="/nr1" className="text-sage-300 hover:text-sage-200 font-semibold transition-colors">
                                    Saiba mais →
                                </Link>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== HEADER ===== */}
            <header className="absolute top-[36px] left-0 right-0 z-40">
                <div className="max-w-[1360px] mx-auto px-8 lg:px-12 flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logo.png"
                            alt="Terapia Empresarial"
                            width={260}
                            height={64}
                            className="h-12 w-auto opacity-85"
                            priority
                        />
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        <Link href="/produto" className="text-[14px] font-medium text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
                            Produto
                        </Link>
                        <Link href="#nr1-section" className="text-[14px] font-medium text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
                            NR-1
                        </Link>
                        <div className="w-px h-5 bg-white/10 mx-2" />
                        <Link href="/login" className="text-[14px] font-medium text-white bg-white/10 hover:bg-white/15 px-5 py-2.5 rounded-lg transition-all border border-white/10">
                            Entrar
                        </Link>
                    </nav>
                </div>
            </header>

            {/* ===== HERO ===== */}
            <section className="relative min-h-screen overflow-hidden">
                {/* Background — degrade azul marinho + pessoa posicionada a direita */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary-800 via-primary-700 to-primary-500">
                    {/* Imagem da pessoa — posicionada a direita/centro, estilo Hotmart */}
                    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
                        <Image
                            src="/hero-person.png"
                            alt=""
                            width={900}
                            height={1100}
                            className="object-contain object-bottom w-auto min-h-full max-w-none select-none"
                            style={{ height: '92%', transform: 'translateX(8%)' }}
                            priority
                            draggable={false}
                        />
                    </div>
                    {/* Overlay esquerdo forte para texto limpo, direito mais leve para pessoa visivel */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-800/95 via-primary-800/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-800/80 via-transparent to-primary-800/40" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-[1360px] mx-auto px-8 lg:px-12 pt-40 pb-16 min-h-screen flex items-center">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">

                        {/* LEFT — 7 cols, texto bem à esquerda */}
                        <div className="lg:col-span-7 lg:pr-8">
                            {/* Headline — conciso */}
                            <h1 className="font-grotesk font-bold tracking-[-0.02em] text-white mb-5">
                                <span className="block text-[clamp(36px,5.5vw,64px)] leading-[1.08] italic">
                                    Saude mental corporativa
                                </span>
                                <span className="block text-[clamp(36px,5.5vw,64px)] leading-[1.08] italic">
                                    com <span className="text-sage-300">resultado real.</span>
                                </span>
                            </h1>

                            {/* Benefits — inline, minimo */}
                            <div className="flex flex-col gap-2 mb-10">
                                <div className="flex items-center gap-2.5">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#9BC2A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <span className="text-white/70 text-[15px]">Conformidade NR-1 garantida</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#9BC2A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <span className="text-white/70 text-[15px]">Mapeamento de riscos psicossociais</span>
                                </div>
                            </div>

                            {/* Social proof — compacto */}
                            <div className="inline-flex items-center gap-4 bg-white/[0.06] backdrop-blur-sm border border-white/[0.06] rounded-2xl px-5 py-3.5">
                                <div className="flex -space-x-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="w-7 h-7 rounded-full bg-white/10 border-2 border-primary-800/80 flex items-center justify-center">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4">
                                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-[13px]">
                                    <span className="text-white/80 font-medium">+200 empresas</span>
                                    <span className="text-white/40 ml-1.5">ja utilizam</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — 5 cols — Login Card */}
                        <div className="lg:col-span-5 flex justify-end">
                            <div className="bg-white rounded-2xl p-8 lg:p-9 relative shadow-2xl shadow-black/20 w-full max-w-[420px]">

                                <h2 className="font-grotesk text-[22px] font-bold text-primary-600 mb-1">
                                    Acesse a plataforma
                                </h2>
                                <p className="text-[14px] text-gray-400 mb-7">
                                    Selecione seu perfil para entrar
                                </p>

                                {/* Profile toggle */}
                                <div className="grid grid-cols-2 gap-3 mb-7">
                                    <button
                                        type="button"
                                        onClick={() => { setLoginType('gestor'); setShowPassword(false) }}
                                        className={`relative h-[48px] rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                                            loginType === 'gestor'
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                                : 'bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        Gestor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setLoginType('funcionario'); setShowPassword(false) }}
                                        className={`relative h-[48px] rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                                            loginType === 'funcionario'
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                                : 'bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        Funcionario
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit}>
                                    {loginType === 'gestor' ? (
                                        <div key="gestor" className="space-y-4">
                                            <div>
                                                <label htmlFor="email" className="block text-[13px] font-medium text-gray-500 mb-1.5">E-mail</label>
                                                <input
                                                    type="email" id="email" name="email"
                                                    value={formData.email} onChange={handleInputChange}
                                                    className="w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[15px] text-primary-600 bg-white placeholder:text-gray-300 transition-all focus:outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10"
                                                    placeholder="seu.email@empresa.com"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="password" className="block text-[13px] font-medium text-gray-500 mb-1.5">Senha</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'} id="password" name="password"
                                                        value={formData.password} onChange={handleInputChange}
                                                        className="w-full h-[48px] px-4 pr-12 border border-gray-200 rounded-xl text-[15px] text-primary-600 bg-white placeholder:text-gray-300 transition-all focus:outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10"
                                                        placeholder="Sua senha"
                                                        required
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            {showPassword ? (
                                                                <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                                            ) : (
                                                                <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                                            )}
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <Link href="/login/esqueci-senha" className="text-[13px] text-primary-400 hover:text-primary-600 transition-colors">
                                                    Esqueci minha senha
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key="funcionario" className="space-y-4">
                                            <div>
                                                <label htmlFor="cpf" className="block text-[13px] font-medium text-gray-500 mb-1.5">CPF</label>
                                                <input
                                                    type="text" id="cpf" name="cpf"
                                                    value={formData.cpf} onChange={handleInputChange}
                                                    className="w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[15px] text-primary-600 bg-white placeholder:text-gray-300 transition-all focus:outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10"
                                                    placeholder="000.000.000-00"
                                                    maxLength={14} required
                                                />
                                                <p className="text-[12px] text-gray-300 mt-1">CPF cadastrado pela sua empresa</p>
                                            </div>
                                            <div>
                                                <label htmlFor="employeePassword" className="block text-[13px] font-medium text-gray-500 mb-1.5">Senha</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'} id="employeePassword" name="employeePassword"
                                                        value={formData.employeePassword} onChange={handleInputChange}
                                                        className="w-full h-[48px] px-4 pr-12 border border-gray-200 rounded-xl text-[15px] text-primary-600 bg-white placeholder:text-gray-300 transition-all focus:outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10"
                                                        placeholder="Sua senha"
                                                        required
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            {showPassword ? (
                                                                <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                                            ) : (
                                                                <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                                            )}
                                                        </svg>
                                                    </button>
                                                </div>
                                                <p className="text-[12px] text-gray-300 mt-1">Primeira vez? Senha = data de nascimento (DDMMAAAA)</p>
                                            </div>
                                            <div className="flex justify-end">
                                                <Link href="/login/funcionario/esqueci-senha" className="text-[13px] text-primary-400 hover:text-primary-600 transition-colors">
                                                    Esqueci minha senha
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-[52px] mt-6 bg-sage-400 hover:bg-sage-500 text-white font-semibold text-[15px] rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(122,158,137,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Entrando...
                                            </span>
                                        ) : (
                                            `Entrar como ${loginType === 'gestor' ? 'Gestor' : 'Funcionario'}`
                                        )}
                                    </button>
                                </form>

                                {loginType === 'funcionario' && (
                                    <div className="mt-5 p-3.5 bg-blue-50 rounded-xl">
                                        <p className="text-[12px] text-blue-500 leading-relaxed">
                                            <strong>Primeiro acesso?</strong> Use o link enviado por email pela sua empresa.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== NR-1 SECTION ===== */}
            <section id="nr1-section" className="bg-white">
                <div className="max-w-[1360px] mx-auto px-8 lg:px-12 py-24 lg:py-32">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">

                        {/* Left content */}
                        <div className="lg:col-span-6">
                            <p className="text-sage-500 text-[13px] font-semibold uppercase tracking-[0.1em] mb-4">Regulamentacao</p>
                            <h2 className="font-grotesk text-[clamp(28px,3.5vw,44px)] font-bold text-primary-600 leading-[1.1] mb-6">
                                NR-1: Sua empresa esta preparada?
                            </h2>
                            <p className="text-gray-400 text-[16px] leading-[1.7] mb-10 max-w-lg">
                                A NR-1 exige o gerenciamento de riscos psicossociais no trabalho.
                                O descumprimento resulta em multas, interdicoes e acoes trabalhistas.
                            </p>

                            <div className="space-y-5 mb-10">
                                {[
                                    { title: 'Obrigatoriedade legal', desc: 'Todas as empresas com CLT devem se adequar' },
                                    { title: 'Fiscalizacao ativa', desc: 'Auditorias do MTE em andamento desde 2025' },
                                    { title: 'Penalidades severas', desc: 'Multas de ate R$ 50.000 por infracao' },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-grotesk font-semibold text-primary-600 text-[15px]">{item.title}</h3>
                                            <p className="text-gray-400 text-[14px] mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/nr1"
                                className="inline-flex items-center gap-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-[15px] h-[52px] px-8 rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(1,40,64,0.25)]"
                            >
                                Acessar materia completa
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Right stats */}
                        <div className="lg:col-span-6">
                            <div className="bg-primary-600 rounded-3xl p-10 lg:p-12 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-sage-400/[0.08] rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3" />
                                <div className="relative">
                                    <p className="text-white/40 text-[13px] font-semibold uppercase tracking-[0.1em] mb-8">O custo da inacao</p>
                                    <div className="space-y-8">
                                        {[
                                            { value: 'R$ 500bi', color: 'text-sage-300', label: 'Custo anual de problemas de saude mental no trabalho (OMS)' },
                                            { value: '12x', color: 'text-blue-300', label: 'Retorno sobre investimento em programas de saude mental' },
                                            { value: '76%', color: 'text-warning-500', label: 'Dos trabalhadores relatam impacto do trabalho na saude mental' },
                                        ].map((stat, i) => (
                                            <div key={stat.value}>
                                                {i > 0 && <div className="h-px bg-white/[0.06] mb-8" />}
                                                <div className={`font-grotesk text-[clamp(32px,4vw,48px)] font-bold ${stat.color} leading-none`}>
                                                    {stat.value}
                                                </div>
                                                <p className="text-white/40 text-[14px] mt-2 max-w-[300px]">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-primary-800 text-white border-t border-white/5">
                <div className="max-w-[1360px] mx-auto px-8 lg:px-12 py-12">
                    <div className="grid md:grid-cols-3 gap-10">
                        <div>
                            <Image src="/logo.png" alt="Terapia Empresarial" width={160} height={40} className="h-7 w-auto mb-4 opacity-80" />
                            <p className="text-white/30 text-[13px] leading-relaxed max-w-[260px]">
                                Inteligencia organizacional com conformidade legal para saude mental corporativa.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-[12px] font-semibold text-white/40 uppercase tracking-[0.12em] mb-4">Contato</h4>
                            <div className="space-y-2 text-[13px] text-white/30">
                                <p>contato@terapiaempresarial.com.br</p>
                                <p>(31) 99695-5389</p>
                                <p>Av. Amazonas 687, 16o andar — BH/MG</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[12px] font-semibold text-white/40 uppercase tracking-[0.12em] mb-4">Legal</h4>
                            <div className="space-y-2 text-[13px]">
                                <Link href="/termos" className="block text-white/30 hover:text-white/60 transition-colors">Termos de uso</Link>
                                <Link href="/privacidade" className="block text-white/30 hover:text-white/60 transition-colors">Politica de privacidade</Link>
                                <Link href="https://wa.me/553196955389" target="_blank" rel="noopener noreferrer" className="block text-white/30 hover:text-white/60 transition-colors">Contato</Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-white/20 text-[12px]">&copy; {new Date().getFullYear()} Terapia Empresarial. Todos os direitos reservados.</p>
                        <div className="flex items-center gap-5">
                            {[
                                { href: 'https://instagram.com/terapia_empresarial', icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></> },
                                { href: 'https://facebook.com', icon: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /> },
                                { href: 'https://youtube.com', icon: <><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></> },
                            ].map((social) => (
                                <Link key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/40 transition-colors">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{social.icon}</svg>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
