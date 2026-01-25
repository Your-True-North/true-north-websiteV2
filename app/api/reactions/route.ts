import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'
import jwt from 'jsonwebtoken'

const DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

// Helper to get userId from JWT token (Authorization header or cookie)
function getUserIdFromRequest(request: NextRequest): string | null {
  // Try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || '') as any
      return decoded.userId
    } catch {}
  }

  // Try cookie
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=')
        return [key, v.join('=')]
      })
    )
    const token = cookies.auth_token
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || '') as any
        return decoded.userId
      } catch {}
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    const { videoId, userId, reactionType = 'like' } = await request.json()

    if (!videoId || !userId) {
      return NextResponse.json({ error: 'Video ID and User ID required' }, { status: 400 })
    }

    await client.connect()

    // Check if already liked
    const existing = await client.query(
      `SELECT video_id FROM reactions WHERE video_id = $1 AND "userId" = $2 AND reaction_type = $3`,
      [videoId, userId, reactionType]
    )

    if (existing.rows.length > 0) {
      // Unlike - remove the reaction
      await client.query(
        `DELETE FROM reactions WHERE video_id = $1 AND "userId" = $2 AND reaction_type = $3`,
        [videoId, userId, reactionType]
      )
      await client.end()
      return NextResponse.json({ success: true, liked: false })
    } else {
      // Like - add the reaction
      await client.query(
        `INSERT INTO reactions (video_id, "userId", reaction_type)
         VALUES ($1, $2, $3)`,
        [videoId, userId, reactionType]
      )
      await client.end()
      return NextResponse.json({ success: true, liked: true })
    }
  } catch (error: any) {
    try { await client.end() } catch {}
    console.error('Error toggling reaction:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    const userId = searchParams.get('userId')
    const reactionType = searchParams.get('reactionType') || 'like'

    if (!videoId || !userId) {
      return NextResponse.json({ error: 'Video ID and User ID required' }, { status: 400 })
    }

    await client.connect()

    await client.query(
      `DELETE FROM reactions WHERE video_id = $1 AND "userId" = $2 AND reaction_type = $3`,
      [videoId, userId, reactionType]
    )

    await client.end()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    try { await client.end() } catch {}
    console.error('Error removing reaction:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    const { searchParams } = new URL(request.url)
    // Try query param first, then JWT token
    let userId = searchParams.get('userId') || getUserIdFromRequest(request)
    const videoId = searchParams.get('videoId')

    if (!userId) {
      return NextResponse.json({ success: true, likes: {}, reactions: [] })
    }

    await client.connect()

    if (videoId) {
      // Get reactions for specific video
      const result = await client.query(
        `SELECT reaction_type FROM reactions WHERE video_id = $1 AND "userId" = $2`,
        [videoId, userId]
      )
      await client.end()
      return NextResponse.json({ reactions: result.rows.map((r: any) => r.reaction_type) })
    }

    // Get all user's likes
    const result = await client.query(
      `SELECT video_id FROM reactions WHERE "userId" = $1`,
      [userId]
    )

    await client.end()

    // Return as object with video IDs as keys (for easy lookup)
    const likes: Record<number, boolean> = {}
    result.rows.forEach((row: any) => {
      likes[row.video_id] = true
    })

    return NextResponse.json({ success: true, likes })
  } catch (error: any) {
    try { await client.end() } catch {}
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
