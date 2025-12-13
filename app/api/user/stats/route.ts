import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET(request: NextRequest) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await client.connect()

    // Get completed videos count from user_video_progress table
    const completedResult = await client.query(
      'SELECT COUNT(*) as count FROM user_video_progress WHERE "userId" = $1 AND completed = true',
      [userId]
    )
    const videosWatched = parseInt(completedResult.rows[0]?.count || '0')

    // Get total videos count
    const totalResult = await client.query('SELECT COUNT(*) as count FROM videos')
    const totalVideos = parseInt(totalResult.rows[0]?.count || '0')

    // Get total watch time
    const watchTimeResult = await client.query(
      'SELECT COALESCE(SUM(watch_time), 0) as total FROM user_video_progress WHERE "userId" = $1',
      [userId]
    )
    const totalWatchTime = parseInt(watchTimeResult.rows[0]?.total || '0')

    // Get in-progress videos for continue watching
    const continueResult = await client.query(`
      SELECT uvp."videoId" as id, v.title, uvp.last_watched
      FROM user_video_progress uvp
      JOIN videos v ON v.id = uvp."videoId"
      WHERE uvp."userId" = $1 AND uvp.completed = false AND uvp.last_watched IS NOT NULL
      ORDER BY uvp.last_watched DESC
      LIMIT 3
    `, [userId])

    await client.end()

    const stats = {
      videosWatched,
      totalWatchTime,
      completionRate: totalVideos > 0
        ? Math.round((videosWatched / totalVideos) * 100)
        : 0,
      continueWatching: continueResult.rows
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('[Stats] Error:', error)
    try { await client.end() } catch {}
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
