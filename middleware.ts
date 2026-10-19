import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hiddenRoutes } from './lib/features'

const MEMBER_PATHS = ['/members', '/journey', '/community', '/videos', '/calls']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // Switched off features redirect to Home
  const hidden = Object.keys(hiddenRoutes).some(
    (route) => !hiddenRoutes[route] && (pathname === route || pathname.startsWith(route + '/'))
  )
  if (hidden) {
    return NextResponse.redirect(new URL('/members', request.url))
  }

  // If trying to access protected pages without token, redirect to login
  const isMemberPage = MEMBER_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (isMemberPage && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Allow access to all other pages (including auth pages)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/members/:path*', '/auth/:path*', '/journey/:path*', '/community/:path*',
    '/videos/:path*', '/calls/:path*',
    '/about-cor/:path*', '/astrology/:path*', '/replays/:path*',
  ]
}
