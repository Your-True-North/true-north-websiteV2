import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { query } from '@/lib/db'
import { getAuthUser, rateLimit } from '@/lib/auth'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'KYN <kyn@yourtruenorth.me>'
const MAX_LENGTH = 2000

// POST { message } → emails the message to ADMIN_CONTACT_EMAIL, with reply-to set to
// the member's own email from the database. The member comes from the auth_token cookie.
export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request) as { userId?: string | number } | null
  if (!authUser?.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const to = process.env.ADMIN_CONTACT_EMAIL
  if (!to) {
    console.error('[Message True] ADMIN_CONTACT_EMAIL is not set')
    return NextResponse.json({ error: 'Messaging is not set up' }, { status: 500 })
  }

  if (rateLimit(`message-true:${authUser.userId}`, 5, 60 * 60 * 1000).limited) {
    return NextResponse.json({ error: 'Too many messages. Try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    if (!message || message.length > MAX_LENGTH) {
      return NextResponse.json({ error: `Message must be 1 to ${MAX_LENGTH} characters` }, { status: 400 })
    }

    const result = await query('SELECT name, email, "createdAt" FROM users WHERE id = $1', [String(authUser.userId)])
    const member = result.rows[0]
    if (!member) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const memberSince = new Date(member.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London',
    })
    const text = [
      message,
      '',
      '',
      `Name: ${member.name || 'Not given'}`,
      `Email: ${member.email}`,
      `Member since: ${memberSince}`,
    ].join('\n')

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: member.email,
      subject: `KYN message from ${member.name || member.email}`,
      text,
    })
    if (error) throw error

    return NextResponse.json({ sent: true })
  } catch (error) {
    console.error('[Message True] Send failed:', error)
    return NextResponse.json({ error: 'Send failed' }, { status: 500 })
  }
}
