import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId, reactionType } = await request.json()
    
    const result = await query(
      `INSERT INTO reactions (video_id, "userId", reaction_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (video_id, "userId", reaction_type) DO NOTHING
       RETURNING id`,
      [videoId, session.user.id, reactionType]
    )

    return NextResponse.json({ success: true, added: result.rows.length > 0 })
  } catch (error: any) {
    console.error('Error adding reaction:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    const reactionType = searchParams.get('reactionType')

    await query(
      `DELETE FROM reactions WHERE video_id = $1 AND "userId" = $2 AND reaction_type = $3`,
      [videoId, session.user.id, reactionType]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing reaction:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ reactions: [] })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (videoId) {
      const result = await query(
        `SELECT reaction_type FROM reactions WHERE video_id = $1 AND "userId" = $2`,
        [videoId, session.user.id]
      )
      return NextResponse.json({ reactions: result.rows.map(r => r.reaction_type) })
    }

    const result = await query(
      `SELECT video_id, reaction_type FROM reactions WHERE "userId" = $1`,
      [session.user.id]
    )
    return NextResponse.json({ reactions: result.rows })
  } catch (error: any) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
