import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    const videoId = params.id

    // Get video details with user progress
    const videoResult = await query(`
      SELECT
        v.id,
        v.title,
        v.description,
        v.youtubeurl as youtube_url,
        v.youtubeid,
        v.category,
        v.duration,
        v.createdat as upload_date,
        uvp.completed,
        uvp.last_watched,
        uvp.watch_time,
        CASE
          WHEN uvp.completed = true THEN 'completed'
          WHEN uvp.last_watched IS NOT NULL THEN 'in_progress'
          ELSE 'new'
        END as progress_status
      FROM videos v
      LEFT JOIN user_video_progress uvp ON v.id = uvp.video_id AND uvp.user_id = $1
      WHERE v.id = $2
    `, [user.userId, videoId])

    if (videoResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    const video = videoResult.rows[0]

    // Get comments count
    const commentsResult = await query(`
      SELECT COUNT(*) as count
      FROM comments
      WHERE videoid = $1
    `, [videoId])
    const commentsCount = parseInt(commentsResult.rows[0]?.count || 0)

    // Get reactions count
    const reactionsResult = await query(`
      SELECT COUNT(*) as count
      FROM reactions
      WHERE videoid = $1
    `, [videoId])
    const reactionsCount = parseInt(reactionsResult.rows[0]?.count || 0)

    // Check if user has reacted
    const userReactionResult = await query(`
      SELECT id
      FROM reactions
      WHERE videoid = $1 AND userid = $2
    `, [videoId, user.userId])
    const hasReacted = userReactionResult.rows.length > 0

    // Get related videos (same category, limit 3)
    const relatedResult = await query(`
      SELECT id, title, category, duration, youtubeurl as youtube_url, youtubeid
      FROM videos
      WHERE category = $1 AND id != $2
      ORDER BY createdat DESC
      LIMIT 3
    `, [video.category, videoId])

    return NextResponse.json({
      video: {
        ...video,
        commentsCount,
        reactionsCount,
        hasReacted
      },
      relatedVideos: relatedResult.rows
    })
  } catch (error) {
    console.error('[Video GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}