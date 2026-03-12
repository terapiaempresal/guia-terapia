'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ToastProvider'
import { ClipboardList, BarChart3, FileText, ChevronDown, ArrowRight, Shield, Activity, Users, Package, CheckCircle } from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

// Depoimentos completos para tooltips
const FULL_TESTIMONIALS = {
    'intensa': `Como uma empresa de tecnologia focada em IA e dados, buscamos a Terapia Empresarial para garantir a conformidade com a NR-1 e as exigências de gestão de riscos psicossociais. O processo foi extremamente ágil, permitindo que nosso time de 10 colaboradores realizasse o diagnóstico através de questionários estruturados que avaliam fatores como sobrecarga e ambiente organizacional com total confidencialidade.

A plataforma transformou as respostas em inteligência organizacional, indo muito além de um relatório estático. Conseguimos identificar padrões de risco e receber recomendações estratégicas que nos ajudam a prevenir passivos trabalhistas e a fortalecer nossa cultura de saúde mental.

Hoje, a Intensa Mídia opera com segurança jurídica e respaldo técnico, atendendo integralmente às normas regulatórias vigentes. Mais do que cumprir uma obrigação legal, agora utilizamos dados precisos para tomar decisões que garantem o bem-estar do nosso time e a eficiência do nosso negócio.`,
    
    'bhcoespace': `A experiência da Bhcoespace com a Terapia Empresarial foi profundamente transformadora, especialmente no que se refere à adequação às exigências da NR-1. O processo nos permitiu compreender, de forma estruturada e técnica, como os riscos psicossociais se manifestam no ambiente organizacional e qual é o papel da empresa na identificação, prevenção e gestão desses fatores.

A partir do trabalho desenvolvido, conseguimos avançar significativamente na conformidade com a NR-1 e com as diretrizes do Programa de Gerenciamento de Riscos (PGR), estruturando um diagnóstico claro sobre aspectos como organização do trabalho, clima organizacional, comunicação interna e fatores de pressão que podem impactar a saúde mental dos colaboradores.

Além de atender às exigências legais, a Terapia Empresarial trouxe ganhos concretos para a empresa: maior consciência organizacional, melhoria no ambiente de trabalho, fortalecimento das práticas de gestão e redução de potenciais riscos trabalhistas relacionados à saúde mental.

Hoje a Bhcoespace possui uma visão muito mais estratégica sobre a gestão de pessoas e sobre a importância do cuidado com os fatores psicossociais dentro da organização.`,
    
    'sketch': `Vivenciamos uma evolução importante em nossa gestão organizacional a partir da implementação do mapeamento de riscos psicossociais e da adequação às diretrizes da NR-1. Com uma estrutura composta por 46 colaboradores na rede própria e 106 colaboradores na fábrica, o processo permitiu compreender de forma mais profunda a dinâmica do ambiente de trabalho, identificando fatores relacionados à organização das atividades, comunicação interna e relacionamento entre equipes e lideranças.

O diagnóstico proporcionou uma visão clara sobre aspectos que impactavam o clima organizacional e o bem-estar dos colaboradores, possibilitando a adoção de práticas mais estruturadas de gestão, prevenção e acompanhamento dos riscos psicossociais, em conformidade com as exigências da NR-1.

Os resultados foram perceptíveis em diferentes níveis da organização. Houve melhoria no bem-estar dos colaboradores, fortalecimento do relacionamento entre equipes e líderes, além de reflexos positivos na forma como os profissionais se relacionam com os clientes no dia a dia das operações.

Como consequência desse ambiente organizacional mais saudável e alinhado, a empresa registrou um incremento de aproximadamente 15% nas vendas, demonstrando que a gestão adequada dos fatores psicossociais e a conformidade com a NR-1 não apenas atendem às exigências legais, mas também contribuem diretamente para o desempenho e crescimento do negócio.`
}

