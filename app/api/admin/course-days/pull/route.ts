import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { getMemberId } from '../../../../../lib/member'
import { COURSE_DAYS } from '../../../../../lib/courses'
import { COURSE_SEQUENCES, fetchSequenceEmails, pullDays, changesFingerprint } from '../../../../../lib/convertkit-course'

// Admin only. POST { course } pulls the course's ConvertKit sequence and returns a
// preview of what would change. POST { course, save: true, fingerprint } pulls
// again and saves, but only if it still matches the preview. Saving backs up
// each day's current text first and changes title and text only.
export async function POST(request: NextRequest) {
  const memberId = getMemberId(request)
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const admin = await query('SELECT role FROM users WHERE id = $1', [memberId])
  if (admin.rows[0]?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { course, save, fingerprint } = await request.json().catch(() => ({}))
  const sequence = typeof course === 'string' ? COURSE_SEQUENCES[course] : undefined
  if (!sequence) return NextResponse.json({ error: 'Unknown course' }, { status: 400 })

  let pull
  try {
    pull = pullDays(await fetchSequenceEmails(sequence.id))
  } catch (err: any) {
    console.error('[course pull] ConvertKit:', err.message)
    return NextResponse.json({ error: "Couldn't read the sequence from ConvertKit." }, { status: 502 })
  }

  const current = await query('SELECT day, title, body FROM course_days WHERE course = $1', [course])
  const byDay = new Map<number, { title: string; body: string }>(current.rows.map((r: any) => [r.day, r]))

  const changes = pull.days
    .filter(d => byDay.get(d.day)?.title !== d.title || byDay.get(d.day)?.body !== d.body)
    .map(d => ({
      day: d.day,
      title: d.title,
      body: d.body,
      subject: d.subject,
      oldTitle: byDay.get(d.day)?.title ?? null,
      oldBody: byDay.get(d.day)?.body ?? null,
    }))
  const unchanged = pull.days.filter(d => !changes.some(c => c.day === d.day)).map(d => d.day)
  const print = changesFingerprint(changes)

  // Days with text once this is saved, so we know when every day is filled
  const filled = Array.from({ length: COURSE_DAYS }, (_, i) => i + 1).filter(day => {
    const change = changes.find(c => c.day === day)
    return (change ? change.body : byDay.get(day)?.body || '').trim() !== ''
  }).length

  const preview = {
    sequence: sequence.name,
    changes,
    unchanged,
    missing: pull.missing,
    duplicates: pull.duplicates,
    filled,
    fingerprint: print,
  }
  if (!save) return NextResponse.json(preview)

  if (fingerprint !== print) {
    return NextResponse.json({ error: 'ConvertKit or the course changed since the preview. Pull again.', ...preview }, { status: 409 })
  }
  if (changes.length === 0) return NextResponse.json({ saved: [] })

  const client = await getClient()
  try {
    await client.query('BEGIN')
    const days = changes.map(c => c.day)
    await client.query(
      `INSERT INTO course_day_backups (course, day, title, body, video_id, pdf_url, was_updated_at, backed_up_by)
       SELECT course, day, title, body, video_id, pdf_url, updated_at, $3
       FROM course_days WHERE course = $1 AND day = ANY($2::int[])`,
      [course, days, memberId]
    )
    for (const c of changes) {
      await client.query(
        `INSERT INTO course_days (course, day, title, body, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (course, day) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body, updated_at = NOW()`,
        [course, c.day, c.title, c.body]
      )
    }
    await client.query('COMMIT')
    return NextResponse.json({ saved: days })
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[course pull] save:', err.message)
    return NextResponse.json({ error: "That didn't save. Nothing was changed." }, { status: 500 })
  } finally {
    client.release()
  }
}
