import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, rateLimit } from '@/lib/auth'
import { sanitizeInput, validateYoutubeUrl } from '@/lib/validation'
import { Resend } from 'resend'

export async function GET(request) {
  try {
    const authResult = requireAuth(request)
    let userId
    if (authResult.error) {
      const headerUserId = request.headers.get('x-user-id')
      if (!headerUserId) {
        return authResult.error
      }
      userId = headerUserId
    } else {
      userId = authResult.user.userId
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'

    // Build query with user progress
    let videoQuery = `
      SELECT
        v.id,
        v.title,
        v.description,
        v."youtubeUrl" as youtube_url,
        v.category,
        v.duration,
        v."createdAt" as upload_date,
        uvp.completed,
        uvp.last_watched,
        uvp.watch_time,
        CASE
          WHEN uvp.completed = true THEN 'completed'
          WHEN uvp.last_watched IS NOT NULL THEN 'in_progress'
          ELSE 'new'
        END as progress_status
      FROM videos v
      LEFT JOIN user_video_progress uvp ON v.id = uvp.video_id AND uvp.user_id = $1
      WHERE v.status = 'active'
    `
    const queryParams = [userId]
    let paramCount = 2

    // Filter by category
    if (category && category !== 'all') {
      videoQuery += ` AND v.category = $${paramCount}`
      queryParams.push(sanitizeInput(category, 50))
      paramCount++
    }

    // Search by title or description
    if (search) {
      videoQuery += ` AND (v.title ILIKE $${paramCount} OR v.description ILIKE $${paramCount})`
      queryParams.push(`%${sanitizeInput(search, 100)}%`)
      paramCount++
    }

    // Sorting
    switch (sort) {
      case 'newest':
        videoQuery += ' ORDER BY v."createdAt" DESC'
        break
      case 'oldest':
        videoQuery += ' ORDER BY v."createdAt" ASC'
        break
      case 'title':
        videoQuery += ' ORDER BY v.title ASC'
        break
      default:
        videoQuery += ' ORDER BY v."createdAt" DESC'
    }

    const result = await query(videoQuery, queryParams)

    // Get category counts
    const categoryCounts = await query(`
      SELECT category, COUNT(*) as count
      FROM videos
      WHERE status = 'active'
      GROUP BY category
    `)

    const categories = {
      all: result.rows.length,
      ...Object.fromEntries(categoryCounts.rows.map(row => [row.category, parseInt(row.count)]))
    }

    // Get user stats
    const statsResult = await query(`
      SELECT
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_count,
        COUNT(*) as watched_count,
        SUM(COALESCE(watch_time, 0)) as total_watch_time
      FROM user_video_progress
      WHERE user_id = $1
    `, [userId])

    const stats = statsResult.rows[0] || { completed_count: 0, watched_count: 0, total_watch_time: 0 }

    return NextResponse.json({
      videos: result.rows,
      categories,
      stats: {
        completedVideos: parseInt(stats.completed_count) || 0,
        videosWatched: parseInt(stats.watched_count) || 0,
        totalWatchTime: parseInt(stats.total_watch_time) || 0
      }
    })
  } catch (error) {
    console.error('[Videos GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Require admin authentication
    const authResult = requireAuth(request, { requiredRole: 'admin' })
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

    // Rate limit: 20 video creations per hour per admin
    const rateLimitResult = rateLimit(`create-video:${user.userId}`, 20, 3600000)
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many video creations. Please slow down.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString()
          }
        }
      )
    }

    const { title, description, youtubeUrl, category, duration } = await request.json()

    // Validate required fields
    if (!title || !youtubeUrl || !category) {
      return NextResponse.json(
        { error: 'Title, YouTube URL, and category are required' },
        { status: 400 }
      )
    }

    // Validate YouTube URL
    const urlValidation = validateYoutubeUrl(youtubeUrl)
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title, 200)
    const sanitizedDescription = sanitizeInput(description, 1000)
    const sanitizedCategory = sanitizeInput(category, 50)
    const sanitizedDuration = sanitizeInput(duration, 20)

    // Insert video
    const result = await query(
      `INSERT INTO videos (title, description, "youtubeUrl", category, duration, status, "createdAt")
       VALUES ($1, $2, $3, $4, $5, 'active', NOW())
       RETURNING id, title, description, "youtubeUrl", category, duration, "createdAt"`,
      [sanitizedTitle, sanitizedDescription, urlValidation.url, sanitizedCategory, sanitizedDuration]
    )

    const video = result.rows[0]

    // Send new video notification to all members (fire-and-forget)
    ;(async () => {
      try {
        const membersResult = await query('SELECT email, name FROM users WHERE role IN (\'member\', \'admin\')')
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

    return NextResponse.json({
      success: true,
      video
    }, {
      status: 201,
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create video', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    )
  }
}