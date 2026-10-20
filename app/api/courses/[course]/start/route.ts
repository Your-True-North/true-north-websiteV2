import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getMemberId } from '../../../../../lib/member'
import { getCourse } from '../../../../../lib/courses'

// POST /api/courses/short-fuse/start → starts the course for him. Day 1 opens now,
// each later day 24 hours after the one before. Starting twice keeps the first date.
export async function POST(request: NextRequest, props: { params: Promise<{ course: string }> }) {
  const memberId = getMemberId(request)
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { course: slug } = await props.params
  if (!getCourse(slug)) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  try {
    await query(
      `INSERT INTO course_enrollments (user_id, course) VALUES ($1, $2)
       ON CONFLICT (user_id, course) DO NOTHING`,
      [memberId, slug]
    )
    const result = await query('SELECT started_at FROM course_enrollments WHERE user_id = $1 AND course = $2', [memberId, slug])
    return NextResponse.json({ startedAt: result.rows[0].started_at })
  } catch (error) {
    console.error('[Courses] start error:', error)
    return NextResponse.json({ error: 'Failed to start course' }, { status: 500 })
  }
}
