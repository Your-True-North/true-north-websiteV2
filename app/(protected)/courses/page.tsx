'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { enabledCourses } from '../../../lib/courses'
import { describeOpening } from '../../../lib/session-time'

interface CourseDay {
  day: number
  title: string
  open: boolean
  opensAt: string | null
  done: boolean
}

interface CourseData {
  course: { slug: string; name: string; description: string }
  startedAt: string | null
  days: CourseDay[]
}

const Tick = () => (
  <svg className="kyn-icon" aria-label="Done" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--kyn-label)' }}>
    <polyline points="5 12.5 10 17.5 19 7" />
  </svg>
)

const Lock = () => (
  <svg className="kyn-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--kyn-ink2)' }}>
    <rect x="5" y="11" width="14" height="10" rx="1" /><path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
)

export default function CoursesPage() {
  const courses = enabledCourses()
  const [selected, setSelected] = useState<string>(courses[0]?.slug || '')
  const [data, setData] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  // ?course=space picks the tab, so a day page can link back to its course
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('course')
    if (fromUrl && courses.some(c => c.slug === fromUrl)) setSelected(fromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    setError('')
    fetch(`/api/courses/${selected}`)
      .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(setData)
      .catch(() => setError("The course didn't load. Try again in a minute."))
      .finally(() => setLoading(false))
  }, [selected])

  const startCourse = async () => {
    setStarting(true)
    setError('')
    try {
      const res = await fetch(`/api/courses/${selected}/start`, { method: 'POST' })
      if (!res.ok) throw new Error('start failed')
      const again = await fetch(`/api/courses/${selected}`)
      setData(await again.json())
    } catch {
      setError("That didn't start. Try again in a minute.")
    } finally {
      setStarting(false)
    }
  }

  const course = courses.find(c => c.slug === selected)

  return (
    <div className="kyn-stack" style={{ paddingBottom: '24px' }}>
      <header>
        <h1 className="kyn-title">Courses</h1>

        {/* Sub tabs, only once there's more than one course */}
        {courses.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            {courses.map(c => {
              const isActive = c.slug === selected
              return (
                <button
                  key={c.slug}
                  onClick={() => setSelected(c.slug)}
                  aria-pressed={isActive}
                  style={{
                    minHeight: '44px', padding: '0 16px', borderRadius: 'var(--kyn-r)', whiteSpace: 'nowrap',
                    border: `1px solid ${isActive ? 'var(--kyn-main-bg)' : 'var(--kyn-border)'}`,
                    background: isActive ? 'var(--kyn-main-bg)' : 'transparent',
                    color: isActive ? 'var(--kyn-main-text)' : 'var(--kyn-ink)',
                    fontSize: '15px', fontWeight: isActive ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'background-color 150ms ease, color 150ms ease, border-color 150ms ease'
                  }}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
        )}
      </header>

      {course && (
        <section>
          {courses.length === 1 && <h2 className="kyn-section-title">{course.name}</h2>}
          <p style={{ fontSize: '16px', lineHeight: 1.55, color: 'var(--kyn-ink2)', margin: 0 }}>
            {course.description}
          </p>

          {!loading && data && !data.startedAt && (
            <div style={{ marginTop: '24px' }}>
              <button onClick={startCourse} disabled={starting} className="kyn-btn kyn-btn-main kyn-btn-block">
                {starting ? 'Starting...' : `Start ${course.name}`}
              </button>
              <p className="kyn-secondary" style={{ margin: '12px 0 0', lineHeight: 1.5 }}>
                Day 1 opens straight away. A new day opens every 24 hours after that.
              </p>
            </div>
          )}

          {error && <p style={{ fontSize: '15px', margin: '16px 0 0' }}>{error}</p>}

          {loading ? (
            <p className="kyn-secondary" style={{ marginTop: '24px' }}>Loading...</p>
          ) : data && (
            <div className="kyn-rows" style={{ marginTop: '24px', borderTop: '1px solid var(--kyn-border)', borderBottom: '1px solid var(--kyn-border)' }}>
              {data.days.map(d => {
                const inner = (
                  <>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="kyn-label" style={{ marginBottom: '4px' }}>Day {d.day}</div>
                      <div style={{ fontSize: '16px', lineHeight: 1.35, color: d.open ? 'var(--kyn-ink)' : 'var(--kyn-ink2)' }}>
                        {d.title || 'Coming soon'}
                      </div>
                      {!d.open && d.opensAt && (
                        <div className="kyn-secondary" style={{ marginTop: '4px' }}>Opens {describeOpening(d.opensAt)}</div>
                      )}
                    </div>
                    {d.done ? <Tick /> : !d.open ? <Lock /> : null}
                  </>
                )
                return d.open ? (
                  <Link key={d.day} href={`/courses/${data.course.slug}/day/${d.day}`} className="kyn-row kyn-row-link" style={{ minHeight: '72px' }}>
                    {inner}
                  </Link>
                ) : (
                  <div key={d.day} className="kyn-row" style={{ minHeight: '72px' }}>{inner}</div>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
