'use client'

import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/app/components/GoogleAnalytics'
import PricingToggle from '@/components/PricingToggle'
import {
  hero,
  heroBelowVideo,
  theDifference,
  whoHoldsThisSpace,
  whatCouldBe,
  transformations,
  testimonialVideos,
  theJourney,
  brotherhood,
  whatsInside,
  credentialsStrip,
  closing,
  afterYouJoin,
  faq,
} from './content'

const ACCENT  = '#9bc4b8'
const TEXT    = '#0a0a0a'
const MUTED   = '#5a5a58'
const SERIF   = "Gambarino, Georgia, serif"
const SANS    = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const CREAM   = '#f5f3ef'
const BORDER  = 'rgba(10,10,10,0.10)'
const DEEP    = '#142E28' // matches PricingToggle's own box colour, reused for the sticky bar

// Body copy: at least 18px on mobile (16.9px was too small to read comfortably),
// 1.6 line-height, per the mobile-first redesign brief.
function bodyStyle(mobile: boolean): React.CSSProperties {
  return {
    fontSize: mobile ? '1.125rem' : '1.0625rem',
    lineHeight: 1.6,
    color: MUTED,
    fontFamily: SANS,
  }
}

const H1: React.CSSProperties = {
  fontFamily: SERIF,
  fontWeight: 400,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  color: TEXT,
  WebkitTextStroke: '1.5px currentColor',
}

const H2: React.CSSProperties = {
  fontFamily: SERIF,
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  color: TEXT,
  WebkitTextStroke: '1px currentColor',
}

const H3: React.CSSProperties = {
  fontFamily: SERIF,
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
  color: TEXT,
  WebkitTextStroke: '0.7px currentColor',
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: SANS,
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase' as const,
      color: ACCENT,
      margin: '0 0 1.25rem',
    }}>{children}</p>
  )
}

function Paras({ text, mobile, style }: { text: string; mobile: boolean; style?: React.CSSProperties }) {
  const base = bodyStyle(mobile)
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i} style={{ ...base, marginBottom: '1.25rem', ...style }}>{para}</p>
      ))}
    </>
  )
}

