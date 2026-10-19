import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Join links only go to logged in members. The public /circle teaser and the
  // calendar webhook use the title, date and description only.
  const member = getAuthUser(request)

  try {
    // A session stays listed until it ends (start plus duration, 60 minutes if not set)
    const result = await query(
      `SELECT id, title, description, scheduled_date AT TIME ZONE 'UTC' AS scheduled_date, zoom_link, duration,
              theme_number, theme_name, week_number, session_type, delivery, camera_note
       FROM live_calls
       WHERE scheduled_date + make_interval(mins => COALESCE(duration, 60)) > NOW()
       ORDER BY scheduled_date ASC
       LIMIT 10`
    )

    const events = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      date: new Date(row.scheduled_date).toISOString(),
      description: row.description || '',
      join_url: member ? row.zoom_link : undefined,
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
