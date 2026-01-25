import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // First, get posts - simple query without complex JOINs
    let postsSql = `
      SELECT
        id,
        "userId",
        category,
        title,
        content,
        created_at
      FROM community_posts
    `
    const params = []

    if (category && category !== 'All Posts') {
      postsSql += ' WHERE category = $1'
      params.push(category)
    }

    postsSql += ' ORDER BY created_at DESC'

    const postsResult = await query(postsSql, params)

    // Now enrich with user info and counts
    const posts = await Promise.all(postsResult.rows.map(async (post) => {
      let user_name = 'Anonymous'
      let user_photo = null
      let reply_count = 0
      let like_count = 0

      // Get user info - handle both string and integer IDs
      try {
        const userResult = await query(
          'SELECT name, profile_photo FROM users WHERE id = $1 OR id::text = $1::text LIMIT 1',
          [post.userId]
        )
        if (userResult.rows.length > 0) {
          user_name = userResult.rows[0].name || 'Anonymous'
          user_photo = userResult.rows[0].profile_photo
        }
      } catch (e) {
        console.log('[Forum] User lookup failed for userId:', post.userId)
      }

      // Get reply count
      try {
        const replyResult = await query(
          'SELECT COUNT(*) as count FROM post_replies WHERE post_id = $1',
          [post.id]
        )
        reply_count = parseInt(replyResult.rows[0]?.count || 0)
      } catch (e) {
        // Table might not exist
      }

      // Get like count
      try {
        const likeResult = await query(
          'SELECT COUNT(*) as count FROM post_likes WHERE post_id = $1',
          [post.id]
        )
        like_count = parseInt(likeResult.rows[0]?.count || 0)
      } catch (e) {
        // Table might not exist
      }

      return {
        ...post,
        user_name,
        user_photo,
        reply_count,
        like_count
      }
    }))

    return NextResponse.json({ posts }, { status: 200 })
  } catch (error) {
    console.error('[Forum Posts GET] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { userId, category, title, content } = await request.json()

    // Validate
    if (!userId) {
      console.error('[Forum Post CREATE] Missing userId')
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    if (!content || content.length < 10) {
      console.error('[Forum Post CREATE] Invalid content length:', content?.length)
      return NextResponse.json(
        { error: 'Content required (min 10 chars)' },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      console.error('[Forum Post CREATE] Content too long:', content.length)
      return NextResponse.json(
        { error: 'Content too long (max 10000 chars)' },
        { status: 400 }
      )
    }

    // Try to verify user exists (but don't block if users table has different schema)
    try {
      const userCheck = await query(
        'SELECT id FROM users WHERE id = $1 OR id::text = $1::text LIMIT 1',
        [userId]
      )
      if (userCheck.rows.length === 0) {
        console.log('[Forum Post CREATE] User not found in users table, proceeding anyway:', userId)
      }
    } catch (e) {
      console.log('[Forum Post CREATE] User check failed, proceeding:', e.message)
    }

    // Insert post
    console.log('[Forum Post CREATE] Creating post for userId:', userId)
    const result = await query(
      `INSERT INTO community_posts ("userId", category, title, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [userId, category || null, title || null, content]
    )

    console.log('[Forum Post CREATE] Post created successfully:', result.rows[0].id)
    return NextResponse.json(
      { post: result.rows[0], message: 'Post created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Forum Post CREATE] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}
