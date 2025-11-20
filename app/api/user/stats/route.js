import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    // Get video progress stats
    const progressResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE completed = true) as videos_watched,
        COALESCE(SUM(watch_time), 0) as total_watch_time,
        COUNT(*) as total_videos_started
      FROM user_video_progress
      WHERE user_id = $1
    `, [user.userId])

    // Get total available videos
    const totalVideosResult = await query(`
      SELECT COUNT(*) as count
      FROM videos
      WHERE published = true
    `)

    const stats = progressResult.rows[0] || {}
    const totalVideos = parseInt(totalVideosResult.rows[0]?.count || 0)
    const videosWatched = parseInt(stats.videos_watched || 0)
    const totalWatchTime = parseInt(stats.total_watch_time || 0)
    const totalVideosStarted = parseInt(stats.total_videos_started || 0)

    // Calculate completion rate
    const completionRate = totalVideos > 0
      ? Math.round((videosWatched / totalVideos) * 100)
      : 0

    // Get continue watching (videos with progress but not completed)
    const continueWatchingResult = await query(`
      SELECT
        v.id,
        v.title,
        v.description,
        v.youtubeurl as youtube_url,
        v.category,
        v.duration,
        v.createdat as upload_date,
        uvp.watch_time,
        uvp.last_watched,
        CASE
          WHEN v.duration > 0 THEN ROUND((uvp.watch_time::float / v.duration::float) * 100)
          ELSE 0
        END as percentage
      FROM user_video_progress uvp
      JOIN videos v ON uvp.video_id = v.id
      WHERE uvp.user_id = $1
        AND uvp.completed = false
        AND uvp.watch_time > 0
        AND v.published = true
      ORDER BY uvp.last_watched DESC
      LIMIT 3
    `, [user.userId])

    return NextResponse.json({
      success: true,
      stats: {
        videosWatched,
        totalWatchTime,
        completionRate,
        totalVideosStarted
      },
      continueWatching: continueWatchingResult.rows
    })

  } catch (error) {
    console.error('[User Stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
