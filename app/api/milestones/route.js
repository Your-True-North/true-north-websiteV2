import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// Define milestones for each level
const MILESTONES = {
  Seeker: [
    { id: 'seeker_1', title: 'Complete Your First Video', description: 'Begin your journey with foundation work' },
    { id: 'seeker_2', title: 'Attend Your First Live Call', description: 'Join the Circle community' },
    { id: 'seeker_3', title: 'Share Your Story', description: 'Post in the community' },
    { id: 'seeker_4', title: '7-Day Practice Streak', description: 'Build consistency in your practice' }
  ],
  Explorer: [
    { id: 'explorer_1', title: 'Complete 10 Videos', description: 'Deepen your understanding' },
    { id: 'explorer_2', title: 'Attend 3 Live Calls', description: 'Engage with the community' },
    { id: 'explorer_3', title: 'First Breathwork Session', description: 'Experience conscious connected breathing' },
    { id: 'explorer_4', title: '21-Day Practice Streak', description: 'Solidify your commitment' }
  ],
  Pathfinder: [
    { id: 'pathfinder_1', title: 'Complete 25 Videos', description: 'Master the foundation work' },
    { id: 'pathfinder_2', title: 'Attend 5 Live Calls', description: 'Become a regular participant' },
    { id: 'pathfinder_3', title: 'Live Teachings Practice', description: 'Clear stagnant energy' },
    { id: 'pathfinder_4', title: '30-Day Practice Streak', description: 'Embody daily practice' }
  ],
  Guide: [
    { id: 'guide_1', title: 'Complete All Videos', description: 'Full mastery of the material' },
    { id: 'guide_2', title: 'Attend 10 Live Calls', description: 'Lead by example in the community' },
    { id: 'guide_3', title: 'Help Another Member', description: 'Share your wisdom' },
    { id: 'guide_4', title: '60-Day Practice Streak', description: 'True integration' }
  ]
}

export async function GET(request) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    // Get user's current level
    const userResult = await query(
      'SELECT level FROM users WHERE id = $1',
      [user.userId]
    )
    const userLevel = userResult.rows[0]?.level || 'Seeker'

    // Get user's completed milestones
    const completedResult = await query(
      'SELECT milestone_id FROM user_milestones WHERE user_id = $1 AND completed = true',
      [user.userId]
    )
    const completedIds = completedResult.rows.map(row => row.milestone_id)

    // Get milestones for current level
    const levelMilestones = MILESTONES[userLevel] || MILESTONES.Seeker

    const milestonesWithStatus = levelMilestones.map(milestone => ({
      ...milestone,
      completed: completedIds.includes(milestone.id)
    }))

    return NextResponse.json({
      level: userLevel,
      milestones: milestonesWithStatus
    })
  } catch (error) {
    console.error('[Milestones GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    const { milestoneId } = await request.json()

    if (!milestoneId) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      )
    }

    // Check if milestone already completed
    const existing = await query(
      'SELECT * FROM user_milestones WHERE user_id = $1 AND milestone_id = $2',
      [user.userId, milestoneId]
    )

    if (existing.rows.length > 0) {
      // Update to completed
      await query(
        'UPDATE user_milestones SET completed = true, completed_at = NOW() WHERE user_id = $1 AND milestone_id = $2',
        [user.userId, milestoneId]
      )
    } else {
      // Insert new milestone
      await query(
        'INSERT INTO user_milestones (user_id, milestone_id, completed, completed_at) VALUES ($1, $2, true, NOW())',
        [user.userId, milestoneId]
      )
    }

    // Create notification
    const milestoneTitle = Object.values(MILESTONES)
      .flat()
      .find(m => m.id === milestoneId)?.title || 'Milestone'

    await query(
      `INSERT INTO notifications (user_id, type, title, message, link, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.userId,
        'milestone',
        'Milestone Achieved!',
        `Congratulations! You've completed: ${milestoneTitle}`,
        '/members'
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Milestone completed!'
    })
  } catch (error) {
    console.error('[Milestones POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to complete milestone' },
      { status: 500 }
    )
  }
}
