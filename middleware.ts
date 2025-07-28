import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rutas que requieren autenticación
  const protectedPaths = [
    '/dashboard',
    '/carrier-waterfalls',
    '/loads',
    '/carrier-directory',
    '/admin-settings',
    '/brand-style-guide'
  ]

  // Rutas de autenticación (incluir todas las subrutas)
  const authPaths = [
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/activate-account'
  ]

  const { pathname } = request.nextUrl
  
  // Verificar si es una ruta protegida
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname === path) || pathname === '/auth'
  
  // Obtener token de la cookie
  const token = request.cookies.get('auth-token')?.value
  const isAuthenticated = !!token

  // Si es una ruta protegida y no está autenticado, redirigir a login
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Si está autenticado y trata de acceder a rutas de auth, redirigir al carrier-waterfalls
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/carrier-waterfalls', request.url))
  }

  // Si está en la raíz y autenticado, redirigir a carrier-waterfalls
  if (pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/carrier-waterfalls', request.url))
  }

  // Si está en la raíz y no autenticado, redirigir a login
  if (pathname === '/' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
