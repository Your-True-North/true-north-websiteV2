'use client'

import CircleCalendarTeaser from './components/CircleCalendarTeaser'
import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { trackEvent } from '@/app/components/GoogleAnalytics'

const ACCENT = '#9bc4b8'
const ACCENT_HOVER = '#7da89c'
const TEXT = '#0a0a0a'
const MUTED = '#666666'
const BODY_FONT = '-apple-system, BlinkMacSystemFont, sans-serif'

export default function Circle() {
  const [isMobile, setIsMobile] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleInitialPlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
      setShowOverlay(false)
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/convertkit/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        trackEvent('join_waitlist', { list: 'circle_of_return', value: 1 })
        setSubmitted(true)
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setMessage('Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const vPad = isMobile ? '48px' : '80px'
  const hPad = isMobile ? '20px' : '40px'
  const sectionStyle = (bg: string) => ({
    background: bg,
    padding: `${vPad} ${hPad}`,
  })
  const inner = { maxWidth: '720px', margin: '0 auto' }
  const bodyText = {
    fontSize: '19px',
    lineHeight: 1.75,
    color: TEXT,
    fontFamily: BODY_FONT,
  }

  return (
    <>
      <main style={{ background: '#ffffff', color: TEXT }}>

        {/* ── HERO VIDEO ── */}
        <section style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '100vh' : '110vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              background: 'linear-gradient(90deg, rgba(10,10,11,0.8) 0%, transparent 15%, transparent 85%, rgba(10,10,11,0.8) 100%)',
              pointerEvents: 'none',
              zIndex: 2
            }} />
            <video
              ref={videoRef}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: isMobile ? '177.78vh' : '100%',
                height: isMobile ? '100vh' : '100%',
                minWidth: '100%', minHeight: '100%',
                transform: 'translate(-50%, -50%)',
                objectFit: 'cover',
                pointerEvents: showOverlay ? 'none' : 'auto',
                opacity: showOverlay ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }}
              playsInline
              onEnded={() => { setIsPlaying(false); setShowOverlay(true) }}
            >
              <source src="https://pub-19417e24742e4c93bb0466196037eeea.r2.dev/Circle%202026.MP4" type="video/mp4" />
            </video>
          </div>

          {showOverlay && (
            <div
              onClick={handleInitialPlay}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 10, cursor: 'pointer',
                gap: isMobile ? '2rem' : '2.5rem',
                padding: isMobile ? '2rem' : '4rem',
                textAlign: 'center',
              }}
            >
              <div style={{ maxWidth: '700px' }}>
                <p style={{
                  fontSize: '11px', fontWeight: 600,
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: ACCENT, marginBottom: '20px', fontFamily: BODY_FONT,
                }}>
                  The Circle of Return
                </p>
                <h1 style={{
                  fontSize: isMobile ? '2.4rem' : '3.5rem',
                  fontWeight: 500, color: '#ffffff',
                  lineHeight: 1.15, marginBottom: '1rem',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}>
                  Most men can see their self-sabotage clearly.
                </h1>
                <p style={{
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
                  color: 'rgba(255,255,255,0.75)', fontWeight: 300,
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}>
                  They just can't stop it alone.
                </p>
              </div>

              <div
                style={{
                  width: isMobile ? '70px' : '90px', height: isMobile ? '70px' : '90px',
                  borderRadius: '50%',
                  background: 'rgba(155,196,184,0.3)', backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease', cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(155,196,184,0.5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(155,196,184,0.3)' }}
              >
                <Play size={isMobile ? 28 : 36} color="#fff" fill="#fff" style={{ marginLeft: '4px' }} />
              </div>

              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: isMobile ? '-1rem' : '0' }}>
                {isMobile ? 'Tap to watch' : 'Click to watch'}
              </p>
            </div>
          )}

          {isPlaying && !showOverlay && (
            <div style={{
              position: 'absolute', bottom: isMobile ? '2rem' : '1.5rem',
              left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '1rem', zIndex: 100,
              padding: '0.75rem 1.5rem',
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
              borderRadius: '50px', border: '1px solid rgba(155,196,184,0.3)',
            }}>
              <button
                onClick={handleRewind}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'rgba(155,196,184,0.2)', backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(155,196,184,0.4)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(155,196,184,0.2)' }}
              >
                <RotateCcw size={20} color="#fff" />
              </button>
              <button
                onClick={handlePlayPause}
                style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'rgba(155,196,184,0.3)', backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(155,196,184,0.5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(155,196,184,0.3)' }}
              >
                {isPlaying ? <Pause size={24} color="#fff" fill="#fff" /> : <Play size={24} color="#fff" fill="#fff" style={{ marginLeft: '2px' }} />}
              </button>
            </div>
          )}
        </section>

        {/* ── WHO THIS IS FOR ── */}
        <section style={sectionStyle('#ffffff')}>
          <div style={inner}>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              You already know this is you.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              You have a version of yourself you can see clearly. The man who leads with confidence and builds something real. Who doesn't run away when things get hard.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              And you know there's a gap between that man and where you stand right now.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              Not because you lack ability or because you haven't tried. But because something underneath keeps pulling you back to where you started.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              Maybe it shows up in business. You build momentum — then somehow lose the contract, delay the launch, undercharge again. You watch the opportunity pass and wonder why you let it.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              Maybe it's relationships. You find yourself in the same argument, creating the same distance. The same moment where you shut down when you most needed to stay open.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              Maybe it's the version of yourself you perform in public versus the one you live with privately. The gap between those two men is exhausting to keep up.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              My brother, all these different stories have the same root.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px', fontWeight: 500 }}>
              I know you've read the books and listened to the podcasts. Maybe you've done therapy. You have more self-awareness than most men you know, yet still the pattern runs.
            </p>
            <p style={{ ...bodyText }}>
              That's not a failure of effort. That's the nature of what's in the blind spot — by definition, you cannot see it from inside it.
            </p>
          </div>
        </section>

        {/* ── MASON'S STORY ── */}
        <section style={{
          ...sectionStyle('#f0f0f0'),
          paddingTop: isMobile ? '64px' : '96px',
          paddingBottom: isMobile ? '64px' : '96px',
          boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
        }}>
          <div style={inner}>
            <div style={{ borderLeft: '3px solid #9bc4b8', paddingLeft: '24px' }}>
              <p style={{ ...bodyText, fontSize: '1.2rem', lineHeight: 1.9, marginBottom: '20px' }}>
                I'm True. And I'm not standing outside this work looking in.
              </p>
              <p style={{ ...bodyText, fontSize: '1.2rem', lineHeight: 1.9, marginBottom: '20px' }}>
                I spent years in the same cycle — and still have my moments. Two steps forward, one back. Building things and burning them. Knowing what I was doing and doing it anyway. The pattern expressed itself in many ways — from procrastination through to violence, addiction, and a level of self-destruction.
              </p>
              <p style={{ ...bodyText, fontSize: '1.2rem', lineHeight: 1.9 }}>
                What changed wasn't a book or a single breakthrough moment. It was sustained, structured work designed to get underneath the story you tell yourself and work with what's actually stored in the body.
              </p>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={sectionStyle('#ffffff')}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '48px',
              fontWeight: 500, color: TEXT,
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
                <div key={id} style={{ border: '1px solid #e5e5e5', borderRadius: '6px', overflow: 'hidden' }}>
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

        {/* ── THE PATTERN ── */}
        <section style={sectionStyle('#ffffff')}>
          <div style={inner}>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              You're currently running old code that was written long before you were old enough to question it. When this code continues to run unchecked, it shapes your relationships, your opportunities, and your ability to hold what you build.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px', fontWeight: 500 }}>
              When the code is interrupted, something changes.
            </p>
            {[
              "You stop sabotaging the very thing you say you want.",
              "You respond instead of react.",
              "You stay steady when things don't go your way.",
              "You make decisions without second-guessing yourself afterwards.",
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

        {/* ── HOW WE WORK ── */}
        <section style={sectionStyle('#f8f8f8')}>
          <div style={inner}>
            <h2 style={{ fontSize: isMobile ? '36px' : '48px', color: TEXT, marginBottom: '48px' }}>
              How we work
            </h2>

            <p style={{ ...bodyText, marginBottom: '32px' }}>
              This isn't random conversation — this work follows a clear path.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {[
                {
                  bold: 'See it.',
                  desc: " Catch the pattern that is running while understanding what's underneath it.",
                },
                {
                  bold: 'Regulate it.',
                  desc: " Your body still holds what the mind doesn't want to deal with. We release what's been stored over the years and build the capacity to hold pressure without reverting. Breathwork. Somatic work. Practical tools that stop the spiral before it starts.",
                },
                {
                  bold: 'Become it.',
                  desc: " Who does your goal require you to be? We close that gap. This cycle repeats, and is applied to real situations — until the old programme loses its grip, and we rewrite a new one.",
                },
              ].map((item, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: '20px' }}>
                  <p style={bodyText}>
                    <strong>{item.bold}</strong>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INSIDE THE CIRCLE ── */}
        <section style={sectionStyle('#ffffff')}>
          <div style={inner}>
            <h2 style={{ fontSize: isMobile ? '36px' : '48px', color: TEXT, marginBottom: '48px' }}>
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
                <div key={i} style={{
                  background: '#ffffff', border: '1px solid #e5e5e5',
                  borderRadius: '6px', padding: '28px',
                }}>
                  <p style={{
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '2px', textTransform: 'uppercase',
                    color: ACCENT, marginBottom: '10px', fontFamily: BODY_FONT,
                  }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: '16px', lineHeight: 1.65, color: TEXT, fontFamily: BODY_FONT }}>
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

        {/* ── CALENDAR ── */}
        <section style={{ ...sectionStyle('#f8f8f8'), paddingTop: isMobile ? '32px' : '48px', paddingBottom: isMobile ? '32px' : '48px' }}>
          <div style={inner}>
            <CircleCalendarTeaser />
          </div>
        </section>

        {/* ── CLOSING CTA ── */}
        <section style={{ ...sectionStyle('#f8f8f8'), textAlign: 'center' }}>
          <div style={inner}>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              You've read this far and that obviously means something. Men who aren't ready close the tab in the first two minutes.
            </p>
            <p style={{ ...bodyText, marginBottom: '48px' }}>
              You already know whether this is for you. You knew it somewhere in the first few paragraphs. What you're doing now is checking whether it's safe to trust that knowing.
            </p>

            <p style={{
              fontSize: isMobile ? '28px' : '34px',
              lineHeight: 1.3, color: TEXT,
              fontStyle: 'italic',
              fontFamily: "'Gambarino', serif",
              marginBottom: '48px',
            }}>
              Where you are now does not have to be where you end up.
            </p>

            <button
              onClick={() => setShowWaitlistPopup(true)}
              style={{
                display: 'inline-block', padding: '16px 40px',
                background: ACCENT, color: TEXT,
                fontSize: '16px', fontWeight: 600,
                borderRadius: '6px', border: 'none',
                cursor: 'pointer', transition: 'background 0.2s ease',
                fontFamily: BODY_FONT,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              Join the Waitlist
            </button>

            <p style={{ fontSize: '13px', color: MUTED, marginTop: '12px', fontFamily: BODY_FONT }}>
              We'll be in touch when doors open.
            </p>
          </div>
        </section>

      </main>

      {/* ── WAITLIST POPUP ── */}
      {showWaitlistPopup && (
        <div
          onClick={() => setShowWaitlistPopup(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1.5rem', backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              padding: isMobile ? '2.5rem 2rem' : '3rem 2.5rem',
              borderRadius: '8px', border: '1px solid #e5e5e5',
              maxWidth: '480px', width: '100%', position: 'relative'
            }}
          >
            <button
              onClick={() => setShowWaitlistPopup(false)}
              style={{
                position: 'absolute', top: '1.2rem', right: '1.2rem',
                background: 'transparent', border: 'none',
                color: '#999', fontSize: '1.5rem', cursor: 'pointer',
                padding: '0.3rem', lineHeight: '1'
              }}
            >
              ×
            </button>

            {submitted ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '1.5rem', fontWeight: 500, color: TEXT,
                  marginBottom: '12px', fontFamily: BODY_FONT,
                }}>
                  You're on the list.
                </p>
                <p style={{ fontSize: '1rem', color: MUTED, lineHeight: 1.6, fontFamily: BODY_FONT }}>
                  We'll reach out when doors open. Keep doing the work in the meantime.
                </p>
              </div>
            ) : (
              <>
                <h3 style={{
                  fontSize: isMobile ? '1.5rem' : '1.7rem',
                  color: TEXT, marginBottom: '8px',
                  fontWeight: 500, fontFamily: BODY_FONT,
                }}>
                  Join the Waitlist
                </h3>
                <p style={{
                  fontSize: '0.95rem', color: MUTED,
                  marginBottom: '2rem', lineHeight: 1.5, fontFamily: BODY_FONT,
                }}>
                  Be first to know when the Circle of Return opens.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      padding: '1rem', fontSize: '1rem',
                      borderRadius: '6px', border: '1px solid #e5e5e5',
                      background: '#f8f8f8', color: TEXT,
                      outline: 'none', transition: 'border-color 0.2s ease',
                      fontFamily: BODY_FONT,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e5e5')}
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '1rem', background: isSubmitting ? '#c5d9d5' : ACCENT,
                      color: TEXT, border: 'none',
                      fontWeight: 600, borderRadius: '6px',
                      fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s ease', fontFamily: BODY_FONT,
                    }}
                    onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = ACCENT_HOVER }}
                    onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = ACCENT }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Join the Waitlist'}
                  </button>

                  {message && (
                    <p style={{
                      textAlign: 'center', color: '#e53e3e',
                      fontSize: '0.85rem', fontFamily: BODY_FONT,
                    }}>
                      {message}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        input::placeholder { color: #aaa; }
      `}</style>
    </>
  )
}
