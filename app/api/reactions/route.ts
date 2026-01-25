import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'
import jwt from 'jsonwebtoken'

const DATABASE_URL = 'postgresql://postgres:HzWkEmYnKjZtevzZTGrHZMbvNcEpFNVV@yamabiko.proxy.rlwy.net:39135/railway'

function getAuthUser(request: NextRequest) {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || '') as any
      return decoded
    } catch (error) {
      // Token invalid
    }
  }

  // Try to get token from cookie
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
        return decoded
      } catch (error) {
        // Token invalid
      }
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    const user = getAuthUser(request)
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId, reactionType } = await request.json()

    await client.connect()

    const result = await client.query(
      `INSERT INTO reactions (video_id, "userId", reaction_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (video_id, "userId", reaction_type) DO NOTHING
       RETURNING video_id`,
      [videoId, user.userId, reactionType]
    )

    await client.end()

    return NextResponse.json({ success: true, added: result.rows.length > 0 })
  } catch (error: any) {
    try { await client.end() } catch {}
    console.error('Error adding reaction:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    const user = getAuthUser(request)
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    const reactionType = searchParams.get('reactionType')

    await client.connect()

    await client.query(
      `DELETE FROM reactions WHERE video_id = $1 AND "userId" = $2 AND reaction_type = $3`,
      [videoId, user.userId, reactionType]
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
    const user = getAuthUser(request)
    if (!user?.userId) {
      return NextResponse.json({ reactions: [] })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    await client.connect()

    if (videoId) {
      const result = await client.query(
        `SELECT reaction_type FROM reactions WHERE video_id = $1 AND "userId" = $2`,
        [videoId, user.userId]
      )
      await client.end()
      return NextResponse.json({ reactions: result.rows.map((r: any) => r.reaction_type) })
    }

    const result = await client.query(
      `SELECT video_id, reaction_type FROM reactions WHERE "userId" = $1`,
      [user.userId]
    )

    await client.end()

    return NextResponse.json({ reactions: result.rows })
  } catch (error: any) {
    try { await client.end() } catch {}
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
