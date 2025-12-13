import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET all videos
export async function GET(request) {
  try {
    const result = await query(`
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

    return NextResponse.json({ videos: result.rows })

  } catch (error) {
    console.error('[Admin Videos GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos', details: error.message }, { status: 500 })
  }
}

// POST new video
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, description, youtubeUrl, youtubeId, category, duration } = body

    if (!title || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Accept either youtubeUrl (full URL) or youtubeId (just the ID)
    let finalYoutubeUrl = youtubeUrl

    if (youtubeId && !youtubeUrl) {
      // Build URL from ID
      finalYoutubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`
    }

    if (!finalYoutubeUrl) {
      return NextResponse.json({ error: 'YouTube URL or ID required' }, { status: 400 })
    }

    const result = await query(`
      INSERT INTO videos (title, description, youtubeurl, category, duration, published, createdat, updatedat)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [title, description || '', finalYoutubeUrl, category, duration || null, true])

    // Log activity
    try {
      await query(`
        INSERT INTO activities (type, title, description, videoid, createdat)
        VALUES ($1, $2, $3, $4, NOW())
      `, ['video_uploaded', 'New Video Uploaded', title, result.rows[0].id])
    } catch (activityError) {
      // Don't fail the whole request if activity logging fails
      console.error('[Admin Videos POST] Activity log error:', activityError)
    }

    return NextResponse.json({ success: true, video: result.rows[0] })

  } catch (error) {
    console.error('[Admin Videos POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create video', details: error.message }, { status: 500 })
  }
}

// PUT update video
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, title, description, youtubeUrl, category, duration, status } = body

    if (!id) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    const result = await query(`
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
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, video: result.rows[0] })

  } catch (error) {
    console.error('[Admin Videos PUT] Error:', error)
    return NextResponse.json({ error: 'Failed to update video', details: error.message }, { status: 500 })
  }
}

// DELETE video
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    const result = await query('DELETE FROM videos WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Video deleted successfully' })

  } catch (error) {
    console.error('[Admin Videos DELETE] Error:', error)
    return NextResponse.json({ error: 'Failed to delete video', details: error.message }, { status: 500 })
  }
}
