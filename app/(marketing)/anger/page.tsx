'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/app/components/GoogleAnalytics'
import { STRIPE_URL, hero, whyKnowYourNorth, whoThisIsFor, whoThisIsNotFor, whoHoldsThisSpace, theJourney, whatsInside, closing } from './content'

const ACCENT = '#9bc4b8'
const TEXT   = '#0a0a0a'
const MUTED  = '#5a5a58'
const SERIF  = "Gambarino, Georgia, serif"
const SANS   = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const CREAM  = '#f5f3ef'
const BORDER = 'rgba(10,10,10,0.10)'

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

// Renders a multi-paragraph string (paragraphs separated by \n\n) as <p> elements
function Paras({ text, style }: { text: string, style?: React.CSSProperties }) {
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i} style={{ ...BODY, marginBottom: '1.25rem', ...style }}>{para}</p>
      ))}
    </>
  )
}

// Splits a journey stage string "Title. Body text." into { title, body }
function parseStage(stage: string): { title: string; body: string } {
  const dot = stage.indexOf('. ')
  return { title: stage.slice(0, dot + 1), body: stage.slice(dot + 2) }
}

function HeroVideo({ videoUrl, posterImageUrl }: { videoUrl?: string | null, posterImageUrl?: string | null }) {
  const [playing, setPlaying] = useState(false)

  if (!videoUrl) {
    return (
      <div style={{ width: '100%', margin: '2rem 0' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%',
          background: '#1a2e22',
          borderRadius: '6px',
          overflow: 'hidden',
          border: `1px solid ${BORDER}`,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '1rem',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(155,196,184,0.15)',
              border: `1.5px solid rgba(155,196,184,0.35)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 4l14 8-14 8V4z" fill={ACCENT} />
              </svg>
            </div>
          </div>
        </div>
        <p style={{
          fontFamily: SANS, fontSize: '0.75rem', color: MUTED,
          textAlign: 'center', marginTop: '0.625rem', letterSpacing: '0.04em',
        }}>Video coming soon</p>
      </div>
    )
  }

  const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#\s]{11})/)
  const ytId = ytMatch ? ytMatch[1] : null

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
        {ytId && !playing ? (
          <div
            onClick={() => setPlaying(true)}
            style={{
              position: 'absolute', inset: 0, cursor: 'pointer',
              backgroundImage: posterImageUrl ? `url(${posterImageUrl})` : `url(https://img.youtube.com/vi/${ytId}/maxresdefault.jpg)`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M6 4l14 8-14 8V4z" fill="#fff" />
              </svg>
            </div>
          </div>
        ) : ytId && playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={videoUrl}
            poster={posterImageUrl || undefined}
            controls
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
        )}
      </div>
    </div>
  )
}

export default function AngerPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [openPillar, setOpenPillar] = useState<number | null>(0)

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
        .querySelectorAll('nav, header, footer, [role="navigation"], [role="contentinfo"], [class*="footer"], [class*="Footer"]')
        .forEach((el) => ((el as HTMLElement).style.display = 'none'))
    }
    hide()
    setTimeout(hide, 100)
  }, [])

  const handleStripeClick = () => {
    trackEvent('begin_checkout', { service: 'anger_founding', value: 25 })
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'InitiateCheckout', {
        content_name: 'Anger Founding Membership',
        value: 25.0,
        currency: 'GBP',
      })
    }
    window.location.href = STRIPE_URL
  }

  const sec = isMobile ? '4rem 1.5rem' : '6rem 1.5rem'
  const inner = { maxWidth: '700px', margin: '0 auto' }

  const CTAButton = ({ label }: { label: string }) => (
    <button
      onClick={handleStripeClick}
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
      {label}
    </button>
  )

  const stages = [
    { num: '01', label: 'The Foundation', ...parseStage(theJourney.stage1) },
    { num: '02', label: 'The Work',       ...parseStage(theJourney.stage2) },
    { num: '03', label: 'The Becoming',   ...parseStage(theJourney.stage3) },
  ]

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

        {/* ── HERO ── */}
        <section style={{
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100svh',
          padding: isMobile ? '4rem 1.5rem 3rem' : '8rem 1.5rem 6rem',
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
              style={{ width: isMobile ? '52px' : '64px', height: 'auto', marginBottom: '1.5rem', opacity: 0.85 }}
            />
            <p style={{
              fontFamily: SANS, fontSize: '0.75rem', fontWeight: 800,
              letterSpacing: '0.2em', textTransform: 'uppercase' as const,
              color: TEXT, margin: '0 0 1.25rem',
            }}>Know Your North</p>

            <h1 style={{
              ...H1,
              fontSize: isMobile ? '2.25rem' : 'clamp(2.5rem, 6vw, 4rem)',
              marginBottom: '1rem',
            }}>
              {isMobile ? <>You're not an angry man.<br />You're carrying anger.</> : hero.headline}
            </h1>

            <p style={{
              fontSize: isMobile ? '1.0625rem' : '1.2rem',
              lineHeight: 1.75,
              color: MUTED,
              maxWidth: '580px',
              margin: '0 auto',
              fontFamily: SANS,
            }}>
              {hero.subheadline}
            </p>

            {/* HeroVideo — videoUrl left empty, posterImageUrl for anger page */}
            <HeroVideo videoUrl={null} posterImageUrl={null} />

            <CTAButton label={hero.ctaLabel} />

            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: MUTED, fontFamily: SANS, maxWidth: '520px', margin: '1rem auto 0' }}>
              {hero.pricingNote}
            </p>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: MUTED, fontFamily: SANS, maxWidth: '520px', margin: '0.75rem auto 0' }}>
              {hero.credentialsLine}
            </p>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: MUTED, fontFamily: SANS, margin: '0.5rem auto 0' }}>
              {hero.cancelLine}
            </p>
          </div>
        </section>

        {/* ── WHY KNOW YOUR NORTH ── */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>Why Know Your North</Label>
            <Paras text={whyKnowYourNorth} />
          </div>
        </section>

        {/* ── WHO THIS IS FOR ── */}
        <section style={{ padding: sec, background: '#ffffff', borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>Who This Is For</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '2.5rem' }}>
              You already know this is you.
            </h2>
            <Paras text={whoThisIsFor} />
          </div>
        </section>

        {/* ── WHO THIS IS NOT FOR ── */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>Who This Is Not For</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {whoThisIsNotFor.split('\n\n').map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `1.5px solid ${BORDER}`, flexShrink: 0, marginTop: '0.3rem' }} />
                  <p style={{ ...BODY, margin: 0 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHO HOLDS THIS SPACE ── */}
        <section style={{ padding: sec, background: '#ffffff', borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>Who Holds This Space</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '2.5rem' }}>
              I've been where you are.
            </h2>
            <div style={{
              display: 'inline-block',
              fontFamily: SANS, fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase' as const,
              color: ACCENT, borderBottom: `1px solid ${ACCENT}`,
              paddingBottom: '0.25rem', marginBottom: '2rem',
            }}>
              True North · Mason
            </div>
            <Paras text={whoHoldsThisSpace} />
          </div>
        </section>

        {/* TODO: swap in anger-specific testimonial videos once recorded, currently reusing founding page testimonials */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <Label>What Changes</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '3rem' }}>
              Real Transformations
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {['n8_muJ84AbU', '7Y1upKm8bZk', 'ubCK70jYQDI', 'UfbMIxlCzgM'].map((id) => (
                <div key={id} style={{ borderRadius: '6px', overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE JOURNEY ── */}
        <section style={{ padding: sec, background: '#ffffff', borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>The Journey</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '0.75rem' }}>
              This work is a path you keep walking.
            </h2>
            <p style={{ ...BODY, marginBottom: '3rem' }}>
              There is no graduation date and no fixed moment where the work is done. This is a continuous deepening applied to what is actually happening in your life right now.
            </p>

            {stages.map((stage, i) => (
              <div
                key={i}
                style={{ borderTop: `1px solid ${BORDER}`, padding: '1.75rem 0', cursor: 'pointer' }}
                onClick={() => setOpenPillar(openPillar === i ? null : i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: SANS, fontSize: '0.75rem', fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', marginTop: '0.5rem', flexShrink: 0 }}>
                      {stage.num}
                    </span>
                    <div>
                      <p style={{ fontFamily: SANS, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, margin: '0 0 0.375rem' }}>
                        {stage.label}
                      </p>
                      <h3 style={{ ...H3, fontSize: isMobile ? '1.333rem' : '1.625rem', margin: 0 }}>
                        {stage.title}
                      </h3>
                    </div>
                  </div>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    border: `1px solid ${BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: MUTED, fontSize: '1.125rem', flexShrink: 0, marginTop: '0.25rem',
                  }}>
                    {openPillar === i ? '−' : '+'}
                  </div>
                </div>
                {openPillar === i && (
                  <p style={{
                    ...BODY,
                    marginTop: '1.25rem',
                    marginLeft: isMobile ? 0 : '2.5rem',
                    marginBottom: 0,
                    paddingLeft: isMobile ? 0 : '1.5rem',
                    borderLeft: isMobile ? 'none' : `1px solid ${BORDER}`,
                  }}>
                    {stage.body}
                  </p>
                )}
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${BORDER}` }} />
          </div>
        </section>

        {/* ── WHAT'S INSIDE ── */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <Label>What You Get</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '2.5rem' }}>
              Inside KYN
            </h2>
            <Paras text={whatsInside} />
          </div>
        </section>

        {/* ── CLOSING CTA ── */}
        <section style={{ padding: isMobile ? '5rem 1.5rem' : '8rem 1.5rem', background: '#ffffff', borderTop: `1px solid ${BORDER}`, textAlign: 'center' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <Paras text={closing.text} />

            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2.25rem, 5vw, 3.75rem)', marginBottom: '2.5rem', marginTop: '2rem' }}>
              Where you are now does not have to be where you end up.
            </h2>

            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: MUTED, marginBottom: '2rem', fontFamily: SANS }}>
              {closing.pricingNote}
            </p>

            <CTAButton label={closing.ctaLabel} />

            <p style={{ marginTop: '1rem', fontSize: '0.8125rem', lineHeight: 1.6, color: MUTED, fontFamily: SANS }}>
              {hero.cancelLine}
            </p>
          </div>
        </section>

      </div>
    </>
  )
}
