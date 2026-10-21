import type { Metadata } from 'next'
import Link from 'next/link'
import { query } from '@/lib/db'
import CourseDayText from '../../components/CourseDayText'

export const metadata: Metadata = {
  title: 'Short Fuse | 14 days with True North',
  description: 'A 14 day course to help you release anger without guilt, shame or bottling it up. Five minutes a day to shift how you respond.',
}

// Reads the course straight from the database, so a Pull from ConvertKit shows here once saved
export const dynamic = 'force-dynamic'

// Same palette and type as the other marketing pages (see map)
const C = {
  dark: '#13140f',
  darkText: '#f0ebe0',
  darkMuted: '#9a9a8c',
  cream: '#f7f3ec',
  ink: '#1a1a16',
  body: '#3a3a34',
  sage: '#8aaa96',
  sageMid: '#6b9079',
  border: '#ddd7cc',
}
const serif = '"Gambarino", Georgia, serif'
const sans = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'

interface Day {
  day: number
  title: string
  body: string
  pdf_url: string | null
  youtube_id: string | null
}

// Public version of the members' Short Fuse course: all 14 days open, no login.
export default async function ShortFusePage() {
  const result = await query(
    `SELECT d.day, d.title, d.body, d.pdf_url, v."youtubeId" AS youtube_id
     FROM course_days d LEFT JOIN videos v ON v.id = d.video_id
     WHERE d.course = 'short-fuse' ORDER BY d.day`
  )
  const days: Day[] = result.rows

  return (
    <div style={{ fontFamily: sans }}>
      <section style={{ background: C.dark, padding: 'clamp(112px, 14vw, 160px) 24px clamp(64px, 10vw, 112px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3.5px', textTransform: 'uppercase', color: C.sage, margin: '0 0 20px' }}>
            Short Fuse · 14 days
          </p>
          <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(40px, 8vw, 68px)', lineHeight: 1.05, color: C.darkText, margin: '0 0 28px' }}>
            Short Fuse
          </h1>
          <p style={{ fontSize: '17px', lineHeight: 1.7, color: C.darkMuted, margin: 0 }}>
            A 14 day course to help you release anger without guilt, shame or bottling it up. Five minutes a day to shift how you respond.
          </p>
        </div>
      </section>

      <style>{`
        .sf-summary::-webkit-details-marker { display: none; }
        .sf-sign::before { content: '+'; }
        details[open] > .sf-summary .sf-sign::before { content: '\\2212'; }
      `}</style>
      <section style={{ background: C.cream, padding: 'clamp(40px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {days.map(d => (
            <details key={d.day} open={d.day === 1} style={{ borderTop: `1px solid ${C.border}`, padding: '20px 0' }}>
              <summary className="sf-summary" style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <span>
                  <span style={{ display: 'block', fontSize: '13px', color: C.sageMid, marginBottom: '6px' }}>Day {d.day}</span>
                  <span style={{ fontFamily: serif, fontSize: '24px', lineHeight: 1.2, color: C.ink }}>{d.title || `Day ${d.day}`}</span>
                </span>
                <span className="sf-sign" aria-hidden="true" style={{ fontSize: '24px', lineHeight: 1, color: C.sageMid, marginTop: '22px' }} />
              </summary>
              <div style={{ marginTop: '20px', color: C.body }}>
                {d.youtube_id && (
                  <div style={{ position: 'relative', paddingTop: '56.25%', background: '#dcd4c5', borderRadius: '2px', overflow: 'hidden', marginBottom: '24px' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${d.youtube_id}?rel=0&modestbranding=1&playsinline=1`}
                      title={`Short Fuse Day ${d.day}: ${d.title}`}
                      loading="lazy"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
                <CourseDayText body={d.body} title={d.title} />
                {d.pdf_url && (
                  <a href={d.pdf_url} target="_blank" rel="noopener noreferrer" style={{ color: C.sageMid, fontSize: '16px' }}>
                    Open the worksheet
                  </a>
                )}
              </div>
            </details>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}` }} />
        </div>
      </section>

      <section style={{ background: C.dark, padding: 'clamp(56px, 9vw, 96px) 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(30px, 5vw, 44px)', lineHeight: 1.15, color: C.darkText, margin: '0 0 20px' }}>
            Do this work with other men.
          </h2>
          <p style={{ fontSize: '17px', lineHeight: 1.7, color: C.darkMuted, margin: '0 0 32px' }}>
            KYN is for men carrying frustration, dissatisfaction, or a short fuse they&apos;re tired of. Weekly work, with other men. £25 a month.
          </p>
          <Link href="/anger" style={{ display: 'inline-block', background: C.sage, color: C.ink, padding: '16px 36px', borderRadius: '4px', fontWeight: 600, fontSize: '16px', textDecoration: 'none' }}>
            Find out about KYN
          </Link>
        </div>
      </section>
    </div>
  )
}
