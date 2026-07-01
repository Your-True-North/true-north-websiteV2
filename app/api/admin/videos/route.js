import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'

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
      LEFT JOIN comments c ON v.id = c."videoId"
      LEFT JOIN reactions r ON v.id = r."videoId"
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

    // Accept either youtubeUrl (full URL) or youtubeId (just the ID or a full URL)
    let finalYoutubeUrl = youtubeUrl
    let finalYoutubeId = youtubeId

    if (youtubeId && !youtubeUrl) {
      // Extract ID if user pasted a full URL into the youtubeId field
      const urlMatch = youtubeId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#\s]+)/)
      if (urlMatch) {
        finalYoutubeId = urlMatch[1]
      } else {
        // Strip any leading =?& chars from partial pastes like "=-6yjAy4aA0s"
        finalYoutubeId = youtubeId.replace(/^[=?&v]+/, '').trim()
      }
      finalYoutubeUrl = `https://www.youtube.com/watch?v=${finalYoutubeId}`
    } else if (youtubeUrl && !youtubeId) {
      // Extract ID from URL
      const match = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      finalYoutubeId = match ? match[1] : ''
    }

    if (!finalYoutubeUrl) {
      return NextResponse.json({ error: 'YouTube URL or ID required' }, { status: 400 })
    }

    const videoId = randomUUID()
    const result = await query(`
      INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, [videoId, title, description || '', finalYoutubeUrl, finalYoutubeId || '', category, duration || null, 'active'])

    // Log activity
    try {
      const activityId = randomUUID()
      await query(`
        INSERT INTO activities (id, type, title, description, "videoId", "createdAt")
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [activityId, 'video_uploaded', 'New Video Uploaded', title, result.rows[0].id])
    } catch (activityError) {
      // Don't fail the whole request if activity logging fails
      console.error('[Admin Videos POST] Activity log error:', activityError)
    }

    const video = result.rows[0]

    // Send new video notification to all members (fire-and-forget)
    ;(async () => {
      try {
        const membersResult = await query("SELECT email, name FROM users WHERE role IN ('member', 'admin')")
        const members = membersResult.rows
        if (members.length === 0) return

        const resend = new Resend(process.env.RESEND_API_KEY)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourtruenorth.me'
        const videoUrl = `${siteUrl}/videos/${video.id}`

        await Promise.all(members.map(member =>
          resend.emails.send({
            from: 'KYN <kyn@yourtruenorth.me>',
            to: member.email,
            subject: `New teaching: ${video.title}`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:40px;border-radius:8px;">
                <p style="font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9bc4b8;margin:0 0 24px;">Know Your North</p>
                <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#0a0a0a;margin:0 0 16px;line-height:1.2;">${video.title}</h1>
                ${video.description ? `<p style="font-size:16px;line-height:1.7;color:#5a5a58;margin:0 0 24px;">${video.description}</p>` : ''}
                ${video.duration ? `<p style="font-size:13px;color:#9bc4b8;margin:0 0 32px;">${video.duration} min · ${video.category}</p>` : `<p style="font-size:13px;color:#9bc4b8;margin:0 0 32px;">${video.category}</p>`}
                <a href="${videoUrl}" style="display:inline-block;background:#9bc4b8;color:#0a0a0a;padding:14px 32px;border-radius:4px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;">Watch now →</a>
                <hr style="border:none;border-top:1px solid rgba(10,10,10,0.1);margin:40px 0 24px;" />
                <p style="font-size:12px;color:#9a9a96;margin:0;">You're receiving this because you're a KYN member. <a href="${siteUrl}/members" style="color:#9bc4b8;">Manage your account</a></p>
              </div>
            `
          }).catch(err => console.error(`[Video notify] Failed to email ${member.email}:`, err))
        ))

        console.log(`[Video notify] Sent to ${members.length} members for video: ${video.title}`)
      } catch (err) {
        console.error('[Video notify] Error sending notifications:', err)
      }
    })()

    return NextResponse.json({ success: true, video })

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
