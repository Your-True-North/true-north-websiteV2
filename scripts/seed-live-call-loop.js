// Idempotent scheduler for the KYN evergreen session loop.
// Reads lib/data/kyn-session-loop.ts (the single source of truth for the 48 sessions)
// and upserts HORIZON_WEEKS worth of live_calls rows, one per week, on SESSION_WEEKDAY
// at SESSION_HOUR:SESSION_MINUTE Europe/London wall clock (DST safe via Luxon).
//
// Usage: node scripts/seed-live-call-loop.js

try {
  require('dotenv').config()
} catch (e) {
  console.log('Note: dotenv not available, using existing environment variables')
}

const { execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { DateTime } = require('luxon')
const { query, getPool } = require('../lib/db.js')

const REPO_ROOT = path.join(__dirname, '..')

// ---- CONFIG ----
const START_DATE = '2026-07-30'   // date of the next live call
const START_INDEX = 2             // Return To The Body week 1 breathwork already ran
const SESSION_WEEKDAY = 4         // Luxon weekday: Mon=1 ... Thu=4 ... Sun=7
const SESSION_HOUR = 8
const SESSION_MINUTE = 0
const TIMEZONE = 'Europe/London'
const HORIZON_WEEKS = 104
const GROUP_CAP = 15
const DURATION_MINUTES = 60
const JOIN_URL = 'https://us02web.zoom.us/j/87536119646?pwd=VrNnKw3q9lqrgcf9lI6pBEg23f5ARG.1'
// ---- END CONFIG ----

const LOOP_LENGTH = 48

const AGENDA_STRUCTURE = [
  { item: 'Arrive and ground', minutes: 5 },
  { item: 'Check in round, how are you arriving today', minutes: 10 },
  { item: 'Teach the frame', minutes: 10 },
  { item: 'The work', minutes: 25 },
  { item: 'Integration and sharing', minutes: 7 },
  { item: 'Close, one line each', minutes: 3 },
]

const CAMERA_NOTE = {
  teaching: 'optional',
  'open discussion': 'on, this is presence',
  somatic: 'eyes closed, cameras optional',
}

function loadLoop() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kyn-seed-'))
  execSync(
    `npx tsc --module commonjs --target es2019 --skipLibCheck --outDir "${tmpDir}" lib/data/kyn-session-loop.ts`,
    { cwd: REPO_ROOT, stdio: 'inherit' }
  )
  const compiled = require(path.join(tmpDir, 'kyn-session-loop.js'))
  return compiled.KYN_SESSION_LOOP
}

function loopIndexForWeek(offset) {
  return ((START_INDEX - 1 + offset) % LOOP_LENGTH) + 1
}

async function main() {
  const loop = loadLoop()
  const byIndex = new Map(loop.map((s) => [s.loop_index, s]))

  const start = DateTime.fromISO(START_DATE, { zone: TIMEZONE })
  if (start.weekday !== SESSION_WEEKDAY) {
    throw new Error(`START_DATE ${START_DATE} is not the configured SESSION_WEEKDAY in ${TIMEZONE}`)
  }

  let upserted = 0
  for (let i = 0; i < HORIZON_WEEKS; i++) {
    const idx = loopIndexForWeek(i)
    const session = byIndex.get(idx)
    if (!session) throw new Error(`No session found for loop_index ${idx}`)

    const localDate = start.plus({ weeks: i })
    const scheduledLondon = localDate.set({
      hour: SESSION_HOUR,
      minute: SESSION_MINUTE,
      second: 0,
      millisecond: 0,
    })
    // Store as a literal UTC wall clock string, no offset, so the naive
    // TIMESTAMP column holds exactly the UTC instant with no reinterpretation.
    const scheduledUtc = scheduledLondon.toUTC().toFormat('yyyy-MM-dd HH:mm:ss')

    const recording = session.session_type !== 'open discussion'
    const cameraNote = CAMERA_NOTE[session.session_type]
    const agenda = JSON.stringify({ structure: AGENDA_STRUCTURE, lean: session.session_type })

    await query(
      `INSERT INTO live_calls (
         title, description, scheduled_date, zoom_link, duration,
         theme_number, theme_name, week_number, session_type, delivery,
         loop_index, recording, agenda, camera_note
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (loop_index, scheduled_date) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         zoom_link = EXCLUDED.zoom_link,
         duration = EXCLUDED.duration,
         theme_number = EXCLUDED.theme_number,
         theme_name = EXCLUDED.theme_name,
         week_number = EXCLUDED.week_number,
         session_type = EXCLUDED.session_type,
         delivery = EXCLUDED.delivery,
         recording = EXCLUDED.recording,
         agenda = EXCLUDED.agenda,
         camera_note = EXCLUDED.camera_note,
         updated_at = NOW()`,
      [
        session.title,
        session.description,
        scheduledUtc,
        JOIN_URL,
        DURATION_MINUTES,
        session.theme_number,
        session.theme_name,
        session.week_number,
        session.session_type,
        session.delivery,
        session.loop_index,
        recording,
        agenda,
        cameraNote,
      ]
    )
    upserted++
  }

  console.log(`Upserted ${upserted} sessions across ${HORIZON_WEEKS} weeks.`)
  console.log(`Group cap threshold noted at ${GROUP_CAP} for open discussion room splitting (not enforced in code).`)

  const pool = getPool()
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
