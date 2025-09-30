import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isMembersPage = request.nextUrl.pathname.startsWith('/members')

  if (isMembersPage && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isMembersPage && token) {
    try {
      jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-secret-key')
      return NextResponse.next()
    } catch (error) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('auth_token')
      return response
    }
  }

  if (isAuthPage && token) {
    try {
      jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-secret-key')
      return NextResponse.redirect(new URL('/members', request.url))
    } catch (error) {
      const response = NextResponse.next()
      response.cookies.delete('auth_token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/members/:path*', '/auth/:path*']
}
