import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ToastProvider from '@/components/ToastProvider'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Guia de Terapia - Jornada de Equipe',
    description: 'Plataforma de desenvolvimento de equipes e liderança',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <div className="flex flex-col min-h-screen">
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                    <Footer />
                </div>
            </body>
        </html>
    )
}
