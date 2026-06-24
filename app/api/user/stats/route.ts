import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [completedResult, totalResult, watchTimeResult, continueWatchingResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM user_video_progress WHERE user_id = $1 AND completed = true', [userId]),
      query('SELECT COUNT(*) as count FROM videos', []),
      query('SELECT COALESCE(SUM(watch_time), 0) as total FROM user_video_progress WHERE user_id = $1', [userId]),
      query(
        `SELECT v.id, v.title, v."youtubeUrl" as youtube_url, v.category, v.duration,
                CASE WHEN v.duration > 0 THEN LEAST(ROUND((uvp.watch_time::float / (v.duration * 60)) * 100), 99) ELSE 0 END AS percentage
         FROM user_video_progress uvp
         JOIN videos v ON v.id = uvp.video_id
         WHERE uvp.user_id = $1 AND uvp.completed = false AND uvp.watch_time > 0
         ORDER BY uvp.last_watched DESC
         LIMIT 10`,
        [userId]
      ),
    ])

    const videosWatched = parseInt(completedResult.rows[0]?.count || '0')
    const totalVideos = parseInt(totalResult.rows[0]?.count || '0')
    const totalWatchTime = parseInt(watchTimeResult.rows[0]?.total || '0')
    const continueWatching = continueWatchingResult.rows

    return NextResponse.json({
      stats: {
        videosWatched,
        totalWatchTime,
        completionRate: totalVideos > 0 ? Math.round((videosWatched / totalVideos) * 100) : 0,
        continueWatching,
      }
    })

  } catch (error) {
    console.error('[Stats] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
