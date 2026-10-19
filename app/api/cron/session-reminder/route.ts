import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { query } from '@/lib/db'
import { buildKynReminderEmail, buildKynRsvpReminderEmail } from '@/lib/kyn-reminder-email'
import { features } from '../../../../lib/features'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'KYN <kyn@yourtruenorth.me>'

export async function GET(req: NextRequest) {
  // Protect cron endpoint — Vercel sets this header automatically for cron jobs
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // RSVP reminders: the day before and the hour before, only to men who said they'd be there
  const rsvp = await sendRsvpReminders()

  // The old 48 hour reminder to every member stays off unless switched back on
  if (!features.allMemberReminder48h) {
    return NextResponse.json({ sessions: 0, sent: 0, failed: 0, rsvp })
  }

  const dueResult = await query(
    `SELECT id, title, description, scheduled_date AT TIME ZONE 'UTC' AS scheduled_date, loop_index
     FROM live_calls
     WHERE reminder_sent_at IS NULL
       AND scheduled_date BETWEEN NOW() + INTERVAL '47 hours' AND NOW() + INTERVAL '49 hours'`
  )
  const dueSessions = dueResult.rows

  if (dueSessions.length === 0) {
    return NextResponse.json({ sessions: 0, sent: 0, failed: 0, rsvp })
  }

  const membersResult = await query(
    `SELECT email, name FROM users WHERE "isActive" = true AND role IN ('member', 'founding_member') ORDER BY "createdAt" ASC`
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

  return NextResponse.json({ sessions: dueSessions.length, sent: totalSent, failed: totalFailed, rsvp })
}

// When EMAIL_TEST_ONLY holds an address, every RSVP reminder goes to that address
// instead of the member. Production: every member's reminder is redirected there.
// Preview: only that account's own RSVPs are picked up, because Preview shares the
// live database and a test run must not mark real members' reminders as sent.
const EMAIL_TEST_ONLY = process.env.EMAIL_TEST_ONLY || ''
const ONLY_TEST_ACCOUNT_RSVPS = process.env.VERCEL_ENV === 'production' ? '' : EMAIL_TEST_ONLY

const RSVP_WINDOWS = {
  // "Tomorrow" email: session starts between 20 and 24 hours from now
  day: { column: 'reminder_day_sent_at', from: '20 hours', to: '24 hours' },
  // "We start in an hour": session starts within the next hour
  hour: { column: 'reminder_hour_sent_at', from: '0 minutes', to: '60 minutes' },
} as const

async function sendRsvpReminders() {
  const totals = { day: { sent: 0, failed: 0 }, hour: { sent: 0, failed: 0 } }

  for (const kind of ['day', 'hour'] as const) {
    const w = RSVP_WINDOWS[kind]

    // Claim the due rows first, so two overlapping runs can't send the same reminder twice
    const claimed = await query(
      `UPDATE session_rsvps r
       SET ${w.column} = NOW()
       FROM live_calls c, users u
       WHERE c.id = r.live_call_id
         AND u.id = r.user_id
         AND r.cancelled_at IS NULL
         AND r.${w.column} IS NULL
         AND u."isActive" = true
         AND c.scheduled_date AT TIME ZONE 'UTC' > NOW() + INTERVAL '${w.from}'
         AND c.scheduled_date AT TIME ZONE 'UTC' <= NOW() + INTERVAL '${w.to}'
         AND ($1 = '' OR LOWER(u.email) = LOWER($1))
       RETURNING r.id, r.timezone, u.email, u.name, c.title, c.zoom_link,
                 c.scheduled_date AT TIME ZONE 'UTC' AS starts_at`,
      [ONLY_TEST_ACCOUNT_RSVPS]
    )

    for (const row of claimed.rows) {
      try {
        if (!row.zoom_link) throw new Error('Session has no join link')
        const email = buildKynRsvpReminderEmail({
          kind,
          name: row.name,
          title: row.title,
          scheduledAtUtc: new Date(row.starts_at),
          timeZone: row.timezone,
          joinUrl: row.zoom_link,
        })
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: EMAIL_TEST_ONLY || row.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
        })
        if (error) throw error
        totals[kind].sent++
      } catch (err) {
        // Release the claim so the next run tries again
        await query(`UPDATE session_rsvps SET ${w.column} = NULL WHERE id = $1`, [row.id])
        console.error(`[Cron] RSVP ${kind} reminder failed for ${row.email}:`, err)
        totals[kind].failed++
      }
    }
  }

  return totals
}
