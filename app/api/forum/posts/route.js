import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Build query with JOINs for user names, reply counts, and like counts
    let sql = `
      SELECT
        cp.*,
        u.name as user_name,
        u.profile_photo as user_photo,
        COUNT(DISTINCT pr.id) as reply_count,
        COUNT(DISTINCT pl.id) as like_count
      FROM community_posts cp
      LEFT JOIN users u ON cp."userId"::text = u.id::text
      LEFT JOIN post_replies pr ON cp.id = pr.post_id
      LEFT JOIN post_likes pl ON cp.id = pl.post_id
    `
    const params = []

    if (category && category !== 'All Posts') {
      sql += ' WHERE cp.category = $1'
      params.push(category)
    }

    sql += ' GROUP BY cp.id, u.name, u.profile_photo'
    sql += ' ORDER BY cp.id DESC'

    let postsRows
    try {
      const result = await query(sql, params)
      postsRows = result.rows
    } catch (joinError) {
      // Fallback: simpler query without joins if tables are missing
      console.warn('[Forum Posts] JOIN query failed, using fallback:', joinError.message)
      let fallbackSql = 'SELECT * FROM community_posts'
      const fallbackParams = []
      if (category && category !== 'All Posts') {
        fallbackSql += ' WHERE category = $1'
        fallbackParams.push(category)
      }
      fallbackSql += ' ORDER BY id DESC'
      const result = await query(fallbackSql, fallbackParams)
      postsRows = result.rows
    }

    // Normalize field names for client
    const posts = postsRows.map(post => ({
      id: post.id,
      userId: post.userId || post.user_id,
      category: post.category,
      title: post.title,
      content: post.content,
      created_at: post.created_at || post.createdat,
      user_name: post.user_name || 'Member',
      user_photo: post.user_photo || null,
      reply_count: parseInt(post.reply_count) || 0,
      like_count: parseInt(post.like_count) || 0
    }))

    // Fetch all replies for all posts in one query
    const postIds = posts.map(p => p.id)
    let repliesByPost = {}
    if (postIds.length > 0) {
      try {
        const repliesResult = await query(
          `SELECT pr.id, pr.post_id, pr."userId", pr.content, pr.created_at, pr.parent_reply_id,
                  u.name as user_name, u.profile_photo as user_photo
           FROM post_replies pr
           LEFT JOIN users u ON pr."userId"::text = u.id::text
           WHERE pr.post_id = ANY($1::int[])
           ORDER BY pr.created_at ASC`,
          [postIds]
        )
        repliesResult.rows.forEach(r => {
          if (!repliesByPost[r.post_id]) repliesByPost[r.post_id] = []
          repliesByPost[r.post_id].push({
            id: r.id,
            content: r.content,
            created_at: r.created_at,
            parent_reply_id: r.parent_reply_id || null,
            user_name: r.user_name || 'Member',
            user_photo: r.user_photo || null,
          })
        })
      } catch (e) {
        console.warn('[Forum Posts] Could not fetch replies:', e.message)
      }
    }

    const postsWithReplies = posts.map(p => ({
      ...p,
      replies: repliesByPost[p.id] || []
    }))

    return NextResponse.json({ posts: postsWithReplies }, { status: 200 })
  } catch (error) {
    console.error('[Forum Posts GET] Error:', error)
    return NextResponse.json({
      error: 'Database error',
      details: error.message,
      posts: []
    }, { status: 200 })
  }
}

export async function POST(request) {
  try {
    const { userId, category, title, content } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (!content || content.length < 10) {
      return NextResponse.json({ error: 'Content required (min 10 chars)' }, { status: 400 })
    }

    // Try with "userId" column name first, fall back to user_id
    let result
    try {
      result = await query(
        `INSERT INTO community_posts ("userId", category, title, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, category || null, title || null, content]
      )
    } catch (e) {
      result = await query(
        `INSERT INTO community_posts (user_id, category, title, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, category || null, title || null, content]
      )
    }

    return NextResponse.json({ post: result.rows[0], message: 'Post created' }, { status: 201 })
  } catch (error) {
    console.error('[Forum Post CREATE] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
