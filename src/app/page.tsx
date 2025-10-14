import Link from 'next/link'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
            {/* Header com link de login */}
            <div className="w-full py-4">
                <div className="container mx-auto px-4 flex justify-end">
                    <Link
                        href="/login"
                        className="bg-white text-primary-600 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow font-medium"
                    >
                        Fazer Login
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Guia de Terapia
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Transforme sua equipe e desenvolva líderes extraordinários
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Jornada de Equipe */}
                    <div className="card">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Jornada de Equipe
                            </h2>
                            <p className="text-gray-600">
                                Para gestores que querem desenvolver suas equipes
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Mapa de Clareza personalizado</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Painel gerencial completo</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Módulos de vídeo interativos</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Guia de ferramentas colaborativo</span>
                            </div>
                        </div>

                        <Link href="/cadastro-gestor" className="btn-primary w-full text-center block">
                            Começar Jornada de Equipe
                        </Link>
                    </div>

                    {/* Jornada do Líder */}
                    <div className="card">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Jornada do Líder
                            </h2>
                            <p className="text-gray-600">
                                Para líderes que querem se desenvolver individualmente
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Programa completo de liderança</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Mentoria individual</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Certificação profissional</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-success-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Acesso vitalício</span>
                            </div>
                        </div>

                        <a
                            href="https://pay.hotmart.com/T101934320V"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            🚀 Começar Jornada do Líder
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
