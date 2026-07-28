import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, title, description, scheduled_date AT TIME ZONE 'UTC' AS scheduled_date, zoom_link, duration,
              theme_number, theme_name, week_number, session_type, delivery, camera_note
       FROM live_calls
       WHERE scheduled_date >= NOW()
       ORDER BY scheduled_date ASC
       LIMIT 10`
    )

    const events = result.rows.map((row: any) => ({
      title: row.title,
      date: new Date(row.scheduled_date).toISOString(),
      description: row.description || '',
      join_url: row.zoom_link,
      duration_minutes: row.duration,
      theme_number: row.theme_number,
      theme_name: row.theme_name,
      week_number: row.week_number,
      session_type: row.session_type,
      delivery: row.delivery,
      camera_note: row.camera_note,
    }))

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Calendar events error:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}
