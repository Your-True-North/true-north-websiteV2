import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getMemberId } from '../../../../../../../lib/member'
import { getCourse, COURSE_DAYS, isDayOpen } from '../../../../../../../lib/courses'

// POST /api/courses/short-fuse/day/3/done → ticks the day off for him
export async function POST(request: NextRequest, props: { params: Promise<{ course: string; day: string }> }) {
  const memberId = getMemberId(request)
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { course: slug, day: dayParam } = await props.params
  const day = parseInt(dayParam)
  if (!getCourse(slug) || !(day >= 1 && day <= COURSE_DAYS)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const enrollment = await query('SELECT started_at FROM course_enrollments WHERE user_id = $1 AND course = $2', [memberId, slug])
    const startedAt = enrollment.rows[0]?.started_at ? new Date(enrollment.rows[0].started_at) : null
    if (!isDayOpen(startedAt, day)) {
      return NextResponse.json({ error: 'This day has not opened yet' }, { status: 403 })
    }

    await query(
      `INSERT INTO course_progress (user_id, course, day) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, course, day) DO NOTHING`,
      [memberId, slug, day]
    )
    return NextResponse.json({ done: true })
  } catch (error) {
    console.error('[Courses] done error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
