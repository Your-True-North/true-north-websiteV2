import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Check if user exists and is admin
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email.toLowerCase().trim(), 'admin']
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials or not authorized' },
        { status: 401 }
      )
    }

    const admin = result.rows[0]

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Return admin data (without password)
    const adminData = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }

    // Create response with cookie
    const response = NextResponse.json(
      { admin: adminData, message: 'Login successful' },
      { status: 200 }
    )

    // Set admin cookie
    response.cookies.set('admin', JSON.stringify(adminData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('[Admin Login] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
