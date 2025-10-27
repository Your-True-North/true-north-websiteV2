import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Get auth token from cookies
  const token = request.cookies.get('auth_token')?.value
  
  // Public paths that don't need authentication
  const isPublicPath = 
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/' ||
    pathname === '/work' ||
    pathname === '/circle' ||
    pathname === '/library' ||
    pathname === '/contact' ||
    pathname === '/about' ||
    pathname.includes('.')  // Static files (images, fonts, etc.)

  // If accessing public path, allow
  if (isPublicPath) {
    const response = NextResponse.next()
    // Add CORS headers for API routes only
    if (pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
    return response
  }

  // Protected routes (/journey, /members, etc.) require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // User is authenticated, allow access
  return NextResponse.next()
}

export const config = {
  // Run on all routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
