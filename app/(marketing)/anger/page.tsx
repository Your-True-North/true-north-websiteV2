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
} from './content'

const ACCENT  = '#9bc4b8'
const TEXT    = '#0a0a0a'
const MUTED   = '#5a5a58'
const SERIF   = "Gambarino, Georgia, serif"
const SANS    = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const CREAM   = '#f5f3ef'
const BORDER  = 'rgba(10,10,10,0.10)'

const BODY: React.CSSProperties = {
  fontSize: '1.0625rem',
  lineHeight: 1.75,
  color: MUTED,
  fontFamily: SANS,
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

function Paras({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i} style={{ ...BODY, marginBottom: '1.25rem', ...style }}>{para}</p>
      ))}
    </>
  )
}

// Autoplays muted (browser-required for autoplay), keeps a poster for the
// first paint, and shows a "Tap for sound" button until the visitor unmutes.
// Captions load from the .vtt track and are shown by default. Fires GA4
// events for play, unmute and completion.
function HeroVideo({
  videoUrl,
  posterImageUrl,
  captionsUrl,
}: {
  videoUrl: string
  posterImageUrl?: string
  captionsUrl?: string
}) {
  const [muted, setMuted] = useState(true)
  const playFired = useRef(false)
  const completeFired = useRef(false)

  return (
    <div style={{ width: '100%', margin: '2rem 0' }}>
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
          preload="auto"
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
              bottom: '14px',
              right: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '999px',
              border: 'none',
              background: 'rgba(10,10,10,0.72)',
              color: '#fff',
              fontFamily: SANS,
              fontSize: '0.8125rem',
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

  const sec = isMobile ? '4rem 1.5rem' : '6rem 1.5rem'
  const inner = { maxWidth: '700px', margin: '0 auto' }

  return (
    <>
      <style jsx global>{`
        nav, header, footer,
        [role='navigation'], [role='contentinfo'],
        [class*='footer'], [class*='Footer'] {
          display: none !important;
        }
        body { background: #ffffff; }
      `}</style>

      <div style={{ fontFamily: SANS, color: TEXT, overflowX: 'hidden' }}>

        {/* 1. HERO */}
        <section style={{
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100svh',
          padding: isMobile ? '0 24px 48px' : '8rem 1.5rem 6rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{ maxWidth: isMobile ? 'none' : '780px', width: '100%', position: 'relative', zIndex: 1 }}>

            <img
              src="/cor-mark-black.svg"
              alt="Know Your North"
              style={{
                width: isMobile ? '52px' : '64px',
                height: 'auto',
                marginBottom: '1.5rem',
                opacity: 0.85,
              }}
            />

            <p style={{
              fontFamily: SANS,
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: TEXT,
              margin: '0 0 0.35rem',
            }}>Know Your North</p>

            <h1 style={{
              ...H1,
              fontSize: isMobile ? '2.75rem' : 'clamp(3rem, 7vw, 5rem)',
              marginBottom: '1.75rem',
            }}>
              {hero.headline}
            </h1>

            <p style={{
              fontSize: isMobile ? '1.0625rem' : '1.2rem',
              lineHeight: 1.75,
              color: MUTED,
              maxWidth: '600px',
              margin: '0 auto',
              fontFamily: SANS,
            }}>
              {hero.subheadline}
            </p>

            {/* This video has captions burned in already, so no captionsUrl/<track> here. */}
            <HeroVideo
              videoUrl="/anger-hero.mp4"
              posterImageUrl="/anger-hero-poster.jpg"
            />

            <div style={{ maxWidth: '520px', margin: '0 auto 2rem' }}>
              <Paras text={heroBelowVideo} style={{ marginBottom: '0.9rem' }} />
            </div>

            <button
              onClick={handleHeroCta}
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
              {hero.ctaLabel}
            </button>
          </div>
        </section>

        {/* 2. THE DIFFERENCE */}
        <section id="the-difference" style={{ padding: sec, background: '#ffffff', scrollMarginTop: '2rem' }}>
          <div style={inner}>
            <Label>{theDifference.label}</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '2.5rem' }}>
              {theDifference.heading}
            </h2>
            <Paras text={theDifference.body} />
          </div>
        </section>

        {/* 3. WHO HOLDS THE SPACE */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>Who Holds the Space</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '2.5rem' }}>
              I've been where you are.
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

            <Paras text={whoHoldsThisSpace} />
          </div>
        </section>

        {/* 4. WHAT COULD BE */}
        <section style={{ padding: sec, background: '#ffffff', borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>{whatCouldBe.label}</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '2.5rem' }}>
              {whatCouldBe.heading}
            </h2>
            <Paras text={whatCouldBe.body} />
          </div>
        </section>

        {/* 5. TRANSFORMATIONS */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <Label>{transformations.label}</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '3rem' }}>
              {transformations.heading}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {testimonialVideos.map(({ id, name, quote }) => (
                <div key={id}>
                  <div style={{ borderRadius: '6px', overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${id}`}
                      style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
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
              ))}
            </div>
          </div>
        </section>

        {/* 6. THE JOURNEY */}
        <section style={{ padding: sec, background: '#ffffff', borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>{theJourney.label}</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '0.75rem' }}>
              {theJourney.heading}
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <Paras text={theJourney.intro} style={{ marginBottom: '1rem' }} />
            </div>

            {theJourney.steps.map((stage, i) => (
              <div key={i} style={{ borderTop: `1px solid ${BORDER}`, padding: '1.75rem 0' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: SANS, fontSize: '0.75rem', fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', marginTop: '0.5rem', flexShrink: 0 }}>
                    {stage.num}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: SANS, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, margin: '0 0 0.375rem' }}>
                      {stage.label}
                    </p>
                    <h3 style={{ ...H3, fontSize: isMobile ? '1.333rem' : '1.625rem', margin: '0 0 0.75rem' }}>
                      {stage.title}
                    </h3>
                    <p style={{ ...BODY, margin: 0 }}>
                      {stage.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${BORDER}` }} />
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
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', background: ACCENT,
                        flexShrink: 0, marginTop: '0.2rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p style={{ ...BODY, margin: 0 }}>{line}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>This is not for you if</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                  {brotherhood.notForYou.map((line, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `1.5px solid ${BORDER}`, flexShrink: 0, marginTop: '0.2rem' }} />
                      <p style={{ ...BODY, margin: 0 }}>{line}</p>
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
                  <p style={{ ...BODY, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <p style={{ ...BODY, margin: 0 }}>
              {whatsInside.closingLine}
            </p>
          </div>
        </section>

        {/* 9. CREDENTIALS STRIP — moved here from under the hero */}
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

        {/* 10. CLOSING CTA */}
        <section style={{ padding: isMobile ? '5rem 1.5rem' : '8rem 1.5rem', background: '#ffffff', textAlign: 'center' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>

            <Paras text={closing.text} style={{ marginBottom: '1.25rem' }} />

            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2.25rem, 5vw, 3.75rem)', margin: '2.5rem 0' }}>
              Where you are now does not have to be where you end up.
            </h2>

            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: MUTED, marginBottom: '2rem', fontFamily: SANS }}>
              {closing.pricingNote}
            </p>

            <PricingToggle ctaLabel={closing.ctaLabel} trackingId="anger_founding" sourcePage="anger" />
          </div>
        </section>

      </div>
    </>
  )
}
