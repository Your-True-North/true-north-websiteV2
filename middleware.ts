import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isMembersPage = request.nextUrl.pathname.startsWith('/members')
  const isJourneyPage = request.nextUrl.pathname.startsWith('/journey')

  // If trying to access protected pages without token, redirect to login
  if ((isMembersPage || isJourneyPage) && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Allow all other requests (including auth pages regardless of token)
  return NextResponse.next()
}

export const config = {
  matcher: ['/members/:path*', '/auth/:path*', '/journey/:path*']
}
