'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function FoundingMembersPage() {
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null)
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
    // Fetch current founding member count
    fetch('/api/founding/count')
      .then(res => res.json())
      .then(data => {
        const count = data.count || 0
        setSpotsRemaining(30 - count)
        setIsSoldOut(count >= 30)
      })
      .catch(() => setSpotsRemaining(30))

    // Track ViewContent event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: 'Founding Members Page',
        content_category: 'Membership'
      })
    }
  }, [])

  const handleStripeClick = () => {
    // Track InitiateCheckout event
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

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '2rem 1.5rem'
      }}>
        {/* Animated Background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '-10%',
            width: isMobile ? '20rem' : '30rem',
            height: isMobile ? '20rem' : '30rem',
            background: 'radial-gradient(circle, rgba(155, 196, 184, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(100px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '-10%',
            width: isMobile ? '20rem' : '30rem',
            height: isMobile ? '20rem' : '30rem',
            background: 'radial-gradient(circle, rgba(127, 176, 105, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(100px)'
          }}></div>
        </div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '70rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: isMobile ? '48px' : '72px',
            fontWeight: 700,
            marginBottom: '24px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#ffffff'
          }}>
            Join the First <span style={{
              background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}>30</span> in Circle of Return
          </h1>

          <p style={{
            fontSize: '20px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '16px',
            maxWidth: '700px',
            margin: '0 auto 16px'
          }}>
            Lock in <strong style={{ color: '#9bc4b8' }}>£25/month for life</strong>
          </p>

          <p style={{
            fontSize: '20px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px'
          }}>
            Regular price from next month: £50/month
          </p>

          {/* Spots Counter */}
          {spotsRemaining !== null && !isSoldOut && (
            <div style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'rgba(155, 196, 184, 0.1)',
              border: '1px solid rgba(155, 196, 184, 0.3)',
              borderRadius: '6px',
              marginBottom: '3rem',
              fontSize: isMobile ? '1rem' : '1.25rem'
            }}>
              <strong style={{ color: '#9bc4b8', fontSize: isMobile ? '1.5rem' : '2rem' }}>
                {spotsRemaining}
              </strong> of 30 spots remaining
            </div>
          )}

          {/* CTA Button or Sold Out */}
          {isSoldOut ? (
            <div>
              <div style={{
                padding: '1.5rem 3rem',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: 600,
                marginBottom: '2rem',
                color: '#ef4444'
              }}>
                SOLD OUT - First 30 Filled
              </div>

              {/* Waitlist Form */}
              {!waitlistSubmitted ? (
                <form onSubmit={handleWaitlistSubmit} style={{
                  maxWidth: '500px',
                  margin: '0 auto'
                }}>
                  <p style={{
                    fontSize: '1.125rem',
                    marginBottom: '1.5rem',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    Join the waitlist for the next cohort
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexDirection: isMobile ? 'column' : 'row' }}>
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      style={{
                        flex: 1,
                        padding: '1rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#000',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Join Waitlist
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(127, 176, 105, 0.2)',
                  border: '1px solid rgba(127, 176, 105, 0.4)',
                  borderRadius: '6px',
                  color: '#7fb069',
                  fontSize: '1.125rem'
                }}>
                  ✓ You're on the waitlist. We'll notify you when spots open.
                </div>
              )}
            </div>
          ) : (
            <a
              href="https://buy.stripe.com/28E8wQaH55Ehes807d9IQ0j"
              onClick={handleStripeClick}
              style={{
                display: 'inline-block',
                padding: '20px 40px',
                background: '#7fb069',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.3s ease',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              Secure Your Spot - £25/Month
            </a>
          )}
        </div>
      </section>

      {/* Story Section */}
      <section style={{
        padding: isMobile ? '80px 20px' : '120px 20px',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: 600,
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            A Glimpse Into My Journey
          </h2>

          <div style={{
            fontSize: '20px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            <p style={{ marginBottom: '24px' }}>
              Most people spend their lives responding to what happens around them, rather than creating the life they want.
            </p>

            <p style={{ marginBottom: '24px' }}>
              I was the same. For years, I lived in survival mode - addiction and destructive reactions became my norm. My conditioning ran so deep I didn't even realize I was protecting myself from threats that no longer existed.
            </p>

            <p style={{ marginBottom: '24px' }}>
              This left me stuck - playing it safe when I should have moved forward, taking reckless risks when I needed stability. The result? Deep unhappiness.
            </p>

            <p style={{ marginBottom: '24px' }}>
              Living in constant defense against invisible threats is no way to exist. The real threat was me - avoiding the parts of myself I didn't want to face.
            </p>

            <p style={{ marginBottom: '24px', fontWeight: 600, color: '#9bc4b8' }}>
              True growth requires knowing your whole self - the good and the uncomfortable.
            </p>

            <p>
              After a decade of this work and guiding hundreds through their own transformations, I see how universal this struggle is.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: isMobile ? '80px 20px' : '120px 20px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: 600,
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            Real Transformations
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {[
              'n8_muJ84AbU',
              '7Y1upKm8bZk',
              'ubCK70jYQDI',
              'UfbMIxlCzgM'
            ].map((videoId, i) => (
              <div key={i} style={{
                position: 'relative',
                paddingTop: '56.25%',
                background: '#000',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`Testimonial ${i + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section style={{
        padding: isMobile ? '80px 20px' : '120px 20px',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: 600,
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            What's Inside the Circle
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '24px'
          }}>
            {[
              { icon: '📚', title: 'Video Library', desc: 'Breathwork sessions, energy healing practices, and integration guidance' },
              { icon: '🎙️', title: 'Live Coaching Calls', desc: 'Monthly sessions with Mason + guest experts in their niches' },
              { icon: '🧘', title: 'Somatic Sessions', desc: 'Body-based practices to release stored trauma and tension' },
              { icon: '👥', title: 'Community Support', desc: 'Connect with men who understand when friends/family don\'t' },
              { icon: '💪', title: 'Confidence Building', desc: 'Goal setting, accountability, and real transformation' },
              { icon: '🔄', title: 'Healthy Habits', desc: 'Build new patterns and ways to view yourself' }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '32px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: '#9bc4b8'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: 1.7
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Exists */}
      <section style={{
        padding: isMobile ? '80px 20px' : '120px 20px'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: 600,
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            Why This Exists
          </h2>

          <div style={{
            fontSize: '20px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            <p style={{ marginBottom: '24px' }}>
              Since 2020, I've wanted to create The CoR. I didn't know what it would be, I just knew it had to give its members what this work has given me.
            </p>

            <p style={{ marginBottom: '24px' }}>
              Life is a search for truth - you just don't know it. The truth can hurt, which is why most avoid it. But confronting it is the only way to feel at peace with who you are and where you're going.
            </p>

            <p style={{ marginBottom: '24px', fontWeight: 600, color: '#ef4444' }}>
              Note: You cannot run away from yourself.
            </p>

            <p>
              The Circle of Return is here to shed the layers of conditioning you've been weighed down by.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: isMobile ? '80px 20px' : '120px 20px',
        background: 'rgba(155, 196, 184, 0.05)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: 600,
            marginBottom: '32px'
          }}>
            Founding Member Offer
          </h2>

          <p style={{
            fontSize: '20px',
            lineHeight: 1.7,
            marginBottom: '16px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            For the first 30 members:
          </p>

          <p style={{
            fontSize: isMobile ? '48px' : '72px',
            fontWeight: 700,
            color: '#9bc4b8',
            marginBottom: '16px',
            lineHeight: 1.1
          }}>
            £25/month for life
          </p>

          <p style={{
            fontSize: '20px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '48px'
          }}>
            Lock in this price forever. Regular price from next month: £50/month
          </p>

          {!isSoldOut ? (
            <>
              {spotsRemaining !== null && (
                <div style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  background: 'rgba(155, 196, 184, 0.15)',
                  border: '1px solid rgba(155, 196, 184, 0.3)',
                  borderRadius: '6px',
                  marginBottom: '2rem',
                  fontSize: isMobile ? '1.125rem' : '1.5rem'
                }}>
                  <strong style={{ color: '#9bc4b8', fontSize: isMobile ? '2rem' : '2.5rem' }}>
                    {spotsRemaining}
                  </strong> spots remaining
                </div>
              )}

              <div>
                <a
                  href="https://buy.stripe.com/28E8wQaH55Ehes807d9IQ0j"
                  onClick={handleStripeClick}
                  style={{
                    display: 'inline-block',
                    padding: '20px 40px',
                    background: '#7fb069',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '18px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.3s ease',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  Secure Your Spot - £25/Month
                </a>
              </div>
            </>
          ) : (
            <div style={{
              padding: '1.5rem 3rem',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '6px',
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              fontWeight: 600,
              color: '#ef4444'
            }}>
              All 30 Founding Spots Filled
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem 1.5rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.875rem'
      }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          True North
        </Link>
        {' · '}
        Circle of Return
        {' · '}
        {new Date().getFullYear()}
      </footer>
    </div>
  )
}
