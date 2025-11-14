import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                    <div className="text-center sm:text-left">
                        <p>&copy; {new Date().getFullYear()} Guia de Terapia. Todos os direitos reservados.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Precisa de ajuda?</span>
                        <Link 
                            href="https://terapiaempresarial.com.br/ajuda"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
                        >
                            Central de Ajuda
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
