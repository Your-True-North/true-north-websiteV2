import type { Metadata, Viewport } from 'next'
import { Archivo } from 'next/font/google'
import s from './shortfuse.module.css'
import Hero from './components/Hero'
import Recognise from './components/Recognise'
import Reframe from './components/Reframe'
import HowItWorks from './components/HowItWorks'
import About from './components/About'
import Faq from './components/Faq'
import FinalCta from './components/FinalCta'
import StickyBar from './components/StickyBar'

// Free opt-in for The Short Fuse email course. Sits outside (marketing) so it
// has its own masthead and footer instead of the site nav.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' })

const description = "It's never really about what triggers you. A free 14 day course for men, from True."

export const metadata: Metadata = {
  title: 'The Short Fuse | Your True North',
  description,
  alternates: { canonical: '/shortfuse' },
  openGraph: {
    title: 'The Short Fuse | Your True North',
    description,
    type: 'website',
    locale: 'en_GB',
    url: 'https://yourtruenorth.me/shortfuse',
    siteName: 'Your True North',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Short Fuse | Your True North',
    description,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f3f2ee',
}

export default function ShortFuseOptIn() {
  return (
    <div className={`${archivo.variable} ${s.sf}`}>
      <div className={s.wrap}>
        <div className={s.mast}><span>Your True North</span><span>Free · 14 days</span></div>
      </div>

      <main>
        <Hero />
        <section className={`${s.paper} ${s.factsBand}`}>
          <div className={s.wrap}>
            <div className={s.facts}>
              <div><b>9 yrs</b><span>guiding people</span></div>
              <div><b>100s</b><span>of men worked with</span></div>
            </div>
          </div>
        </section>
        <Recognise />
        <Reframe />
        <HowItWorks />
        <About />
        <Faq />
        <FinalCta />
      </main>

      <footer className={s.footer}>
        <div className={s.wrap}>Your True North · yourtruenorth.me · @your_truenorth_</div>
      </footer>

      <StickyBar />
    </div>
  )
}
