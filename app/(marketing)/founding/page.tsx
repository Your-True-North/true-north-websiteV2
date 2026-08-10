'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/app/components/GoogleAnalytics'
import PricingToggle from '@/components/PricingToggle'

const STRIPE_URL = 'https://buy.stripe.com/28E8wQaH55Ehes807d9IQ0j'

const ACCENT  = '#9bc4b8'
const TEXT    = '#0a0a0a'
const MUTED   = '#5a5a58'
const SERIF   = "Gambarino, Georgia, serif"
const SANS    = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const CREAM   = '#f5f3ef'
const BORDER  = 'rgba(10,10,10,0.10)'

// Typographic scale — Perfect Fourth (×1.333)
// xs:   0.75rem  / 12px  — labels, captions, fine print
// sm:   1rem     / 16px  — secondary notes
// base: 1.0625rem/ 17px  — primary body (optimal 16-18px range)
// md:   1.333rem / 21px  — lead text, pull quotes
// lg:   1.777rem / 28px  — small display, kicker
// xl:   2.5rem   / 40px  — kicker display
// h2:   clamp(2rem → 3rem)
// h1:   clamp(3rem → 5rem)

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

// 0.75rem / 12px — minimum readable for uppercase labels
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


export default function FoundingMembersPage() {
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

  // Sends people to the pricing block so they choose monthly or yearly there.
  // Checkout itself, and the InitiateCheckout event, now fire inside PricingToggle.
  const handleStripeClick = () => {
    trackEvent('view_pricing', { service: 'circle_founding' })
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const sec = isMobile ? '4rem 1.5rem' : '6rem 1.5rem'
  const inner = { maxWidth: '700px', margin: '0 auto' }

  const pillars = [
    {
      num: '01',
      label: 'The Foundation',
      title: 'See it.',
      body: "You cannot change what you cannot see. The first layer is self-awareness, catching the pattern that has been running your decisions. This is where the blind spot comes into your vision. Followed by a sense of relief… Then more work to remove it.",
    },
    {
      num: '02',
      label: 'The Work',
      title: 'Regulate it.',
      body: "Your body still holds what the mind has already made sense of. Through somatic work, breathwork, and nervous system regulation, we release what has been stored and build real capacity, the kind that lets you hold pressure without reverting to the old pattern.",
    },
    {
      num: '03',
      label: 'The Becoming',
      title: 'Become it.',
      body: "Who does your goal require you to be? We close that gap in real time, applied to your actual life. This cycle never ends, it deepens. Each layer removed reveals the next, and that is the nature of this journey.",
    },
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

        {/* HERO */}
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

            {/* Logo above text */}
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

            {/* Eyebrow labels — 0.75rem / 12px */}
            <p style={{
              fontFamily: SANS,
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: TEXT,
              margin: '0 0 0.35rem',
            }}>Know Your North</p>


            {/* Kicker — 2.5rem / 40px italic, sits just below h1 on the scale */}
            <p style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '1.75rem' : '2.5rem',
              fontStyle: 'italic',
              color: TEXT,
              marginBottom: '0.4rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              Drown out the noise.
            </p>

            {/* H1 — clamp(3rem → 5rem), 1.5px stroke for weight */}
            <h1 style={{
              ...H1,
              fontSize: isMobile ? '2.75rem' : 'clamp(3rem, 7vw, 5rem)',
              marginBottom: '1.75rem',
            }}>
              Find your direction.
            </h1>

            {/* Lead — 1.2rem / 19px on desktop (within the 16-21px lead text range) */}
            <p style={{
              fontSize: isMobile ? '1.0625rem' : '1.2rem',
              lineHeight: 1.75,
              color: MUTED,
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              fontFamily: SANS,
            }}>
              KYN is where you get clear on who you are and razor focused on where you're going.
            </p>

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
              Secure Your Founding Spot
            </button>

            {/* Fine print — 0.8125rem / 13px, acceptable for legal/secondary */}
            <p style={{ marginTop: '1rem', fontSize: '0.8125rem', lineHeight: 1.6, color: MUTED, fontFamily: SANS }}>
              <strong>£25/month fixed for life. Price rises to £50 at member 51.</strong>
            </p>
          </div>
        </section>

        {/* PROOF BAR */}
        <section style={{ background: CREAM, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '2rem 1.5rem' }}>
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)',
            gap: isMobile ? '1.5rem' : '1rem',
            textAlign: 'center',
          }}>
            {[
              { value: 'Somatic Therapy Practitioner', label: 'Trained under Dr Gabor Maté' },
              { value: 'ICF & EMCC Certified', label: 'Internationally accredited Transformational Coach' },
              { value: 'Cancel Any Time', label: 'No contracts, no pressure' },
              { value: 'Limited Spots: £25/month', label: '£50 at member 51' },
              { value: 'Real Men, Real Work', label: 'No egos, no judgment' },
            ].map(({ value, label }, i) => (
              <div key={value} style={{ padding: isMobile ? '0' : '0 0.5rem', ...(isMobile && i === 4 ? { gridColumn: '1 / -1' } : {}) }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: TEXT, fontFamily: SANS, marginBottom: '0.3rem' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: MUTED, fontFamily: SANS, lineHeight: 1.5 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ORIGIN STORY */}
        <section style={{ padding: sec, background: '#ffffff' }}>
          <div style={inner}>
            <Label>Why Know Your North</Label>

            {[
              'A while back, I created a community called the Circle of Return.',
              'I called it that because I believe, no, I feel down to my core, that our whole purpose for being here is to reconnect with our truth. The part of us that lives underneath the conditioning of everything we were told to be.',
              'But I came to see that there\'s something we need before that.',
            ].map((para, i) => (
              <p key={i} style={{ ...BODY, marginBottom: '1.25rem' }}>{para}</p>
            ))}

            <p style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '1.777rem' : '2.5rem',
              color: TEXT,
              lineHeight: 1.1,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              margin: '2rem 0',
            }}>
              We need Direction.
            </p>

            {[
              'Knowing where we\'re going, and being able to navigate the obstacles that stand between here and there.',
              'That\'s why the Circle of Return shifted, in name and in focus, to Know Your North.',
              'I learned some stuff working with men for nearly a decade: When we have clear direction, everything changes. The overwhelm eases, the anxiety loses its grip. The uncertainty stops feeling like a threat and starts feeling like a path to follow.',
            ].map((para, i) => (
              <p key={i} style={{ ...BODY, marginBottom: '1.25rem' }}>{para}</p>
            ))}

            <p style={{ ...BODY, color: ACCENT, fontWeight: 500, marginTop: '1.5rem', margin: 0 }}>
              Men that find alignment with where they're supposed to be going, actually get there.
            </p>
          </div>
        </section>

        {/* WHO THIS IS FOR */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>Who This Is For</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '2.5rem' }}>
              You already know this is for you.
            </h2>

            {[
              "You have a version of yourself you can see clearly. The man who leads with confidence and builds something, he's a man who doesn't run away when things get hard.",
              "And you know there's a gap between that man and where you stand right now.",
              "You also know that this isn't because you lack the ability or because you haven't tried, but because something underneath keeps pulling you back to where you started.",
              "Maybe it shows up in business. You build momentum, then somehow lose the contract, delay the launch, undercharge again. You watch yet another opportunity pass you by.",
              "Maybe it's relationships. You find yourself in the same argument, creating the same distance, arriving at the same moment where you shut down or kick off when you most needed to stay open and calm.",
              "Maybe it's the version of yourself you perform in public versus the one you live with privately. The gap between those two men is exhausting to maintain.",
            ].map((para, i) => (
              <p key={i} style={{ ...BODY, marginBottom: '1.25rem' }}>{para}</p>
            ))}

            {/* Pull quote — 1.333rem / 21px, one step up from body */}
            <div style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: '1.5rem', margin: '2.5rem 0' }}>
              <p style={{
                fontFamily: SERIF,
                fontSize: isMobile ? '1.2rem' : '1.333rem',
                lineHeight: 1.6,
                color: TEXT,
                margin: 0,
                fontStyle: 'italic',
                WebkitTextStroke: '0.3px currentColor',
              }}>
                "I know you've read the books and listened to the podcasts. You have more self-awareness than most men you know, yet still the pattern repeats. You're not failing my man, you're navigating."
              </p>
            </div>

            <p style={{ ...BODY, color: TEXT, fontWeight: 500, margin: 0 }}>
              That's the nature of what's in the blind spot. By definition, you cannot see it from inside it.
            </p>
          </div>
        </section>

        {/* MASON'S STORY */}
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

            {[
              "I'm True, and I'm not one of those standing outside this work looking in.",
              "I spent years in the same cycle, and still have my moments. I took two steps forward and one back, building things and subconsciously sabotaging them, in the back of my mind I could see what I was doing and doing it anyway. The pattern expressed itself in many ways, from procrastination through to violence, addiction, and a level of self-destruction that I am not proud of.",
              "What changed wasn't a book or a single breakthrough moment. It was sustained, structured work designed to get underneath the story you tell yourself and work with what's actually stored in the body.",
              "I created KYN because I know what it means to do this work without a real community around you. The men in here aren't here to look good. They're here to build something real.",
            ].map((para, i) => (
              <p key={i} style={{ ...BODY, marginBottom: '1.25rem' }}>{para}</p>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding: sec, background: '#ffffff', borderTop: `1px solid ${BORDER}` }}>
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

        {/* THE JOURNEY */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={inner}>
            <Label>The Journey</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '0.75rem' }}>
              This is not a programme with an end date. It is a path you keep walking.
            </h2>
            <p style={{ ...BODY, marginBottom: '3rem' }}>
              There is no graduation date and no fixed moment where the work is done. This is a continuous deepening applied to what is actually happening in your life right now.
            </p>

            {pillars.map((pillar, i) => (
              <div
                key={i}
                style={{ borderTop: `1px solid ${BORDER}`, padding: '1.75rem 0', cursor: 'pointer' }}
                onClick={() => setOpenPillar(openPillar === i ? null : i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: SANS, fontSize: '0.75rem', fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', marginTop: '0.5rem', flexShrink: 0 }}>
                      {pillar.num}
                    </span>
                    <div>
                      <p style={{ fontFamily: SANS, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, margin: '0 0 0.375rem' }}>
                        {pillar.label}
                      </p>
                      <h3 style={{ ...H3, fontSize: isMobile ? '1.333rem' : '1.625rem', margin: 0 }}>
                        {pillar.title}
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
                    {pillar.body}
                  </p>
                )}
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${BORDER}` }} />
          </div>
        </section>

        {/* BROTHERHOOD */}
        <section style={{ padding: sec, background: '#ffffff', borderTop: `1px solid ${BORDER}` }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '3rem' : '5rem',
          }}>
            <div>
              <Label>This is for you if</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                {[
                  "You're done wearing a mask and being a version of yourself that isn't real.",
                  "You want to be around men who are actually doing the work, not just talking about it.",
                  "You're ready to build something lasting, rather than half-arsing something that goes nowhere.",
                  "You know there's a better version of you available, and you're prepared to go get it.",
                  "You want to get close to other brothers who will root for you and hold you to what you said you wanted.",
                ].map((line, i) => (
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
                {[
                  "You're looking for a hype group or a place to look good.",
                  "You want strategies to manage the pattern rather than face it.",
                  "You're not willing to be honest with yourself.",
                ].map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `1.5px solid ${BORDER}`, flexShrink: 0, marginTop: '0.2rem' }} />
                    <p style={{ ...BODY, margin: 0 }}>{line}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '3rem', borderLeft: `3px solid ${ACCENT}`, paddingLeft: '1.25rem' }}>
                <p style={{
                  fontFamily: SERIF,
                  fontSize: '1.333rem',
                  lineHeight: 1.6,
                  color: TEXT,
                  fontStyle: 'italic',
                  margin: 0,
                  WebkitTextStroke: '0.3px currentColor',
                }}>
                  "A brotherhood of men with purpose, not a bro club or a hype room, but a community that genuinely builds."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* INSIDE KYN */}
        <section style={{ padding: sec, background: CREAM, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Label>What You Get</Label>
            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '3rem' }}>
              Inside KYN
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
              {[
                { title: 'Two live deep sessions each month', desc: "Built around expansion topics that reveal the pattern underneath your decisions, applied to your real situations so the work moves you forward rather than just inward." },
                { title: 'Two somatic regulation sessions', desc: "To help release what has been stuck and weighing you down. We build actual capacity, the kind that holds it together under real pressure." },
                { title: 'Quarterly community goal mapping', desc: "So you know exactly where you're tightening, where you're slipping, and what the next chapter genuinely requires of you." },
                { title: 'Exclusive supporting content', desc: 'We take a holistic approach across somatic experiencing, the psyche, and grounded spiritual perspectives, because understanding how and why you operate is one of the most powerful forms of growth.' },
                { title: 'Private brotherhood', desc: "A private community of men doing the work properly. Not a place for big egos trying to out-perform each other, but a space where men build, challenge each other, and show up." },
              ].map((item, i) => (
                <div key={i} style={{ background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '1.75rem' }}>
                  {/* Card label — 0.75rem / 12px uppercase */}
                  <p style={{ fontFamily: SANS, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: ACCENT, marginBottom: '0.625rem' }}>
                    {item.title}
                  </p>
                  <p style={{ ...BODY, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <p style={{ ...BODY, margin: 0 }}>
              You are looking at a few focused hours each month, no endless content to consume and no daily task lists, just consistent structured work applied to the life you are actually living.
            </p>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section style={{ padding: isMobile ? '5rem 1.5rem' : '8rem 1.5rem', background: '#ffffff', borderTop: `1px solid ${BORDER}`, textAlign: 'center' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>

            <p style={{ ...BODY, marginBottom: '1.25rem' }}>
              You've read this far and that obviously means something. Men who aren't ready close the tab in the first two minutes.
            </p>
            <p style={{ ...BODY, marginBottom: '3rem' }}>
              You already know whether this is for you. You knew it somewhere in the first few paragraphs. What you're doing right now is checking whether it's safe to trust that knowing.
            </p>

            <h2 style={{ ...H2, fontSize: isMobile ? '1.777rem' : 'clamp(2.25rem, 5vw, 3.75rem)', marginBottom: '2.5rem' }}>
              Where you are now does not have to be where you end up.
            </h2>

            <PricingToggle ctaLabel="Secure Your Founding Spot" trackingId="founding" />
          </div>
        </section>

      </div>
    </>
  )
}
