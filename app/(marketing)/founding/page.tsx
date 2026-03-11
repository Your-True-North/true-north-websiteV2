'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/app/components/GoogleAnalytics'

export default function FoundingMembersPage() {
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(10)
  const [isMobile, setIsMobile] = useState(false)
  const [isSoldOut, setIsSoldOut] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetch('/api/founding/count')
      .then(res => res.json())
      .then(data => {
        const count = data.count || 0
        const remaining = Math.max(0, 20 - count)
        setSpotsRemaining(remaining)
        setIsSoldOut(count >= 20)
      })
      .catch(() => setSpotsRemaining(10))

    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: 'Founding Members Page',
        content_category: 'Membership'
      })
    }
  }, [])

  useEffect(() => {
    const hideFooter = () => {
      const footers = document.querySelectorAll('footer, [role="contentinfo"], [class*="footer"], [class*="Footer"]');
      footers.forEach(footer => {
        (footer as HTMLElement).style.display = 'none';
      });
    };
    hideFooter();
    setTimeout(hideFooter, 100);
  }, [])

  const handleStripeClick = () => {
    trackEvent('begin_checkout', {
      service: 'circle_founding',
      value: 25
    })
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: 'Founding Membership',
        value: 25.00,
        currency: 'GBP'
      })
    }
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/founding/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail })
      })
      if (res.ok) {
        setWaitlistSubmitted(true)
        setWaitlistEmail('')
      }
    } catch (error) {
      console.error('Waitlist error:', error)
    }
  }

  const ctaButton = (
    <a
      href="https://buy.stripe.com/28E8wQaH55Ehes807d9IQ0j"
      onClick={handleStripeClick}
      style={{
        display: 'inline-block',
        padding: '24px 48px',
        background: '#ffffff',
        color: '#000000',
        fontSize: '18px',
        fontWeight: 700,
        borderRadius: '3px',
        border: '2px solid rgba(255,255,255,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        boxShadow: '0 4px 12px rgba(127,176,105,0.15)',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(127,176,105,0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(127,176,105,0.15)'
      }}
    >
      Secure Your Spot - £25/Month
    </a>
  )

  const soldOutBlock = (
    <div style={{
      padding: '24px 48px',
      background: 'rgba(239, 68, 68, 0.2)',
      border: '2px solid rgba(239, 68, 68, 0.4)',
      borderRadius: '3px',
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: 700,
      color: '#ef4444',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px'
    }}>
      SOLD OUT - First 20 Filled
    </div>
  )

  const waitlistBlock = (
    !waitlistSubmitted ? (
      <form onSubmit={handleWaitlistSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ fontSize: '18px', marginBottom: '24px', color: 'rgba(255,255,255,0.7)' }}>
          Join the waitlist for the next cohort
        </p>
        <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
          <input
            type="email"
            value={waitlistEmail}
            onChange={(e) => setWaitlistEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              flex: 1,
              padding: '16px 24px',
              background: 'rgba(255,255,255,0.05)',
              border: '2px solid rgba(255,255,255,0.1)',
              borderRadius: '3px',
              color: '#fff',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '16px 32px',
              background: '#ffffff',
              border: '2px solid rgba(255,255,255,0.1)',
              borderRadius: '3px',
              color: '#000000',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
              textTransform: 'uppercase' as const,
              letterSpacing: '1px'
            }}
          >
            Join Waitlist
          </button>
        </div>
      </form>
    ) : (
      <div style={{
        padding: '24px',
        background: 'rgba(127,176,105,0.2)',
        border: '2px solid rgba(127,176,105,0.4)',
        borderRadius: '3px',
        color: '#7fb069',
        fontSize: '18px',
        fontWeight: 600
      }}>
        You're on the waitlist. We'll notify you when spots open.
      </div>
    )
  )

  return (
    <>
      <style jsx global>{`
        nav,
        header,
        footer,
        [role="navigation"],
        [role="contentinfo"],
        [class*="footer"],
        [class*="Footer"] {
          display: none !important;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>

        {/* HERO */}
        <section style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: isMobile ? '100px 20px' : '200px 40px'
        }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', top: '20%', left: '-10%',
              width: isMobile ? '300px' : '500px', height: isMobile ? '300px' : '500px',
              background: 'radial-gradient(circle, rgba(155,196,184,0.15) 0%, transparent 70%)',
              borderRadius: '50%', filter: 'blur(100px)'
            }} />
            <div style={{
              position: 'absolute', bottom: '20%', right: '-10%',
              width: isMobile ? '300px' : '500px', height: isMobile ? '300px' : '500px',
              background: 'radial-gradient(circle, rgba(127,176,105,0.15) 0%, transparent 70%)',
              borderRadius: '50%', filter: 'blur(100px)'
            }} />
          </div>

          <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', textAlign: 'center', margin: '0 auto' }}>

            {/* Headline */}
            <h1 style={{
              fontSize: isMobile ? 'clamp(2rem, 10vw, 3rem)' : 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-1px',
              color: '#ffffff',
              marginBottom: '24px'
            }}>
              Most men can see their self-sabotage clearly.
              <span style={{ display: 'block', color: '#9bc4b8', fontStyle: 'italic', marginTop: '8px' }}>
                They just can't stop it alone.
              </span>
            </h1>

            <p style={{
              fontSize: isMobile ? '18px' : '22px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.7,
              maxWidth: '700px',
              margin: '0 auto 40px'
            }}>
              You're self-employed. You're self-aware. You're capable. You can see that you're getting in your way. And somehow - knowing it isn't enough to stop it.
            </p>

            <p style={{
              fontSize: isMobile ? '17px' : '20px',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
              maxWidth: '700px',
              margin: '0 auto 48px',
              fontStyle: 'italic'
            }}>
              The Circle of Return is a private community for men in their 30s and 40s who are done watching themselves repeat the pattern - and ready to finally interrupt it.
            </p>

            {/* Video */}
            <div style={{
              width: '100%',
              maxWidth: '800px',
              margin: '0 auto 48px',
              ...(isMobile ? {
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100vw'
              } : {})
            }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src="https://www.youtube.com/embed/GbpTduHxQ9s?modestbranding=1&rel=0&controls=0&showinfo=0&iv_load_policy=3"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Spots + CTA */}
            {spotsRemaining !== null && !isSoldOut && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: isMobile ? '18px' : '20px',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: 600,
                  marginBottom: '24px'
                }}>
                  <span style={{ fontSize: isMobile ? '36px' : '48px', color: '#9bc4b8', fontWeight: 800 }}>
                    {spotsRemaining}
                  </span>{' '}of 20 founding spots remaining
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              {isSoldOut ? soldOutBlock : ctaButton}
            </div>

            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginTop: '16px' }}>
              £25/month fixed for founding members - price rises to £50 at member 21
            </p>

            {isSoldOut && <div style={{ marginTop: '40px' }}>{waitlistBlock}</div>}
          </div>
        </section>

        {/* WHO THIS IS FOR */}
        <section style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(127,176,105,0.03) 100%)',
          padding: isMobile ? '100px 20px' : '120px 40px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '52px',
              fontWeight: 700,
              marginBottom: '48px',
              color: '#ffffff'
            }}>
              You already know this is you.
            </h2>

            <div style={{ fontSize: '19px', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
              <p style={{ marginBottom: '28px' }}>
                You have a version of yourself you can see clearly. The man who leads with confidence and builds something real. Who doesn't run away when things get hard.
              </p>
              <p style={{ marginBottom: '28px' }}>
                And you know there's a gap between that man and where you stand right now.
              </p>
              <p style={{ marginBottom: '28px' }}>
                Not because you lack ability or because you haven't tried. But because something underneath keeps pulling you back to where you started.
              </p>
              <p style={{ marginBottom: '28px' }}>
                Maybe it shows up in business. You build momentum - then somehow lose the contract, delay the launch, undercharge again. You watch the opportunity pass and wonder why you let it.
              </p>
              <p style={{ marginBottom: '28px' }}>
                Maybe it's relationships. You find yourself in the same argument, creating the same distance. The same moment where you shut down when you most needed to stay open.
              </p>
              <p style={{ marginBottom: '28px' }}>
                Maybe it's the version of yourself you perform in public versus the one you live with privately. The gap between those two men is exhausting to keep up.
              </p>
              <p style={{ marginBottom: '28px', fontWeight: 700, color: '#9bc4b8', fontSize: '21px' }}>
                My brother, all these different stories have the same root.
              </p>
              <p style={{ marginBottom: '28px' }}>
                I know you've read the books and listened to the podcasts. Maybe you've done therapy. You have more self-awareness than most men you know, yet still the pattern runs.
              </p>
              <p>
                That's not a failure of effort. That's the nature of what's in the blind spot - by definition, you cannot see it from inside it.
              </p>
            </div>
          </div>
        </section>

        {/* THE COST */}
        <section style={{ padding: isMobile ? '100px 20px' : '120px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '52px',
              fontWeight: 700,
              marginBottom: '48px',
              color: '#ffffff'
            }}>
              Do you know what this actually costs you?
            </h2>

            <div style={{ fontSize: '19px', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
              <p style={{ marginBottom: '28px' }}>
                Not the frustration or the self-criticism. The real cost.
              </p>
              <p style={{ marginBottom: '28px' }}>
                It's the business you've half-built three times and the deals that stalled because something in you sabotaged the close. It's the income ceiling that moves just fast enough to keep you feeling like you're chasing but never quite arriving.
              </p>
              <p style={{ marginBottom: '28px' }}>
                It's the relationship where you keep showing up as a smaller version of yourself. The one you pulled back from when it asked you to be fully present. The one you ended before it could end you first.
              </p>
              <p style={{ marginBottom: '28px' }}>
                It's waking up at 3am knowing exactly who you're capable of being - and not knowing why you keep choosing something less.
              </p>
              <p style={{ marginBottom: '28px', fontWeight: 700, color: '#9bc4b8', fontSize: '21px' }}>
                Most men spend years circling this alone. They get better at managing the pattern. They never actually break it.
              </p>
              <p>
                That's not who you are. And it's not where this has to end.
              </p>
            </div>
          </div>
        </section>

        {/* CREDIBILITY */}
        <section style={{
          background: 'rgba(0,0,0,0.3)',
          padding: isMobile ? '100px 20px' : '120px 40px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '52px',
              fontWeight: 700,
              marginBottom: '48px',
              color: '#ffffff'
            }}>
              I know this work from the inside.
            </h2>

            <div style={{ fontSize: '19px', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
              <p style={{ marginBottom: '28px' }}>
                I'm True. And I'm not standing outside this work looking in.
              </p>
              <p style={{ marginBottom: '28px' }}>
                I spent years in the same cycle - and still have my moments. Two steps forward, one back. Building things and burning them. Knowing what I was doing and doing it anyway. The pattern expressed itself in many ways - from procrastination through to violence, addiction, and a level of self-destruction.
              </p>
              <p style={{ marginBottom: '48px' }}>
                What changed wasn't a book or a single breakthrough moment. It was a shift in mindset. It was sustained, structured work designed to get underneath the story you tell yourself and work with what's actually stored in the body.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                {
                  title: 'ICF Transformational Coach',
                  desc: 'Internationally certified. The methodology is rigorous. The application is real-world.'
                },
                {
                  title: 'Somatic Therapy Practitioner - Trained by Gabor Mate',
                  desc: 'His work on trauma and the body-mind connection is some of the most important in the field. This isn\'t theoretical application - it\'s how I work with every man.'
                },
                {
                  title: 'Breathwork Facilitator',
                  desc: 'Breathwork accesses what conversation can\'t reach. I use it with precision, not spectacle.'
                },
                {
                  title: 'Reiki Master',
                  desc: 'Energy work as a complement to the deeper process, for the men who are open to it.'
                }
              ].map((cred, i) => (
                <div key={i} style={{
                  padding: '28px 32px',
                  background: 'rgba(155,196,184,0.05)',
                  border: '1px solid rgba(155,196,184,0.2)',
                  borderRadius: '3px',
                  borderLeft: '3px solid #9bc4b8'
                }}>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#9bc4b8', marginBottom: '8px' }}>
                    {cred.title}
                  </p>
                  <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                    {cred.desc}
                  </p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '19px', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', marginTop: '40px' }}>
              Textbooks don't cut it compared to lived experience navigating real situations. I've done this work on myself. That's the only reason I can guide you through it.
            </p>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding: isMobile ? '100px 20px' : '120px 40px', maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '36px' : '52px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '24px',
            color: '#ffffff'
          }}>
            From the men in the work.
          </h2>
          <p style={{
            fontSize: '20px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '700px',
            margin: '0 auto 64px'
          }}>
            I'm not going to tell you what's possible. The men who've done this work will.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {[
              { id: 'n8_muJ84AbU', label: 'Breaking the pattern' },
              { id: '7Y1upKm8bZk', label: 'Emotional transformation' },
              { id: 'ubCK70jYQDI', label: 'Business and identity' },
              { id: 'UfbMIxlCzgM', label: 'Relationship breakthrough' }
            ].map((video, i) => (
              <div key={i}>
                <p style={{
                  fontSize: '15px',
                  color: '#9bc4b8',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '12px'
                }}>
                  {video.label}
                </p>
                <div style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: '3px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.label}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{
          background: 'rgba(0,0,0,0.3)',
          padding: isMobile ? '100px 20px' : '120px 40px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '52px',
              fontWeight: 700,
              marginBottom: '24px',
              color: '#ffffff'
            }}>
              This isn't about more insight.
            </h2>
            <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '64px' }}>
              You already have insight. What you need is interruption, integration - and a structured container to do that work properly. The Circle of Return follows a clear progression. Not random conversation. Not motivational content. A method.
            </p>

            {[
              {
                step: '01',
                title: 'See It',
                desc: 'Most men know something is there. They don\'t know exactly what it is, where it comes from, or how it operates in the specific moments that matter most. We locate it. We name it. We make the invisible visible - so it stops running you blindly.'
              },
              {
                step: '02',
                title: 'Regulate It',
                desc: 'Insight without embodiment changes nothing. Your body still holds what your mind has moved on from. Breathwork and somatic work release what\'s been stored for years and build the actual capacity to hold pressure without reverting to the pattern. This is where most approaches fail - they stay in the head. We don\'t.'
              },
              {
                step: '03',
                title: 'Become It',
                desc: 'Who does your goal require you to be? We close that gap - applied to real situations, real decisions, real moments. The old programme loses its grip. We rewrite a new one. This cycle repeats - deeper each time - until the man you\'ve been performing becomes the man you simply are.'
              }
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '32px',
                marginBottom: '48px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: 'rgba(155,196,184,0.3)',
                  lineHeight: 1,
                  minWidth: '60px'
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#9bc4b8', marginBottom: '12px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHAT'S INSIDE */}
        <section style={{ padding: isMobile ? '100px 20px' : '120px 40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '52px',
              fontWeight: 700,
              marginBottom: '16px',
              color: '#ffffff'
            }}>
              What you get as a founding member.
            </h2>
            <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.6)', marginBottom: '64px' }}>
              A few focused hours each month. No daily check-ins. No tasks to manage. Just consistent application in the areas that move the needle.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                {
                  title: 'Two live deep-dive sessions each month',
                  desc: 'Built around the expansion topics that reveal the pattern underneath your decisions. You bring your real situations, and we work on them in real time. This is where insight becomes interruption.'
                },
                {
                  title: 'Two somatic regulation sessions each month',
                  desc: 'To release what\'s been sitting in the body that conversation can\'t reach. We build genuine capacity here - not just awareness. The ability to stay present under pressure without reverting.'
                },
                {
                  title: 'Quarterly community goal mapping',
                  desc: 'A structured review of exactly where you\'re tightening, where you\'re slipping, and what the next quarter needs to look like. Most men never do this kind of honest audit. Inside the CoR, we do.'
                },
                {
                  title: 'Exclusive supporting content library',
                  desc: 'Somatics, psychology, grounded spiritual perspective. Curated for life application, not just consumption.'
                },
                {
                  title: 'Private brotherhood community',
                  desc: 'Men doing this work properly. Not a place for performance or ego, but a place where honesty is the standard and the work is taken seriously.'
                }
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '32px 36px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '3px',
                  borderLeft: '3px solid rgba(155,196,184,0.4)'
                }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HONEST ANSWERS */}
        <section style={{
          background: 'rgba(0,0,0,0.3)',
          padding: isMobile ? '100px 20px' : '120px 40px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '52px',
              fontWeight: 700,
              marginBottom: '64px',
              color: '#ffffff'
            }}>
              The questions worth asking before you decide.
            </h2>

            {[
              {
                q: 'Is this therapy?',
                a: 'No. This is structured transformation work. We use somatic and breathwork methods that have therapeutic application, but this is not a clinical setting. If you\'re in a mental health crisis, therapy is the right place to start. If you\'re a functioning man with patterns that are limiting your life - this is built for you.'
              },
              {
                q: 'I\'ve done coaching before and it didn\'t stick. Why would this be different?',
                a: 'Because most coaching lives in the head. It gives you frameworks and asks you to apply them. When the pattern is rooted in the body - in nervous system responses shaped over decades - talking about it has a ceiling. We work below that ceiling. That\'s the difference.'
              },
              {
                q: 'Is this group work or 1:1?',
                a: 'The Circle is group-based - a private community with live sessions. The power is in working alongside other men who are being honest about their patterns. 1:1 work with me is available separately for men who want deeper personalised support alongside the community.'
              },
              {
                q: 'How long are the sessions and where do they happen?',
                a: 'Live sessions run via Zoom, typically 90 minutes. Somatic sessions are 60 minutes.'
              },
              {
                q: 'I don\'t have much time. Is this realistic?',
                a: 'The live sessions add up to roughly 5-6 focused hours a month. Everything else is asynchronous in the community. If you can\'t find 5 hours a month for the work that changes everything - that\'s worth looking at directly.'
              },
              {
                q: '£25 seems low. What\'s the catch?',
                a: 'There isn\'t one. This is a founding member price designed to build the initial cohort with committed men. You help build it, and 50% off is the thank you. Once 20 members are in, the price moves to £50. The men who join now lock in the founding rate for as long as they stay.'
              },
              {
                q: 'What if I join and it\'s not right for me?',
                a: 'Then you leave. What I\'d ask is that you give it 30 days and show up honestly. If you do the work and it\'s genuinely not landing, I\'ll respect that. What I won\'t do is hold space for men who aren\'t ready. If you\'re not sure you\'re ready - wait until you are.'
              }
            ].map((item, i) => (
              <div key={i} style={{
                marginBottom: '40px',
                paddingBottom: '40px',
                borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.06)' : 'none'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#9bc4b8', marginBottom: '14px' }}>
                  {item.q}
                </h3>
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* INVESTMENT */}
        <section style={{ padding: isMobile ? '100px 20px' : '120px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '52px',
              fontWeight: 700,
              marginBottom: '48px',
              color: '#ffffff'
            }}>
              What this costs. And what it doesn't.
            </h2>

            <div style={{ fontSize: '19px', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
              <p style={{ marginBottom: '28px' }}>
                The founding member rate is £25 per month - fixed for life for the first 20 men. The 21st pays £50.
              </p>
              <p style={{ marginBottom: '28px', fontWeight: 700, color: '#9bc4b8', fontSize: '21px' }}>
                The real question isn't whether £25 is worth it. The question is what the pattern has already cost you - and what it will continue to cost if you leave it running.
              </p>
              <p style={{ marginBottom: '28px' }}>
                Self-sabotage has a price. You've already been paying for it in missed opportunities. In relationships that didn't reach what they could have. In the version of yourself that keeps waiting for the conditions to be right.
              </p>
            </div>
          </div>
        </section>

        {/* CLOSING */}
        <section style={{
          padding: isMobile ? '100px 20px' : '120px 40px',
          background: 'radial-gradient(circle at center, rgba(127,176,105,0.08) 0%, transparent 70%)',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontSize: isMobile ? '36px' : '52px',
              fontWeight: 700,
              marginBottom: '48px',
              color: '#ffffff'
            }}>
              One last thing.
            </h2>

            <div style={{ fontSize: '19px', lineHeight: 1.9, color: 'rgba(255,255,255,0.8)', marginBottom: '48px' }}>
              <p style={{ marginBottom: '28px' }}>
                You've read this far and that obviously means something. Men who aren't ready close the tab in the first two minutes.
              </p>
              <p style={{ marginBottom: '28px' }}>
                You already know whether this is for you. You knew it somewhere in the first few paragraphs. What you're doing now is checking whether it's safe to trust that knowing.
              </p>
              <p style={{ marginBottom: '40px', fontWeight: 700, color: '#9bc4b8', fontSize: '24px', fontStyle: 'italic' }}>
                Where you are now does not have to be where you end up.
              </p>
              <p style={{ marginBottom: '28px' }}>
                I'm not asking you to fix yourself because you're not broken. I'm inviting you into a container where the pattern gets interrupted properly - with other men who are serious about the same work.
              </p>
              <p style={{ marginBottom: '48px' }}>
                No one can do this for you. But you don't have to do it alone.
              </p>
            </div>

            {!isSoldOut ? (
              <>
                {spotsRemaining !== null && (
                  <p style={{
                    fontSize: '18px',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '24px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}>
                    <span style={{ fontSize: '32px', color: '#9bc4b8', fontWeight: 800 }}>{spotsRemaining}</span> founding spots remaining
                  </p>
                )}
                <div style={{ marginBottom: '16px' }}>{ctaButton}</div>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginTop: '16px' }}>
                  £25/month fixed for founding members - price rises to £50 at member 21
                </p>
              </>
            ) : (
              <div>
                {soldOutBlock}
                <div style={{ marginTop: '40px' }}>{waitlistBlock}</div>
              </div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{
          padding: '40px 20px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '14px'
        }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>True North</Link>
          {' · '}Circle of Return{' · '}{new Date().getFullYear()}
        </footer>

      </div>
    </>
  )
}
