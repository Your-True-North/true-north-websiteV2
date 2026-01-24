import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

const DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const sort = searchParams.get('sort') || 'newest'
    const search = searchParams.get('search') || ''

    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    let query = 'SELECT * FROM videos WHERE status = $1'
    const params: any[] = ['active']

    if (category !== 'all') {
      query += ' AND category = $2'
      params.push(category)
    }

    if (search) {
      query += ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    if (sort === 'newest') {
      query += ' ORDER BY "createdAt" DESC'
    } else if (sort === 'oldest') {
      query += ' ORDER BY "createdAt" ASC'
    } else if (sort === 'title') {
      query += ' ORDER BY title ASC'
    }

    const result = await client.query(query, params)

    // Get categories count
    const catResult = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM videos 
      WHERE status = 'active' 
      GROUP BY category
    `)

    const categories: any = { all: result.rows.length }
    catResult.rows.forEach((row: any) => {
      categories[row.category] = parseInt(row.count)
    })

    await client.end()

    // Transform to match frontend interface
    const videos = result.rows.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      youtube_url: v.youtubeUrl,
      youtubeId: v.youtubeId,
      category: v.category,
      duration: v.duration,
      upload_date: v.uploadDate || v.createdAt,
      completed: false,
      last_watched: null,
      status: 'new'
    }))

    return NextResponse.json({ 
      videos, 
      categories,
      stats: { completedVideos: 0, videosWatched: 0, totalWatchTime: 0 }
    })
  } catch (error: any) {
    console.error('[Videos API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
