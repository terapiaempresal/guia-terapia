import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Permitir acesso a rotas públicas
    const publicRoutes = ['/', '/login', '/acesso']
    const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith('/api/') || pathname.startsWith('/_next/')
    )

    if (isPublicRoute) {
        return NextResponse.next()
    }

    // Para rotas protegidas, o controle de acesso será feito no lado do cliente
    // usando o useAuth hook que verifica localStorage
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}
