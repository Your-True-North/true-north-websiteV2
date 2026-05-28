'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/app/components/GoogleAnalytics'

const STRIPE_URL = 'https://buy.stripe.com/28E8wQaH55Ehes807d9IQ0j'
const SPOTS_REMAINING = 10

const C = {
  dark:        '#0c0c0a',
  dark2:       '#111110',
  card:        '#1a1a18',
  border:      '#2c2c2a',
  cream:       '#f5f3ef',
  textDark:    '#f0ede8',
  mutedDark:   '#a0a09c',
  textLight:   '#1c1a18',
  mutedLight:  '#5a5a58',
  sage:        '#9bc4b8',
  sageDeep:    '#7da89c',
  borderLight: 'rgba(28,26,24,0.08)',
}

const SERIF = "Gambarino, Georgia, serif"
const SANS  = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: SANS,
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase' as const,
      color: C.sage,
      margin: '0 0 1.25rem',
    }}>{children}</p>
  )
}

function CTAButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-block',
        background: `linear-gradient(135deg, ${C.sage}, ${C.sageDeep})`,
        color: C.dark,
        padding: '1.125rem 2.75rem',
        borderRadius: '4px',
        fontWeight: 700,
        fontSize: '1rem',
        fontFamily: SANS,
        border: 'none',
        cursor: 'pointer',
        letterSpacing: '0.03em',
        textTransform: 'uppercase' as const,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      {children}
    </button>
  )
}

