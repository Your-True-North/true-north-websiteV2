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

    const id = `video-${Date.now()}`
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`

    const result = await client.query(
      `INSERT INTO videos (id, title, description, "youtubeUrl", "youtubeId", category, duration, "thumbnailUrl", status, "uploadDate", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
       RETURNING *`,
      [id, title, description || '', youtubeUrl, youtubeId, category, duration ? parseInt(duration) : null, thumbnailUrl || null, 'active']
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

    const result = await client.query('SELECT * FROM videos ORDER BY "createdAt" DESC')

    await client.end()

    return NextResponse.json({ videos: result.rows })
  } catch (error: any) {
    console.error('[Admin Videos] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing video id' }, { status: 400 })
    }

    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    await client.query('DELETE FROM videos WHERE id = $1', [id])

    await client.end()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Admin Videos] Delete Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
