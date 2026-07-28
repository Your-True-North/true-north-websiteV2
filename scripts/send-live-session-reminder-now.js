// Manually triggers the session reminder send for the next upcoming, not yet
// reminded, live session. Mirrors app/api/cron/session-reminder/route.ts but run
// directly so it does not depend on the Vercel cron having redeployed yet.
// Marks reminder_sent_at so the daily cron will not send it again.
//
// Usage: node scripts/send-live-session-reminder-now.js

try {
  require('dotenv').config()
} catch (e) {
  console.log('Note: dotenv not available, using existing environment variables')
}

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { Resend } = require('resend')
const { query, getPool } = require('../lib/db.js')

const REPO_ROOT = path.join(__dirname, '..')
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'KYN <kyn@yourtruenorth.me>'

function loadEmailBuilder() {
  const tmpDir = fs.mkdtempSync(path.join(REPO_ROOT, '.kyn-send-'))
  execSync(
    `npx tsc --module commonjs --target es2019 --skipLibCheck --outDir "${tmpDir}" lib/kyn-reminder-email.ts lib/kyn-calendar-links.ts`,
    { cwd: REPO_ROOT, stdio: 'inherit' }
  )
  const mod = require(path.join(tmpDir, 'kyn-reminder-email.js'))
  fs.rmSync(tmpDir, { recursive: true, force: true })
  return mod
}

async function main() {
  const { buildKynReminderEmail } = loadEmailBuilder()

  const dueResult = await query(
    `SELECT id, title, description, scheduled_date AT TIME ZONE 'UTC' AS scheduled_date, loop_index
     FROM live_calls
     WHERE reminder_sent_at IS NULL AND scheduled_date >= NOW()
     ORDER BY scheduled_date ASC
     LIMIT 1`
  )
  const session = dueResult.rows[0]
  if (!session) {
    console.log('No upcoming session without a reminder already sent. Nothing to do.')
    await getPool().end()
    return
  }

  const membersResult = await query(
    `SELECT email, name FROM users WHERE "isActive" = true AND role IN ('member', 'founding_member') ORDER BY "createdAt" ASC`
  )
  const members = membersResult.rows

  console.log(`Session: ${session.title} (${session.scheduled_date})`)
  console.log(`Recipients (${members.length}):`)
  members.forEach((m, i) => console.log(`${i + 1}. ${m.name} <${m.email}>`))

  const email = buildKynReminderEmail({
    id: session.id,
    loopIndex: session.loop_index,
    title: session.title,
    description: session.description,
    scheduledAtUtc: new Date(session.scheduled_date),
  })
  const icsBase64 = Buffer.from(email.icsContent, 'utf8').toString('base64')

  const resend = new Resend(process.env.RESEND_API_KEY)
  let sent = 0
  let failed = 0
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
            attachments: [{ filename: email.icsFilename, content: icsBase64 }],
          })
          sent++
        } catch (err) {
          console.error(`Failed to send to ${member.email}:`, err.message || err)
          failed++
        }
      })
    )
  }

  await query('UPDATE live_calls SET reminder_sent_at = NOW() WHERE id = $1', [session.id])

  console.log(`Done. Sent: ${sent}, Failed: ${failed}`)
  await getPool().end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
