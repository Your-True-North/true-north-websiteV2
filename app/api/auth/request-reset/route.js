import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sendEmail } from '@/lib/sendgrid'
import pkg from 'pg'
const { Client } = pkg

function generatePassword(length = 10) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()

    const body = await request.json()
    const { email } = body

    if (!email) {
      await client.end()
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      await client.end()
      return NextResponse.json({ success: true, message: 'If an account with that email exists, a new password has been sent.' }, { status: 200 })
    }

    const newPassword = generatePassword(10)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await client.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email])

    console.log('[Password Reset] Attempting to send email to:', email)
    console.log('[Password Reset] RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)
    console.log('[Password Reset] EMAIL_FROM:', process.env.EMAIL_FROM)

    await sendEmail({
      to: email,
      subject: 'Your New Password - Circle of Return',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0b; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #9bc4b8; font-weight: 300; letter-spacing: 0.1em;">Circle of Return</h1>
          </div>

          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 30px;">
            <h2 style="color: #fff; font-weight: 300; margin-bottom: 20px;">Password Reset</h2>

            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 20px;">
              You requested a password reset for your Circle of Return member portal account.
            </p>

            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 10px;">
              Your new temporary password is:
            </p>

            <div style="background: rgba(155, 196, 184, 0.15); border: 1px solid rgba(155, 196, 184, 0.4); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <code style="font-size: 1.5rem; color: #9bc4b8; font-weight: 600; letter-spacing: 0.05em;">${newPassword}</code>
            </div>

            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 20px;">
              Use this password to log in, then change it to something memorable in your account settings.
            </p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://truenorthwithin.com'}/auth/login"
                 style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #9bc4b8, #7fb069); color: #000; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Log In Now
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.875rem;">
              If you didn't request this reset, please contact support immediately.
            </p>
          </div>
        </div>
      `,
      text: `
Circle of Return - Password Reset

You requested a password reset for your Circle of Return member portal account.

Your new temporary password is: ${newPassword}

Use this password to log in at ${process.env.NEXT_PUBLIC_APP_URL || 'https://truenorthwithin.com'}/auth/login

Then change it to something memorable in your account settings.

If you didn't request this reset, please contact support immediately.
      `
    })

    console.log('[Password Reset] Email sent successfully via Resend to:', email)

    await client.end()

    return NextResponse.json({
      success: true,
      message: 'A new password has been sent to your email.'
    }, { status: 200 })

  } catch (error) {
    console.error('[Password Reset] Error:', error)
    try { await client.end() } catch {}
    return NextResponse.json({
      error: 'Failed to process password reset',
      details: error.message
    }, { status: 500 })
  }
}
