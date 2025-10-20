import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
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
    
    const { token, password } = await request.json()

    if (!token || !password) {
      await client.end()
      return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
    }

    if (password.length < 8) {
      await client.end()
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Find user with valid token
    const result = await client.query(
      'SELECT id, email FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
      [token]
    )
    
    const user = result.rows[0]
    
    if (!user) {
      await client.end()
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password and clear reset token
    await client.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    )

    await client.end()

    return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 })

  } catch (error) {
    try { await client.end() } catch {}
    console.error('Reset verify error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
