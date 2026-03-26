import { NextRequest, NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg

const FALLBACK_DATABASE_URL = 'postgresql://postgres:JSRVavPyKDfxvKqCDcRNArgvRdwflWwn@yamabiko.proxy.rlwy.net:39135/railway'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { userId, watchedSeconds, totalDuration, completed } = await request.json()
    
    const client = new Client({
      connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    })

    await client.connect()

    const percentage = Math.round((watchedSeconds / totalDuration) * 100)
    
    const progressData = {
      watched_seconds: watchedSeconds,
      total_duration: totalDuration,
      percentage: percentage,
      completed: completed || percentage >= 90,
      last_watched: new Date().toISOString()
    }
    
    await client.query(`
      UPDATE users
      SET video_progress = jsonb_set(
        COALESCE(video_progress, '{}'::jsonb),
        $1,
        $2::jsonb
      )
      WHERE id = $3
    `, [`{${params.id}}`, JSON.stringify(progressData), userId])
    
    await client.end()
    
    return NextResponse.json({ success: true, progress: progressData })
    
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
    
    const client = new Client({
      connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    })

    await client.connect()

    const result = await client.query(
      'SELECT video_progress FROM users WHERE id = $1',
      [userId]
    )
    
    await client.end()
    
    const progress = result.rows[0]?.video_progress?.[params.id] || null
    
    return NextResponse.json({ progress })
    
  } catch (error) {
    console.error('[Progress] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}
