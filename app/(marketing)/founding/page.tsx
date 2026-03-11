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
              For capable men ready to face what's been holding them back – and move forward differently.
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
              Will get the result. Who'll build the momentum. And then somehow get in his own way at the last moment.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              You know exactly where in life you're sabotaging yourself. Whether it's a money-making opportunity. The relationships that break down. Or the level you feel you can reach but never quite hit.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              Different stories, same root.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              These usually come with that feeling in the gut that says I'm not enough. Yet you are capable. You're functioning, but still not fully settled.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              That feeling in your gut that says you're not enough isn't a personality flaw. It's a pattern.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              And until you see it clearly, it will continue to run your decisions.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              You could try to work this out on your own. Most men do. They read more, think more and try harder to control their reactions. But realistically — if that was going to solve it, it probably would have by now.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px', fontWeight: 500 }}>
              My man, the issue isn't your lack of effort… It's in your blind spots.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              You cannot see the pattern while you're inside it — like the fish doesn't notice the water it swims in. This work is about having other eyes on the moments you justify or rationalise, and catching the reactions before the cycles cause too much damage. That shortens the frustrating process dramatically.
            </p>
            <p style={{ ...bodyText, marginBottom: '12px', fontWeight: 500, fontSize: '21px' }}>
              You can spend years circling it alone.
            </p>
            <p style={{ ...bodyText, fontWeight: 500, fontSize: '21px' }}>
              Or you can expose it properly and deal with it.
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
                I know this from experience — I was that man repeating the cycle. Two steps forward, then stepping back without knowing why. I robbed myself of peace and progress for years before I learned what was going on.
              </p>
              <p style={{ ...bodyText, fontSize: '1.2rem', lineHeight: 1.9 }}>
                I'm not a coach who is standing outside of this work looking in. I came through it myself, and that's the only reason I can guide you through it. Textbooks don't quite cut it compared to lived experience and navigating real life scenarios.
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
              You're currently running old code that was written long before you were old enough to question it. When this code continues to run unchecked, it shapes your relationships, your opportunities, and your ability to hold what you build.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px', fontWeight: 500 }}>
              When the code is interrupted, something changes.
            </p>
            {[
              'You stop sabotaging the very thing you say you want.',
              'You respond instead of react.',
              'You stay steady when things don\'t go your way.',
              'You make decisions without second-guessing yourself afterwards.',
            ].map((line, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: '20px', marginBottom: '16px' }}>
                <p style={bodyText}>{line}</p>
              </div>
            ))}
            <p style={{ ...bodyText, marginTop: '24px', marginBottom: '20px' }}>
              When you enter The CoR — you will feel shifts within weeks.
            </p>
            <p style={bodyText}>
              And within your first 30 days, you will identify a pattern that has been influencing your decisions for years. Once you see it clearly, you cannot unsee it — it stops running you blindly.
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
              How we work
            </h2>

            <p style={{ ...bodyText, marginBottom: '32px' }}>
              This isn't random conversation — this work follows a clear path.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {[
                {
                  bold: 'See it.',
                  desc: ' Catch the pattern that is running while understanding what\'s underneath it.',
                },
                {
                  bold: 'Regulate it.',
                  desc: ' Your body still holds what the mind doesn\'t want to deal with. We release what\'s been stored over the years and build the capacity to hold pressure without reverting. Breathwork. Somatic work. Practical tools that stop the spiral before it starts.',
                },
                {
                  bold: 'Become it.',
                  desc: ' Who does your goal require you to be? We close that gap. This cycle repeats, and is applied to real situations — until the old programme loses its grip, and we rewrite a new one.',
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
                { title: 'Two live deep sessions each month', desc: "Built around expansion topics that reveal the pattern underneath your decisions. You apply them to your real-life situations so the work moves you forward, not just inward." },
                { title: 'Two somatic regulation sessions', desc: "To help release what's been stuck and weighing you down. We build actual capacity, not just insight." },
                { title: 'Quarterly community goal mapping review', desc: "So you know exactly where you're tightening and where you're slipping." },
                { title: 'Exclusive supporting content', desc: 'We take a holistic approach — somatics, the psyche, and grounded spiritual perspectives — because understanding how and why you operate is one of the most powerful forms of growth.' },
                { title: 'Private community', desc: 'A private community of men doing the work properly. Not a place for big egos trying to out-perform.' },
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

            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                "You're looking at a few focused hours each month.",
                "Not endless.",
                "No daily tasks.",
                "Just consistent application in the areas that matter.",
              ].map((line, i) => (
                <p key={i} style={{ ...bodyText, margin: 0 }}>{line}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. CLOSING CTA ── */}
        <section style={{ ...section('#f8f8f8'), textAlign: 'center' }}>
          <div style={inner}>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              This is personal work inside a structured container. It requires honesty. It requires effort. And zero chaos.
            </p>
            <p style={{ ...bodyText, marginBottom: '48px' }}>
              If you're ready to stop getting in your own way, this is the most direct way to do it.
            </p>

            <p style={{
              fontSize: isMobile ? '28px' : '34px',
              lineHeight: 1.3,
              color: TEXT,
              fontStyle: 'italic',
              fontFamily: "'Gambarino', serif",
              marginBottom: '48px',
            }}>
              What matters more is what it has already cost you to leave this unchecked.
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
