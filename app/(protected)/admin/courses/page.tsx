'use client'

import { useEffect, useState } from 'react'
import { COURSES, COURSE_DAYS } from '../../../../lib/courses'
import CourseDayText from '../../../components/CourseDayText'

interface Day {
  day: number
  title: string
  body: string
  video_id: string | null
  pdf_url: string | null
}

interface VideoOption {
  id: string
  title: string
  status: string
}

interface PullPreview {
  sequence: string
  changes: { day: number; title: string; body: string; subject: string; oldTitle: string | null; oldBody: string | null }[]
  unchanged: number[]
  missing: number[]
  duplicates: { day: number; subjects: string[] }[]
  filled: number
  fingerprint: string
}

const blank = (day: number): Day => ({ day, title: '', body: '', video_id: null, pdf_url: null })
const listDays = (days: number[]) => days.length === 1 ? `Day ${days[0]}` : `Days ${days.slice(0, -1).join(', ')} and ${days[days.length - 1]}`

// Admin only (the API checks the role): edit each course day's title, text, video and worksheet link.
export default function AdminCoursesPage() {
  const [course, setCourse] = useState<string>(COURSES[0].slug)
  const [days, setDays] = useState<Day[]>([])
  const [videos, setVideos] = useState<VideoOption[]>([])
  const [selectedDay, setSelectedDay] = useState(1)
  const [form, setForm] = useState<Day>(blank(1))
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<PullPreview | null>(null)
  const [pulling, setPulling] = useState(false)
  const [pullStatus, setPullStatus] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    setStatus('')
    setPreview(null)
    setPullStatus('')
    fetch(`/api/admin/course-days?course=${course}`)
      .then(async res => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Admin access required.' : 'Could not load.')
        return res.json()
      })
      .then(data => {
        setDays(data.days)
        setVideos(data.videos)
      })
      .catch(err => setStatus(err.message))
  }, [course, reload])

  // Pull from ConvertKit: first a preview, then Save applies exactly that preview.
  const pull = async (savePreview?: PullPreview) => {
    setPulling(true)
    setPullStatus('')
    try {
      const res = await fetch('/api/admin/course-days/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePreview ? { course, save: true, fingerprint: savePreview.fingerprint } : { course }),
      })
      const data = await res.json()
      if (res.status === 409) { setPreview(data); throw new Error(data.error) }
      if (!res.ok) throw new Error(data.error || "That didn't work. Try again.")
      if (savePreview) {
        setPreview(null)
        setPullStatus(data.saved.length ? `${listDays(data.saved)} saved. The old text is backed up.` : 'Nothing to save.')
        setReload(n => n + 1)
      } else {
        setPreview(data)
      }
    } catch (err: any) {
      setPullStatus(err.message)
    } finally {
      setPulling(false)
    }
  }

  useEffect(() => {
    setForm(days.find(d => d.day === selectedDay) || blank(selectedDay))
  }, [days, selectedDay])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus('')
    try {
      const res = await fetch('/api/admin/course-days', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, ...form }),
      })
      if (!res.ok) throw new Error()
      const { day } = await res.json()
      setDays(prev => [...prev.filter(d => d.day !== day.day), day].sort((a, b) => a.day - b.day))
      setStatus(`Day ${day.day} saved.`)
    } catch {
      setStatus("That didn't save. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const courseVideos = videos.filter(v => v.status === 'course')
  const otherVideos = videos.filter(v => v.status !== 'course')

  return (
    <div className="kyn-stack" style={{ paddingBottom: '24px' }}>
      <header>
        <h1 className="kyn-title">Edit courses</h1>
        <p className="kyn-secondary" style={{ margin: '12px 0 0' }}>Changes show to members straight away.</p>
      </header>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {COURSES.map(c => (
          <button
            key={c.slug}
            onClick={() => { setCourse(c.slug); setSelectedDay(1) }}
            aria-pressed={course === c.slug}
            className={course === c.slug ? 'kyn-btn kyn-btn-main' : 'kyn-btn kyn-btn-secondary'}
          >
            {c.name}{c.enabled ? '' : ' (hidden)'}
          </button>
        ))}
      </div>

      <section className="kyn-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 className="kyn-section-title" style={{ margin: 0 }}>Pull from ConvertKit</h2>
          <p className="kyn-secondary" style={{ margin: '8px 0 0' }}>
            Titles and text come from the sequence emails with subjects starting &quot;Day 1:&quot; to &quot;Day 14:&quot;. You see what changes before anything is saved.
          </p>
        </div>
        {!preview && (
          <button onClick={() => pull()} disabled={pulling} className="kyn-btn kyn-btn-secondary kyn-btn-block">
            {pulling ? 'Pulling...' : 'Pull from ConvertKit'}
          </button>
        )}

        {preview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p className="kyn-label" style={{ margin: 0 }}>From &quot;{preview.sequence}&quot;</p>

            {preview.missing.length > 0 && (
              <p style={{ margin: 0 }}>
                No &quot;Day N:&quot; email for {listDays(preview.missing)}. {preview.missing.length === 1 ? 'That day stays' : 'Those days stay'} as {preview.missing.length === 1 ? 'it is' : 'they are'}.
              </p>
            )}
            {preview.duplicates.map(d => (
              <p key={d.day} style={{ margin: 0 }}>
                More than one email for Day {d.day} ({d.subjects.map(s => `"${s}"`).join(', ')}). Day {d.day} stays as it is.
              </p>
            ))}
            {preview.unchanged.length > 0 && (
              <p className="kyn-secondary" style={{ margin: 0 }}>No change: {listDays(preview.unchanged)}.</p>
            )}

            {preview.changes.length === 0 ? (
              <p style={{ margin: 0 }}>Nothing has changed.</p>
            ) : (
              <div className="kyn-rows">
                {preview.changes.map(c => (
                  <div key={c.day} className="kyn-row" style={{ display: 'block' }}>
                    <p className="kyn-label" style={{ margin: 0 }}>Day {c.day}{c.oldTitle === null ? ' (new)' : ''}</p>
                    <p className="kyn-session-title" style={{ margin: '8px 0 0' }}>{c.title}</p>
                    {c.oldTitle !== null && c.oldTitle !== c.title && (
                      <p className="kyn-secondary" style={{ margin: '4px 0 0' }}>Was: {c.oldTitle || '(empty)'}</p>
                    )}
                    <div style={{ marginTop: '12px' }}>
                      {c.body ? <CourseDayText body={c.body} title={c.title} /> : <p style={{ margin: 0 }}>(no text)</p>}
                    </div>
                    {c.oldBody !== null && c.oldBody !== c.body && (
                      <details style={{ marginTop: '12px' }}>
                        <summary className="kyn-secondary" style={{ cursor: 'pointer' }}>Current text</summary>
                        <p className="kyn-secondary" style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{c.oldBody || '(empty)'}</p>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {preview.changes.length > 0 && (
                <button onClick={() => pull(preview)} disabled={pulling} className="kyn-btn kyn-btn-main">
                  {pulling ? 'Saving...' : `Save ${preview.changes.length} ${preview.changes.length === 1 ? 'day' : 'days'}`}
                </button>
              )}
              <button onClick={() => { setPreview(null); setPullStatus('') }} disabled={pulling} className="kyn-btn kyn-btn-secondary">
                {preview.changes.length > 0 ? 'Cancel' : 'Close'}
              </button>
            </div>
          </div>
        )}
        {pullStatus && <p className="kyn-label" style={{ margin: 0 }}>{pullStatus}</p>}
      </section>

      <div>
        <label htmlFor="course-day" className="kyn-label" style={{ display: 'block', marginBottom: '8px' }}>Day</label>
        <select
          id="course-day"
          className="kyn-input"
          value={selectedDay}
          onChange={e => setSelectedDay(parseInt(e.target.value))}
        >
          {Array.from({ length: COURSE_DAYS }, (_, i) => i + 1).map(n => {
            const d = days.find(x => x.day === n)
            return <option key={n} value={n}>Day {n}{d?.title ? `: ${d.title}` : ' (empty)'}</option>
          })}
        </select>
      </div>

      <form onSubmit={save} className="kyn-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="day-title" className="kyn-label" style={{ display: 'block', marginBottom: '8px' }}>Title</label>
          <input id="day-title" className="kyn-input" value={form.title} readOnly />
        </div>
        <div>
          <label htmlFor="day-video" className="kyn-label" style={{ display: 'block', marginBottom: '8px' }}>Video</label>
          <select id="day-video" className="kyn-input" value={form.video_id || ''}
            onChange={e => setForm({ ...form, video_id: e.target.value || null })}>
            <option value="">No video</option>
            <optgroup label="Course videos">
              {courseVideos.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            </optgroup>
            <optgroup label="Library videos">
              {otherVideos.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <label htmlFor="day-body" className="kyn-label" style={{ display: 'block', marginBottom: '8px' }}>Text</label>
          <textarea id="day-body" className="kyn-input" rows={12} value={form.body} readOnly style={{ resize: 'vertical', lineHeight: 1.5 }} />
          <p className="kyn-secondary" style={{ margin: '8px 0 0' }}>Title and text come from ConvertKit. Edit the email, then Pull from ConvertKit.</p>
        </div>
        <div>
          <label htmlFor="day-pdf" className="kyn-label" style={{ display: 'block', marginBottom: '8px' }}>Worksheet link (optional)</label>
          <input id="day-pdf" className="kyn-input" type="url" value={form.pdf_url || ''} placeholder="https://"
            onChange={e => setForm({ ...form, pdf_url: e.target.value || null })} />
        </div>
        <button type="submit" disabled={saving} className="kyn-btn kyn-btn-main kyn-btn-block">
          {saving ? 'Saving...' : `Save Day ${selectedDay}`}
        </button>
        {status && <p className="kyn-label" style={{ margin: 0 }}>{status}</p>}
      </form>
    </div>
  )
}
