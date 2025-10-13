import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    console.log('=== LOGIN ATTEMPT ===')
    console.log('Email:', email)
    console.log('DATABASE_PUBLIC_URL exists?', !!process.env.DATABASE_PUBLIC_URL)
    console.log('DATABASE_URL exists?', !!process.env.DATABASE_URL)

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    console.log('Query result rows:', result.rows.length)
    
    const user = result.rows[0]
    
    if (!user) {
      console.log('No user found')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    console.log('User found:', user.email)
    console.log('Stored hash:', user.password)

    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('Password valid?', isValidPassword)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '30d' }
    )

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
