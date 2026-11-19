import type { Metadata } from 'next'
import Go from './Go'

// Short link for Jermaine's Power Hour Tasks. Link previews show the
// True North logo from here; the browser then opens the Claude page.
const TARGET = 'https://claude.ai/artifact/Q6RPAAVy7xfGynionhTHXK'
const TITLE = "Jermaine's Power Hour Tasks"
const DESCRIPTION = 'Your daily tasks from True North. Tick them off as you go.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: 'https://yourtruenorth.me/jermaine',
    siteName: 'True North',
    images: [{ url: '/tn-jermaine-kyn.jpg', width: 1200, height: 630, alt: 'True North' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/tn-jermaine-kyn.jpg'],
  },
}

export default function JermainePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '24px 16px', textAlign: 'center' }}>
      <img src="/white white star.png" alt="True North" style={{ width: 'min(320px, 80vw)', height: 'auto' }} />
      <p style={{ margin: 0, opacity: 0.8 }}>Opening your Power Hour Tasks…</p>
      <a href={TARGET} style={{ color: '#000', background: '#fff', padding: '12px 22px', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>
        Open my tasks
      </a>
      <Go to={TARGET} />
    </main>
  )
}
