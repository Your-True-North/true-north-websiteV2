import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getMemberId } from '../../../../lib/member'
import { getCourse, COURSE_DAYS, dayOpensAt, isDayOpen } from '../../../../lib/courses'

// GET /api/courses/short-fuse → when he started, and each day's title, open time and tick
export async function GET(request: NextRequest, props: { params: Promise<{ course: string }> }) {
  const memberId = getMemberId(request)
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { course: slug } = await props.params
  const course = getCourse(slug)
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  try {
    const [enrollment, days, progress] = await Promise.all([
      query('SELECT started_at FROM course_enrollments WHERE user_id = $1 AND course = $2', [memberId, slug]),
      query('SELECT day, title FROM course_days WHERE course = $1 ORDER BY day', [slug]),
      query('SELECT day FROM course_progress WHERE user_id = $1 AND course = $2', [memberId, slug]),
    ])
    const startedAt: Date | null = enrollment.rows[0]?.started_at ? new Date(enrollment.rows[0].started_at) : null
    const titles = new Map(days.rows.map((r: any) => [r.day, r.title]))
    const done = new Set(progress.rows.map((r: any) => r.day))

    return NextResponse.json({
      course: { slug: course.slug, name: course.name, description: course.description },
      startedAt,
      days: Array.from({ length: COURSE_DAYS }, (_, i) => {
        const day = i + 1
        return {
          day,
          title: titles.get(day) || '',
          open: isDayOpen(startedAt, day),
          opensAt: startedAt ? dayOpensAt(startedAt, day) : null,
          done: done.has(day),
        }
      }),
    })
  } catch (error) {
    console.error('[Courses] GET error:', error)
    return NextResponse.json({ error: 'Failed to load course' }, { status: 500 })
  }
}
