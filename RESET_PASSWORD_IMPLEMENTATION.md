# Reset Password Flow - Implementation Plan

## Status: ⚠️ INCOMPLETE (Frontend Only)

**Review Date:** October 24, 2025
**Branch:** claude/retrieve-archived-session-info-011CUSFzeWzQed3zuTZn9FHe

---

## Current State

### ✅ What Exists

**Frontend Page:** `app/(auth)/auth/reset-password/page.tsx`
- Clean UI for password reset request
- Form validation
- Success/error states
- Calls `/api/auth/request-reset` (doesn't exist)

### ❌ What's Missing

1. **API Endpoint:** `/api/auth/request-reset` - Does not exist
2. **Database Fields:** User model lacks reset token fields
3. **Email Service:** Not configured for sending reset emails
4. **Reset Confirmation Page:** Page to actually reset password with token
5. **Token Validation:** Backend logic to verify reset tokens

---

## Complete Implementation Plan

### Step 1: Update Database Schema

**File:** `prisma/schema.prisma`

Add to User model:
```prisma
model User {
  // ... existing fields ...

  resetToken        String?   @unique
  resetTokenExpiry  DateTime?

  // ... rest of model ...
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_password_reset_fields
```

---

### Step 2: Create Request Reset API

**File:** `app/api/auth/request-reset/route.js`

```javascript
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import pkg from 'pg'
const { Client } = pkg

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()

    const { email } = await request.json()

    // Find user
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save token to database
    await client.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    )

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/auth/reset-password/confirm?token=${resetToken}`

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@truenorth.com',
      to: email,
      subject: 'Reset Your Password - Circle of Return',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to continue:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #9bc4b8, #7fb069); color: #000; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            This link will expire in 1 hour.<br/>
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `
    })

    await client.end()
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    try { await client.end() } catch {}
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
```

---

### Step 3: Create Reset Confirmation Page

**File:** `app/(auth)/auth/reset-password/confirm/page.tsx`

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Password Reset Successful</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center', marginBottom: '2rem' }}>
          Set New Password
        </h1>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || !token}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
                placeholder="Enter new password"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || !token}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                color: '#000',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: (loading || !token) ? 'not-allowed' : 'pointer',
                opacity: (loading || !token) ? 0.5 : 1
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/auth/login" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem', textDecoration: 'none' }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### Step 4: Create Reset Password API

**File:** `app/api/auth/reset-password/route.js`

```javascript
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pkg from 'pg'
const { Client } = pkg

export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
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
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    )

    const user = result.rows[0]

    if (!user) {
      await client.end()
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    await client.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.id]
    )

    await client.end()

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    try { await client.end() } catch {}
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
```

---

## Environment Variables Required

Add to `.env.local`:

```bash
# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@truenorth.com

# Public URL (for reset links)
NEXT_PUBLIC_URL=https://yourdomain.com
```

---

## Database Migration

```sql
-- Run manually or via Prisma migrate
ALTER TABLE users
ADD COLUMN reset_token VARCHAR(255) UNIQUE,
ADD COLUMN reset_token_expiry TIMESTAMP;
```

Or using Prisma:
```bash
npx prisma migrate dev --name add_password_reset
```

---

## Testing Checklist

Once implemented, test:

- [ ] User can request password reset
- [ ] Email is received with reset link
- [ ] Reset link contains valid token
- [ ] Token expires after 1 hour
- [ ] User can set new password
- [ ] Old password no longer works
- [ ] New password allows login
- [ ] Invalid token shows error
- [ ] Expired token shows error
- [ ] Password validation works (min 8 chars)

---

## Security Considerations

### ✅ Good Practices

1. **Token Security**
   - Cryptographically random tokens
   - 1-hour expiration
   - Single-use (cleared after reset)

2. **User Enumeration Prevention**
   - Same response whether user exists or not
   - No indication of valid/invalid emails

3. **Password Security**
   - bcrypt hashing (12 rounds)
   - Minimum 8 character requirement
   - Client-side + server-side validation

### ⚠️ Recommendations

1. **Rate Limiting** - Add to prevent abuse
2. **Email Validation** - Verify email format strictly
3. **HTTPS Only** - Ensure reset links only work over HTTPS
4. **IP Logging** - Log reset requests for security monitoring

---

## Current Workaround

**Login page has WhatsApp link:**
```
Forgot password? Contact Mason →
https://wa.me/447449052909
```

This is functional but not scalable for many users.

---

## Effort Estimate

**Time to implement:** 2-3 hours

- Database migration: 15 minutes
- API endpoints: 1 hour
- Frontend page: 45 minutes
- Email configuration: 30 minutes
- Testing: 30 minutes

---

## Decision Required

**Should we implement full password reset?**

**Option A:** Implement complete flow (2-3 hours)
- ✅ Professional, scalable solution
- ✅ Better user experience
- ❌ Requires email service setup
- ❌ More code to maintain

**Option B:** Keep WhatsApp contact method
- ✅ No development needed
- ✅ Personal touch for small user base
- ❌ Doesn't scale
- ❌ Not automated

**Option C:** Hybrid approach
- Keep WhatsApp for now
- Add password reset later when user base grows
- Focus on higher priority features first

---

## Recommendation

For a membership site with paying users, **implement Option A (full password reset)**. It's a standard feature users expect and will reduce support burden.

For a small community (< 100 members), **Option B or C** are acceptable temporary solutions.

---

**Status:** Awaiting decision and implementation
**Priority:** Medium (nice-to-have, not blocking)
**Current Workaround:** WhatsApp contact link

