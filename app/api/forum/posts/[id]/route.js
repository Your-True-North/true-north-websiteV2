import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request, props) {
  try {
    const params = await props.params
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

    // Map post to ensure consistent field names for client
    const post = postResult.rows[0]
    const mappedPost = {
      ...post,
      created_at: post.created_at || post.createdat,
      like_count: parseInt(post.like_count) || 0
    }

    // Get replies using pr.* (handles any column naming)
    // Try full query with reply_likes join first, then simpler fallbacks
    let repliesRows = []
    try {
      const repliesResult = await query(
        `SELECT
          pr.*,
          u.name as user_name,
          u.profile_photo as user_photo,
          COUNT(DISTINCT rl.id) as like_count
         FROM post_replies pr
         LEFT JOIN users u ON pr."userId" = u.id
         LEFT JOIN reply_likes rl ON pr.id = rl.reply_id
         WHERE pr.post_id = $1
         GROUP BY pr.id, u.name, u.profile_photo
         ORDER BY pr.id ASC`,
        [postId]
      )
      repliesRows = repliesResult.rows
    } catch (replyError) {
      // reply_likes table may not exist - try without it
      console.warn('[Forum Post Detail] Retrying without reply_likes:', replyError.message)
      try {
        const repliesResult = await query(
          `SELECT
            pr.*,
            u.name as user_name,
            u.profile_photo as user_photo,
            0 as like_count
           FROM post_replies pr
           LEFT JOIN users u ON pr."userId" = u.id
           WHERE pr.post_id = $1
           ORDER BY pr.id ASC`,
          [postId]
        )
        repliesRows = repliesResult.rows
      } catch (fallbackError) {
        // Simplest possible query
        console.warn('[Forum Post Detail] Retrying with minimal query:', fallbackError.message)
        const repliesResult = await query(
          `SELECT pr.*, 0 as like_count
           FROM post_replies pr
           WHERE pr.post_id = $1
           ORDER BY pr.id ASC`,
          [postId]
        )
        repliesRows = repliesResult.rows
      }
    }

    // Normalize reply field names for client
    const mappedReplies = repliesRows.map(r => ({
      ...r,
      created_at: r.created_at || r.createdat,
      parent_reply_id: r.parent_reply_id || null,
      user_name: r.user_name || 'Member',
      user_photo: r.user_photo || null,
      like_count: parseInt(r.like_count) || 0
    }))

    return NextResponse.json({
      post: mappedPost,
      replies: mappedReplies
    }, { status: 200 })
  } catch (error) {
    console.error('[Forum Post Detail] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
