import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request, { params }) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    const videoId = params.id
    const { completed, watchTime } = await request.json()

    // Check if progress record exists
    const existing = await query(`
      SELECT id, completed
      FROM user_video_progress
      WHERE user_id = $1 AND video_id = $2
    `, [user.userId, videoId])

    if (existing.rows.length > 0) {
      // Update existing progress
      await query(`
        UPDATE user_video_progress
        SET
          completed = $1,
          watch_time = COALESCE($2, watch_time),
          last_watched = NOW(),
          completion_date = CASE WHEN $1 = true THEN NOW() ELSE completion_date END
        WHERE user_id = $3 AND video_id = $4
      `, [completed, watchTime, user.userId, videoId])
    } else {
      // Insert new progress
      await query(`
        INSERT INTO user_video_progress (user_id, video_id, completed, watch_time, last_watched, completion_date)
        VALUES ($1, $2, $3, $4, NOW(), CASE WHEN $3 = true THEN NOW() ELSE NULL END)
      `, [user.userId, videoId, completed, watchTime || 0])
    }

    // If video was just completed, create notification
    if (completed && (!existing.rows[0] || !existing.rows[0].completed)) {
      // Get video title
      const videoResult = await query(`
        SELECT title
        FROM videos
        WHERE id = $1
      `, [videoId])

      const videoTitle = videoResult.rows[0]?.title || 'Video'

      await query(`
        INSERT INTO notifications (user_id, type, title, message, link, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        user.userId,
        'video_completed',
        'Video Completed!',
        `Great work! You've completed: ${videoTitle}`,
        `/library/${videoId}`
      ])

      // Check if this completes a milestone
      const completedVideosResult = await query(`
        SELECT COUNT(*) as count
        FROM user_video_progress
        WHERE user_id = $1 AND completed = true
      `, [user.userId])

      const completedCount = parseInt(completedVideosResult.rows[0]?.count || 0)

      // Check milestones: 1, 10, 25 videos
      let milestoneId = null
      let milestoneTitle = null

      if (completedCount === 1) {
        milestoneId = 'seeker_1'
        milestoneTitle = 'Complete Your First Video'
      } else if (completedCount === 10) {
        milestoneId = 'explorer_1'
        milestoneTitle = 'Complete 10 Videos'
      } else if (completedCount === 25) {
        milestoneId = 'pathfinder_1'
        milestoneTitle = 'Complete 25 Videos'
      }

      if (milestoneId) {
        // Mark milestone as complete
        await query(`
          INSERT INTO user_milestones (user_id, milestone_id, milestone_title, completed, completed_at)
          VALUES ($1, $2, $3, true, NOW())
          ON CONFLICT (user_id, milestone_id) DO UPDATE
          SET completed = true, completed_at = NOW()
        `, [user.userId, milestoneId, milestoneTitle])

        // Create milestone notification
        await query(`
          INSERT INTO notifications (user_id, type, title, message, link, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [
          user.userId,
          'milestone',
          'Milestone Achieved!',
          `Congratulations! You've completed: ${milestoneTitle}`,
          '/members'
        ])
      }
    }

    return NextResponse.json({
      success: true,
      completed
    })
  } catch (error) {
    console.error('[Video Progress] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
