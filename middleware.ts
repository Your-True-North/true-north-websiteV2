import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const isMembersPage = request.nextUrl.pathname.startsWith('/members')
  const isJourneyPage = request.nextUrl.pathname.startsWith('/journey')
  const isCommunityPage = request.nextUrl.pathname.startsWith('/community')

  // If trying to access protected pages without token, redirect to login
  if ((isMembersPage || isJourneyPage || isCommunityPage) && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Allow access to all other pages (including auth pages)
  return NextResponse.next()
}

export const config = {
  matcher: ['/members/:path*', '/auth/:path*', '/journey/:path*', '/community/:path*']
}
