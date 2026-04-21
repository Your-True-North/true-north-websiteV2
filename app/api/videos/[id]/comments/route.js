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

    const result = await query(`
      SELECT
        c.id,
        c.content,
        c."createdAt" as created_at,
        c."parentId" as parent_comment_id,
        u.id as user_id,
        u.name as user_name,
        u.profile_photo
      FROM comments c
      JOIN users u ON c."userId"::text = u.id::text
      WHERE c."videoId" = $1
      ORDER BY c."createdAt" ASC
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

    const rateLimitResult = rateLimit(`comment:${user.userId}`, 10, 3600000)
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many comments. Please slow down.' },
        { status: 429 }
      )
    }

    const videoId = params.id
    const { content, parentId } = await request.json()

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

    const result = await query(`
      INSERT INTO comments (id, "videoId", "userId", content, "parentId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
      RETURNING id, content, "createdAt" as created_at, "parentId" as parent_comment_id
    `, [videoId, user.userId, sanitizedContent, parentId || null])

    const comment = result.rows[0]

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
        profile_photo: userInfo.profile_photo,
        parent_comment_id: comment.parent_comment_id || null
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
