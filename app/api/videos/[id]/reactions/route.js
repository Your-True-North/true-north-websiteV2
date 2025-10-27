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

    // Get reactions count
    const countResult = await query(`
      SELECT COUNT(*) as count
      FROM video_reactions
      WHERE video_id = $1
    `, [videoId])

    const count = parseInt(countResult.rows[0]?.count || 0)

    // Check if user has reacted
    const userReactionResult = await query(`
      SELECT id
      FROM video_reactions
      WHERE video_id = $1 AND user_id = $2
    `, [videoId, user.userId])

    const hasReacted = userReactionResult.rows.length > 0

    return NextResponse.json({
      count,
      hasReacted
    })
  } catch (error) {
    console.error('[Reactions GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    const videoId = params.id

    // Check if already reacted
    const existing = await query(`
      SELECT id
      FROM video_reactions
      WHERE video_id = $1 AND user_id = $2
    `, [videoId, user.userId])

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Already reacted to this video' },
        { status: 400 }
      )
    }

    // Add reaction
    await query(`
      INSERT INTO video_reactions (video_id, user_id, reaction_type, created_at)
      VALUES ($1, $2, 'like', NOW())
    `, [videoId, user.userId])

    // Get updated count
    const countResult = await query(`
      SELECT COUNT(*) as count
      FROM video_reactions
      WHERE video_id = $1
    `, [videoId])

    const count = parseInt(countResult.rows[0]?.count || 0)

    return NextResponse.json({
      success: true,
      count,
      hasReacted: true
    })
  } catch (error) {
    console.error('[Reactions POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    const videoId = params.id

    // Delete reaction
    await query(`
      DELETE FROM video_reactions
      WHERE video_id = $1 AND user_id = $2
    `, [videoId, user.userId])

    // Get updated count
    const countResult = await query(`
      SELECT COUNT(*) as count
      FROM video_reactions
      WHERE video_id = $1
    `, [videoId])

    const count = parseInt(countResult.rows[0]?.count || 0)

    return NextResponse.json({
      success: true,
      count,
      hasReacted: false
    })
  } catch (error) {
    console.error('[Reactions DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    )
  }
}
