import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.NEXTAUTH_SECRET

export function verifyToken(token) {
  if (!token || !JWT_SECRET) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

export function createToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('NEXTAUTH_SECRET environment variable is not set')
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function getAuthUser(request) {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (decoded) {
      return decoded
    }
  }

  // Try to get token from cookie
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=')
        return [key, v.join('=')]
      })
    )
    const token = cookies.auth_token
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        return decoded
      }
    }
  }

  return null
}

export function requireAuth(request, options = {}) {
  const user = getAuthUser(request)

  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  if (options.requiredRole && user.role !== options.requiredRole) {
    return {
      error: NextResponse.json(
        { error: `${options.requiredRole} access required` },
        { status: 403 }
      )
    }
  }

  return { user }
}

// Rate limiting store (in-memory for now, should use Redis in production)
const rateLimitStore = new Map()

export function rateLimit(identifier, maxRequests = 5, windowMs = 60000) {
  const now = Date.now()
  const key = identifier

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, [])
  }

  const requests = rateLimitStore.get(key).filter(time => now - time < windowMs)
  requests.push(now)
  rateLimitStore.set(key, requests)

  // Cleanup old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, times] of rateLimitStore.entries()) {
      if (times.every(t => now - t > windowMs)) {
        rateLimitStore.delete(k)
      }
    }
  }

  if (requests.length > maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetAt: Math.ceil((requests[0] + windowMs) / 1000)
    }
  }

  return {
    limited: false,
    remaining: maxRequests - requests.length,
    resetAt: Math.ceil((now + windowMs) / 1000)
  }
}
