import './globals.css'
import type { Metadata } from 'next'
import { Sora, Space_Grotesk } from 'next/font/google'
import ToastProvider from '@/components/ToastProvider'

const sora = Sora({
    subsets: ['latin'],
    variable: '--font-sora',
    display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-grotesk',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Terapia Empresarial - Inteligencia Organizacional com Conformidade Legal',
    description: 'Mais que um laudo. Uma solucao estrategica para saude mental corporativa. Atendimento a NR-1, mapeamento de riscos psicossociais e plataforma pratica.',
    icons: {
        icon: '/favicon.png',
        shortcut: '/favicon.png',
        apple: '/favicon.png',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" className={`${sora.variable} ${spaceGrotesk.variable}`}>
            <body className="font-sora">
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    )
}
