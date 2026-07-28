import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { query } from '@/lib/db'
import { buildKynReminderEmail } from '@/lib/kyn-reminder-email'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'KYN <kyn@yourtruenorth.me>'

export async function GET(req: NextRequest) {
  // Protect cron endpoint — Vercel sets this header automatically for cron jobs
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dueResult = await query(
    `SELECT id, title, description, scheduled_date AT TIME ZONE 'UTC' AS scheduled_date, loop_index
     FROM live_calls
     WHERE reminder_sent_at IS NULL
       AND scheduled_date BETWEEN NOW() + INTERVAL '47 hours' AND NOW() + INTERVAL '49 hours'`
  )
  const dueSessions = dueResult.rows

  if (dueSessions.length === 0) {
    return NextResponse.json({ sessions: 0, sent: 0, failed: 0 })
  }

  const membersResult = await query(
    `SELECT email, name FROM users WHERE "isActive" = true AND role = 'member' ORDER BY "createdAt" ASC`
  )
  const members = membersResult.rows as { email: string; name: string }[]

  let totalSent = 0
  let totalFailed = 0

  for (const session of dueSessions) {
    const email = buildKynReminderEmail({
      id: session.id,
      loopIndex: session.loop_index,
      title: session.title,
      description: session.description,
      scheduledAtUtc: new Date(session.scheduled_date),
    })

    const icsBase64 = Buffer.from(email.icsContent, 'utf8').toString('base64')

    let sent = 0
    let failed = 0

    // Send in batches of 10 to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < members.length; i += batchSize) {
      const batch = members.slice(i, i + batchSize)
      await Promise.allSettled(
        batch.map(async (member) => {
          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: member.email,
              subject: email.subject,
              html: email.html,
              text: email.text,
              attachments: [
                {
                  filename: email.icsFilename,
                  content: icsBase64,
                },
              ],
            })
            sent++
          } catch (err) {
            console.error(`[Cron] Failed to send session reminder to ${member.email}:`, err)
            failed++
          }
        })
      )
    }

    await query('UPDATE live_calls SET reminder_sent_at = NOW() WHERE id = $1', [session.id])

    console.log(`[Cron] Session ${session.id} reminder — sent: ${sent}, failed: ${failed}`)
    totalSent += sent
    totalFailed += failed
  }

  return NextResponse.json({ sessions: dueSessions.length, sent: totalSent, failed: totalFailed })
}
