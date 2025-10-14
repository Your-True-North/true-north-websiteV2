import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isMembersPage = request.nextUrl.pathname.startsWith('/members')

  // If trying to access members without token, redirect to login
  if (isMembersPage && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If has token, allow access to members (API routes will verify JWT properly)
  if (isMembersPage && token) {
    return NextResponse.next()
  }

  // If trying to access auth pages with token, redirect to members
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/members', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/members/:path*', '/auth/:path*']
}
