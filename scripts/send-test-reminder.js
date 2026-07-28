// Sends a single test copy of the KYN 48 hour reminder email to one address.
// Does not touch reminder_sent_at and does not email any real members.
//
// Usage: node scripts/send-test-reminder.js recipient@example.com

try {
  require('dotenv').config()
} catch (e) {
  console.log('Note: dotenv not available, using existing environment variables')
}

const { execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { Resend } = require('resend')
const { query, getPool } = require('../lib/db.js')

const REPO_ROOT = path.join(__dirname, '..')
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'KYN <kyn@yourtruenorth.me>'

function loadEmailBuilder() {
  // Compiled inside the repo (not os.tmpdir()) so node_modules resolution
  // (luxon, resend) still finds the repo's own node_modules.
  const tmpDir = fs.mkdtempSync(path.join(REPO_ROOT, '.kyn-test-'))
  execSync(
    `npx tsc --module commonjs --target es2019 --skipLibCheck --outDir "${tmpDir}" lib/kyn-reminder-email.ts lib/kyn-calendar-links.ts`,
    { cwd: REPO_ROOT, stdio: 'inherit' }
  )
  const mod = require(path.join(tmpDir, 'kyn-reminder-email.js'))
  fs.rmSync(tmpDir, { recursive: true, force: true })
  return mod
}

async function main() {
  const recipient = process.argv[2]
  if (!recipient) {
    throw new Error('Usage: node scripts/send-test-reminder.js recipient@example.com')
  }

  const { buildKynReminderEmail } = loadEmailBuilder()

  const result = await query(
    `SELECT id, title, description, scheduled_date AT TIME ZONE 'UTC' AS scheduled_date, loop_index
     FROM live_calls
     WHERE scheduled_date >= NOW()
     ORDER BY scheduled_date ASC
     LIMIT 1`
  )
  const nextSession = result.rows[0]
  if (!nextSession) throw new Error('No upcoming session found in live_calls')

  const email = buildKynReminderEmail({
    id: nextSession.id,
    loopIndex: nextSession.loop_index,
    title: nextSession.title,
    description: nextSession.description,
    scheduledAtUtc: new Date(nextSession.scheduled_date),
  })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const icsBase64 = Buffer.from(email.icsContent, 'utf8').toString('base64')

  const send = await resend.emails.send({
    from: FROM_EMAIL,
    to: recipient,
    subject: `[TEST] ${email.subject}`,
    html: email.html,
    text: email.text,
    attachments: [{ filename: email.icsFilename, content: icsBase64 }],
  })

  console.log('Sent test reminder for session:', nextSession.title, nextSession.scheduled_date)
  console.log('Resend result:', JSON.stringify(send))

  await getPool().end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
