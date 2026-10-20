import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getMemberId } from '../../../../../../lib/member'
import { getCourse, COURSE_DAYS, dayOpensAt, isDayOpen } from '../../../../../../lib/courses'

// GET /api/courses/short-fuse/day/3 → that day's content, only once it has opened for him
export async function GET(request: NextRequest, props: { params: Promise<{ course: string; day: string }> }) {
  const memberId = getMemberId(request)
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { course: slug, day: dayParam } = await props.params
  const course = getCourse(slug)
  const day = parseInt(dayParam)
  if (!course || !(day >= 1 && day <= COURSE_DAYS)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const enrollment = await query('SELECT started_at FROM course_enrollments WHERE user_id = $1 AND course = $2', [memberId, slug])
    const startedAt: Date | null = enrollment.rows[0]?.started_at ? new Date(enrollment.rows[0].started_at) : null

    if (!isDayOpen(startedAt, day)) {
      return NextResponse.json({
        locked: true,
        started: !!startedAt,
        opensAt: startedAt ? dayOpensAt(startedAt, day) : null,
      }, { status: 403 })
    }

    const [content, progress] = await Promise.all([
      query(
        `SELECT d.title, d.body, d.pdf_url, d.video_id, v."youtubeId" AS youtube_id
         FROM course_days d LEFT JOIN videos v ON v.id = d.video_id
         WHERE d.course = $1 AND d.day = $2`,
        [slug, day]
      ),
      query('SELECT 1 FROM course_progress WHERE user_id = $1 AND course = $2 AND day = $3', [memberId, slug, day]),
    ])
    const row = content.rows[0] || {}
    const next = day < COURSE_DAYS ? day + 1 : null

    return NextResponse.json({
      course: { slug: course.slug, name: course.name },
      day,
      title: row.title || '',
      body: row.body || '',
      pdfUrl: row.pdf_url || null,
      video: row.video_id && row.youtube_id ? { id: row.video_id, youtubeId: row.youtube_id } : null,
      done: progress.rows.length > 0,
      next: next ? { day: next, open: isDayOpen(startedAt, next), opensAt: dayOpensAt(startedAt as Date, next) } : null,
    })
  } catch (error) {
    console.error('[Courses] day GET error:', error)
    return NextResponse.json({ error: 'Failed to load day' }, { status: 500 })
  }
}
