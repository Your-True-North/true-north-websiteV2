import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import pkg from 'pg'
const { Client } = pkg

const FALLBACK_DATABASE_URL = 'postgresql://postgres:JSRVavPyKDfxvKqCDcRNArgvRdwflWwn@yamabiko.proxy.rlwy.net:39135/railway'

webpush.setVapidDetails(
  'mailto:mason@yourtruenorth.me',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

async function getClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  })
  await client.connect()
  return client
}

export async function POST(req: NextRequest) {
  // Admin only
  const adminData = req.headers.get('x-admin-key')
  if (adminData !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, body, url } = await req.json()

  if (!title || !body) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 })
  }

  const client = await getClient()
  let sent = 0
  let failed = 0

  try {
    const result = await client.query('SELECT * FROM push_subscriptions')

    await Promise.allSettled(
      result.rows.map(async (row) => {
        try {
          await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            JSON.stringify({ title, body, url: url || '/members' })
          )
          sent++
        } catch (err: any) {
          // Remove expired/invalid subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await client.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.endpoint])
          }
          failed++
        }
      })
    )
  } finally {
    await client.end()
  }

  return NextResponse.json({ sent, failed })
}