// Small accent-filled check mark, reused anywhere a line needs a brand mark
// instead of a plain paragraph (What Changes, This is for you if).
function CheckMark() {
  return (
    <div style={{
      width: '18px', height: '18px', borderRadius: '50%', background: ACCENT,
      flexShrink: 0, marginTop: '0.2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
        <path d="M1 3.5L3.5 6L8 1" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function OpenCircle() {
  return <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `1.5px solid ${BORDER}`, flexShrink: 0, marginTop: '0.2rem' }} />
}

// Autoplays muted (browser-required for autoplay), keeps a poster for the
// first paint, and shows a "Tap for sound" button until the visitor unmutes.
// Fires GA4 events for play, unmute and completion. `compact` tightens the
// outer margin on mobile so the hero fits above the fold.
function HeroVideo({
  videoUrl,
  posterImageUrl,
  captionsUrl,
  compact,
}: {
  videoUrl: string
  posterImageUrl?: string
  captionsUrl?: string
  compact?: boolean
}) {
  const [muted, setMuted] = useState(true)
  const playFired = useRef(false)
  const completeFired = useRef(false)

  return (
    <div style={{ width: '100%', margin: compact ? '0.85rem 0' : '2rem 0' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%',
        background: '#000',
        borderRadius: '6px',
        overflow: 'hidden',
        border: `1px solid ${BORDER}`,
      }}>
        <video
          autoPlay
          muted={muted}
          loop={false}
          playsInline
          preload="metadata"
          controls
          poster={posterImageUrl}
          onPlay={() => {
            if (!playFired.current) {
              playFired.current = true
              trackEvent('hero_video_play')
            }
          }}
          onEnded={() => {
            if (!completeFired.current) {
              completeFired.current = true
              trackEvent('hero_video_complete')
            }
          }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <source src={videoUrl} type="video/mp4" />
          {captionsUrl && (
            <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />
          )}
        </video>

        {muted && (
          <button
            type="button"
            onClick={() => {
              setMuted(false)
              trackEvent('hero_video_unmute')
            }}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '999px',
              border: 'none',
              background: 'rgba(10,10,10,0.72)',
              color: '#fff',
              fontFamily: SANS,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              cursor: 'pointer',
            }}
          >
            🔊 Tap for sound
          </button>
        )}
      </div>
    </div>
  )
}

// Click-to-load testimonial embed: shows the YouTube thumbnail with a play
// button and only mounts the iframe once tapped, so four videos don't load
// on page open.
function TestimonialEmbed({ id, name, quote }: { id: string; name: string; quote: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div>
      <div
        onClick={() => !loaded && setLoaded(true)}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: '6px',
          overflow: 'hidden',
          border: `1px solid ${BORDER}`,
          background: '#000',
          cursor: loaded ? 'default' : 'pointer',
        }}
      >
        {loaded ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', border: `1.5px solid rgba(255,255,255,0.5)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 4l14 8-14 8V4z" fill="#fff" />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Caption slot stays hidden until a real name is supplied in content.ts */}
      {name && (
        <div style={{ padding: '0.75rem 0.25rem 0' }}>
          <p style={{ fontFamily: SANS, fontSize: '0.8125rem', fontWeight: 700, color: TEXT, margin: '0 0 0.2rem' }}>
            {name}
          </p>
          {quote && (
            <p style={{ fontFamily: SERIF, fontSize: '0.9375rem', fontStyle: 'italic', color: MUTED, margin: 0 }}>
              "{quote}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Mid-page join button: same visual weight as the main pricing CTA, scrolls to
// #pricing (PricingToggle's own root id), fires mid_cta_click with a placement.
function JoinButton({ placement }: { placement: string }) {
  const onClick = () => {
    trackEvent('mid_cta_click', { placement })
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  return (
    <div style={{ textAlign: 'center', margin: '3rem 0 0' }}>
      <button
        onClick={onClick}
        style={{
          display: 'inline-block',
          background: ACCENT,
          color: TEXT,
          padding: '0.875rem 2.5rem',
          borderRadius: '4px',
          fontWeight: 700,
          fontSize: '0.9375rem',
          fontFamily: SANS,
          border: 'none',
          cursor: 'pointer',
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#7da89c')}
        onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
      >
        Join Know Your North
      </button>
      <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: MUTED, fontFamily: SANS }}>
        Cancel any time. No contract.
      </p>
    </div>
  )
}

// Mobile-only slim join bar: hidden while the hero is in view, appears once
// it scrolls out, hides again once the pricing card comes into view.
function StickyJoinBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const heroEl = document.getElementById('hero')
    const pricingEl = document.getElementById('pricing')
    if (!heroEl || !pricingEl) return

    let heroInView = true
    let pricingInView = false
    const update = () => setVisible(!heroInView && !pricingInView)

    const heroObserver = new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting
      update()
    }, { threshold: 0 })
    const pricingObserver = new IntersectionObserver(([entry]) => {
      pricingInView = entry.isIntersecting
      update()
    }, { threshold: 0 })

    heroObserver.observe(heroEl)
    pricingObserver.observe(pricingEl)
    return () => {
      heroObserver.disconnect()
      pricingObserver.disconnect()
    }
  }, [])

  const onJoin = () => {
    trackEvent('sticky_join_click')
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div
      className="sticky-join-bar"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        background: DEEP,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 220ms ease',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <style jsx>{`
        .sticky-join-bar { display: flex; }
        @media (min-width: 768px) {
          .sticky-join-bar { display: none !important; }
        }
      `}</style>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '0.75rem', padding: '0.75rem 1rem', width: '100%', boxSizing: 'border-box',
      }}>
        <span style={{ color: '#F5F3EF', fontFamily: SANS, fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.3 }}>
          Join Know Your North · £25/month
        </span>
        <button
          onClick={onJoin}
          style={{
            flexShrink: 0,
            background: ACCENT,
            color: TEXT,
            border: 'none',
            borderRadius: '4px',
            padding: '0.55rem 1.25rem',
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: '0.8125rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            cursor: 'pointer',
          }}
        >
          Join
        </button>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderTop: `1px solid ${BORDER}` }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', padding: '1.25rem 0', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: SANS, textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 600, color: TEXT }}>{question}</span>
        <span style={{
          width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, flexShrink: 0,
        }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p style={{ ...bodyStyle(false), margin: '0 0 1.25rem' }}>{answer}</p>
      )}
    </div>
  )
}

export default function AngerPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'ViewContent', {
        content_name: 'Anger Page',
        content_category: 'Membership',
      })
    }
  }, [])

  useEffect(() => {
    const hide = () => {
      document
        .querySelectorAll(
          'nav, header, footer, [role="navigation"], [role="contentinfo"], [class*="footer"], [class*="Footer"]'
        )
        .forEach((el) => ((el as HTMLElement).style.display = 'none'))
    }
    hide()
    setTimeout(hide, 100)
  }, [])

  // Fires once per threshold as the visitor scrolls down the page.
  useEffect(() => {
    const fired = new Set<number>()
    const thresholds = [25, 50, 75, 100]
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const pct = Math.min(100, Math.round((window.scrollY / docHeight) * 100))
      thresholds.forEach((t) => {
        if (pct >= t && !fired.has(t)) {
          fired.add(t)
          trackEvent('scroll_depth', { percent: t })
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scrolls to "The Difference" instead of straight to pricing.
  const handleHeroCta = () => {
    trackEvent('hero_cta_click', { service: 'anger_founding' })
    document.getElementById('the-difference')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleAlreadyKnow = () => {
    trackEvent('hero_cta_click', { service: 'anger_founding', variant: 'already_know' })
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const sec = isMobile ? '4rem 1.5rem' : '6rem 1.5rem'
  const inner = { maxWidth: '640px', margin: '0 auto' }

  const hasAfterYouJoin = Boolean(afterYouJoin.heading) || afterYouJoin.steps.some((s) => s.title || s.body)
  // Stays hidden until every slot has real copy, not just the first one.
  const hasFaq = faq.every((f) => f.question && f.answer)

  return (
    <>
      <style jsx global>{`
        nav, header, footer,
        [role='navigation'], [role='contentinfo'],
        [class*='footer'], [class*='Footer'] {
          display: none !important;
        }
        body { background: #ffffff; }

        /* Hero is pure CSS media queries, not JS isMobile, so there is no
           desktop-first SSR flash on mobile load (the fold-fit requirement
           needs this to be correct on first paint, not after hydration). */
        .hero-section {
          background: #ffffff; display: flex; flex-direction: column; align-items: center;
          justify-content: flex-start; min-height: auto; padding: 1.25rem 20px 2.5rem;
          text-align: center; position: relative; overflow: hidden; width: 100%; box-sizing: border-box;
        }
        .hero-inner { max-width: 100%; width: 100%; box-sizing: border-box; position: relative; z-index: 1; }
        .hero-logo { width: 32px; height: auto; margin-bottom: 0.5rem; opacity: 0.85; }
        .hero-eyebrow {
          font-family: ${SANS}; font-size: 0.6875rem; font-weight: 800; letter-spacing: 0.2em;
          text-transform: uppercase; color: ${TEXT}; margin: 0 0 0.3rem;
        }
        .hero-h1 {
          font-family: ${SERIF}; font-weight: 400; line-height: 1.1; letter-spacing: -0.02em;
          color: ${TEXT}; -webkit-text-stroke: 1.5px currentColor;
          font-size: clamp(1.9rem, 8vw, 2.5rem); margin-bottom: 0.6rem; max-width: 100%; overflow-wrap: break-word;
        }
        .hero-subhead { font-size: 1rem; line-height: 1.5; color: ${MUTED}; max-width: 600px; margin: 0 auto; font-family: ${SANS}; }
        .hero-cta {
          display: inline-block; background: ${ACCENT}; color: ${TEXT}; padding: 0.75rem 2rem;
          border-radius: 4px; font-weight: 700; font-size: 0.875rem; font-family: ${SANS};
          border: none; cursor: pointer; letter-spacing: 0.06em; text-transform: uppercase;
        }
        .hero-cta:hover { background: #7da89c; }
        .hero-already {
          display: inline-block; background: none; border: none; color: ${MUTED}; font-family: ${SANS};
          font-size: 0.8125rem; text-decoration: underline; text-underline-offset: 3px; cursor: pointer;
          margin-top: 0.9rem; padding: 0.35rem;
        }
        .hero-below { max-width: 520px; margin: 1.5rem auto 0; }

        @media (min-width: 768px) {
          .hero-section { justify-content: center; min-height: 100svh; padding: 8rem 1.5rem 6rem; }
          .hero-inner { max-width: 780px; }
          .hero-logo { width: 64px; margin-bottom: 1.5rem; }
          .hero-eyebrow { font-size: 0.75rem; }
          .hero-h1 { font-size: clamp(3rem, 7vw, 5rem); margin-bottom: 1.75rem; }
          .hero-subhead { font-size: 1.2rem; }
          .hero-cta { padding: 0.875rem 2.5rem; font-size: 0.9375rem; }
          .hero-below { margin: 2rem auto 0; }
        }
      `}</style>

      {/* Gets the hero poster fetched at high priority, ahead of the video
          data itself, so the LCP paint isn't waiting behind it. */}
      <link rel="preload" as="image" href="/anger-hero-poster.jpg" fetchPriority="high" />

      <div style={{ fontFamily: SANS, color: TEXT, overflowX: 'hidden' }}>

        {/* 1. HERO — eyebrow, H1, subhead, video and button all fit above the
            fold on a 390px mobile screen. heroBelowVideo text sits below the
            button, out of the fold budget, so it doesn't push the CTA down.
            Sized with CSS media queries (not isMobile) so there's no flash. */}
        <section id="hero" className="hero-section">
          <div className="hero-inner">

            <img src="/cor-mark-black.svg" alt="Know Your North" className="hero-logo" />

            <p className="hero-eyebrow">Know Your North</p>

            <h1 className="hero-h1">{hero.headline}</h1>

            <p className="hero-subhead">{hero.subheadline}</p>

            <HeroVideo
              videoUrl="/anger-hero.mp4"
              posterImageUrl="/anger-hero-poster.jpg"
              compact={isMobile}
            />

            <button onClick={handleHeroCta} className="hero-cta">
              {hero.ctaLabel}
            </button>

            <div>
              <button onClick={handleAlreadyKnow} className="hero-already">
                Already know? Join now
              </button>
            </div>

            <div className="hero-below">
              <Paras text={heroBelowVideo} mobile={isMobile} style={{ marginBottom: '0.9rem' }} />
            </div>
          </div>
        </section>

        {/* 2. THE DIFFERENCE */}
        <section id="the-difference" style={{ padding: sec, background: '#ffffff', scrollMarginTop: '2rem' }}>
          <div style={inner}>
            <Label>{theDifference.label}</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '2.5rem' }}>
              {theDifference.heading}
            </h2>
            <Paras text={theDifference.body} mobile={isMobile} />
          </div>
        </section>

        {/* 3. WHO HOLDS THE SPACE */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>Who Holds the Space</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '2.5rem' }}>
              I didn't just learn this in a classroom.
            </h2>

            <div style={{
              display: 'inline-block',
              fontFamily: SANS,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: ACCENT,
              borderBottom: `1px solid ${ACCENT}`,
              paddingBottom: '0.25rem',
              marginBottom: '2rem',
            }}>
              True North · Mason
            </div>

            <Paras text={whoHoldsThisSpace} mobile={isMobile} />
          </div>
        </section>

        {/* 4. WHAT CHANGES — each line as its own row with a brand mark, not a plain paragraph */}
        <section style={{ padding: sec, background: '#ffffff', borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>{whatCouldBe.label}</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '2.5rem' }}>
              {whatCouldBe.heading}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {whatCouldBe.body.split('\n\n').map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <CheckMark />
                  <p style={{ ...bodyStyle(isMobile), margin: 0 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. TRANSFORMATIONS — click-to-load embeds */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <Label>{transformations.label}</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '3rem' }}>
              {transformations.heading}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {testimonialVideos.map(({ id, name, quote }) => (
                <TestimonialEmbed key={id} id={id} name={name} quote={quote} />
              ))}
            </div>

            <JoinButton placement="after_transformations" />
          </div>
        </section>

        {/* 6. THE JOURNEY — side by side on desktop, stacked on mobile, always open */}
        <section style={{ padding: sec, background: '#ffffff', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: isMobile ? 'left' : 'center' }}>
              <Label>{theJourney.label}</Label>
              <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '0.75rem' }}>
                {theJourney.heading}
              </h2>
              <Paras text={theJourney.intro} mobile={isMobile} style={{ marginBottom: '1rem' }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? '2.5rem' : '2.5rem',
              marginTop: '2.5rem',
              textAlign: isMobile ? 'left' : 'center',
            }}>
              {theJourney.steps.map((stage, i) => (
                <div key={i}>
                  <div style={{
                    fontFamily: SERIF, fontSize: '3rem', lineHeight: 1, color: ACCENT,
                    WebkitTextStroke: '1px currentColor', marginBottom: '0.75rem',
                  }}>
                    {stage.num}
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, margin: '0 0 0.375rem' }}>
                    {stage.label}
                  </p>
                  <h3 style={{ ...H3, fontSize: isMobile ? '1.333rem' : '1.5rem', margin: '0 0 0.75rem' }}>
                    {stage.title}
                  </h3>
                  <p style={{ ...bodyStyle(isMobile), margin: 0 }}>
                    {stage.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. THE BROTHERHOOD */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '3rem', maxWidth: '700px' }}>
              {brotherhood.heading}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '3rem' : '5rem',
            }}>
              <div>
                <Label>This is for you if</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                  {brotherhood.forYou.map((line, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <CheckMark />
                      <p style={{ ...bodyStyle(isMobile), margin: 0 }}>{line}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>This is not for you if</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                  {brotherhood.notForYou.map((line, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <OpenCircle />
                      <p style={{ ...bodyStyle(isMobile), margin: 0 }}>{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '3rem', borderLeft: `3px solid ${ACCENT}`, paddingLeft: '1.5rem' }}>
              <p style={{
                fontFamily: SERIF,
                fontSize: isMobile ? '1.2rem' : '1.333rem',
                lineHeight: 1.6,
                color: TEXT,
                fontStyle: 'italic',
                margin: 0,
                WebkitTextStroke: '0.3px currentColor',
              }}>
                {brotherhood.closingLine}
              </p>
            </div>
          </div>
        </section>

        {/* 8. INSIDE KYN */}
        <section style={{ padding: sec, background: '#ffffff', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Label>What You Get</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '3rem' }}>
              {whatsInside.heading}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
              {whatsInside.cards.map((item, i) => (
                <div key={i} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '1.75rem' }}>
                  <p style={{ fontFamily: SANS, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: ACCENT, marginBottom: '0.625rem' }}>
                    {item.title}
                  </p>
                  <p style={{ ...bodyStyle(isMobile), margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <Paras text={whatsInside.closingLine} mobile={isMobile} />

            <JoinButton placement="after_inside" />
          </div>
        </section>

        {/* 9. CREDENTIALS STRIP */}
        <section style={{ background: CREAM, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '2rem 1.5rem' }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? '1.5rem' : '1rem',
            textAlign: 'center',
          }}>
            {credentialsStrip.map(({ value, label }) => (
              <div key={value} style={{ padding: isMobile ? '0' : '0 0.5rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: TEXT, fontFamily: SANS, marginBottom: '0.3rem' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: MUTED, fontFamily: SANS, lineHeight: 1.5 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. CLOSING COPY */}
        <section style={{ padding: isMobile ? '4rem 1.5rem 0' : '6rem 1.5rem 0', background: '#ffffff', textAlign: 'center' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <Paras text={closing.text} mobile={isMobile} style={{ marginBottom: '1.25rem' }} />
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2.25rem, 5vw, 3.75rem)', margin: '2.5rem 0 0' }}>
              Where you are now does not have to be where you end up.
            </h2>
          </div>
        </section>

        {/* 11. WHAT HAPPENS AFTER YOU JOIN — hidden until real copy is supplied */}
        {hasAfterYouJoin && (
          <section style={{ padding: sec, background: '#ffffff', textAlign: 'center' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              {afterYouJoin.heading && (
                <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '3rem' }}>
                  {afterYouJoin.heading}
                </h2>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '2.5rem',
                textAlign: isMobile ? 'left' : 'center',
              }}>
                {afterYouJoin.steps.map((step) => (
                  <div key={step.num}>
                    <div style={{ fontFamily: SERIF, fontSize: '2.5rem', color: ACCENT, marginBottom: '0.5rem', WebkitTextStroke: '1px currentColor' }}>
                      {step.num}
                    </div>
                    <h3 style={{ ...H3, fontSize: '1.333rem', margin: '0 0 0.75rem' }}>{step.title}</h3>
                    <p style={{ ...bodyStyle(isMobile), margin: 0 }}>{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 10b. PRICING CARD — price, toggle, founding note and button as one boxed card */}
        <section style={{ padding: sec, background: '#ffffff' }}>
          <div style={{
            maxWidth: '560px',
            margin: '0 auto',
            background: CREAM,
            border: `1px solid ${BORDER}`,
            borderRadius: '14px',
            padding: isMobile ? '1.75rem 1.25rem' : '2.5rem',
            boxShadow: '0 12px 40px rgba(10,10,10,0.06)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: MUTED, marginBottom: '1.5rem', fontFamily: SANS }}>
              {closing.pricingNote}
            </p>
            <PricingToggle ctaLabel={closing.ctaLabel} trackingId="anger_founding" sourcePage="anger" />
          </div>
        </section>

        {/* 12. FAQ — hidden until real questions are supplied */}
        {hasFaq && (
          <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
            <div style={inner}>
              <Label>Questions</Label>
              <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '1rem' }}>
                Before you join
              </h2>
              <div>
                {faq.filter((f) => f.question || f.answer).map((f, i) => (
                  <FaqItem key={i} question={f.question} answer={f.answer} />
                ))}
                <div style={{ borderTop: `1px solid ${BORDER}` }} />
              </div>
            </div>
          </section>
        )}

      </div>

      <StickyJoinBar />
    </>
  )
}
