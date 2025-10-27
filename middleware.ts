import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

function verifyToken(token: string) {
  const JWT_SECRET = process.env.NEXTAUTH_SECRET

  if (!JWT_SECRET || !token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isMembersPage = request.nextUrl.pathname.startsWith('/members')
  const isJourneyPage = request.nextUrl.pathname.startsWith('/journey')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

  // Verify token if it exists
  const user = token ? verifyToken(token) : null

  // Protected pages (members, journey, admin) require valid token
  if ((isMembersPage || isJourneyPage || isAdminPage) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Admin pages require admin role
  if (isAdminPage && user && (user as any).role !== 'admin') {
    return NextResponse.redirect(new URL('/members', request.url))
  }

  // Auth pages redirect to members if already logged in
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/members', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/members/:path*', '/auth/:path*', '/journey/:path*', '/admin/:path*']
}
