import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { query } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mason <mason@yourtruenorth.me>'

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, body, url } = await req.json()

  if (!title || !body) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 })
  }

  // Save announcement to DB so the in-app popup can pick it up
  await query(
    `CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      url TEXT NOT NULL DEFAULT '/members',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  )
  await query(
    'INSERT INTO announcements (title, body, url) VALUES ($1, $2, $3)',
    [title, body, url || '/members']
  )

  // Fetch all active member emails
  const membersResult = await query(
    `SELECT email, name FROM users WHERE "isActive" = true AND role = 'member' ORDER BY "createdAt" ASC`
  )
  const members = membersResult.rows

  if (members.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0 })
  }

  const linkUrl = url?.startsWith('http') ? url : `https://yourtruenorth.me${url || '/members'}`
  const buttonLabel = url && url !== '/members' ? 'View Now' : 'Go to Members Area'

  let sent = 0
  let failed = 0

  // Send in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize)
    await Promise.allSettled(
      batch.map(async (member: { email: string; name: string }) => {
        const firstName = member.name?.split(' ')[0] || ''
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: member.email,
            subject: title,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
                <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">${firstName ? `Hey ${firstName},` : 'Hey,'}</p>
                <p style="font-size: 15px; line-height: 1.7; margin-bottom: 24px;">${body}</p>
                <a href="${linkUrl}" style="display: inline-block; padding: 14px 28px; background: #9bc4b8; color: #0a0a0a; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 15px;">${buttonLabel}</a>
                <p style="font-size: 13px; color: #999; margin-top: 32px;">Mason</p>
              </div>
            `,
          })
          sent++
        } catch {
          failed++
        }
      })
    )
  }

  return NextResponse.json({ sent, failed })
}
