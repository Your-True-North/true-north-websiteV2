import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let sql = `
      SELECT
        fp.*,
        u.name as user_name,
        u.profile_photo as user_photo,
        COUNT(DISTINCT fr.id) as reply_count,
        COUNT(DISTINCT fl.id) as like_count
      FROM forum_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      LEFT JOIN forum_replies fr ON fp.id = fr.post_id
      LEFT JOIN forum_likes fl ON fp.id = fl.post_id
    `

    const params = []

    if (category && category !== 'All Posts') {
      sql += ' WHERE fp.category = $1'
      params.push(category)
    }

    sql += ' GROUP BY fp.id, u.name, u.profile_photo ORDER BY fp.createdat DESC'

    const result = await query(sql, params)

    return NextResponse.json({ posts: result.rows }, { status: 200 })
  } catch (error) {
    console.error('[Forum Posts GET] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Verify user exists
    const userCheck = await query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    )

    if (userCheck.rows.length === 0) {
      console.error('[Forum Post CREATE] User not found:', userId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Insert post
    console.log('[Forum Post CREATE] Creating post for userId:', userId)
    const result = await query(
      `INSERT INTO forum_posts (user_id, category, title, content)
       VALUES ($1, $2, $3, $4)
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
