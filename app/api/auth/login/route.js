import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pkg from 'pg'
const { Client } = pkg

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()
    
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      await client.end()
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    
    if (!user) {
      await client.end()
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      await client.end()
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '30d' }
    )

    await client.end()

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
      },
      token
    }, { status: 200 })

    response.cookies.set('auth_token', token, {
      httpOnly: false, // Allow client-side access for auth check
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })

    return response

  } catch (error) {
    try { await client.end() } catch {}
    return NextResponse.json({ error: 'Login failed', details: error.message }, { status: 500 })
  }
}