export default function HomePage() {
    const router = useRouter()
    const { showSuccess, showError, showWarning } = useToast()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [loginType, setLoginType] = useState<'gestor' | 'funcionario'>('gestor')
    const [isPaused, setIsPaused] = useState(false)
    const [showAlertBar, setShowAlertBar] = useState(true)
    const [activeStep, setActiveStep] = useState(0) // Para seção "Como Funciona"
    const [isAutoPlaying, setIsAutoPlaying] = useState(true) // Auto-play da seção
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0) // FAQ accordion (primeira pergunta aberta por padrão)
    const [activeNewsIndex, setActiveNewsIndex] = useState(0) // Carrossel de notícias NR-1
    const [isNewsAutoPlaying, setIsNewsAutoPlaying] = useState(true) // Auto-play do carrossel de notícias
    const [newsProgress, setNewsProgress] = useState(0) // Progresso do timer (0-100)
    const [stepProgress, setStepProgress] = useState(0) // Progresso da Seção 5 (0-100)
    const [isMobile, setIsMobile] = useState(false) // Detectar mobile para carrossel
    const [activeBenefit, setActiveBenefit] = useState(0) // Seção 6 - Benefício ativo no scroll
    const [hoveredTestimonial, setHoveredTestimonial] = useState<string | null>(null) // Controle de hover nos depoimentos
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        cpf: '',
        employeePassword: ''
    })

    // Total de etapas
    const totalSteps = 3

    // Touch gestures para mobile
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    // Detectar scroll e esconder alert bar
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowAlertBar(false)
            } else {
                setShowAlertBar(true)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Detectar mobile para carrossel
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Auto-play das etapas (5 segundos cada) + progresso
    useEffect(() => {
        if (!isAutoPlaying) {
            setStepProgress(0)
            return
        }

        const duration = 5000 // 5 segundos
        const interval = 50 // Atualizar a cada 50ms
        let elapsed = 0

        setStepProgress(0)

        const progressInterval = setInterval(() => {
            elapsed += interval
            const progress = (elapsed / duration) * 100
            setStepProgress(Math.min(progress, 100))

            if (elapsed >= duration) {
                setActiveStep(prev => (prev + 1) % totalSteps)
            }
        }, interval)

        return () => clearInterval(progressInterval)
    }, [isAutoPlaying, activeStep, totalSteps])

    // Auto-play do carrossel de notícias NR-1 (5 segundos cada) + progresso
    useEffect(() => {
        if (!isNewsAutoPlaying) {
            setNewsProgress(0)
            return
        }

        const duration = 5000 // 5 segundos
        const interval = 50 // Atualizar a cada 50ms
        let elapsed = 0

        setNewsProgress(0)

        const progressInterval = setInterval(() => {
            elapsed += interval
            const progress = (elapsed / duration) * 100
            setNewsProgress(Math.min(progress, 100))

            if (elapsed >= duration) {
                setActiveNewsIndex(prev => {
                    const next = prev + 1
                    return next >= 3 ? 0 : next // 3 notícias
                })
            }
        }, interval)

        return () => clearInterval(progressInterval)
    }, [isNewsAutoPlaying, activeNewsIndex])

    // Navegação por teclado
    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            // Setas esquerda/direita
            if (e.key === 'ArrowLeft') {
                setActiveStep(prev => (prev - 1 + totalSteps) % totalSteps)
                setIsAutoPlaying(false) // Pausa auto-play ao navegar manualmente
            } else if (e.key === 'ArrowRight') {
                setActiveStep(prev => (prev + 1) % totalSteps)
                setIsAutoPlaying(false)
            }
            // Números 1, 2, 3
            else if (['1', '2', '3'].includes(e.key)) {
                const stepIndex = parseInt(e.key) - 1
                if (stepIndex >= 0 && stepIndex < totalSteps) {
                    setActiveStep(stepIndex)
                    setIsAutoPlaying(false)
                }
            }
        }

        window.addEventListener('keydown', handleKeyboard)
        return () => window.removeEventListener('keydown', handleKeyboard)
    }, [totalSteps])

    // Intersection Observer para animações on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('opacity-0', 'translate-y-6')
                        entry.target.classList.add('opacity-100', 'translate-y-0')
                    }
                })
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        )

        const elements = document.querySelectorAll('.animate-on-scroll')
        elements.forEach((el) => observer.observe(el))

        return () => {
            elements.forEach((el) => observer.unobserve(el))
        }
    }, [])

    // Handlers para swipe gestures (mobile)
    const minSwipeDistance = 50

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance
        
        if (isLeftSwipe) {
            // Swipe para esquerda = próxima etapa
            setActiveStep(prev => (prev + 1) % totalSteps)
            setIsAutoPlaying(false)
        } else if (isRightSwipe) {
            // Swipe para direita = etapa anterior
            setActiveStep(prev => (prev - 1 + totalSteps) % totalSteps)
            setIsAutoPlaying(false)
        }
    }

    // Handlers do carrossel de notícias
    const handleNewsNext = () => {
        setActiveNewsIndex(prev => {
            const next = prev + 1
            return next >= newsData.length ? prev : next
        })
        setIsNewsAutoPlaying(false)
    }

    const handleNewsPrev = () => {
        setActiveNewsIndex(prev => {
            const previous = prev - 1
            return previous < 0 ? prev : previous
        })
        setIsNewsAutoPlaying(false)
    }

    const handleNewsDot = (index: number) => {
        setActiveNewsIndex(index)
        setIsNewsAutoPlaying(false)
    }

    // Mensagens rotativas da alert bar
    const alertMessages = [
        {
            text: 'Fiscalização da NR-1 já está em vigor. Sua empresa está preparada?',
            cta: 'Entenda as exigências',
            link: '/nr1',
            icon: 'alert'
        },
        {
            text: 'Conformidade NR-1: evite multas de até R$ 50 milhões e proteja sua equipe',
            cta: 'Saiba mais',
            link: '/nr1',
            icon: 'money'
        },
        {
            text: 'Mapeamento de riscos psicossociais obrigatório. Adeque-se agora',
            cta: 'Começar diagnóstico',
            link: '/cadastro-gestor',
            icon: 'alert'
        },
        {
            text: 'Empresas adequadas à NR-1 reduzem turnover em até 40%',
            cta: 'Ver benefícios',
            link: '/nr1',
            icon: 'alert'
        }
    ]

    // Dados das notícias NR-1 para o carrossel
    const newsData = [
        {
            title: 'Empresas com mais afastamentos serão alvo de ação fiscalizadora',
            date: 'Fevereiro 2026',
            tag: 'Fiscalização',
            icon: 'shield',
            url: 'https://valor.globo.com/carreira/noticia/2026/02/02/empresas-com-mais-afastamentos-serao-alvo-de-acao-fiscalizadora.ghtml',
            source: 'Valor Econômico'
        },
        {
            title: 'Texto completo da NR-1: Disposições Gerais e Gerenciamento de Riscos',
            date: 'Atualizado em 2024',
            tag: 'Documentação Oficial',
            icon: 'scale',
            url: 'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-1',
            source: 'Portal Gov.br'
        },
        {
            title: 'Nova NR-1 entra em vigor em 2026: o que muda e como se preparar',
            date: '2026',
            tag: 'Preparação',
            icon: 'chart',
            url: 'https://exame.com/carreira/nova-nr-1-entra-em-vigor-em-2026-o-que-muda-e-como-as-empresas-devem-se-preparar/',
            source: 'Revista Exame'
        }
    ]

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

    // Renderizar ícones das notícias
    const renderNewsIcon = (icon: string) => {
        const iconProps = { width: 56, height: 56, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: 'text-sage-300' }
        
        switch (icon) {
            case 'shield':
                return (
                    <svg {...iconProps}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="M12 8v4M12 16h.01"/>
                    </svg>
                )
            case 'scale':
                return (
                    <svg {...iconProps}>
                        <line x1="12" y1="3" x2="12" y2="7"/>
                        <path d="M5 9l7-7 7 7"/>
                        <path d="M5 9v0a7 7 0 0 0 7 7 7 7 0 0 0 7-7"/>
                        <rect x="3" y="20" width="18" height="2" rx="1"/>
                    </svg>
                )
            case 'chart':
                return (
                    <svg {...iconProps}>
                        <line x1="12" y1="20" x2="12" y2="10"/>
                        <line x1="18" y1="20" x2="18" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="16"/>
                    </svg>
                )
            case 'heart':
                return (
                    <svg {...iconProps}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        <path d="M9 11l2 2 4-4"/>
                    </svg>
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* ===== ALERT BAR ===== */}
            <div 
                className="fixed left-0 right-0 z-50 bg-primary-800 border-b border-white/10 overflow-hidden transition-transform duration-300 ease-in-out"
                style={{
                    top: 0,
                    transform: showAlertBar ? 'translateY(0)' : 'translateY(-100%)'
                }}
            >
                <div 
                    className="relative h-[44px] flex items-center"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="whitespace-nowrap w-full flex items-center">
                        <div
                            className="inline-flex items-center h-full"
                            style={{ 
                                animation: 'marquee 50s linear infinite', 
                                animationPlayState: isPaused ? 'paused' : 'running',
                                willChange: 'transform' 
                            }}
                        >
                            {alertMessages.map((message, index) => (
                                <div key={index} className="flex items-center gap-2.5 px-4">
                                    {/* Ícone - alerta ou dinheiro */}
                                    <div className="flex-shrink-0">
                                        {message.icon === 'money' ? (
                                            // Ícone de notas de dinheiro verde vivo
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="2" y="6" width="20" height="12" rx="2" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <circle cx="12" cy="12" r="3" stroke="#22C55E" strokeWidth="2"/>
                                                <path d="M18 12C18 12 17 10 15 10M6 12C6 12 7 10 9 10M18 12C18 12 17 14 15 14M6 12C6 12 7 14 9 14" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        ) : (
                                            // Ícone de alerta padrão
                                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="9" cy="9" r="8" stroke="#FFBC7D" strokeWidth="1.5"/>
                                                <path d="M9 5V10" stroke="#FFBC7D" strokeWidth="1.5" strokeLinecap="round"/>
                                                <circle cx="9" cy="13" r="0.5" fill="#FFBC7D"/>
                                            </svg>
                                        )}
                                    </div>
                                    {/* Conteúdo do alert - tudo inline na mesma baseline */}
                                    <Link href={message.link} className="inline-flex items-baseline gap-2 hover:opacity-90 transition-opacity">
                                        <span className="font-sora text-[13px] font-medium text-white/90 leading-none">
                                            {message.text}
                                        </span>
                                        <span className="font-sora text-sage-300 font-semibold text-[13px] whitespace-nowrap inline-flex items-center gap-1.5 leading-none">
                                            {message.cta}
                                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="relative top-[1px]">
                                                <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                    </Link>
                                </div>
                            ))}
                            {/* Duplicar mensagens para loop infinito sem saltos */}
                            {alertMessages.map((message, index) => (
                                <div key={`dup-${index}`} className="flex items-center gap-2.5 px-4">
                                    {/* Ícone - alerta ou dinheiro */}
                                    <div className="flex-shrink-0">
                                        {message.icon === 'money' ? (
                                            // Ícone de notas de dinheiro verde vivo
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="2" y="6" width="20" height="12" rx="2" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <circle cx="12" cy="12" r="3" stroke="#22C55E" strokeWidth="2"/>
                                                <path d="M18 12C18 12 17 10 15 10M6 12C6 12 7 10 9 10M18 12C18 12 17 14 15 14M6 12C6 12 7 14 9 14" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        ) : (
                                            // Ícone de alerta padrão
                                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="9" cy="9" r="8" stroke="#FFBC7D" strokeWidth="1.5"/>
                                                <path d="M9 5V10" stroke="#FFBC7D" strokeWidth="1.5" strokeLinecap="round"/>
                                                <circle cx="9" cy="13" r="0.5" fill="#FFBC7D"/>
                                            </svg>
                                        )}
                                    </div>
                                    {/* Conteúdo do alert - tudo inline na mesma baseline */}
                                    <Link href={message.link} className="inline-flex items-baseline gap-2 hover:opacity-90 transition-opacity">
                                        <span className="font-sora text-[13px] font-medium text-white/90 leading-none">
                                            {message.text}
                                        </span>
                                        <span className="font-sora text-sage-300 font-semibold text-[13px] whitespace-nowrap inline-flex items-center gap-1.5 leading-none">
                                            {message.cta}
                                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="relative top-[1px]">
                                                <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== HEADER ===== */}
            <header 
                className="absolute left-0 right-0 z-40 transition-all duration-300 ease-in-out"
                style={{
                    top: showAlertBar ? '44px' : '0'
                }}
            >
                <div className="max-w-[1360px] mx-auto px-8 lg:px-12 flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logo.png"
                            alt="Terapia Empresarial"
                            width={180}
                            height={48}
                            className="h-8 w-auto"
                            priority
                        />
                    </Link>
                    
                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link 
                            href="/produto" 
                            className="group relative font-sora text-[14px] font-medium text-white/70 hover:text-sage-300 px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden"
                        >
                            <span className="relative z-10">Produto</span>
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sage-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </Link>
                        <Link 
                            href="/sobre" 
                            className="group relative font-sora text-[14px] font-medium text-white/70 hover:text-sage-300 px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden"
                        >
                            <span className="relative z-10">Sobre</span>
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sage-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </Link>
                        <Link 
                            href="/suporte" 
                            className="group relative font-sora text-[14px] font-medium text-white/70 hover:text-sage-300 px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden"
                        >
                            <span className="relative z-10">Suporte</span>
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sage-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </Link>
                    </nav>
                </div>
            </header>

            {/* ===== HERO ===== */}
            <section className="relative min-h-screen overflow-hidden">
                {/* Background image - pessoa como elemento central, estilo Hotmart */}
                <div className="absolute inset-0 z-0 bg-primary-700">
                    {/* Imagem da pessoa — visivel, central, preenchendo */}
                    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
                        <Image
                            src="/hero-person.png"
                            alt=""
                            width={900}
                            height={1100}
                            className="object-contain object-bottom w-auto min-h-full max-w-none select-none"
                            style={{ height: '92%' }}
                            priority
                            draggable={false}
                        />
                    </div>
                    {/* Overlays para legibilidade */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-800/95 via-primary-800/60 to-primary-800/80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-800/90 via-transparent to-primary-800/70" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-[1360px] mx-auto px-8 lg:px-12 pt-40 pb-16 min-h-screen flex items-center">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 w-full items-center">

                        {/* LEFT — 6 cols */}
                        <div className="lg:col-span-6">
                            {/* Headline — Hero Title (mesmo tamanho do H2 - Heading 2) */}
                            <h1 className="font-grotesk font-bold tracking-[-0.01em] text-white mb-8 animate-fade-in-up">
                                <span className="block text-[clamp(28px,3.5vw,44px)] leading-[1.1]">
                                    Saúde mental corporativa
                                </span>
                                <span className="block text-[clamp(28px,3.5vw,44px)] leading-[1.1]">
                                    com <span className="text-sage-300">resultados reais</span>
                                </span>
                            </h1>

                            {/* Benefits — inline, minimo */}
                            <div className="flex flex-col gap-2.5 mb-10 animate-fade-in-up delay-100">
                                <div className="flex items-center gap-2.5">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#9BC2A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <span className="font-sora text-white/70 text-[15px] leading-[1.5]">Mapeamento estruturado de riscos psicossociais</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#9BC2A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <span className="font-sora text-white/70 text-[15px] leading-[1.5]">Conformidade com a NR-1</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#9BC2A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <span className="font-sora text-white/70 text-[15px] leading-[1.5]">Redução de passivo trabalhista</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#9BC2A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <span className="font-sora text-white/70 text-[15px] leading-[1.5]">Diagnóstico organizacional baseado em dados</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#9BC2A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <span className="font-sora text-white/70 text-[15px] leading-[1.5]">Relatórios técnicos para tomada de decisão</span>
                                </div>
                            </div>

                            {/* Social proof — compacto */}
                            <div className="inline-flex items-center gap-4 bg-white/[0.06] backdrop-blur-sm border border-white/[0.06] rounded-2xl px-5 py-3.5 animate-fade-in-up delay-200">
                                <div className="flex -space-x-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="w-7 h-7 rounded-full bg-white/10 border-2 border-primary-800/80 flex items-center justify-center">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4">
                                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    ))}
                                </div>
                                <div className="font-sora text-[13px] leading-[1.4]">
                                    <span className="text-white/80 font-medium">+200 empresas</span>
                                    <span className="text-white/40 ml-1.5">já utilizam</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — 6 cols — Login Card */}
                        <div className="lg:col-span-6 flex justify-end">
                            <div className="bg-white rounded-2xl p-8 lg:p-9 relative shadow-2xl shadow-black/20 w-full max-w-[420px] animate-fade-in-up delay-200">

                                <h2 className="font-grotesk text-[22px] font-bold text-primary-600 mb-1">
                                    Acesse a plataforma
                                </h2>
                                <p className="font-sora text-[14px] text-gray-400 mb-7">
                                    Selecione seu perfil para entrar
                                </p>

                                {/* Profile toggle */}
                                <div className="grid grid-cols-2 gap-3 mb-7">
                                    <button
                                        type="button"
                                        onClick={() => { setLoginType('gestor'); setShowPassword(false) }}
                                        className={`font-sora relative h-[48px] rounded-xl text-[15px] font-semibold transition-all duration-200 ${
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
                                        className={`font-sora relative h-[48px] rounded-xl text-[15px] font-semibold transition-all duration-200 ${
                                            loginType === 'funcionario'
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                                : 'bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        Funcionário
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit}>
                                    {loginType === 'gestor' ? (
                                        <div key="gestor" className="space-y-4">
                                            <div>
                                                <label htmlFor="email" className="font-sora block text-[13px] font-medium text-gray-500 mb-1.5">E-mail</label>
                                                <input
                                                    type="email" id="email" name="email"
                                                    value={formData.email} onChange={handleInputChange}
                                                    className="font-sora w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[15px] text-primary-600 bg-white placeholder:text-gray-300 transition-all focus:outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10"
                                                    placeholder="seu.email@empresa.com"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="password" className="font-sora block text-[13px] font-medium text-gray-500 mb-1.5">Senha</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'} id="password" name="password"
                                                        value={formData.password} onChange={handleInputChange}
                                                        className="font-sora w-full h-[48px] px-4 pr-12 border border-gray-200 rounded-xl text-[15px] text-primary-600 bg-white placeholder:text-gray-300 transition-all focus:outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10"
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
                                                <Link href="/login/esqueci-senha" className="font-sora text-[13px] text-primary-400 hover:text-primary-600 transition-colors">
                                                    Esqueci minha senha
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key="funcionario" className="space-y-4">
                                            <div>
                                                <label htmlFor="cpf" className="font-sora block text-[13px] font-medium text-gray-500 mb-1.5">CPF</label>
                                                <input
                                                    type="text" id="cpf" name="cpf"
                                                    value={formData.cpf} onChange={handleInputChange}
                                                    className="font-sora w-full h-[48px] px-4 border border-gray-200 rounded-xl text-[15px] text-primary-600 bg-white placeholder:text-gray-300 transition-all focus:outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10"
                                                    placeholder="000.000.000-00"
                                                    maxLength={14} required
                                                />
                                                <p className="font-sora text-[12px] text-gray-300 mt-1">CPF cadastrado pela sua empresa</p>
                                            </div>
                                            <div>
                                                <label htmlFor="employeePassword" className="font-sora block text-[13px] font-medium text-gray-500 mb-1.5">Senha</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'} id="employeePassword" name="employeePassword"
                                                        value={formData.employeePassword} onChange={handleInputChange}
                                                        className="font-sora w-full h-[48px] px-4 pr-12 border border-gray-200 rounded-xl text-[15px] text-primary-600 bg-white placeholder:text-gray-300 transition-all focus:outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10"
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
                                                <p className="font-sora text-[12px] text-gray-300 mt-1">Primeira vez? Senha = data de nascimento (DDMMAAAA)</p>
                                            </div>
                                            <div className="flex justify-end">
                                                <Link href="/login/funcionario/esqueci-senha" className="font-sora text-[13px] text-primary-400 hover:text-primary-600 transition-colors">
                                                    Esqueci minha senha
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="font-sora w-full h-[52px] mt-6 bg-sage-400 hover:bg-sage-500 text-white font-semibold text-[15px] rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(122,158,137,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        <p className="font-sora text-[12px] text-blue-500 leading-relaxed">
                                            <strong>Primeiro acesso?</strong> Use o link enviado por email pela sua empresa.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SEÇÃO 4: EDUCAÇÃO NR-1 ===== */}
            <section id="nr1-section" className="bg-white">
                <div className="max-w-[1360px] mx-auto px-8 lg:px-12 py-24 lg:py-32">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">

                        {/* Left content */}
                        <div className="lg:col-span-6">
                            <p className="font-sora text-sage-500 text-[11px] font-semibold uppercase tracking-[0.1em] mb-4">Regulamentação</p>
                            <h2 className="font-grotesk text-[clamp(28px,3.5vw,44px)] font-bold text-primary-600 leading-[1.1] mb-6">
                                NR-1: Entenda suas obrigações legais
                            </h2>
                            
                            <div className="space-y-5 font-sora text-gray-500 text-[16px] leading-[1.7] mb-10 max-w-lg">
                                <p>
                                    A Norma Regulamentadora nº 1 estabelece diretrizes obrigatórias para a gestão de riscos ocupacionais nas organizações.
                                </p>
                                <p>
                                    Entre essas diretrizes está a necessidade de identificar e gerenciar fatores psicossociais que possam impactar a saúde mental dos trabalhadores.
                                </p>
                                <p>
                                    Empresas que não realizam essa gestão podem estar mais expostas a riscos jurídicos, trabalhistas e organizacionais.
                                </p>
                            </div>

                            <Link
                                href="/nr1"
                                className="font-sora inline-flex items-center gap-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-[15px] h-[52px] px-8 rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(1,40,64,0.25)]"
                            >
                                Conheça a NR-1 na íntegra
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Right carousel - Notícias NR-1 */}
                        <div className="lg:col-span-6">
                            <div className="relative">
                                {/* Título */}
                                <h3 className="font-grotesk text-2xl lg:text-3xl font-bold text-primary-600 mb-6">
                                    Notícias relacionadas à NR-1
                                </h3>

                                {/* Dots indicadores */}
                                <div className="flex gap-2 mb-6 justify-center lg:justify-start">
                                    {newsData.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleNewsDot(index)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                activeNewsIndex === index 
                                                    ? 'w-8 bg-sage-300' 
                                                    : 'w-1.5 bg-gray-300 hover:bg-sage-300/50'
                                            }`}
                                            aria-label={`Ver notícia ${index + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Container com setas + carrossel */}
                                <div className="flex items-center gap-4 lg:gap-6">
                                    {/* Seta esquerda - Discreta */}
                                    <button
                                        onClick={handleNewsPrev}
                                        disabled={activeNewsIndex === 0}
                                        className={`hidden lg:flex flex-shrink-0 text-4xl font-light transition-all duration-300 ${
                                            activeNewsIndex === 0 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-gray-500 hover:text-sage-300 hover:scale-110'
                                        }`}
                                        aria-label="Notícia anterior"
                                    >
                                        ‹
                                    </button>

                                    {/* Container do carrossel - Stack de cartas com offset visível */}
                                    <div className="relative h-[450px] lg:h-[500px] flex-1 overflow-hidden">
                                        {newsData.map((news, index) => {
                                            // Calcular posição relativa ao card ativo
                                            const position = index - activeNewsIndex
                                            const isActive = index === activeNewsIndex
                                            const isPast = index < activeNewsIndex
                                            
                                            // Cards futuros ficam empilhados atrás com offset para baixo e direita
                                            const stackOffset = position > 0 ? position * 12 : 0
                                            
                                            return (
                                                <div
                                                    key={index}
                                                    className="absolute inset-0 transition-all duration-700 ease-out"
                                                    style={{
                                                        transform: isPast 
                                                            ? `translateY(-150%) scale(0.85) rotate(-5deg)` // Sai por cima
                                                            : isActive 
                                                                ? 'translateX(0) translateY(0) scale(1) rotate(0)' 
                                                                : `translateX(${stackOffset}px) translateY(${stackOffset}px) scale(${1 - position * 0.03}) rotate(0deg)`, // Empilhados embaixo
                                                        opacity: isPast ? 0 : isActive ? 1 : 0.7,
                                                        zIndex: isActive ? 30 : 30 - position,
                                                        pointerEvents: isActive ? 'auto' : 'none',
                                                    }}
                                                >
                                                    <a 
                                                        href={news.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 lg:p-12 relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl h-full shadow-lg"
                                                        onClick={(e) => {
                                                            setIsNewsAutoPlaying(false)
                                                        }}
                                                    >
                                                        {/* Glow effect */}
                                                        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-sage-400/[0.08] rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3" />
                                                        
                                                        {/* Content */}
                                                        <div className="relative h-full flex flex-col">
                                                            {/* Tag + External Link Icon */}
                                                            <div className="flex items-center justify-between mb-6">
                                                                <span className="font-sora text-xs font-semibold uppercase tracking-wider text-sage-300 bg-sage-300/10 px-3 py-1.5 rounded-full">
                                                                    {news.tag}
                                                                </span>
                                                                {/* External link icon */}
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-sage-300 transition-colors">
                                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                                                    <polyline points="15 3 21 3 21 9"/>
                                                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                                                </svg>
                                                            </div>

                                                            {/* Icon */}
                                                            <div className="mb-8">
                                                                {renderNewsIcon(news.icon)}
                                                            </div>

                                                            {/* Title */}
                                                            <h3 className="font-grotesk text-[clamp(20px,2.5vw,28px)] font-bold text-white leading-[1.2] mb-4 flex-grow group-hover:text-sage-300 transition-colors">
                                                                {news.title}
                                                            </h3>

                                                            {/* Source + Date */}
                                                            <div className="flex items-center gap-3 text-white/60 text-sm font-sora">
                                                                <span className="font-semibold">{news.source}</span>
                                                                <span>•</span>
                                                                <span>{news.date}</span>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Seta direita - Discreta */}
                                    <button
                                        onClick={handleNewsNext}
                                        disabled={activeNewsIndex === newsData.length - 1}
                                        className={`hidden lg:flex flex-shrink-0 text-4xl font-light transition-all duration-300 ${
                                            activeNewsIndex === newsData.length - 1 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-gray-500 hover:text-sage-300 hover:scale-110'
                                        }`}
                                        aria-label="Próxima notícia"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SEÇÃO 5: COMO FUNCIONA O PRODUTO ===== */}
            <section className="relative pt-20 pb-12 lg:pt-32 lg:pb-16 overflow-hidden" style={{background: '#ffffff'}}>
                <div className="max-w-[1360px] mx-auto px-8 lg:px-12 relative z-10">
                    {/* Header da seção */}
                    <div className="mb-16 text-center lg:text-left">
                        <p className="font-sora text-[11px] font-semibold uppercase tracking-[0.1em] mb-4" style={{color: '#6b7480'}}>Como funciona</p>
                        <h2 className="font-grotesk text-[clamp(32px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.01em] mb-4" style={{color: '#0d0d0d'}}>
                            Processo simples em 3 etapas
                        </h2>
                        <p className="font-sora text-[17px] leading-[1.6] max-w-[650px] mx-auto lg:mx-0" style={{color: '#6b7480'}}>
                            Metodologia estruturada para identificar e gerenciar riscos psicossociais na sua organização
                        </p>
                    </div>

                    {/* Layout: Visual à esquerda (fluxo) + Cards à direita */}
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                        
                        {/* LEFT: Fluxo visual das etapas */}
                        <div className="relative lg:sticky lg:top-32">
                            <div className="rounded-3xl p-8 lg:p-12 relative" style={{background: '#fafbfc'}}>
                                {/* Título do fluxo */}
                                <h3 className="font-grotesk text-xl font-semibold mb-8" style={{color: '#6b7480'}}>
                                    Jornada do diagnóstico
                                </h3>

                                {/* Fluxo de etapas - Vertical com conectores */}
                                <div className="space-y-4 relative">
                                    {/* Linha conectora vertical */}
                                    <div className="absolute left-[19px] top-12 bottom-12 w-[2px]" style={{background: '#dfe2e6'}}></div>

                                    {[
                                        {
                                            title: 'Questionário aplicado',
                                            subtitle: 'Colaboradores respondem',
                                            IconComponent: ClipboardList,
                                            active: activeStep === 0
                                        },
                                        {
                                            title: 'Análise dos dados',
                                            subtitle: 'Sistema processa respostas',
                                            IconComponent: BarChart3,
                                            active: activeStep === 1
                                        },
                                        {
                                            title: 'Relatório gerado',
                                            subtitle: 'Insights e recomendações',
                                            IconComponent: FileText,
                                            active: activeStep === 2
                                        }
                                    ].map((step, index) => (
                                        <div 
                                            key={index}
                                            className={`relative flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${
                                                step.active 
                                                    ? 'bg-white scale-[1.02]' 
                                                    : 'bg-transparent opacity-50'
                                            }`}
                                            style={step.active ? {boxShadow: '0 10px 30px rgba(155, 194, 166, 0.2)'} : {}}
                                        >
                                            {/* Ícone */}
                                            <div 
                                                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
                                                    step.active ? 'scale-110' : ''
                                                }`}
                                                style={{
                                                    background: step.active ? '#9BC2A6' : '#dfe2e6',
                                                    color: step.active ? '#ffffff' : '#6b7480',
                                                    boxShadow: step.active ? '0 8px 20px rgba(155, 194, 166, 0.3)' : 'none'
                                                }}
                                            >
                                                <step.IconComponent 
                                                    size={18} 
                                                    strokeWidth={2.5}
                                                    className={step.active ? 'animate-bounce-subtle' : ''} 
                                                />
                                            </div>

                                            {/* Conteúdo */}
                                            <div className="flex-1 pt-1">
                                                <h4 
                                                    className="font-sora text-[15px] font-semibold mb-0.5 transition-colors"
                                                    style={{color: step.active ? '#5F8A6F' : '#6b7480'}}
                                                >
                                                    {step.title}
                                                </h4>
                                                <p 
                                                    className="font-sora text-[13px] transition-colors"
                                                    style={{color: step.active ? '#6b7480' : '#dfe2e6'}}
                                                >
                                                    {step.subtitle}
                                                </p>
                                            </div>

                                            {/* Indicador de ativo */}
                                            {step.active && (
                                                <div className="w-2 h-2 rounded-full animate-pulse" style={{background: '#9BC2A6'}}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Cards expansíveis */}
                        <div className="space-y-2.5">
                            {[
                                {
                                    title: 'Diagnóstico organizacional',
                                    description: 'Colaboradores respondem a questionários estruturados que avaliam carga de trabalho, ambiente, liderança e clareza de funções.',
                                    detail: 'Questionários baseados em metodologias validadas cientificamente que se adaptam ao contexto da sua empresa.',
                                    IconComponent: ClipboardList,
                                    color: 'sage'
                                },
                                {
                                    title: 'Análise inteligente',
                                    description: 'Plataforma processa automaticamente as respostas e identifica padrões de risco psicossocial por níveis de urgência.',
                                    detail: 'Visualize métricas em tempo real por departamento, função ou qualquer segmentação relevante.',
                                    IconComponent: BarChart3,
                                    color: 'blue'
                                },
                                {
                                    title: 'Relatórios estratégicos',
                                    description: 'Gestores recebem relatórios com insights acionáveis, recomendações práticas e planos de ação personalizados.',
                                    detail: 'Relatórios em conformidade com a NR-1 e prontos para auditorias, incluindo histórico evolutivo.',
                                    IconComponent: FileText,
                                    color: 'purple'
                                }
                            ].map((step, index) => {
                                const isActive = activeStep === index
                                
                                // Cores uniformes - verde claro (sage-300) para todos os elementos
                                const colors = {
                                    iconBg: isActive ? '#9BC2A6' : 'rgba(155, 194, 166, 0.15)',
                                    iconColor: isActive ? '#ffffff' : '#5F8A6F',
                                    border: isActive ? '#9BC2A6' : '#dfe2e6',
                                    bg: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                                    badgeBg: '#9BC2A6',
                                    linkColor: '#5F8A6F',
                                    linkHover: '#4A7259'
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setActiveStep(index)
                                            setIsAutoPlaying(false)
                                        }}
                                        className="group w-full text-left p-3 rounded-xl border-2 transition-all duration-300 relative overflow-hidden"
                                        style={{
                                            borderColor: colors.border,
                                            background: colors.bg,
                                            boxShadow: isActive ? '0 10px 30px rgba(0, 0, 0, 0.08)' : 'none'
                                        }}
                                    >
                                        {/* Loader de progresso - apenas no card ativo e com auto-play */}
                                        {isActive && isAutoPlaying && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden">
                                                <div 
                                                    className="h-full"
                                                    style={{
                                                        width: `${stepProgress}%`,
                                                        background: colors.iconBg,
                                                        transition: 'width 50ms linear'
                                                    }}
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="flex items-start gap-2.5">
                                            {/* Ícone */}
                                            <div 
                                                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                                                style={{
                                                    background: colors.iconBg,
                                                    color: colors.iconColor
                                                }}
                                            >
                                                <step.IconComponent size={18} strokeWidth={2} />
                                            </div>

                                            {/* Conteúdo */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-sora text-[9px] font-semibold uppercase tracking-wider" style={{color: '#6b7480'}}>
                                                        Etapa {index + 1}
                                                    </span>
                                                    {isActive && (
                                                        <span 
                                                            className="px-1.5 py-0.5 text-white text-[8px] font-bold uppercase tracking-wider rounded-full"
                                                            style={{background: colors.badgeBg}}
                                                        >
                                                            Ativo
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 
                                                    className="font-grotesk text-[16px] font-bold mb-1 leading-[1.2] transition-colors"
                                                    style={{color: isActive ? '#053d4e' : '#353a40'}}
                                                >
                                                    {step.title}
                                                </h3>
                                                <p 
                                                    className="font-sora text-[12px] leading-[1.5] transition-colors"
                                                    style={{color: isActive ? '#6b7480' : '#6b7480'}}
                                                >
                                                    {step.description}
                                                </p>
                                                
                                                {/* Detalhes extras - só aparecem quando ativo */}
                                                {isActive && (
                                                    <div className="mt-2.5 pt-2.5 animate-fade-in-up" style={{borderTop: '1px solid #dfe2e6'}}>
                                                        <p className="font-sora text-[11px] leading-[1.5] mb-2.5" style={{color: '#6b7480'}}>
                                                            {step.detail}
                                                        </p>
                                                        <Link
                                                            href="https://api.whatsapp.com/send/?phone=5531996955389&text=Ol%C3%A1%2C+vim+pelo+site%21&type=phone_number&app_absent=0"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 font-sora text-[11px] font-semibold transition-colors"
                                                            style={{color: colors.linkColor}}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = colors.linkHover}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = colors.linkColor}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <span>Saiba mais sobre esta etapa</span>
                                                            <ArrowRight size={12} strokeWidth={2.5} />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Ícone de expansão */}
                                            <ChevronDown 
                                                size={16}
                                                strokeWidth={2}
                                                className="flex-shrink-0 transition-transform duration-300"
                                                style={{
                                                    color: isActive ? colors.iconBg : '#6b7480',
                                                    transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)'
                                                }}
                                            />
                                        </div>
                                    </button>
                                )
                            })}

                            {/* CTA final */}
                            <div className="pt-4">
                                <Link 
                                    href="https://api.whatsapp.com/send/?phone=5531996955389&text=Ol%C3%A1%2C+vim+pelo+site%21&type=phone_number&app_absent=0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full font-sora text-[15px] font-semibold text-white px-6 py-4 rounded-xl transition-all duration-300"
                                    style={{
                                        background: '#9BC2A6',
                                        boxShadow: '0 8px 20px rgba(155, 194, 166, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#7A9E89'
                                        e.currentTarget.style.transform = 'scale(1.02)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#9BC2A6'
                                        e.currentTarget.style.transform = 'scale(1)'
                                    }}
                                >
                                    <span>Agendar demonstração gratuita</span>
                                    <ArrowRight size={18} strokeWidth={2.5} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SEÇÃO 6: BENEFÍCIOS (Scroll Progressivo estilo Humble) ===== */}
            <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32" style={{background: '#ffffff'}}>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                    {/* Header da seção */}
                    <div className="mb-16 lg:mb-24 text-center">
                        <p className="font-sora text-[11px] font-semibold uppercase tracking-[0.1em] mb-4" style={{color: '#6b7480'}}>Por que escolher</p>
                        <h2 className="font-grotesk text-[clamp(32px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.01em]" style={{color: '#0d0d0d'}}>
                            Benefícios para sua organização
                        </h2>
                    </div>

                    {/* Layout Humble: 2 colunas - LEFT sticky + RIGHT scroll */}
                    <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-16">
                        
                        {/* LEFT COLUMN: Sticky Content com textos que trocam */}
                        <div className="relative">
                            <div className="lg:sticky lg:top-32 lg:min-h-[70vh] flex items-center">
                                <div className="relative w-full">
                                    {/* Linha vertical de progresso */}
                                    <div className="absolute left-0 top-0 w-[2px] h-[350px] hidden lg:block" style={{background: '#dfe2e6'}}>
                                        <motion.div 
                                            className="absolute top-0 left-0 w-full origin-top"
                                            style={{background: '#9BC2A6'}}
                                            animate={{height: `${(activeBenefit / 4) * 100}%`}}
                                            transition={{duration: 0.5, ease: 'easeOut'}}
                                        />
                                    </div>

                                    {/* Container dos textos (sobrepostos) */}
                                    <div className="relative pl-0 lg:pl-8 min-h-[400px]">
                                        {[
                                            {
                                                badge: 'BENEFÍCIO',
                                                number: '1—2.',
                                                title: 'Redução de passivo trabalhista',
                                                description: 'Identifique e gerencie riscos psicossociais antes que se tornem processos trabalhistas, protegendo sua empresa de custos jurídicos e danos reputacionais.'
                                            },
                                            {
                                                badge: 'BENEFÍCIO',
                                                number: '2—3.',
                                                title: 'Gestão preventiva da saúde mental',
                                                description: 'Detecte sinais de sobrecarga, burnout e adoecimento mental antes do afastamento, reduzindo absenteísmo e custos com saúde ocupacional.'
                                            },
                                            {
                                                badge: 'BENEFÍCIO',
                                                number: '3—4.',
                                                title: 'Fortalecimento da cultura organizacional',
                                                description: 'Compreenda como os colaboradores percebem a organização e implemente melhorias estratégicas que fortalecem engajamento e retenção de talentos.'
                                            },
                                            {
                                                badge: 'BENEFÍCIO',
                                                number: '4—5.',
                                                title: 'Tomada de decisão baseada em dados',
                                                description: 'Relatórios técnicos estruturados com indicadores mensuráveis que fundamentam decisões estratégicas de RH, liderança e gestão operacional.'
                                            },
                                            {
                                                badge: 'BENEFÍCIO',
                                                number: '5.',
                                                title: 'Adequação às exigências da NR-1',
                                                description: 'Atenda às diretrizes da Norma Regulamentadora nº 1 com metodologia estruturada e documentação técnica que comprova a gestão de riscos psicossociais.'
                                            }
                                        ].map((benefit, index) => (
                                            <motion.div
                                                key={index}
                                                className="absolute top-0 left-0 lg:left-8 right-0 w-full"
                                                initial={{opacity: 0, y: 20}}
                                                animate={{
                                                    opacity: activeBenefit === index ? 1 : 0,
                                                    y: activeBenefit === index ? 0 : 20
                                                }}
                                                transition={{duration: 0.4, ease: 'easeOut'}}
                                                style={{
                                                    pointerEvents: activeBenefit === index ? 'auto' : 'none'
                                                }}
                                            >
                                                {/* Badge superior */}
                                                <div className="inline-block mb-6 px-3 py-1.5 rounded-full border" style={{borderColor: '#dfe2e6', background: '#ffffff'}}>
                                                    <span className="font-sora text-[10px] font-bold uppercase tracking-wider" style={{color: '#6b7480'}}>
                                                        {benefit.badge}
                                                    </span>
                                                </div>

                                                {/* Numeração estilo "DAY 1—2." */}
                                                <h3 className="font-grotesk text-[64px] lg:text-[80px] font-bold leading-none mb-8" style={{color: '#0d0d0d'}}>
                                                    {benefit.number}
                                                </h3>

                                                {/* Título */}
                                                <h4 className="font-grotesk text-[28px] lg:text-[36px] font-bold leading-[1.1] mb-6" style={{color: '#0d0d0d'}}>
                                                    {benefit.title}
                                                </h4>

                                                {/* Descrição */}
                                                <p className="font-sora text-[16px] lg:text-[18px] leading-[1.6] max-w-[520px]" style={{color: '#6b7480'}}>
                                                    {benefit.description}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Cards empilhados com MUITO espaçamento (100vh cada) */}
                        <div className="relative space-y-[100vh] pb-[20vh]">
                            {[
                                { icon: Shield, color: '#9BC2A6' },
                                { icon: Activity, color: '#9BC2A6' },
                                { icon: Users, color: '#9BC2A6' },
                                { icon: Package, color: '#9BC2A6' },
                                { icon: CheckCircle, color: '#9BC2A6' }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    id={`benefit-card-${index}`}
                                    className="h-[50vh] lg:h-[60vh] flex items-center justify-center"
                                    ref={(el) => {
                                        if (!el) return
                                        
                                        const observer = new IntersectionObserver(
                                            ([entry]) => {
                                                if (entry.isIntersecting) {
                                                    setActiveBenefit(index)
                                                }
                                            },
                                            { 
                                                threshold: 0.6,
                                                rootMargin: '-20% 0px -20% 0px'
                                            }
                                        )
                                        
                                        observer.observe(el)
                                        return () => observer.disconnect()
                                    }}
                                >
                                    {/* Card visual */}
                                    <motion.div 
                                        className="w-full max-w-[400px] bg-white rounded-2xl lg:rounded-3xl p-8 lg:p-12 border-2 shadow-lg"
                                        animate={{
                                            opacity: activeBenefit === index ? 1 : 0.25,
                                            scale: activeBenefit === index ? 1 : 0.9,
                                            y: activeBenefit === index ? 0 : 40
                                        }}
                                        transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
                                        style={{
                                            borderColor: activeBenefit === index ? item.color : '#dfe2e6',
                                            boxShadow: activeBenefit === index 
                                                ? '0 25px 50px -12px rgba(155, 194, 166, 0.3)' 
                                                : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                        }}
                                    >
                                        {/* Ícone centralizado */}
                                        <motion.div 
                                            className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center mx-auto mb-8"
                                            animate={{
                                                background: activeBenefit === index ? item.color : 'rgba(155, 194, 166, 0.1)'
                                            }}
                                            transition={{duration: 0.3}}
                                        >
                                            <item.icon 
                                                size={44} 
                                                strokeWidth={2} 
                                                style={{
                                                    color: activeBenefit === index ? '#ffffff' : '#5F8A6F',
                                                    transition: 'color 0.3s ease'
                                                }} 
                                            />
                                        </motion.div>

                                        {/* Número grande */}
                                        <div className="text-center">
                                            <motion.span 
                                                className="font-grotesk text-[72px] lg:text-[88px] font-bold leading-none block"
                                                animate={{
                                                    color: activeBenefit === index ? item.color : '#e5e7eb'
                                                }}
                                                transition={{duration: 0.3}}
                                            >
                                                0{index + 1}
                                            </motion.span>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA final */}
                    <div className="mt-24 lg:mt-32 text-center">
                        <Link
                            href="https://api.whatsapp.com/send/?phone=5531996955389&text=Ol%C3%A1%2C+gostaria+de+conhecer+os+benef%C3%ADcios+da+plataforma+para+minha+empresa&type=phone_number&app_absent=0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 font-sora font-semibold text-[15px] text-white px-8 py-4 rounded-xl transition-all duration-300 group hover:scale-105"
                            style={{
                                background: '#9BC2A6',
                                boxShadow: '0 8px 20px rgba(155, 194, 166, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#7A9E89'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#9BC2A6'
                            }}
                        >
                            <span>Agendar apresentação da plataforma</span>
                            <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== SEÇÃO 7: AUTORIDADE TÉCNICA (Provas Sociais) ===== */}
            <section className="relative py-20 lg:py-32" style={{background: '#fafbfc'}}>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                    
                    {/* Header da seção */}
                    <div className="text-center mb-12 lg:mb-16 max-w-[900px] mx-auto">
                        <p className="font-sora text-[11px] font-semibold uppercase tracking-[0.1em] mb-4" 
                           style={{color: '#5F8A6F'}}>
                            Metodologia
                        </p>
                        <h2 className="font-grotesk text-[clamp(28px,3.5vw,42px)] font-bold leading-[1.15] tracking-[-0.01em] mb-6" 
                            style={{color: '#0d0d0d'}}>
                            Base técnica e normativa
                        </h2>
                        
                        {/* Texto institucional */}
                        <div className="space-y-4 font-sora text-[16px] lg:text-[17px] leading-[1.7] max-w-[800px] mx-auto" 
                             style={{color: '#6b7480'}}>
                            <p>
                                A metodologia utilizada pela Terapia Empresarial foi desenvolvida com base em princípios de gestão organizacional, psicologia do trabalho e normas regulatórias vigentes.
                            </p>
                            <p>
                                Nosso diagnóstico considera fatores psicossociais reconhecidos em estudos sobre saúde mental no trabalho e está alinhado às exigências normativas relacionadas à gestão de riscos ocupacionais.
                            </p>
                        </div>
                    </div>

                    {/* Subheader: "Escolhida por empresas..." */}
                    <div className="text-center mb-12 lg:mb-16">
                        <h3 className="font-grotesk text-[clamp(22px,2.5vw,28px)] font-semibold leading-[1.2] tracking-[-0.01em]" 
                            style={{color: '#353a40'}}>
                            Escolhida por empresas que levam a saúde mental a sério
                        </h3>
                    </div>

                    {/* Carrossel infinito de logos (marquee → direita) */}
                    <div className="mb-16 lg:mb-20 overflow-hidden relative py-8">
                        <motion.div 
                            className="flex gap-16 items-center"
                            animate={{x: ['0%', '-50%']}}
                            transition={{
                                duration: 40,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                        >
                            {/* Duplicar array 2x para loop infinito suave */}
                            {[
                                { name: 'Intensa Mídia', path: '/clients/intensa-midia.png' },
                                { name: 'BHCoSpace', path: '/clients/bhcoespace.png' },
                                { name: 'SKETCH', path: '/clients/sketch.png' },
                                { name: 'Cliente 4', path: '/clients/cliente4.png' },
                                { name: 'Cliente 5', path: '/clients/cliente5.png' },
                                { name: 'Cliente 6', path: '/clients/cliente6.png' },
                                { name: 'Cliente 7', path: '/clients/cliente7.png' }
                            ].concat([
                                { name: 'Intensa Mídia', path: '/clients/intensa-midia.png' },
                                { name: 'BHCoSpace', path: '/clients/bhcoespace.png' },
                                { name: 'SKETCH', path: '/clients/sketch.png' },
                                { name: 'Cliente 4', path: '/clients/cliente4.png' },
                                { name: 'Cliente 5', path: '/clients/cliente5.png' },
                                { name: 'Cliente 6', path: '/clients/cliente6.png' },
                                { name: 'Cliente 7', path: '/clients/cliente7.png' }
                            ]).map((logo, index) => (
                                <div key={index} className="flex-shrink-0 flex items-center justify-center" style={{width: '140px', height: '48px'}}>
                                    <Image
                                        src={logo.path}
                                        alt={logo.name}
                                        width={140}
                                        height={48}
                                        className="max-h-[48px] max-w-[140px] w-auto h-auto object-contain opacity-40 hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* HERO TESTIMONIAL - SKETCH (Destaque) */}
                    <motion.div
                        className="mb-12 lg:mb-16"
                        initial={{opacity: 0, y: 30}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, margin: '-50px'}}
                        transition={{duration: 0.6, ease: 'easeOut'}}
                        onMouseEnter={() => setHoveredTestimonial('sketch')}
                        onMouseLeave={() => setHoveredTestimonial(null)}
                    >
                        <div 
                            className="relative bg-white rounded-3xl p-10 lg:p-12 border-2 transition-all duration-300 cursor-pointer"
                            style={{
                                borderColor: '#9BC2A6',
                                background: 'rgba(155, 194, 166, 0.03)'
                            }}
                        >
                            {/* Badge Destaque */}
                            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" 
                                 style={{background: '#9BC2A6'}}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{color: '#ffffff'}}>
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                                <span className="font-sora text-[11px] font-bold uppercase tracking-wider" 
                                      style={{color: '#ffffff'}}>
                                    Destaque
                                </span>
                            </div>

                            {/* Quote */}
                            <p className="font-sora text-[17px] lg:text-[19px] leading-[1.7] mb-8" 
                               style={{color: '#0d0d0d'}}>
                                "Os resultados foram perceptíveis em diferentes níveis da organização. Houve melhoria no bem-estar dos colaboradores, fortalecimento do relacionamento entre equipes e líderes, além de reflexos positivos na forma como os profissionais se relacionam com os clientes no dia a dia das operações. Como consequência desse ambiente organizacional mais saudável e alinhado, a empresa registrou um incremento de aproximadamente 15% nas vendas."
                            </p>

                            {/* Divisor */}
                            <div className="w-16 h-[2px] mb-6" 
                                 style={{background: '#9BC2A6'}} />

                            {/* Autor e Logo */}
                            <div className="flex items-end justify-between flex-wrap gap-6">
                                <div>
                                    <p className="font-grotesk text-[17px] font-bold mb-1" 
                                       style={{color: '#0d0d0d'}}>
                                        Gestão Executiva
                                    </p>
                                    <p className="font-sora text-[14px]" 
                                       style={{color: '#6b7480'}}>
                                        SKETCH Confecções
                                    </p>
                                </div>
                                <div className="relative" style={{width: '140px', height: '48px'}}>
                                    <Image
                                        src="/clients/sketch.png"
                                        alt="SKETCH Confecções"
                                        fill
                                        className="object-contain object-right opacity-70"
                                    />
                                </div>
                            </div>

                            {/* Tooltip com depoimento completo */}
                            <AnimatePresence>
                                {hoveredTestimonial === 'sketch' && (
                                    <motion.div
                                        className="absolute inset-0 bg-white rounded-3xl p-10 lg:p-12 border-2 z-10 overflow-y-auto"
                                        style={{
                                            borderColor: '#9BC2A6',
                                            background: 'rgba(255, 255, 255, 0.98)',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 25px 50px rgba(155, 194, 166, 0.3)'
                                        }}
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                        transition={{duration: 0.2}}
                                    >
                                        {/* Badge Destaque */}
                                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" 
                                             style={{background: '#9BC2A6'}}>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{color: '#ffffff'}}>
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                            <span className="font-sora text-[11px] font-bold uppercase tracking-wider" 
                                                  style={{color: '#ffffff'}}>
                                                Depoimento Completo
                                            </span>
                                        </div>

                                        {/* Depoimento completo */}
                                        <div className="font-sora text-[15px] lg:text-[16px] leading-[1.8] mb-8 whitespace-pre-line" 
                                             style={{color: '#0d0d0d'}}>
                                            "{FULL_TESTIMONIALS.sketch}"
                                        </div>

                                        {/* Divisor */}
                                        <div className="w-16 h-[2px] mb-6" 
                                             style={{background: '#9BC2A6'}} />

                                        {/* Autor e Logo */}
                                        <div className="flex items-end justify-between flex-wrap gap-6">
                                            <div>
                                                <p className="font-grotesk text-[17px] font-bold mb-1" 
                                                   style={{color: '#0d0d0d'}}>
                                                    Gestão Executiva
                                                </p>
                                                <p className="font-sora text-[14px]" 
                                                   style={{color: '#6b7480'}}>
                                                    SKETCH Confecções
                                                </p>
                                            </div>
                                            <div className="relative" style={{width: '140px', height: '48px'}}>
                                                <Image
                                                    src="/clients/sketch.png"
                                                    alt="SKETCH Confecções"
                                                    fill
                                                    className="object-contain object-right opacity-70"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Grid de Depoimentos (2 cards normais + 1 CTA card) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Card 1: Intensa Mídia */}
                        <motion.div
                            className="bg-white rounded-2xl p-8 lg:p-10 border transition-all duration-300 hover:scale-[1.02] group flex flex-col cursor-pointer relative"
                            style={{borderColor: '#e5e7eb'}}
                            initial={{opacity: 0, y: 30}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true, margin: '-50px'}}
                            transition={{duration: 0.5, delay: 0}}
                            whileHover={{
                                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
                                borderColor: '#d1d5db'
                            }}
                            onMouseEnter={() => setHoveredTestimonial('intensa')}
                            onMouseLeave={() => setHoveredTestimonial(null)}
                        >
                            <p className="font-sora text-[15px] lg:text-[16px] leading-[1.65] mb-auto" 
                               style={{color: '#353a40'}}>
                                "A plataforma transformou as respostas em inteligência organizacional, indo muito além de um relatório estático. Conseguimos identificar padrões de risco e receber recomendações estratégicas que nos ajudam a prevenir passivos trabalhistas."
                            </p>

                            <div className="w-12 h-[2px] my-6" style={{background: '#e5e7eb'}} />

                            <div className="mb-6">
                                <p className="font-grotesk text-[15px] font-bold mb-0.5" style={{color: '#0d0d0d'}}>
                                    Equipe de Gestão
                                </p>
                                <p className="font-sora text-[13px]" style={{color: '#9ca3af'}}>
                                    Intensa Mídia
                                </p>
                            </div>

                            <div className="h-14 flex items-center justify-start">
                                <div className="relative" style={{width: '120px', height: '40px'}}>
                                    <Image
                                        src="/clients/intensa-midia.png"
                                        alt="Intensa Mídia"
                                        fill
                                        className="object-contain object-left opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                            </div>

                            {/* Tooltip com depoimento completo */}
                            <AnimatePresence>
                                {hoveredTestimonial === 'intensa' && (
                                    <motion.div
                                        className="absolute inset-0 bg-white rounded-2xl p-8 lg:p-10 border-2 z-10 overflow-y-auto"
                                        style={{
                                            borderColor: '#9BC2A6',
                                            background: 'rgba(255, 255, 255, 0.98)',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 25px 50px rgba(155, 194, 166, 0.3)'
                                        }}
                                        initial={{opacity: 0, scale: 0.95}}
                                        animate={{opacity: 1, scale: 1}}
                                        exit={{opacity: 0, scale: 0.95}}
                                        transition={{duration: 0.2}}
                                    >
                                        {/* Badge */}
                                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full" 
                                             style={{background: '#9BC2A6'}}>
                                            <span className="font-sora text-[10px] font-bold uppercase tracking-wider" 
                                                  style={{color: '#ffffff'}}>
                                                Depoimento Completo
                                            </span>
                                        </div>

                                        {/* Depoimento completo */}
                                        <div className="font-sora text-[14px] leading-[1.7] mb-6 whitespace-pre-line" 
                                             style={{color: '#0d0d0d'}}>
                                            "{FULL_TESTIMONIALS.intensa}"
                                        </div>

                                        {/* Divisor */}
                                        <div className="w-12 h-[2px] mb-4" 
                                             style={{background: '#9BC2A6'}} />

                                        {/* Autor e Logo */}
                                        <div className="mb-4">
                                            <p className="font-grotesk text-[15px] font-bold mb-0.5" style={{color: '#0d0d0d'}}>
                                                Equipe de Gestão
                                            </p>
                                            <p className="font-sora text-[13px]" style={{color: '#9ca3af'}}>
                                                Intensa Mídia
                                            </p>
                                        </div>

                                        <div className="h-14 flex items-center justify-start">
                                            <div className="relative" style={{width: '120px', height: '40px'}}>
                                                <Image
                                                    src="/clients/intensa-midia.png"
                                                    alt="Intensa Mídia"
                                                    fill
                                                    className="object-contain object-left opacity-70"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Card 2: BHCoSpace */}
                        <motion.div
                            className="bg-white rounded-2xl p-8 lg:p-10 border transition-all duration-300 hover:scale-[1.02] group flex flex-col cursor-pointer relative"
                            style={{borderColor: '#e5e7eb'}}
                            initial={{opacity: 0, y: 30}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true, margin: '-50px'}}
                            transition={{duration: 0.5, delay: 0.15}}
                            whileHover={{
                                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
                                borderColor: '#d1d5db'
                            }}
                            onMouseEnter={() => setHoveredTestimonial('bhcoespace')}
                            onMouseLeave={() => setHoveredTestimonial(null)}
                        >
                            <p className="font-sora text-[15px] lg:text-[16px] leading-[1.65] mb-auto" 
                               style={{color: '#353a40'}}>
                                "Conseguimos avançar significativamente na conformidade com a NR-1, estruturando um diagnóstico claro sobre organização do trabalho, clima organizacional e fatores de pressão que podem impactar a saúde mental dos colaboradores."
                            </p>

                            <div className="w-12 h-[2px] my-6" style={{background: '#e5e7eb'}} />

                            <div className="mb-6">
                                <p className="font-grotesk text-[15px] font-bold mb-0.5" style={{color: '#0d0d0d'}}>
                                    Equipe de RH
                                </p>
                                <p className="font-sora text-[13px]" style={{color: '#9ca3af'}}>
                                    BHCoSpace
                                </p>
                            </div>

                            <div className="h-14 flex items-center justify-start">
                                <div className="relative" style={{width: '120px', height: '40px'}}>
                                    <Image
                                        src="/clients/bhcoespace.png"
                                        alt="BHCoSpace"
                                        fill
                                        className="object-contain object-left opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                            </div>

                            {/* Tooltip com depoimento completo */}
                            <AnimatePresence>
                                {hoveredTestimonial === 'bhcoespace' && (
                                    <motion.div
                                        className="absolute inset-0 bg-white rounded-2xl p-8 lg:p-10 border-2 z-10 overflow-y-auto"
                                        style={{
                                            borderColor: '#9BC2A6',
                                            background: 'rgba(255, 255, 255, 0.98)',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 25px 50px rgba(155, 194, 166, 0.3)'
                                        }}
                                        initial={{opacity: 0, scale: 0.95}}
                                        animate={{opacity: 1, scale: 1}}
                                        exit={{opacity: 0, scale: 0.95}}
                                        transition={{duration: 0.2}}
                                    >
                                        {/* Badge */}
                                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full" 
                                             style={{background: '#9BC2A6'}}>
                                            <span className="font-sora text-[10px] font-bold uppercase tracking-wider" 
                                                  style={{color: '#ffffff'}}>
                                                Depoimento Completo
                                            </span>
                                        </div>

                                        {/* Depoimento completo */}
                                        <div className="font-sora text-[14px] leading-[1.7] mb-6 whitespace-pre-line" 
                                             style={{color: '#0d0d0d'}}>
                                            "{FULL_TESTIMONIALS.bhcoespace}"
                                        </div>

                                        {/* Divisor */}
                                        <div className="w-12 h-[2px] mb-4" 
                                             style={{background: '#9BC2A6'}} />

                                        {/* Autor e Logo */}
                                        <div className="mb-4">
                                            <p className="font-grotesk text-[15px] font-bold mb-0.5" style={{color: '#0d0d0d'}}>
                                                Equipe de RH
                                            </p>
                                            <p className="font-sora text-[13px]" style={{color: '#9ca3af'}}>
                                                BHCoSpace
                                            </p>
                                        </div>

                                        <div className="h-14 flex items-center justify-start">
                                            <div className="relative" style={{width: '120px', height: '40px'}}>
                                                <Image
                                                    src="/clients/bhcoespace.png"
                                                    alt="BHCoSpace"
                                                    fill
                                                    className="object-contain object-left opacity-70"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Card 3: CTA Card */}
                        <motion.div
                            className="rounded-2xl p-8 lg:p-10 border-2 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.05] group"
                            style={{
                                borderColor: '#9BC2A6',
                                background: 'linear-gradient(135deg, rgba(155, 194, 166, 0.08) 0%, rgba(155, 194, 166, 0.12) 100%)'
                            }}
                            initial={{opacity: 0, y: 30}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true, margin: '-50px'}}
                            transition={{duration: 0.5, delay: 0.3}}
                            whileHover={{
                                boxShadow: '0 20px 40px rgba(155, 194, 166, 0.25)'
                            }}
                        >
                            {/* Ícone */}
                            <motion.div 
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                                style={{background: '#9BC2A6'}}
                                animate={{y: [0, -5, 0]}}
                                transition={{duration: 2, repeat: Infinity, ease: 'easeInOut'}}
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{color: '#ffffff'}}>
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                    <path d="M2 17l10 5 10-5"/>
                                    <path d="M2 12l10 5 10-5"/>
                                </svg>
                            </motion.div>

                            {/* Título */}
                            <h3 className="font-grotesk text-[22px] lg:text-[24px] font-bold leading-[1.2] mb-4" 
                                style={{color: '#0d0d0d'}}>
                                Veja como sua empresa pode alcançar resultados assim
                            </h3>

                            {/* Subtítulo */}
                            <p className="font-sora text-[15px] leading-[1.6] mb-6" 
                               style={{color: '#6b7480'}}>
                                Agende uma apresentação e descubra o potencial de transformação da sua organização
                            </p>

                            {/* Botão CTA */}
                            <Link
                                href="https://api.whatsapp.com/send/?phone=5531996955389&text=Ol%C3%A1%2C+gostaria+de+agendar+uma+apresenta%C3%A7%C3%A3o+da+plataforma&type=phone_number&app_absent=0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 font-sora font-semibold text-[15px] text-white px-6 py-3.5 rounded-xl transition-all duration-300 mb-4 group-hover:scale-105"
                                style={{background: '#9BC2A6'}}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#7A9E89'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#9BC2A6'
                                }}
                            >
                                <span>Agendar apresentação</span>
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </Link>

                            {/* Link secundário */}
                            <a 
                                href="#depoimentos" 
                                className="font-sora text-[13px] font-medium transition-colors duration-200"
                                style={{
                                    color: '#5F8A6F',
                                    textDecoration: 'underline',
                                    textDecorationStyle: 'dashed',
                                    textUnderlineOffset: '3px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecorationStyle = 'solid'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecorationStyle = 'dashed'
                                }}
                            >
                                Ver casos completos →
                            </a>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ===== SEÇÃO 8: FAQ ===== */}
            <section className="bg-white py-20 lg:py-28">
                <div className="max-w-[960px] mx-auto px-8 lg:px-12">
                    <div className="text-center mb-12">
                        <p className="font-sora text-sage-500 text-[11px] font-semibold uppercase tracking-[0.1em] mb-4">Perguntas Frequentes</p>
                        <h2 className="font-grotesk text-[clamp(28px,3.5vw,44px)] font-bold text-primary-600 leading-[1.1]">
                            Dúvidas comuns
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                question: 'O mapeamento psicossocial é obrigatório?',
                                answer: 'A NR-1 estabelece diretrizes para gestão de riscos ocupacionais, incluindo riscos psicossociais relacionados à organização do trabalho.'
                            },
                            {
                                question: 'Quem precisa aplicar esse diagnóstico?',
                                answer: 'Empresas que buscam adequação às exigências normativas e prevenção de passivos trabalhistas podem se beneficiar da aplicação do diagnóstico.'
                            },
                            {
                                question: 'Os dados dos colaboradores são confidenciais?',
                                answer: 'Sim. A plataforma foi desenvolvida para garantir confidencialidade e proteção das informações coletadas.'
                            },
                            {
                                question: 'Quanto tempo leva o diagnóstico?',
                                answer: 'O tempo depende do tamanho da organização e da quantidade de colaboradores participantes.'
                            }
                        ].map((faq, index) => (
                            <div 
                                key={index} 
                                className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-sage-300/50 hover:shadow-sm"
                            >
                                <button
                                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left transition-colors duration-200"
                                >
                                    <h3 className="font-grotesk font-semibold text-[16px] lg:text-[17px] text-primary-600 pr-4">
                                        {faq.question}
                                    </h3>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-sage-300/10 flex items-center justify-center transition-all duration-300 ${openFaqIndex === index ? 'rotate-180 bg-sage-300' : ''}`}>
                                        <svg 
                                            className={`w-4 h-4 transition-colors duration-200 ${openFaqIndex === index ? 'text-white' : 'text-sage-500'}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            viewBox="0 0 24 24"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </button>
                                
                                <div 
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="px-8 pb-6">
                                        <div className="pt-2 border-t border-gray-100">
                                            <p className="font-sora text-gray-500 text-[15px] leading-[1.7] mt-4">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA final */}
                    <div className="mt-12 text-center">
                        <p className="font-sora text-gray-500 text-[14px] mb-6">
                            Ainda tem dúvidas? Entre em contato conosco
                        </p>
                        <Link
                            href="https://api.whatsapp.com/send/?phone=5531996955389&text=Ol%C3%A1%2C+tenho+d%C3%BAvidas+sobre+a+plataforma&type=phone_number&app_absent=0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-sage-300 hover:bg-sage-400 text-white font-sora font-semibold text-[14px] rounded-xl transition-all duration-300 shadow-lg shadow-sage-300/20 hover:shadow-xl hover:shadow-sage-300/30"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span>Falar no WhatsApp</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-primary-800 text-white border-t border-white/5">
                <div className="max-w-[1360px] mx-auto px-8 lg:px-12 py-12">
                    <div className="grid md:grid-cols-3 gap-10">
                        <div>
                            <Image src="/logo.png" alt="Terapia Empresarial" width={160} height={40} className="h-7 w-auto mb-4 opacity-80" />
                            <p className="font-sora text-white/30 text-[13px] leading-relaxed max-w-[260px]">
                                Inteligencia organizacional com conformidade legal para saude mental corporativa.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-sora text-[12px] font-semibold text-white/40 uppercase tracking-[0.12em] mb-4">Contato</h4>
                            <div className="font-sora space-y-2 text-[13px] text-white/30">
                                <p>contato@terapiaempresarial.com.br</p>
                                <p>(31) 99695-5389</p>
                                <p>Av. Amazonas 687, 16o andar — BH/MG</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-sora text-[12px] font-semibold text-white/40 uppercase tracking-[0.12em] mb-4">Legal</h4>
                            <div className="font-sora space-y-2 text-[13px]">
                                <Link href="/termos" className="block text-white/30 hover:text-white/60 transition-colors">Termos de uso</Link>
                                <Link href="/privacidade" className="block text-white/30 hover:text-white/60 transition-colors">Politica de privacidade</Link>
                                <Link href="https://wa.me/553196955389" target="_blank" rel="noopener noreferrer" className="block text-white/30 hover:text-white/60 transition-colors">Contato</Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="font-sora text-white/20 text-[12px]">&copy; {new Date().getFullYear()} Terapia Empresarial. Todos os direitos reservados.</p>
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
