import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Clean malformed YouTube URLs like "https://www.youtube.com/watch?v=https://youtu.be/ABC123"
function cleanYoutubeUrl(url) {
  if (!url) return url

  // Check for double URL pattern
  const match = url.match(/youtube\.com\/watch\?v=(https?:\/\/youtu\.be\/([^&\s]+))/)
  if (match) {
    return `https://www.youtube.com/watch?v=${match[2]}`
  }

  return url
}

// GET all videos
export async function GET(request) {
  try {
    const result = await query(`
      SELECT
        v.*,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT r.id) as reaction_count
      FROM videos v
      LEFT JOIN video_comments c ON v.id = c.video_id
      LEFT JOIN video_reactions r ON v.id = r.video_id
      GROUP BY v.id
      ORDER BY v."createdAt" DESC
    `)

    // Clean any malformed YouTube URLs and fix in database
    const videos = result.rows.map(video => {
      const cleanedUrl = cleanYoutubeUrl(video.youtubeUrl)
      if (cleanedUrl !== video.youtubeUrl) {
        // Fix the URL in database asynchronously (fire and forget)
        query('UPDATE videos SET "youtubeUrl" = $1 WHERE id = $2', [cleanedUrl, video.id])
          .catch(err => console.error('[Admin Videos] Failed to fix malformed URL:', err))
      }
      return { ...video, youtubeUrl: cleanedUrl }
    })

    return NextResponse.json({ videos })

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
    let finalYoutubeId = youtubeId

    if (youtubeId && !youtubeUrl) {
      // Build URL from ID
      finalYoutubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`
    } else if (youtubeUrl && !youtubeId) {
      // Extract ID from URL
      const match = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      finalYoutubeId = match ? match[1] : ''
    }

    if (!finalYoutubeUrl) {
      return NextResponse.json({ error: 'YouTube URL or ID required' }, { status: 400 })
    }

    const result = await query(`
      INSERT INTO videos (title, description, "youtubeUrl", "youtubeId", category, duration, status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [title, description || '', finalYoutubeUrl, finalYoutubeId || '', category, duration || null, 'active'])

    // Log activity
    try {
      await query(`
        INSERT INTO activities (type, title, description, "videoId", "createdAt")
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

    // Extract youtubeId from URL if provided
    let youtubeId = null
    if (youtubeUrl) {
      const match = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      youtubeId = match ? match[1] : null
    }

    const result = await query(`
      UPDATE videos
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        "youtubeUrl" = COALESCE($3, "youtubeUrl"),
        "youtubeId" = COALESCE($4, "youtubeId"),
        category = COALESCE($5, category),
        duration = COALESCE($6, duration),
        status = COALESCE($7, status),
        "updatedAt" = NOW()
      WHERE id = $8
      RETURNING *
    `, [title, description, youtubeUrl, youtubeId, category, duration, status, id])

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
