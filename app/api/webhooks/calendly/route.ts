import { NextRequest, NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg

const FALLBACK_DATABASE_URL = 'postgresql://postgres:JSRVavPyKDfxvKqCDcRNArgvRdwflWwn@yamabiko.proxy.rlwy.net:39135/railway'

const SEQUENCE_MAP: Record<string, string> = {
  'breathwork-journey': '17656423',
  'energy-healing-experience': '17656427',
}

async function getClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  })
  await client.connect()
  return client
}

async function ensureTable(client: any) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS pending_ck_enrollments (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      first_name TEXT,
      sequence_id TEXT NOT NULL,
      scheduled_for TIMESTAMPTZ NOT NULL,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

export async function POST(req: NextRequest) {
  let body: any

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = body?.event
  const payload = body?.payload

  console.log('[Calendly Webhook] Event received:', event)

  if (event !== 'invitee.created') {
    return NextResponse.json({ received: true })
  }

  const email = payload?.email
  const name = payload?.name || ''
  const firstName = name.split(' ')[0] || ''

  // Session end time — enroll in sequence after session completes
  const sessionEndTime: string = payload?.scheduled_event?.end_time

  // Determine event type slug
  const eventTypeUri: string = payload?.scheduled_event?.event_type || ''
  const uriSlug = eventTypeUri.split('/').pop() || ''
  const nameSlug = (payload?.event_type?.name || '').toLowerCase().replace(/\s+/g, '-')
  const slug = SEQUENCE_MAP[uriSlug] ? uriSlug : nameSlug
  const sequenceId = SEQUENCE_MAP[slug]

  if (!email) {
    console.error('[Calendly Webhook] No email in payload')
    return NextResponse.json({ received: true })
  }

  if (!sequenceId) {
    console.log(`[Calendly Webhook] No sequence mapped for slug: "${slug}"`)
    return NextResponse.json({ received: true })
  }

  if (!sessionEndTime) {
    console.error('[Calendly Webhook] No session end time in payload')
    return NextResponse.json({ received: true })
  }

  const client = await getClient()
  try {
    await ensureTable(client)
    await client.query(
      `INSERT INTO pending_ck_enrollments (email, first_name, sequence_id, scheduled_for)
       VALUES ($1, $2, $3, $4)`,
      [email, firstName, sequenceId, new Date(sessionEndTime)]
    )
    console.log(`[Calendly Webhook] Enrollment scheduled for ${email} (${slug}) at ${sessionEndTime}`)
  } finally {
    await client.end()
  }

  return NextResponse.json({ received: true })
}
