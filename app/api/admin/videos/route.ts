import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

const DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, youtubeId, category, duration, thumbnailUrl } = body

    if (!title || !youtubeId || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    const result = await client.query(
      `INSERT INTO videos (title, description, youtubeid, category, duration, thumbnailurl, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [title, description || '', youtubeId, category, duration || null, thumbnailUrl || null]
    )

    await client.end()

    return NextResponse.json({ success: true, video: result.rows[0] })
  } catch (error: any) {
    console.error('[Admin Videos] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    const result = await client.query('SELECT * FROM videos ORDER BY created_at DESC')

    await client.end()

    return NextResponse.json({ videos: result.rows })
  } catch (error: any) {
    console.error('[Admin Videos] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
