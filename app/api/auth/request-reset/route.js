import { NextResponse } from 'next/server'
import crypto from 'crypto'
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
    
    const { email } = await request.json()

    if (!email) {
      await client.end()
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Check if user exists
    const result = await client.query('SELECT id, email, name FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    
    if (!user) {
      // Don't reveal if user exists or not (security)
      await client.end()
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Store token in database
    await client.query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    )

    // Send email via ConvertKit
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password/${resetToken}`
    
    const convertkitRes = await fetch('https://api.convertkit.com/v3/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_secret: process.env.CONVERTKIT_API_KEY,
        email_address: email,
        subject: 'Reset Your Password - True North',
        content: `
          <p>Hi ${user.name || 'there'},</p>
          <p>You requested to reset your password for True North.</p>
          <p><a href="${resetUrl}" style="background: linear-gradient(135deg, #9bc4b8, #7fb069); color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reset Password</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, ignore this email.</p>
          <p>- True North</p>
        `
      })
    })

    await client.end()

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    try { await client.end() } catch {}
    console.error('Reset request error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
