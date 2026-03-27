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

    // Get total videos count
    const videosTotal = await query('SELECT COUNT(*) as total FROM videos WHERE id IS NOT NULL')
    const totalVideos = parseInt(videosTotal.rows[0]?.total || 0)

    // Get completed videos for user
    const videosCompleted = await query(
      'SELECT COUNT(*) as completed FROM user_video_progress WHERE user_id = $1 AND completed = true',
      [user.userId]
    )
    const completedVideos = parseInt(videosCompleted.rows[0]?.completed || 0)

    // Get total calls
    const callsTotal = await query('SELECT COUNT(*) as total FROM live_calls WHERE scheduled_date <= NOW()')
    const totalCalls = parseInt(callsTotal.rows[0]?.total || 0)

    // Get attended calls for user
    const callsAttended = await query(
      'SELECT COUNT(*) as attended FROM call_attendance WHERE "userId" = $1 AND attended = true',
      [user.userId]
    )
    const attendedCalls = parseInt(callsAttended.rows[0]?.attended || 0)

    // Get total milestones
    const milestonesTotal = 16 // 4 milestones per level, 4 levels

    // Get completed milestones for user
    const milestonesCompleted = await query(
      'SELECT COUNT(*) as completed FROM user_milestones WHERE "userId" = $1 AND completed = true',
      [user.userId]
    )
    const completedMilestones = parseInt(milestonesCompleted.rows[0]?.completed || 0)

    // Get current streak
    const streakResult = await query(
      'SELECT current_streak FROM users WHERE id = $1',
      [user.userId]
    )
    const currentStreak = parseInt(streakResult.rows[0]?.current_streak || 0)

    // Calculate progress with weights
    const weights = {
      videosWatched: 0.40,
      callsAttended: 0.30,
      milestonesComplete: 0.20,
      practiceStreak: 0.10
    }

    const videoProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0
    const callProgress = totalCalls > 0 ? (attendedCalls / totalCalls) * 100 : 0
    const milestoneProgress = (completedMilestones / milestonesTotal) * 100
    const practiceProgress = Math.min((currentStreak / 30) * 100, 100)

    const totalProgress = Math.round(
      (videoProgress * weights.videosWatched) +
      (callProgress * weights.callsAttended) +
      (milestoneProgress * weights.milestonesComplete) +
      (practiceProgress * weights.practiceStreak)
    )

    // Determine level based on progress
    let level = 'Seeker'
    let nextLevel = 'Explorer'
    let daysUntilNext = 30

    if (totalProgress >= 75) {
      level = 'Guide'
      nextLevel = null
      daysUntilNext = 0
    } else if (totalProgress >= 50) {
      level = 'Pathfinder'
      nextLevel = 'Guide'
      daysUntilNext = Math.ceil((75 - totalProgress) / 0.83) // Approx days
    } else if (totalProgress >= 25) {
      level = 'Explorer'
      nextLevel = 'Pathfinder'
      daysUntilNext = Math.ceil((50 - totalProgress) / 0.83)
    } else {
      level = 'Seeker'
      nextLevel = 'Explorer'
      daysUntilNext = Math.ceil((25 - totalProgress) / 0.83)
    }

    // Update user progress and level
    await query(
      'UPDATE users SET progress = $1, level = $2 WHERE id = $3',
      [totalProgress, level, user.userId]
    )

    return NextResponse.json({
      progress: totalProgress,
      level,
      nextLevel,
      daysUntilNext,
      stats: {
        videosWatched: completedVideos,
        totalVideos,
        callsAttended: attendedCalls,
        totalCalls,
        milestonesCompleted: completedMilestones,
        totalMilestones: milestonesTotal,
        currentStreak,
        videoProgress: Math.round(videoProgress),
        callProgress: Math.round(callProgress),
        milestoneProgress: Math.round(milestoneProgress),
        practiceProgress: Math.round(practiceProgress)
      }
    })
  } catch (error) {
    console.error('[Progress Calculate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate progress' },
      { status: 500 }
    )
  }
}
