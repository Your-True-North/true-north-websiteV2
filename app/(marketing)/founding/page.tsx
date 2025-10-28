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
            fontSize: isMobile ? '2.5rem' : '4.5rem',
            fontWeight: 300,
            marginBottom: '1.5rem',
            lineHeight: 1.1,
            letterSpacing: '-0.02em'
          }}>
            Join the First <span style={{
              background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 400
            }}>30</span> in Circle of Return
          </h1>

          <p style={{
            fontSize: isMobile ? '1.25rem' : '1.75rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '1rem',
            fontWeight: 300
          }}>
            Lock in <strong style={{ color: '#9bc4b8' }}>£25/month for life</strong>
          </p>

          <p style={{
            fontSize: isMobile ? '1rem' : '1.25rem',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '3rem',
            fontWeight: 300
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
                padding: isMobile ? '1.25rem 2.5rem' : '1.5rem 4rem',
                background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                border: 'none',
                borderRadius: '6px',
                color: '#000',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                boxShadow: '0 4px 20px rgba(155, 196, 184, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 30px rgba(155, 196, 184, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(155, 196, 184, 0.3)'
              }}
            >
              Secure Your Spot - £25/Month
            </a>
          )}
        </div>
      </section>

      {/* Mason's Story */}
      <section style={{
        padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ maxWidth: '50rem', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 300,
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Mason's Story
          </h2>

          <div style={{
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            lineHeight: 1.8,
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 300
          }}>
            <p style={{ marginBottom: '1.5rem' }}>
              You, like most, are probably reacting to life instead of building it…
            </p>

            <p style={{ marginBottom: '1.5rem' }}>
              Much of my life was spent reacting. My reactions came in the form of addiction and destructive patterns. My conditioning ran so deep that I was unaware my whole way of being was because I was living in survival. I constantly had a guard up, protecting me from threats that no longer existed.
            </p>

            <p style={{ marginBottom: '1.5rem' }}>
              This made me hesitant, unsure, either playing things too safe or taking too much of a risk. This is what led to my unhappiness.
            </p>

            <p style={{ marginBottom: '1.5rem' }}>
              How could I ever truly be happy living from invisible threats? The only real threat being myself - I was scared to really look at myself and accept the parts I disliked.
            </p>

            <p style={{ marginBottom: '1.5rem', fontWeight: 400, color: '#9bc4b8' }}>
              To be your best self, you have to know your whole self.
            </p>

            <p>
              Now, ten years into this work - having coached hundreds - I realise how common this is.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 300,
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            Transformation Stories
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '2rem'
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                position: 'relative',
                paddingTop: '56.25%',
                background: '#000',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(155, 196, 184, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '0.875rem'
                }}>
                  Testimonial Video {i}
                  <br />
                  (YouTube embed placeholder)
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section style={{
        padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ maxWidth: '60rem', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 300,
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            What's Inside the Circle
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '2rem'
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
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.05), rgba(127, 176, 105, 0.02))',
                border: '1px solid rgba(155, 196, 184, 0.2)',
                borderRadius: '6px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  marginBottom: '0.75rem',
                  color: '#9bc4b8'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: 1.6
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
        padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem'
      }}>
        <div style={{ maxWidth: '50rem', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 300,
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Why This Exists
          </h2>

          <div style={{
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            lineHeight: 1.8,
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 300
          }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Since 2020, I've wanted to create The CoR. I didn't know what it would be, I just knew it had to give its members what this work has given me.
            </p>

            <p style={{ marginBottom: '1.5rem' }}>
              Life is a search for truth - you just don't know it. The truth can hurt, which is why most avoid it. But confronting it is the only way to feel at peace with who you are and where you're going.
            </p>

            <p style={{ marginBottom: '1.5rem', fontWeight: 400, color: '#ef4444' }}>
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
        padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.1), rgba(127, 176, 105, 0.05))',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '50rem', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 300,
            marginBottom: '2rem'
          }}>
            Founding Member Offer
          </h2>

          <p style={{
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            marginBottom: '1rem',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            For the first 30 members:
          </p>

          <p style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: 400,
            color: '#9bc4b8',
            marginBottom: '1rem'
          }}>
            £25/month for life
          </p>

          <p style={{
            fontSize: isMobile ? '1rem' : '1.25rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '3rem'
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
                    padding: isMobile ? '1.25rem 2.5rem' : '1.5rem 4rem',
                    background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#000',
                    fontSize: isMobile ? '1.25rem' : '1.5rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    boxShadow: '0 4px 20px rgba(155, 196, 184, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 30px rgba(155, 196, 184, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(155, 196, 184, 0.3)'
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
