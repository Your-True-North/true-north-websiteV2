import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, rateLimit } from '@/lib/auth'
import { validateVideoId } from '@/lib/validation'

export async function POST(request) {
  try {
    // Require authentication
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    // Rate limit: 30 reactions per minute per user
    const rateLimitResult = rateLimit(`reaction:${user.userId}`, 30, 60000)
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many reactions. Please slow down.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString()
          }
        }
      )
    }

    const { type, videoId } = await request.json()

    // Validate video ID
    const videoValidation = validateVideoId(videoId)
    if (!videoValidation.valid) {
      return NextResponse.json({ error: videoValidation.error }, { status: 400 })
    }

    // Validate reaction type
    const validTypes = ['like', 'love', 'insightful']
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid reaction type. Must be one of: like, love, insightful' },
        { status: 400 }
      )
    }

    // Check if reaction already exists
    const existing = await query(
      'SELECT id FROM reactions WHERE userid = $1 AND videoid = $2 AND type = $3',
      [user.userId, videoValidation.videoId, type]
    )

    let result
    if (existing.rows.length > 0) {
      // Remove reaction (toggle off)
      await query(
        'DELETE FROM reactions WHERE userid = $1 AND videoid = $2 AND type = $3',
        [user.userId, videoValidation.videoId, type]
      )
      result = { action: 'removed', type }
    } else {
      // Add reaction
      await query(
        'INSERT INTO reactions (userid, videoid, type, createdat) VALUES ($1, $2, $3, NOW())',
        [user.userId, videoValidation.videoId, type]
      )
      result = { action: 'added', type }
    }

    // Get updated reaction counts
    const counts = await query(
      `SELECT type, COUNT(*) as count
       FROM reactions
       WHERE videoid = $1
       GROUP BY type`,
      [videoValidation.videoId]
    )

    return NextResponse.json({
      success: true,
      ...result,
      counts: counts.rows.reduce((acc, row) => {
        acc[row.type] = parseInt(row.count)
        return acc
      }, {})
    }, {
      status: 200,
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to toggle reaction', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    )
  }
}