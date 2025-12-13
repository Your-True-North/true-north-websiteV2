import { NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg

// Extract YouTube ID from URL
function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? match[1] : ''
}

// GET all videos
export async function GET(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()

    const result = await client.query(`
      SELECT
        v.*,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT r.id) as reaction_count
      FROM videos v
      LEFT JOIN comments c ON v.id = c.videoid
      LEFT JOIN reactions r ON v.id = r.videoid
      GROUP BY v.id
      ORDER BY v.createdat DESC
    `)

    await client.end()

    return NextResponse.json({ videos: result.rows })

  } catch (error) {
    try { await client.end() } catch {}
    console.error('[Admin Videos GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos', details: error.message }, { status: 500 })
  }
}

// POST new video
export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()

    const body = await request.json()
    const { title, description, youtubeUrl, youtubeId, category, duration } = body

    if (!title || !category) {
      await client.end()
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Accept either youtubeUrl (full URL) or youtubeId (just the ID)
    let finalYoutubeUrl = youtubeUrl

    if (youtubeId && !youtubeUrl) {
      // Build URL from ID
      finalYoutubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`
    }

    if (!finalYoutubeUrl) {
      await client.end()
      return NextResponse.json({ error: 'YouTube URL or ID required' }, { status: 400 })
    }

    const result = await client.query(`
      INSERT INTO videos (title, description, youtubeurl, category, duration, published, createdat, updatedat)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [title, description || '', finalYoutubeUrl, category, duration || null, true])

    // Log activity
    await client.query(`
      INSERT INTO activities (type, title, description, videoid, createdat)
      VALUES ($1, $2, $3, $4, NOW())
    `, ['video_uploaded', 'New Video Uploaded', title, result.rows[0].id])

    await client.end()

    return NextResponse.json({ success: true, video: result.rows[0] })

  } catch (error) {
    try { await client.end() } catch {}
    console.error('[Admin Videos POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create video', details: error.message }, { status: 500 })
  }
}

// PUT update video
export async function PUT(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()

    const body = await request.json()
    const { id, title, description, youtubeUrl, category, duration, status } = body

    if (!id) {
      await client.end()
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    const youtubeId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null

    const result = await client.query(`
      UPDATE videos
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        youtubeurl = COALESCE($3, youtubeurl),
        category = COALESCE($4, category),
        duration = COALESCE($5, duration),
        published = COALESCE($6, published),
        updatedat = NOW()
      WHERE id = $7
      RETURNING *
    `, [title, description, youtubeUrl, category, duration, status === 'published' ? true : (status === 'draft' ? false : null), id])

    if (result.rows.length === 0) {
      await client.end()
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    await client.end()

    return NextResponse.json({ success: true, video: result.rows[0] })

  } catch (error) {
    try { await client.end() } catch {}
    console.error('[Admin Videos PUT] Error:', error)
    return NextResponse.json({ error: 'Failed to update video', details: error.message }, { status: 500 })
  }
}

// DELETE video
export async function DELETE(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      await client.end()
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    const result = await client.query('DELETE FROM videos WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      await client.end()
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    await client.end()

    return NextResponse.json({ success: true, message: 'Video deleted successfully' })

  } catch (error) {
    try { await client.end() } catch {}
    console.error('[Admin Videos DELETE] Error:', error)
    return NextResponse.json({ error: 'Failed to delete video', details: error.message }, { status: 500 })
  }
}
