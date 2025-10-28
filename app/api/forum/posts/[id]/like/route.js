import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request, { params }) {
  try {
    const postId = params.id
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Check if already liked
    const existing = await query(
      'SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    )

    if (existing.rows.length > 0) {
      // Unlike
      await query(
        'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      )

      return NextResponse.json(
        { liked: false, message: 'Post unliked' },
        { status: 200 }
      )
    } else {
      // Like
      await query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
        [postId, userId]
      )

      return NextResponse.json(
        { liked: true, message: 'Post liked' },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('[Forum Like] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
