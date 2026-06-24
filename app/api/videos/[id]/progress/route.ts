import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const videoId = params.id
    const { userId, completed, watch_time } = await request.json()
    const watchTime = typeof watch_time === 'number' ? Math.round(watch_time) : 0

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    await query(`
      INSERT INTO user_video_progress (user_id, video_id, completed, last_watched, completion_date, watch_time)
      VALUES ($1, $2, $3, NOW(), CASE WHEN $3 = true THEN NOW() ELSE NULL END, $4)
      ON CONFLICT (user_id, video_id) DO UPDATE
      SET completed = CASE WHEN $3 = true THEN true ELSE user_video_progress.completed END,
          last_watched = NOW(),
          completion_date = CASE WHEN $3 = true AND user_video_progress.completion_date IS NULL THEN NOW() ELSE user_video_progress.completion_date END,
          watch_time = GREATEST($4, user_video_progress.watch_time)
    `, [userId, videoId, completed, watchTime])

    return NextResponse.json({ success: true, progress: { completed } })

  } catch (error) {
    console.error('[Progress] Error:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const userId = request.headers.get('x-user-id')

    if (!userId) return NextResponse.json({ progress: null })

    const result = await query(
      'SELECT completed FROM user_video_progress WHERE user_id = $1 AND video_id = $2',
      [userId, params.id]
    )
    return NextResponse.json({ progress: result.rows[0] || null })

  } catch (error) {
    console.error('[Progress] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}
