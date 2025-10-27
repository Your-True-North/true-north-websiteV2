import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { createToken, rateLimit } from '@/lib/auth'
import { validateEmail, validatePassword } from '@/lib/validation'

export async function POST(request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    const rateLimitResult = rateLimit(`login:${ip}`, 5, 60000)
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString()
          }
        }
      )
    }

    const body = await request.json()
    const { email, password } = body

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [emailValidation.email])
    const user = result.rows[0]

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ 
        error: `Debug: ${password.length} chars, hash: ${user.password?.substring(0, 10)}`
      }, { status: 401 })
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: 'Seeker',
        daysUntilNext: 30,
        nextLevel: 'Explorer',
        joinDate: user.createdat || new Date().toISOString()
      }
    }, {
      status: 200,
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      }
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

    return response

  } catch (error) {
    return NextResponse.json({ error: 'Login failed: ' + error.message }, { status: 500 })
  }
}
