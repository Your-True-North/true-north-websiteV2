'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import TrackedYouTubePlayer from '../../../../../components/TrackedYouTubePlayer'
import { describeOpening } from '../../../../../../lib/session-time'

interface DayData {
  course: { slug: string; name: string }
  day: number
  title: string
  body: string
  pdfUrl: string | null
  video: { id: string; youtubeId: string } | null
  done: boolean
  next: { day: number; open: boolean; opensAt: string } | null
}

interface Locked {
  locked: true
  started: boolean
  opensAt: string | null
}

export default function CourseDayPage() {
  const params = useParams()
  const slug = params.course as string
  const day = params.day as string
  const [data, setData] = useState<DayData | null>(null)
  const [locked, setLocked] = useState<Locked | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setData(null)
    setLocked(null)
    fetch(`/api/courses/${slug}/day/${day}`)
      .then(async res => {
        const json = await res.json()
        if (res.status === 403 && json.locked) setLocked(json)
        else if (!res.ok) setNotFound(true)
        else setData(json)
      })
      .catch(() => setNotFound(true))
  }, [slug, day])

  const markDone = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/courses/${slug}/day/${day}/done`, { method: 'POST' })
      if (!res.ok) throw new Error('save failed')
      setData(d => (d ? { ...d, done: true } : d))
    } catch {
      setError("That didn't save. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const backLink = (
    <Link href={`/courses?course=${slug}`} className="kyn-link-btn" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', gap: '4px' }}>
      <svg className="kyn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 6 9 12 15 18" />
      </svg>
      All days
    </Link>
  )

  if (notFound) {
    return (
      <div className="kyn-stack">
        {backLink}
        <p className="kyn-secondary">This day isn&apos;t available.</p>
      </div>
    )
  }

  if (locked) {
    return (
      <div className="kyn-stack">
        {backLink}
        <section className="kyn-card">
          <div className="kyn-label" style={{ marginBottom: '12px' }}>Day {day}</div>
          <p style={{ fontSize: '16px', margin: 0, lineHeight: 1.55 }}>
            {locked.started && locked.opensAt
              ? `This day opens ${describeOpening(locked.opensAt)}.`
              : 'Start the course first. Day 1 opens straight away.'}
          </p>
        </section>
      </div>
    )
  }

  if (!data) return <p className="kyn-secondary">Loading...</p>

  // The text keeps its own line breaks; lines starting with a bullet sit together as a list
  const paragraphs = data.body.split('\n').map(l => l.trim()).filter(Boolean)

  return (
    <div className="kyn-stack" style={{ paddingBottom: '24px' }}>
      <div>
        {backLink}
        <div className="kyn-label" style={{ margin: '24px 0 12px' }}>{data.course.name} · Day {data.day}</div>
        <h1 className="kyn-title">{data.title || `Day ${data.day}`}</h1>
      </div>

      {data.video && (
        <TrackedYouTubePlayer videoId={data.video.id} youtubeId={data.video.youtubeId} />
      )}

      {(paragraphs.length > 0 || data.pdfUrl) && (
        <section>
          {paragraphs.map((p, i) =>
            p.startsWith('•') ? (
              <p key={i} style={{ fontSize: '16px', lineHeight: 1.55, margin: '0 0 8px', paddingLeft: '20px', textIndent: '-14px' }}>{p}</p>
            ) : (
              <p key={i} style={{ fontSize: '16px', lineHeight: 1.55, margin: '0 0 16px' }}>{p}</p>
            )
          )}
          {data.pdfUrl && (
            <a href={data.pdfUrl} target="_blank" rel="noopener noreferrer" className="kyn-btn kyn-btn-secondary" style={{ marginTop: '8px' }}>
              Open the worksheet
            </a>
          )}
        </section>
      )}

      <section>
        {data.done ? (
          <div className="kyn-btn kyn-btn-secondary kyn-btn-block" aria-live="polite" style={{ cursor: 'default' }}>
            <svg className="kyn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--kyn-label)' }}>
              <polyline points="5 12.5 10 17.5 19 7" />
            </svg>
            Day {data.day} done
          </div>
        ) : (
          <button onClick={markDone} disabled={saving} className="kyn-btn kyn-btn-main kyn-btn-block">
            {saving ? 'Saving...' : 'Mark day done'}
          </button>
        )}
        {error && <p style={{ fontSize: '15px', margin: '12px 0 0' }}>{error}</p>}

        {data.next && (
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--kyn-border)', paddingTop: '16px' }}>
            {data.next.open ? (
              <Link href={`/courses/${slug}/day/${data.next.day}`} className="kyn-row kyn-row-link" style={{ justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: '16px' }}>Next: Day {data.next.day}</span>
                <svg className="kyn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </Link>
            ) : (
              <p className="kyn-secondary" style={{ margin: 0 }}>
                Day {data.next.day} opens {describeOpening(data.next.opensAt)}.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
