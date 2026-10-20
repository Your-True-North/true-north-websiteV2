import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getMemberId } from '../../../../lib/member'
import { COURSES, COURSE_DAYS } from '../../../../lib/courses'

// Admin only: read and edit course day content. The role is checked in the database.
async function requireAdmin(request: NextRequest) {
  const memberId = getMemberId(request)
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const result = await query('SELECT role FROM users WHERE id = $1', [memberId])
  if (result.rows[0]?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  return null
}

const isCourse = (slug: unknown): slug is string => COURSES.some(c => c.slug === slug)

// GET /api/admin/course-days?course=short-fuse → all 14 days, plus course videos to pick from
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const slug = new URL(request.url).searchParams.get('course')
  if (!isCourse(slug)) return NextResponse.json({ error: 'Unknown course' }, { status: 400 })

  const [days, videos] = await Promise.all([
    query('SELECT day, title, body, video_id, pdf_url, updated_at FROM course_days WHERE course = $1 ORDER BY day', [slug]),
    query(`SELECT id, title, "youtubeId" AS youtube_id, status FROM videos ORDER BY status, title`),
  ])
  return NextResponse.json({ days: days.rows, videos: videos.rows })
}

// PUT { course, day, title, body, video_id, pdf_url } → saves one day
export async function PUT(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const { course, day, title, body, video_id, pdf_url } = await request.json()
  const dayNum = parseInt(day)
  if (!isCourse(course) || !(dayNum >= 1 && dayNum <= COURSE_DAYS)) {
    return NextResponse.json({ error: 'Unknown course or day' }, { status: 400 })
  }

  const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  const result = await query(
    `INSERT INTO course_days (course, day, title, body, video_id, pdf_url, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (course, day) DO UPDATE SET
       title = EXCLUDED.title, body = EXCLUDED.body, video_id = EXCLUDED.video_id,
       pdf_url = EXCLUDED.pdf_url, updated_at = NOW()
     RETURNING day, title, body, video_id, pdf_url, updated_at`,
    [course, dayNum, clean(title, 200), clean(body, 20000), clean(video_id, 100) || null, clean(pdf_url, 1000) || null]
  )
  return NextResponse.json({ day: result.rows[0] })
}
