import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, rateLimit } from '@/lib/auth'
import { sanitizeInput } from '@/lib/validation'

export async function GET(request, { params }) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const videoId = params.id

    // Get comments with user info
    const result = await query(`
      SELECT
        vc.id,
        vc.content,
        vc.created_at,
        u.id as user_id,
        u.name as user_name,
        u.profile_photo
      FROM video_comments vc
      JOIN users u ON vc.user_id = u.id
      WHERE vc.video_id = $1
      ORDER BY vc.created_at DESC
    `, [videoId])

    return NextResponse.json({
      comments: result.rows
    })
  } catch (error) {
    console.error('[Comments GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
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

    // Rate limit: 10 comments per hour
    const rateLimitResult = rateLimit(`comment:${user.userId}`, 10, 3600000)
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many comments. Please slow down.' },
        { status: 429 }
      )
    }

    const videoId = params.id
    const { content } = await request.json()

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    const sanitizedContent = sanitizeInput(content, 5000)

    // Insert comment
    const result = await query(`
      INSERT INTO video_comments (video_id, user_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, content, created_at
    `, [videoId, user.userId, sanitizedContent])

    const comment = result.rows[0]

    // Get user info
    const userResult = await query(`
      SELECT name, profile_photo
      FROM users
      WHERE id = $1
    `, [user.userId])

    const userInfo = userResult.rows[0]

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        user_id: user.userId,
        user_name: userInfo.name,
        profile_photo: userInfo.profile_photo
      }
    }, { status: 201 })
  } catch (error) {
    console.error('[Comments POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    )
  }
}