export default function FoundingMembersPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [gate, setGate] = useState<'question1' | 'question2' | 'open'>('question1')

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
    window.location.href = STRIPE_URL
  }

  const sec = isMobile ? '4rem 1.5rem' : '6rem 1.5rem'

  if (gate !== 'open') {
    return (
      <div style={{
        minHeight: '100vh',
        background: C.dark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: SANS,
      }}>
        <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>

          {gate === 'question1' && (
            <>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: C.sage, marginBottom: '2rem' }}>
                Before you read this
              </p>
              <h1 style={{ fontSize: isMobile ? '2rem' : '2.75rem', fontWeight: 700, lineHeight: 1.2, color: '#ffffff', marginBottom: '3rem', fontFamily: SANS }}>
                Did you click this link because you self-sabotage?
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button onClick={() => setGate('question2')} style={{ padding: '1.25rem 2rem', background: C.sage, border: 'none', borderRadius: '6px', color: C.dark, fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
                  Yes
                </button>
                <button onClick={() => setGate('open')} style={{ padding: '1.25rem 2rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 400, cursor: 'pointer', fontFamily: SANS }}>
                  No
                </button>
              </div>
              <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', fontFamily: SANS }}>
                There is no wrong answer.
              </p>
            </>
          )}

          {gate === 'question2' && (
            <>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: C.sage, marginBottom: '2rem' }}>
                Good. You just caught it.
              </p>
              <h1 style={{ fontSize: isMobile ? '2rem' : '2.75rem', fontWeight: 700, lineHeight: 1.2, color: '#ffffff', marginBottom: '1rem', fontFamily: SANS }}>
                Will you continue to self-sabotage by ignoring what comes next?
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', marginBottom: '3rem', lineHeight: 1.7, fontFamily: SANS }}>
                Most men will. They'll read this, feel something, and close the tab.<br />
                That's the pattern.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button onClick={() => setGate('open')} style={{ padding: '1.25rem 2rem', background: C.sage, border: 'none', borderRadius: '6px', color: C.dark, fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
                  No — show me what this is
                </button>
                <button onClick={() => window.history.back()} style={{ padding: '1.25rem 2rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 400, cursor: 'pointer', fontFamily: SANS }}>
                  Yes — I'll leave
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        nav, header, footer,
        [role='navigation'], [role='contentinfo'],
        [class*='footer'], [class*='Footer'] {
          display: none !important;
        }
      `}</style>

      <div style={{ fontFamily: SANS, overflowX: 'hidden' }}>

        {/* ── HERO ── dark */}
        <section style={{
          minHeight: '100vh',
          background: C.dark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '6rem 1.5rem 5rem' : '8rem 1.5rem 6rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <img
            src="/the-cor-logo.png"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? '260px' : '480px',
              height: 'auto',
              opacity: 0.07,
              pointerEvents: 'none',
              userSelect: 'none' as const,
              zIndex: 0,
            }}
          />
          <div style={{ maxWidth: '780px', width: '100%', position: 'relative', zIndex: 1 }}>
            <Label>Know Your North · Founding Members</Label>

            <h1 style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '2.75rem' : 'clamp(3rem, 7vw, 5rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              color: C.textDark,
              marginBottom: '1.75rem',
              letterSpacing: '-0.02em',
            }}>
              Find your direction.<br />Drown out the noise.
            </h1>

            <p style={{
              fontSize: isMobile ? '1.0625rem' : '1.2rem',
              lineHeight: 1.8,
              color: C.mutedDark,
              maxWidth: '600px',
              margin: '0 auto 3rem',
            }}>
              KYN is where you get clear on who you are and razor focused on where you're going. {SPOTS_REMAINING} founding spots at £25/month — price rises to £50 at member 21.
            </p>

            <CTAButton onClick={handleStripeClick}>Secure Your Founding Spot →</CTAButton>

            <p style={{ marginTop: '1.25rem', fontSize: '0.8125rem', color: 'rgba(160,160,156,0.5)', fontFamily: SANS }}>
              {SPOTS_REMAINING} of 20 founding spots remaining · £25/month fixed for life
            </p>
          </div>
        </section>

        {/* ── WHO THIS IS FOR ── cream */}
        <section style={{ padding: sec, background: C.cream }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <Label>Who This Is For</Label>
            <h2 style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: C.textLight,
              marginBottom: '2.5rem',
              letterSpacing: '-0.02em',
            }}>
              You already know this is you.
            </h2>

            {[
              "You have a version of yourself you can see clearly. The man who leads with confidence and builds something real. Who doesn't run away when things get hard.",
              "And you know there's a gap between that man and where you stand right now.",
              "Not because you lack ability or because you haven't tried. But because something underneath keeps pulling you back to where you started.",
              "Maybe it shows up in business. You build momentum — then somehow lose the contract, delay the launch, undercharge again. You watch the opportunity pass and wonder why you let it.",
              "Maybe it's relationships. You find yourself in the same argument, creating the same distance. The same moment where you shut down when you most needed to stay open.",
              "Maybe it's the version of yourself you perform in public versus the one you live with privately. The gap between those two men is exhausting to keep up.",
            ].map((para, i) => (
              <p key={i} style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: C.mutedLight, marginBottom: '1.25rem' }}>
                {para}
              </p>
            ))}

            <div style={{ borderLeft: `3px solid ${C.sage}`, paddingLeft: '1.5rem', margin: '2.5rem 0' }}>
              <p style={{
                fontFamily: SERIF,
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                lineHeight: 1.6,
                color: C.textLight,
                margin: 0,
                fontStyle: 'italic',
              }}>
                "I know you've read the books and listened to the podcasts. You have more self-awareness than most men you know, yet still the pattern runs. That's not a failure of effort."
              </p>
            </div>

            <p style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: C.textLight, fontWeight: 500, margin: 0 }}>
              That's the nature of what's in the blind spot — by definition, you cannot see it from inside it.
            </p>
          </div>
        </section>

        {/* ── MASON'S STORY ── dark */}
        <section style={{ padding: sec, background: C.dark2, borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <Label>Who Holds the Space</Label>
            <h2 style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: C.textDark,
              marginBottom: '2.5rem',
              letterSpacing: '-0.02em',
            }}>
              I'm not standing outside this work looking in.
            </h2>

            <div style={{
              display: 'inline-block',
              fontFamily: SANS,
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: C.sage,
              borderBottom: `1px solid ${C.sage}`,
              paddingBottom: '0.25rem',
              marginBottom: '2rem',
            }}>
              True North · Mason
            </div>

            {[
              "I'm True. And I'm not standing outside this work looking in.",
              "I spent years in the same cycle — and still have my moments. Two steps forward, one back. Building things and burning them. Knowing what I was doing and doing it anyway. The pattern expressed itself in many ways — from procrastination through to violence, addiction, and a level of self-destruction.",
              "What changed wasn't a book or a single breakthrough moment. It was sustained, structured work designed to get underneath the story you tell yourself and work with what's actually stored in the body.",
            ].map((para, i) => (
              <p key={i} style={{ fontSize: '1rem', lineHeight: 1.85, color: C.mutedDark, marginBottom: '1.25rem' }}>
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── dark */}
        <section style={{ padding: sec, background: C.dark }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <Label>What Changes</Label>
            <h2 style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: C.textDark,
              marginBottom: '3rem',
              letterSpacing: '-0.02em',
            }}>
              Real Transformations
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '1.5rem',
            }}>
              {['n8_muJ84AbU', '7Y1upKm8bZk', 'ubCK70jYQDI', 'UfbMIxlCzgM'].map((id) => (
                <div key={id} style={{ borderRadius: '6px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
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

        {/* ── THE PATTERN ── cream */}
        <section style={{ padding: sec, background: C.cream }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <Label>The Pattern</Label>
            <h2 style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: C.textLight,
              marginBottom: '2rem',
              letterSpacing: '-0.02em',
            }}>
              You're running old code.
            </h2>

            <p style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: C.mutedLight, marginBottom: '1.25rem' }}>
              Old code that was written long before you were old enough to question it. When this code continues to run unchecked, it shapes your relationships, your opportunities, and your ability to hold what you build.
            </p>
            <p style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: C.textLight, fontWeight: 500, marginBottom: '2rem' }}>
              When the code is interrupted, something changes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.375rem', marginBottom: '2.5rem' }}>
              {[
                'You stop sabotaging the very thing you say you want.',
                'You respond instead of react.',
                "You stay steady when things don't go your way.",
                'You make decisions without second-guessing yourself afterwards.',
              ].map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'rgba(155,196,184,0.12)', border: `1px solid ${C.sage}`,
                    flexShrink: 0, marginTop: '0.125rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.sage }} />
                  </div>
                  <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: C.textLight, margin: 0 }}>{line}</p>
                </div>
              ))}
            </div>

            <div style={{ borderLeft: `3px solid ${C.sage}`, paddingLeft: '1.5rem' }}>
              <p style={{
                fontFamily: SERIF,
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                lineHeight: 1.6,
                color: C.textLight,
                margin: 0,
                fontStyle: 'italic',
              }}>
                "Within your first 30 days, you will identify a pattern that has been influencing your decisions for years. Once you see it clearly, you cannot unsee it."
              </p>
            </div>
          </div>
        </section>

        {/* ── HOW WE WORK ── dark */}
        <section style={{ padding: sec, background: C.dark }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <Label>The Method</Label>
            <h2 style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: C.textDark,
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}>
              How we work
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: C.mutedDark, marginBottom: '3rem' }}>
              This isn't random conversation. This work follows a clear path.
            </p>

            {[
              { num: '01', bold: 'See it.', desc: "Catch the pattern that is running while understanding what's underneath it." },
              { num: '02', bold: 'Regulate it.', desc: "Your body still holds what the mind doesn't want to deal with. We release what's been stored over the years and build the capacity to hold pressure without reverting. Breathwork. Somatic work. Practical tools that stop the spiral before it starts." },
              { num: '03', bold: 'Become it.', desc: "Who does your goal require you to be? We close that gap. This cycle repeats, applied to real situations, until the old programme loses its grip and we rewrite a new one." },
            ].map((item, i) => (
              <div key={i} style={{ borderTop: `1px solid ${C.border}`, padding: '1.75rem 0', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: SANS, fontSize: '0.7rem', fontWeight: 700, color: C.sage, letterSpacing: '0.1em', marginTop: '0.2rem', flexShrink: 0 }}>
                  {item.num}
                </span>
                <div style={{ borderLeft: `3px solid ${C.border}`, paddingLeft: '1.25rem' }}>
                  <p style={{ fontSize: '1rem', lineHeight: 1.8, margin: 0 }}>
                    <strong style={{ color: C.textDark }}>{item.bold}</strong>{' '}
                    <span style={{ color: C.mutedDark }}>{item.desc}</span>
                  </p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${C.border}` }} />
          </div>
        </section>

        {/* ── INSIDE KYN ── cream */}
        <section style={{ padding: sec, background: C.cream }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Label>What You Get</Label>
            <h2 style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '2rem' : 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: C.textLight,
              marginBottom: '3rem',
              letterSpacing: '-0.02em',
            }}>
              Inside KYN
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
              {[
                { title: 'Two live deep sessions each month', desc: "Built around expansion topics that reveal the pattern underneath your decisions. You apply them to your real-life situations so the work moves you forward, not just inward." },
                { title: 'Two somatic regulation sessions', desc: "To help release what's been stuck and weighing you down. We build actual capacity, not just insight." },
                { title: 'Quarterly community goal mapping review', desc: "So you know exactly where you're tightening and where you're slipping." },
                { title: 'Exclusive supporting content', desc: 'We take a holistic approach: somatics, the psyche, and grounded spiritual perspectives. Understanding how and why you operate is one of the most powerful forms of growth.' },
                { title: 'Private community', desc: 'A private community of men doing the work properly. Not a place for big egos trying to out-perform.' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#ffffff', border: `1px solid ${C.borderLight}`, borderRadius: '6px', padding: '28px' }}>
                  <p style={{ fontFamily: SANS, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: C.sage, marginBottom: '0.75rem' }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: C.mutedLight, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                "You're looking at a few focused hours each month.",
                "Not endless. No daily tasks.",
                "Just consistent application in the areas that matter.",
              ].map((line, i) => (
                <p key={i} style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: C.mutedLight, margin: 0 }}>{line}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLOSING CTA ── dark */}
        <section style={{
          padding: isMobile ? '5rem 1.5rem' : '8rem 1.5rem',
          background: C.dark,
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <p style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: C.mutedDark, marginBottom: '1.5rem' }}>
              You've read this far and that obviously means something. Men who aren't ready close the tab in the first two minutes.
            </p>
            <p style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: C.mutedDark, marginBottom: '3rem' }}>
              You already know whether this is for you. You knew it somewhere in the first few paragraphs.
            </p>

            <h2 style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '2.25rem' : 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 400,
              lineHeight: 1.15,
              color: C.textDark,
              marginBottom: '2.5rem',
              letterSpacing: '-0.02em',
            }}>
              Where you are now does not have to be where you end up.
            </h2>

            <p style={{ fontSize: '0.9375rem', color: C.mutedDark, marginBottom: '2rem', fontFamily: SANS }}>
              Founding member price: £25/month. Locked in for life — rises to £50 at member 21.
            </p>

            <CTAButton onClick={handleStripeClick}>Secure Your Founding Spot →</CTAButton>

            <p style={{ marginTop: '1.25rem', fontSize: '0.8125rem', color: 'rgba(160,160,156,0.4)', fontFamily: SANS }}>
              {SPOTS_REMAINING} of 20 founding spots remaining · £25/month fixed for life
            </p>
          </div>
        </section>

      </div>
    </>
  )
}
