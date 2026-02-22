import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request, props) {
  try {
    const params = await props.params
    const postId = params.id
    const { userId, content, parent_reply_id } = await request.json()

    // Validate
    if (!userId || !content || content.length < 1) {
      return NextResponse.json(
        { error: 'User ID and content required' },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Content too long (max 5000 chars)' },
        { status: 400 }
      )
    }

    // Insert reply (with optional parent_reply_id for nested replies)
    const result = await query(
      `INSERT INTO post_replies (post_id, "userId", content, parent_reply_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [postId, userId, content, parent_reply_id || null]
    )

    return NextResponse.json(
      { reply: result.rows[0], message: 'Reply posted successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Forum Reply] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
