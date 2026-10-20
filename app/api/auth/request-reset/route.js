import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sendEmail } from '@/lib/email'
import pkg from 'pg'
const { Client } = pkg

const FALLBACK_DATABASE_URL = 'postgresql://postgres:JSRVavPyKDfxvKqCDcRNArgvRdwflWwn@yamabiko.proxy.rlwy.net:39135/railway'

function generatePassword(length = 10) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export async function POST(request) {
  const startTime = Date.now()
  console.log('[Password Reset] ========== START ==========')
  console.log('[Password Reset] Timestamp:', new Date().toISOString())

  // Log environment configuration
  console.log('[Password Reset] Environment check:')
  console.log('[Password Reset]   - DATABASE_URL present:', !!process.env.DATABASE_URL)
  console.log('[Password Reset]   - DATABASE_PUBLIC_URL present:', !!process.env.DATABASE_PUBLIC_URL)
  console.log('[Password Reset]   - RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)
  console.log('[Password Reset]   - EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET')
  console.log('[Password Reset]   - NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'NOT SET')

  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    console.log('[Password Reset] Step 1: Connecting to database...')
    await client.connect()
    console.log('[Password Reset] Step 1: ✅ Database connected')

    console.log('[Password Reset] Step 2: Parsing request body...')
    const body = await request.json()
    // Emails are stored in lower case, so match however he typed it
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    console.log('[Password Reset] Step 2: ✅ Email received:', email ? `${email.substring(0, 3)}***` : 'NONE')

    if (!email) {
      console.log('[Password Reset] ❌ Error: No email provided')
      await client.end()
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('[Password Reset] Step 3: Querying database for user...')
    const result = await client.query('SELECT * FROM users WHERE LOWER(email) = $1', [email])
    const user = result.rows[0]
    console.log('[Password Reset] Step 3: ✅ Query complete - User found:', !!user)

    if (!user) {
      console.log('[Password Reset] ⚠️  User not found, returning generic success message for security')
      await client.end()
      return NextResponse.json({ success: true, message: 'If an account with that email exists, a new password has been sent.' }, { status: 200 })
    }

    console.log('[Password Reset] Step 4: Generating new password...')
    const newPassword = generatePassword(10)
    console.log('[Password Reset] Step 4: ✅ Password generated (length:', newPassword.length, ')')

    console.log('[Password Reset] Step 5: Hashing password...')
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    console.log('[Password Reset] Step 5: ✅ Password hashed')

    // The new password is only kept if the email goes out. Otherwise it is rolled
    // back, so a failed send can't lock him out of his old password.
    console.log('[Password Reset] Step 6: Updating database...')
    await client.query('BEGIN')
    await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id])
    console.log('[Password Reset] Step 6: ✅ Database updated (not yet committed)')

    console.log('[Password Reset] Step 7: Preparing to send email...')
    console.log('[Password Reset] Step 7: Email config:')
    console.log('[Password Reset]   - To:', email)
    console.log('[Password Reset]   - From:', process.env.EMAIL_FROM || 'kyn@yourtruenorth.me')
    console.log('[Password Reset]   - Subject: Your new KYN password')

    const LOGIN_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'https://yourtruenorth.me'}/auth/login`

    const sent = await sendEmail({
      to: user.email,
      subject: 'Your new KYN password',
      html: `
<div style="display: none; max-height: 0; overflow: hidden;">Your new password to log in to KYN.</div>
<div style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.6; color: #141410; max-width: 560px; margin: 0 auto; padding: 28px 22px;">
  <p style="margin: 0 0 8px; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #2d6a4f;">KYN</p>
  <h2 style="font-size: 21px; font-weight: 700; margin: 0 0 16px; color: #141410;">Your new password</h2>
  <p style="margin: 0 0 16px;">You asked to reset your password. Here is your new one:</p>
  <div style="background: #e8f4ee; border-radius: 8px; padding: 14px 16px; margin: 0 0 22px;">
    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; color: #141410;">${newPassword}</p>
  </div>
  <p style="margin: 0 0 22px;">Log in with ${user.email} and this password.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
    <tr>
      <td>
        <a href="${LOGIN_URL}" style="display: inline-block; padding: 10px 18px; background: #2d6a4f; color: #ffffff; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; font-size: 13px; font-weight: 600;">Log in</a>
      </td>
    </tr>
  </table>
  <p style="margin: 0 0 16px; font-size: 14px; color: #52524a;">If you didn't ask for this, email kyn@yourtruenorth.me and let me know.</p>
  <p style="margin: 0; padding-top: 16px; border-top: 1px solid #e2e2de;">True</p>
</div>
      `,
      text: `Your new KYN password

You asked to reset your password. Here is your new one:

${newPassword}

Log in with ${user.email} and this password: ${LOGIN_URL}

If you didn't ask for this, email kyn@yourtruenorth.me and let me know.

True`
    })

    // Resend reports a failed send in its result rather than throwing
    if (sent?.data?.error) {
      throw new Error(`Failed to send email: ${sent.data.error.message || sent.data.error.name}`)
    }
    await client.query('COMMIT')

    const elapsedTime = Date.now() - startTime
    console.log('[Password Reset] Step 7: ✅ Email sent successfully via Resend to:', email)
    console.log('[Password Reset] ========== SUCCESS ==========')
    console.log('[Password Reset] Total time:', elapsedTime, 'ms')

    await client.end()

    return NextResponse.json({
      success: true,
      message: 'A new password has been sent to your email.'
    }, { status: 200 })

  } catch (error) {
    const elapsedTime = Date.now() - startTime
    console.error('[Password Reset] ========== ERROR ==========')
    console.error('[Password Reset] Error occurred at:', elapsedTime, 'ms')
    console.error('[Password Reset] Error type:', error.constructor.name)
    console.error('[Password Reset] Error message:', error.message)
    console.error('[Password Reset] Error stack:', error.stack)

    // Log specific error details based on error type
    if (error.name === 'Error' && error.message.includes('Failed to send email')) {
      console.error('[Password Reset] ❌ EMAIL SENDING FAILED')
      console.error('[Password Reset] Check:')
      console.error('[Password Reset]   1. RESEND_API_KEY is set in Vercel')
      console.error('[Password Reset]   2. EMAIL_FROM domain is verified in Resend')
      console.error('[Password Reset]   3. Resend API status: https://status.resend.com')
    } else if (error.code) {
      console.error('[Password Reset] Database error code:', error.code)
      console.error('[Password Reset] Database error detail:', error.detail)
    }

    try {
      await client.query('ROLLBACK')
    } catch {}

    try {
      await client.end()
      console.log('[Password Reset] Database connection closed')
    } catch (closeError) {
      console.error('[Password Reset] Error closing database:', closeError.message)
    }

    return NextResponse.json({
      error: 'Failed to process password reset',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
