import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Try to get posts - handle both column naming conventions
    let postsResult
    try {
      // First try camelCase column names (Prisma style)
      let postsSql = `
        SELECT
          id,
          "userId" as user_id,
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
      postsResult = await query(postsSql, params)
    } catch (e) {
      // Fallback to snake_case column names (migration style)
      console.log('[Forum] Trying snake_case columns:', e.message)
      let postsSql = `
        SELECT
          id,
          user_id,
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
      postsResult = await query(postsSql, params)
    }

    // Enrich with user info and counts
    const posts = await Promise.all(postsResult.rows.map(async (post) => {
      let user_name = 'Anonymous'
      let user_photo = null
      let reply_count = 0
      let like_count = 0

      const postUserId = post.user_id || post.userId

      // Get user info
      if (postUserId) {
        try {
          const userResult = await query(
            'SELECT name, profile_photo FROM users WHERE id::text = $1::text LIMIT 1',
            [String(postUserId)]
          )
          if (userResult.rows.length > 0) {
            user_name = userResult.rows[0].name || 'Anonymous'
            user_photo = userResult.rows[0].profile_photo
          }
        } catch (e) {
          console.log('[Forum] User lookup failed:', e.message)
        }
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
        id: post.id,
        userId: postUserId,
        category: post.category,
        title: post.title,
        content: post.content,
        created_at: post.created_at,
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
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (!content || content.length < 10) {
      return NextResponse.json({ error: 'Content required (min 10 chars)' }, { status: 400 })
    }

    if (content.length > 10000) {
      return NextResponse.json({ error: 'Content too long (max 10000 chars)' }, { status: 400 })
    }

    // Insert post - try camelCase first, then snake_case
    let result
    try {
      result = await query(
        `INSERT INTO community_posts ("userId", category, title, content, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [userId, category || null, title || null, content]
      )
    } catch (e) {
      console.log('[Forum] Trying snake_case insert:', e.message)
      result = await query(
        `INSERT INTO community_posts (user_id, category, title, content, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [userId, category || null, title || null, content]
      )
    }

    return NextResponse.json(
      { post: result.rows[0], message: 'Post created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Forum Post CREATE] Error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}
