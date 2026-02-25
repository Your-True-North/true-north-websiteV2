'use client'

import { useEffect, useState, useRef } from 'react'
import { Play, Pause } from 'lucide-react'
import { trackEvent } from '@/app/components/GoogleAnalytics'

const STRIPE_URL = 'https://buy.stripe.com/28E8wQaH55Ehes807d9IQ0j'
const VIDEO_URL = 'https://pub-19417e24742e4c93bb0466196037eeea.r2.dev/Circle%202026.MP4'
const SPOTS_REMAINING = 10
const ACCENT = '#9bc4b8'
const ACCENT_HOVER = '#7da89c'
const TEXT = '#0a0a0a'
const MUTED = '#666666'
const BODY_FONT = '-apple-system, BlinkMacSystemFont, sans-serif'

export default function FoundingMembersPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'ViewContent', {
        content_name: 'Founding Members Page',
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

  const handleStripeClick = () => {
    trackEvent('begin_checkout', { service: 'circle_founding', value: 25 })
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'InitiateCheckout', {
        content_name: 'Founding Membership',
        value: 25.0,
        currency: 'GBP',
      })
    }
  }

  const handleInitialPlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
      setShowOverlay(false)
    }
  }

  const handlePlayPause = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const vPad = isMobile ? '48px' : '80px'
  const hPad = isMobile ? '20px' : '40px'
  const section = (bg: string) => ({
    background: bg,
    padding: `${vPad} ${hPad}`,
  })
  const inner = {
    maxWidth: '720px',
    margin: '0 auto',
  }
  const bodyText = {
    fontSize: '19px',
    lineHeight: 1.75,
    color: TEXT,
    fontFamily: BODY_FONT,
  }

  return (
    <>
      <style jsx global>{`
        nav,
        header,
        footer,
        [role='navigation'],
        [role='contentinfo'],
        [class*='footer'],
        [class*='Footer'] {
          display: none !important;
        }
        body {
          background: #ffffff;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#ffffff', color: TEXT }}>

        {/* ── 1. HERO ── */}
        <section style={{ ...section('#ffffff'), textAlign: 'center', paddingTop: isMobile ? '64px' : '96px' }}>
          <div style={inner}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: ACCENT,
              marginBottom: '24px',
              fontFamily: BODY_FONT,
            }}>
              Founding Member · £25/Month
            </p>

            <h1 style={{
              fontSize: isMobile ? '48px' : '72px',
              fontWeight: 500,
              lineHeight: 1.1,
              color: TEXT,
              marginBottom: '20px',
            }}>
              The Circle of Return
            </h1>

            <p style={{
              fontSize: '18px',
              color: MUTED,
              marginBottom: '36px',
              fontFamily: BODY_FONT,
            }}>
              £25 for the first 20 men. The 21st pays £50.
            </p>

            <a
              href={STRIPE_URL}
              onClick={handleStripeClick}
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: ACCENT,
                color: TEXT,
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
                fontFamily: BODY_FONT,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              Secure Your Spot — £25/month
            </a>

            <p style={{
              fontSize: '13px',
              color: MUTED,
              marginTop: '12px',
              fontFamily: BODY_FONT,
            }}>
              {SPOTS_REMAINING} of 20 spots remaining
            </p>
          </div>
        </section>

        {/* ── 2. VIDEO ── */}
        <section style={{
          background: '#ffffff',
          padding: isMobile ? `0 0 ${vPad}` : `0 ${hPad} ${vPad}`,
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p style={{
              marginBottom: '24px',
              textAlign: 'center',
              fontStyle: 'italic',
              fontSize: '1.15rem',
              color: MUTED,
              fontFamily: "'Gambarino', serif",
            }}>
              For capable men ready to face what's been holding them back — and move forward differently.
            </p>

            <div style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              background: '#000',
              borderRadius: isMobile ? '0' : '6px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}>
              <video
                ref={videoRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                playsInline
                onEnded={() => { setIsPlaying(false); setShowOverlay(true) }}
              >
                <source src={VIDEO_URL} type="video/mp4" />
              </video>

              {showOverlay && (
                <div
                  onClick={handleInitialPlay}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? '64px' : '80px',
                      height: isMobile ? '64px' : '80px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '2px solid rgba(255,255,255,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                  >
                    <Play size={isMobile ? 24 : 32} color="#fff" fill="#fff" style={{ marginLeft: '3px' }} />
                  </div>
                </div>
              )}

              {!showOverlay && (
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                }}>
                  <button
                    onClick={handlePlayPause}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '2px solid rgba(255,255,255,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                  >
                    {isPlaying
                      ? <Pause size={20} color="#fff" fill="#fff" />
                      : <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: '2px' }} />
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 3. WHO THIS IS FOR ── */}
        <section style={section('#ffffff')}>
          <div style={inner}>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              This is for the man who—
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              Gets results. Builds momentum. Then somehow gets in his own way at the last moment.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              Whether it's the missed opportunity. The relationship that broke down. The level he never quite hit. Different stories, but the same root. That feeling in his gut that says he's not enough.
            </p>
            <p style={{
              ...bodyText,
              fontSize: '21px',
              fontWeight: 500,
              color: TEXT,
            }}>
              Capable. Functioning. And still doesn't feel like enough.
            </p>
          </div>
        </section>

        {/* ── 4. MASON'S STORY ── */}
        <section style={{
          ...section('#f0f0f0'),
          paddingTop: isMobile ? '64px' : '96px',
          paddingBottom: isMobile ? '64px' : '96px',
          boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
        }}>
          <div style={inner}>
            <div style={{ borderLeft: '3px solid #9bc4b8', paddingLeft: '24px' }}>
              <p style={{ ...bodyText, fontSize: '1.2rem', lineHeight: 1.9, marginBottom: '20px' }}>
                I was that man. Robbed myself of peace for years before I learned how to stop. Not manage it. Stop it.
              </p>
              <p style={{ ...bodyText, fontSize: '1.2rem', lineHeight: 1.9 }}>
                I'm not standing outside of this work looking in. I came through it. That's the only reason I can guide you through it.
              </p>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={section('#ffffff')}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '48px',
              fontWeight: 500,
              color: TEXT,
              marginBottom: '48px',
              fontFamily: "'Gambarino', serif",
            }}>
              Real Transformations
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '20px',
            }}>
              {['n8_muJ84AbU', '7Y1upKm8bZk', 'ubCK70jYQDI', 'UfbMIxlCzgM'].map((id) => (
                <div
                  key={id}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      border: 'none',
                      borderRadius: '6px',
                      display: 'block',
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. THE PATTERN ── */}
        <section style={section('#ffffff')}>
          <div style={inner}>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              The pattern running underneath your decisions isn't a character flaw. It's old code. Written long before you were old enough to question it.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              And until you see it, it runs the show. Your relationships. Your opportunities, and your ability to hold what you build.
            </p>
            <p style={bodyText}>
              The first thing to shift is your need to control, and your reaction when things don't go your way. Situations that once used to knock you sideways start to hit with less impact. My man, this isn't just positive thinking... This is what happens when the pattern loses its grip.
            </p>
          </div>
        </section>

        {/* ── 6. WHAT WE DO HERE ── */}
        <section style={section('#f8f8f8')}>
          <div style={inner}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '48px',
              color: TEXT,
              marginBottom: '48px',
            }}>
              What we do here
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {[
                {
                  bold: 'See it.',
                  desc: " Catch the pattern while it's running. Understand what's underneath the trigger. Not the story about it.",
                },
                {
                  bold: 'Regulate it.',
                  desc: " Your body holds what your mind has rationalised away. Breathwork. Somatic work. Real capacity to hold pressure without reverting.",
                },
                {
                  bold: 'Become it.',
                  desc: ' Who does your goal require you to be. We close that gap. In practice.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: `3px solid ${ACCENT}`,
                    paddingLeft: '20px',
                  }}
                >
                  <p style={bodyText}>
                    <strong>{item.bold}</strong>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. INSIDE THE CIRCLE ── */}
        <section style={section('#ffffff')}>
          <div style={inner}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '48px',
              color: TEXT,
              marginBottom: '48px',
            }}>
              Inside the Circle
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '20px',
            }}>
              {[
                { title: 'Bi-weekly live calls', desc: "Bring real situations. We highlight the blind spot and expose exactly where autopilot takes over — so you know where the work needs to happen." },
                { title: 'Somatic & breathwork sessions', desc: "Structured and regulated. Release what's blocked to build the capacity to hold the pressure that comes with ambition." },
                { title: 'Monthly goal mapping check-ins', desc: "You're working toward something specific. We review where you are, what's slipping, and what needs tightening. Drifting isn't welcome here." },
                { title: 'Video library', desc: 'Frameworks, tools, and content when you need them.' },
                { title: 'Community', desc: 'No performance. Just men doing the work properly.' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    padding: '28px',
                  }}
                >
                  <p style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: ACCENT,
                    marginBottom: '10px',
                    fontFamily: BODY_FONT,
                  }}>
                    {item.title}
                  </p>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: 1.65,
                    color: TEXT,
                    fontFamily: BODY_FONT,
                  }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <p style={{ ...bodyText, marginTop: '40px' }}>
              Imagine 20 men around the world on a shared mission. Not competing, just doing the work. That's how you grow.
            </p>
            <p style={{ ...bodyText, marginTop: '20px' }}>
              This is personal work. But it happens inside a structured container.
            </p>
          </div>
        </section>

        {/* ── 8. CLOSING CTA ── */}
        <section style={{ ...section('#f8f8f8'), textAlign: 'center' }}>
          <div style={inner}>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              I'm selective about who enters this room. The work requires a level of honesty most men avoid. There's no shame in that. Better you wait until you are.
            </p>
            <p style={{ ...bodyText, marginBottom: '48px' }}>
              If you're ready to stop getting in your own way, this is the place.
            </p>

            <p style={{
              fontSize: isMobile ? '28px' : '34px',
              lineHeight: 1.3,
              color: TEXT,
              fontStyle: 'italic',
              fontFamily: "'Gambarino', serif",
              marginBottom: '48px',
            }}>
              The truth is hard to hear. But you already knew it.
            </p>

            <p style={{ ...bodyText, marginBottom: '48px' }}>
              The only question is how much longer you're willing to ignore it.
            </p>

            <p style={{
              fontSize: '15px',
              color: MUTED,
              marginBottom: '24px',
              fontFamily: BODY_FONT,
            }}>
              Founding member price £25/month. £25 for the first 20 men. The 21st pays £50.
            </p>

            <a
              href={STRIPE_URL}
              onClick={handleStripeClick}
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: ACCENT,
                color: TEXT,
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
                fontFamily: BODY_FONT,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              Secure Your Spot — £25/month
            </a>

            <p style={{
              fontSize: '13px',
              color: MUTED,
              marginTop: '12px',
              fontFamily: BODY_FONT,
            }}>
              {SPOTS_REMAINING} of 20 spots remaining
            </p>
          </div>
        </section>

      </div>
    </>
  )
}
