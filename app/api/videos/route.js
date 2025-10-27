import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, rateLimit } from '@/lib/auth'
import { sanitizeInput, validateYoutubeUrl } from '@/lib/validation'

export async function GET(request) {
  try {
    const authResult = requireAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const user = authResult.user

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
        v.youtubeurl as youtube_url,
        v.category,
        v.duration,
        v.createdat as upload_date,
        uvp.completed,
        uvp.last_watched,
        CASE
          WHEN uvp.completed = true THEN 'completed'
          WHEN uvp.last_watched IS NOT NULL THEN 'in_progress'
          ELSE 'new'
        END as status
      FROM videos v
      LEFT JOIN user_video_progress uvp ON v.id = uvp.video_id AND uvp.user_id = $1
      WHERE v.published = true
    `
    const queryParams = [user.userId]
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
        videoQuery += ' ORDER BY v.createdat DESC'
        break
      case 'oldest':
        videoQuery += ' ORDER BY v.createdat ASC'
        break
      case 'title':
        videoQuery += ' ORDER BY v.title ASC'
        break
      default:
        videoQuery += ' ORDER BY v.createdat DESC'
    }

    const result = await query(videoQuery, queryParams)

    // Get category counts
    const categoryCounts = await query(`
      SELECT category, COUNT(*) as count
      FROM videos
      WHERE published = true
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
    `, [user.userId])

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
      `INSERT INTO videos (title, description, youtubeurl, category, duration, published, createdat)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       RETURNING id, title, description, youtubeurl, category, duration, createdat`,
      [sanitizedTitle, sanitizedDescription, urlValidation.url, sanitizedCategory, sanitizedDuration]
    )

    const video = result.rows[0]

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