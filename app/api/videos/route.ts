import { NextRequest, NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg

const FALLBACK_DATABASE_URL = 'postgresql://postgres:JSRVavPyKDfxvKqCDcRNArgvRdwflWwn@yamabiko.proxy.rlwy.net:39135/railway'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const sort = searchParams.get('sort') || 'newest'
    const search = searchParams.get('search') || ''
    const userId = request.headers.get('x-user-id') || searchParams.get('userId')

    const client = new Client({
      connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    })
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

    const catResult = await client.query(`
      SELECT category, COUNT(*) as count
      FROM videos
      WHERE status = 'active'
      GROUP BY category
    `)

    // Fetch user progress if userId provided
    let progressMap: Record<string, { completed: boolean; last_watched: string | null }> = {}
    let completedVideos = 0
    let videosWatched = 0

    let totalWatchTime = 0
    if (userId) {
      const progressResult = await client.query(
        'SELECT video_id, completed, last_watched, watch_time FROM user_video_progress WHERE user_id = $1',
        [userId]
      )
      progressResult.rows.forEach((row: any) => {
        progressMap[row.video_id] = { completed: row.completed, last_watched: row.last_watched }
        if (row.completed) completedVideos++
        if (row.last_watched) videosWatched++
        if (row.watch_time) totalWatchTime += parseInt(row.watch_time) || 0
      })
    }

    await client.end()

    const categories: any = { all: result.rows.length }
    catResult.rows.forEach((row: any) => {
      categories[row.category] = parseInt(row.count)
    })

    const videos = result.rows.map((v: any) => {
      const progress = progressMap[v.id]
      const completed = progress?.completed ?? false
      const lastWatched = progress?.last_watched ?? null
      return {
        id: v.id,
        title: v.title,
        description: v.description,
        youtube_url: v.youtubeUrl,
        youtubeId: v.youtubeId,
        category: v.category,
        duration: v.duration,
        upload_date: v.uploadDate || v.createdAt,
        completed,
        last_watched: lastWatched,
        status: completed ? 'completed' : lastWatched ? 'in_progress' : 'new'
      }
    })

    return NextResponse.json({
      videos,
      categories,
      stats: { completedVideos, videosWatched, totalWatchTime }
    })
  } catch (error: any) {
    console.error('[Videos API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
