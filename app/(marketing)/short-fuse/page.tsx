import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Archivo } from 'next/font/google'
import { query } from '@/lib/db'
import CourseDayText from '../../components/CourseDayText'
import { dayForKey, SHORT_FUSE_COOKIE } from '../../../lib/shortfuse-days'
import SaveKey from './SaveKey'
import s from '../../shortfuse/shortfuse.module.css'
import c from './course.module.css'

export const metadata: Metadata = {
  title: 'Short Fuse | 14 days with True North',
  description: 'A 14 day course to help you release anger without guilt, shame or bottling it up. Five minutes a day to shift how you respond.',
}

// Reads the course straight from the database, so a Pull from ConvertKit shows here once saved
export const dynamic = 'force-dynamic'

// Same typeface as the sign-up page (/shortfuse)
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' })

interface Day {
  day: number
  title: string
  body: string
  pdf_url: string | null
  youtube_id: string | null
}

// Used when the database can't be read, so the page never crashes.
// Titles and videos are the ones in the Day emails in Kit.
const FALLBACK_DAYS: [string, string][] = [
  ['Acknowledge Your Anger', 'zgzAaGmFInA'],
  ['Understand the Role of Anger', 'c7XiJWWGdeI'],
  ['Observe Without Judgement', '9-haOwvD9Zg'],
  ['Identify Patterns and Triggers', 'q5vs3ygGRs4'],
  ['Separate Anger from Action', '66IQ6csoxl4'],
  ['Reflect on the Impact of Anger', 'KPsTW6bYq40'],
  ['Ground Yourself in the Moment', 'sqlUHCpml-M'],
  ['Set Boundaries for Emotional Wellbeing', 'MtyzjoAfGG4'],
  ['Build Emotional Awareness', 'LcKyjjsRdj4'],
  ['Practice Self-Compassion', 'fQrbFRaKy5Q'],
  ['Release Stored Anger Safely', '__6jSaByaAk'],
  ['Forgive Yourself and Others', 'XNbQ7NovW58'],
  ['Develop Your Anger Action Plan', '6U0T1v9QbDw'],
  ['Reflect and Commit', 'gqu-mHcPrXM'],
]

// Public version of the members' Short Fuse course, no login. Days open one at
// a time: each Day email links here with that day's key (see lib/shortfuse-days),
// which opens that day and the ones before it. Looks like the sign-up page.
export default async function ShortFusePage(props: { searchParams: Promise<{ k?: string | string[] }> }) {
  let openUpTo = 0
  let linkKey = ''
  let saveKey = false
  try {
    const params = await props.searchParams
    linkKey = typeof params?.k === 'string' ? params.k : ''
    const fromLink = dayForKey(linkKey)
    const fromCookie = dayForKey((await cookies()).get(SHORT_FUSE_COOKIE)?.value)
    openUpTo = Math.max(fromLink, fromCookie)
    saveKey = fromLink > fromCookie
  } catch (err: any) {
    console.error('[short-fuse page] Reading the day key failed:', err?.message)
  }

  let days: Day[] = []
  try {
    const result = await query(
      `SELECT d.day, d.title, d.body, d.pdf_url, v."youtubeId" AS youtube_id
       FROM course_days d LEFT JOIN videos v ON v.id = d.video_id
       WHERE d.course = 'short-fuse' ORDER BY d.day`
    )
    days = result.rows
  } catch (err: any) {
    console.error('[short-fuse page] Database read failed, showing the built-in days:', err?.message)
  }
  if (!days.length) {
    days = FALLBACK_DAYS.map(([title, youtube_id], i) => ({ day: i + 1, title, body: '', pdf_url: null, youtube_id }))
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={`${archivo.variable} ${s.sf} ${c.page}`}>
      {saveKey && <SaveKey shortFuseKey={linkKey} />}
      <div className={s.wrap}>
        <div className={s.mast}>
          <span>Your True North</span>
          <span>{openUpTo > 0 ? `Day ${openUpTo} of 14` : 'Free · 14 days'}</span>
        </div>
      </div>

      <header className={`${s.wrap} ${c.head}`}>
        <h1 className={c.sfTitle}>The Short Fuse</h1>
        <p className={c.intro}>
          A 14 day course to help you release anger without guilt, shame or bottling it up. Five minutes a day to shift how you respond.
        </p>
        {openUpTo === 0 && (
          <p className={c.intro}>
            Each day opens with its email. Not signed up yet? <Link href="/shortfuse">Start The Short Fuse here</Link>.
          </p>
        )}
      </header>

      <main className={`${s.wrap} ${c.days}`}>
        {days.map(d => d.day > openUpTo ? (
          <div key={d.day} className={`${c.day} ${c.row} ${c.locked}`}>
            <span className={c.num}>Day {pad(d.day)}</span>
            <span className={c.name}>{d.title || `Day ${d.day}`}</span>
            <span className={c.tag}><span className={c.long}>Opens with your Day {d.day} email</span><span className={c.short}>Locked</span></span>
          </div>
        ) : (
          <details key={d.day} className={c.day} open={d.day === openUpTo}>
            <summary className={c.row}>
              <span className={c.num}>Day {pad(d.day)}</span>
              <span className={c.name}>{d.title || `Day ${d.day}`}</span>
              {d.day === openUpTo && <span className={`${c.tag} ${c.today}`}>Today</span>}
              <span className={c.sign} aria-hidden="true" />
            </summary>
            <div className={c.body}>
              {d.youtube_id && (
                <div className={c.video}>
                  <iframe
                    src={`https://www.youtube.com/embed/${d.youtube_id}?rel=0&modestbranding=1&playsinline=1`}
                    title={`Short Fuse Day ${d.day}: ${d.title}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
              <div className={c.text}>
                <CourseDayText body={d.body || ''} title={d.title} />
                {d.pdf_url && (
                  <a href={d.pdf_url} target="_blank" rel="noopener noreferrer">Open the worksheet</a>
                )}
              </div>
            </div>
          </details>
        ))}
      </main>

      <section className={`${s.navy} ${c.next}`}>
        <div className={s.wrap}>
          <h2 className={c.nextTitle}>Do this work with other men.</h2>
          <p className={c.nextText}>
            The MAP is my twelve-week programme for men carrying frustration, dissatisfaction, or a short fuse they&apos;re tired of. Men who are done reading about it. Ten men a cohort. We go into the body, find what&apos;s underneath, and let it move.
          </p>
          <Link href="/the-map" className={`${s.go} ${c.nextGo}`}>
            <span>See if The MAP is for you</span><span className={s.ar} aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={s.wrap}>Your True North · yourtruenorth.me · @your_truenorth_</div>
      </footer>
    </div>
  )
}
