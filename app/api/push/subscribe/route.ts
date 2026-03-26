import { NextRequest, NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg

const FALLBACK_DATABASE_URL = 'postgresql://postgres:JSRVavPyKDfxvKqCDcRNArgvRdwflWwn@yamabiko.proxy.rlwy.net:39135/railway'

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
  const { subscription, userId } = await req.json()

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  const client = await getClient()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint TEXT UNIQUE NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, p256dh = $3, auth = $4`,
      [userId || null, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    )

    return NextResponse.json({ success: true })
  } finally {
    await client.end()
  }
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json()
  const client = await getClient()
  try {
    await client.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint])
    return NextResponse.json({ success: true })
  } finally {
    await client.end()
  }
}
