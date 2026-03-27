import { NextRequest, NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg

const FALLBACK_DATABASE_URL = 'postgresql://postgres:JSRVavPyKDfxvKqCDcRNArgvRdwflWwn@yamabiko.proxy.rlwy.net:39135/railway'

export async function GET(request: NextRequest) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  })

  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await client.connect()

    const completedResult = await client.query(
      'SELECT COUNT(*) as count FROM user_video_progress WHERE user_id = $1 AND completed = true',
      [userId]
    )
    const videosWatched = parseInt(completedResult.rows[0]?.count || '0')

    const totalResult = await client.query('SELECT COUNT(*) as count FROM videos')
    const totalVideos = parseInt(totalResult.rows[0]?.count || '0')

    const watchTimeResult = await client.query(
      'SELECT COALESCE(SUM(watch_time), 0) as total FROM user_video_progress WHERE user_id = $1',
      [userId]
    )
    const totalWatchTime = parseInt(watchTimeResult.rows[0]?.total || '0')

    await client.end()

    return NextResponse.json({
      stats: {
        videosWatched,
        totalWatchTime,
        completionRate: totalVideos > 0 ? Math.round((videosWatched / totalVideos) * 100) : 0,
      }
    })

  } catch (error) {
    console.error('[Stats] Error:', error)
    try { await client.end() } catch {}
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
