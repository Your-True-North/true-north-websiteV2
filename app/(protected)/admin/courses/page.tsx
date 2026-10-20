'use client'

import { useEffect, useState } from 'react'
import { COURSES, COURSE_DAYS } from '../../../../lib/courses'

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

const blank = (day: number): Day => ({ day, title: '', body: '', video_id: null, pdf_url: null })

// Admin only (the API checks the role): edit each course day's title, text, video and worksheet link.
export default function AdminCoursesPage() {
  const [course, setCourse] = useState<string>(COURSES[0].slug)
  const [days, setDays] = useState<Day[]>([])
  const [videos, setVideos] = useState<VideoOption[]>([])
  const [selectedDay, setSelectedDay] = useState(1)
  const [form, setForm] = useState<Day>(blank(1))
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setStatus('')
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
  }, [course])

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
          <input id="day-title" className="kyn-input" value={form.title} maxLength={200}
            onChange={e => setForm({ ...form, title: e.target.value })} />
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
          <textarea id="day-body" className="kyn-input" rows={12} value={form.body} style={{ resize: 'vertical', lineHeight: 1.5 }}
            onChange={e => setForm({ ...form, body: e.target.value })} />
          <p className="kyn-secondary" style={{ margin: '8px 0 0' }}>One paragraph per line. Start a line with • for a bullet.</p>
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
