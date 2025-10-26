import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { rateLimit } from '@/lib/auth'
import { validateEmail, validatePassword, validateName } from '@/lib/validation'

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Rate limit: 3 registration attempts per hour
    const rateLimitResult = rateLimit(`register:${ip}`, 3, 3600000)
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString()
          }
        }
      )
    }

    const { name, email, password } = await request.json()

    // Validate name
    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 })
    }

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [emailValidation.email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    const result = await query(
      `INSERT INTO users (name, email, password, role, createdat)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, name, email, role, createdat`,
      [nameValidation.name, emailValidation.email, hashedPassword, 'member']
    )

    const user = result.rows[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: 'Seeker',
        daysUntilNext: 30,
        nextLevel: 'Explorer',
        joinDate: user.createdat
      }
    }, {
      status: 201,
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed. Please try again.', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    )
  }
}
