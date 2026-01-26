import { NextResponse } from 'next/server'
import { Client } from 'pg'

const DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

export async function GET(request) {
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    await client.connect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Simple query - try to get all columns
    let sql = 'SELECT * FROM community_posts'
    const params = []

    if (category && category !== 'All Posts') {
      sql += ' WHERE category = $1'
      params.push(category)
    }

    sql += ' ORDER BY created_at DESC'

    const postsResult = await client.query(sql, params)

    // Build response with safe defaults
    const posts = postsResult.rows.map(post => ({
      id: post.id,
      userId: post.userId || post.user_id,
      category: post.category,
      title: post.title,
      content: post.content,
      created_at: post.created_at || post.createdat,
      user_name: 'Member',
      user_photo: null,
      reply_count: 0,
      like_count: 0
    }))

    await client.end()
    return NextResponse.json({ posts }, { status: 200 })
  } catch (error) {
    try { await client.end() } catch {}
    console.error('[Forum Posts GET] Error:', error)
    return NextResponse.json({
      error: 'Database error',
      details: error.message,
      posts: []
    }, { status: 200 })
  }
}

export async function POST(request) {
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    await client.connect()

    const { userId, category, title, content } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (!content || content.length < 10) {
      return NextResponse.json({ error: 'Content required (min 10 chars)' }, { status: 400 })
    }

    // Try both column name styles
    let result
    try {
      result = await client.query(
        `INSERT INTO community_posts ("userId", category, title, content, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [userId, category || null, title || null, content]
      )
    } catch (e) {
      result = await client.query(
        `INSERT INTO community_posts (user_id, category, title, content, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [userId, category || null, title || null, content]
      )
    }

    await client.end()
    return NextResponse.json({ post: result.rows[0], message: 'Post created' }, { status: 201 })
  } catch (error) {
    try { await client.end() } catch {}
    console.error('[Forum Post CREATE] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
