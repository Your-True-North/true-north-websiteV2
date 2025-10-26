import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, rateLimit } from '@/lib/auth'
import { sanitizeInput, validateYoutubeUrl } from '@/lib/validation'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let result
    if (category && category !== 'all') {
      // Fetch videos by category
      result = await query(
        `SELECT id, title, description, youtubeurl, category, duration, createdat
         FROM videos
         WHERE category = $1 AND published = true
         ORDER BY createdat DESC`,
        [sanitizeInput(category, 50)]
      )
    } else {
      // Fetch all videos
      result = await query(
        `SELECT id, title, description, youtubeurl, category, duration, createdat
         FROM videos
         WHERE published = true
         ORDER BY createdat DESC`
      )
    }

    return NextResponse.json({ videos: result.rows })
  } catch (error) {
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