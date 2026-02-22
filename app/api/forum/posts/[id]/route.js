import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const postId = params.id

    // Get post with user info and like count
    const postResult = await query(
      `SELECT
        cp.*,
        u.name as user_name,
        u.profile_photo as user_photo,
        COUNT(DISTINCT pl.id) as like_count
       FROM community_posts cp
       LEFT JOIN users u ON cp."userId" = u.id
       LEFT JOIN post_likes pl ON cp.id = pl.post_id
       WHERE cp.id = $1
       GROUP BY cp.id, u.name, u.profile_photo`,
      [postId]
    )

    if (postResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get replies with user info, like counts, and parent_reply_id for nesting
    const repliesResult = await query(
      `SELECT
        pr.*,
        pr.parent_reply_id,
        u.name as user_name,
        u.profile_photo as user_photo,
        COUNT(DISTINCT rl.id) as like_count
       FROM post_replies pr
       LEFT JOIN users u ON pr."userId" = u.id
       LEFT JOIN reply_likes rl ON pr.id = rl.reply_id
       WHERE pr.post_id = $1
       GROUP BY pr.id, u.name, u.profile_photo
       ORDER BY pr.createdat ASC`,
      [postId]
    )

    return NextResponse.json({
      post: postResult.rows[0],
      replies: repliesResult.rows
    }, { status: 200 })
  } catch (error) {
    console.error('[Forum Post Detail] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
