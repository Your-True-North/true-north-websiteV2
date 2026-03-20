import { NextRequest, NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg

const FALLBACK_DATABASE_URL = 'postgresql://postgres:JSRVavPyKDfxvKqCDcRNArgvRdwflWwn@yamabiko.proxy.rlwy.net:39135/railway'
const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY

async function getClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  })
  await client.connect()
  return client
}

async function subscribeToSequence(email: string, firstName: string, sequenceId: string) {
  if (!CONVERTKIT_API_KEY) return
  const res = await fetch(`https://api.convertkit.com/v3/sequences/${sequenceId}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_secret: CONVERTKIT_API_KEY,
      email,
      first_name: firstName,
    }),
  })
  if (!res.ok) {
    throw new Error(`ConvertKit API error: ${res.status}`)
  }
}

export async function GET(req: NextRequest) {
  // Protect cron endpoint — Vercel sets this header automatically for cron jobs
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = await getClient()
  let processed = 0
  let failed = 0

  try {
    // Fetch all due enrollments not yet completed
    const result = await client.query(
      `SELECT id, email, first_name, sequence_id
       FROM pending_ck_enrollments
       WHERE scheduled_for <= NOW()
         AND completed_at IS NULL
       ORDER BY scheduled_for ASC
       LIMIT 50`
    )

    for (const row of result.rows) {
      try {
        await subscribeToSequence(row.email, row.first_name || '', row.sequence_id)
        await client.query(
          `UPDATE pending_ck_enrollments SET completed_at = NOW() WHERE id = $1`,
          [row.id]
        )
        console.log(`[Cron] Enrolled ${row.email} in sequence ${row.sequence_id}`)
        processed++
      } catch (err) {
        console.error(`[Cron] Failed to enroll ${row.email}:`, err)
        failed++
      }
    }
  } finally {
    await client.end()
  }

  console.log(`[Cron] Done — processed: ${processed}, failed: ${failed}`)
  return NextResponse.json({ processed, failed })
}
