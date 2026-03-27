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

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const videoId = params.id
    const { userId, completed } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const client = await getClient()
    try {
      await client.query(`
        INSERT INTO user_video_progress (user_id, video_id, completed, last_watched, completion_date)
        VALUES ($1, $2, $3, NOW(), CASE WHEN $3 = true THEN NOW() ELSE NULL END)
        ON CONFLICT (user_id, video_id) DO UPDATE
        SET completed = $3,
            last_watched = NOW(),
            completion_date = CASE WHEN $3 = true THEN NOW() ELSE user_video_progress.completion_date END
      `, [userId, videoId, completed])
    } finally {
      await client.end()
    }

    return NextResponse.json({ success: true, progress: { completed } })

  } catch (error) {
    console.error('[Progress] Error:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const userId = request.headers.get('x-user-id')

    if (!userId) return NextResponse.json({ progress: null })

    const client = await getClient()
    try {
      const result = await client.query(
        'SELECT completed FROM user_video_progress WHERE user_id = $1 AND video_id = $2',
        [userId, params.id]
      )
      return NextResponse.json({ progress: result.rows[0] || null })
    } finally {
      await client.end()
    }

  } catch (error) {
    console.error('[Progress] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}
