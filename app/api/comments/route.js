import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, rateLimit } from '@/lib/auth'
import { validateVideoId, validateComment } from '@/lib/validation'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    // Validate video ID
    const videoValidation = validateVideoId(videoId)
    if (!videoValidation.valid) {
      return NextResponse.json({ error: videoValidation.error }, { status: 400 })
    }

    // Fetch comments from database
    const result = await query(
      `SELECT c.id, c.content, c.createdat, u.name as username, u.id as userid
       FROM comments c
       JOIN users u ON c.userid = u.id
       WHERE c.videoid = $1
       ORDER BY c.createdat DESC`,
      [videoValidation.videoId]
    )

    return NextResponse.json({ comments: result.rows })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Require authentication
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    // Rate limit: 10 comments per hour per user
    const rateLimitResult = rateLimit(`comment:${user.userId}`, 10, 3600000)
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many comments. Please slow down.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString()
          }
        }
      )
    }

    const { videoId, content } = await request.json()

    // Validate video ID
    const videoValidation = validateVideoId(videoId)
    if (!videoValidation.valid) {
      return NextResponse.json({ error: videoValidation.error }, { status: 400 })
    }

    // Validate comment content
    const commentValidation = validateComment(content)
    if (!commentValidation.valid) {
      return NextResponse.json({ error: commentValidation.error }, { status: 400 })
    }

    // Insert comment into database
    const result = await query(
      `INSERT INTO comments (videoid, userid, content, createdat)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, content, createdat`,
      [videoValidation.videoId, user.userId, commentValidation.content]
    )

    const comment = result.rows[0]

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        username: user.email,
        userid: user.userId
      }
    }, {
      status: 201,
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    )
  }
}
