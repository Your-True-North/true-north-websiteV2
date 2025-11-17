'use client'

import CircleCalendarTeaser from '../circle/components/CircleCalendarTeaser'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/app/components/GoogleAnalytics'

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
        setSpotsRemaining(20)
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

  useEffect(() => {
    // Hide footer on this page only
    const hideFooter = () => {
      const footers = document.querySelectorAll('footer, [role="contentinfo"], [class*="footer"], [class*="Footer"]');
      footers.forEach(footer => {
        (footer as HTMLElement).style.display = 'none';
      });
    };

    hideFooter();
    // Run again after a brief delay to catch any delayed renders
    setTimeout(hideFooter, 100);
  }, [])

  const handleStripeClick = () => {
    // Track GA4 event
    trackEvent('begin_checkout', {
      service: 'circle_founding',
      value: 25
    })

    // Track Facebook Pixel event
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
        {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: isMobile ? '100px 20px' : '200px 40px'
      }}>
        {/* Animated Background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '-10%',
            width: isMobile ? '300px' : '500px',
            height: isMobile ? '300px' : '500px',
            background: 'radial-gradient(circle, rgba(155, 196, 184, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(100px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '-10%',
            width: isMobile ? '300px' : '500px',
            height: isMobile ? '300px' : '500px',
            background: 'radial-gradient(circle, rgba(127, 176, 105, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(100px)'
          }}></div>
        </div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1400px',
          textAlign: 'center',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: isMobile ? "clamp(2rem, 10vw, 3rem)" : "clamp(3.5rem, 8vw, 5rem)",
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-2px',
            background: 'linear-gradient(135deg, #ffffff 0%, #9bc4b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '32px'
          }}>
            Join the First <span style={{
              background: 'linear-gradient(135deg, #7fb069 0%, #9bc4b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>30</span> in Circle of Return
          </h1>

          <p style={{
            fontSize: isMobile ? '20px' : '28px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.4,
            maxWidth: '700px',
            margin: '0 auto 48px'
          }}>
            Lock in <strong style={{ color: '#9bc4b8' }}>£25/month FIXED</strong>. Never increases.
          </p>

          {/* Spots Counter */}
          {spotsRemaining !== null && !isSoldOut && (
            <div style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '0',
              padding: '40px',
              textAlign: 'center',
              maxWidth: '500px',
              margin: '0 auto 40px'
            }}>
          {/* YouTube Video */}
          <div style={{
            width: isMobile ? '100vw' : '100%',
            maxWidth: '900px',
            margin: isMobile ? '0 0 48px 0' : '0 auto 48px',
            position: isMobile ? 'relative' : 'static',
            left: isMobile ? '50%' : 'auto',
            transform: isMobile ? 'translateX(-50%)' : 'none'
          }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://www.youtube.com/embed/GbpTduHxQ9s?modestbranding=1&rel=0&controls=0&showinfo=0&iv_load_policy=3"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
              <div style={{
                fontSize: isMobile ? '56px' : '72px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #7fb069 0%, #9bc4b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                lineHeight: 1
              }}>
                {spotsRemaining}
              </div>
              <div style={{
                fontSize: '20px',
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontWeight: 600
              }}>
                of 30 spots remaining
              </div>
            </div>
          )}

          {/* CTA Button or Sold Out */}
          {isSoldOut ? (
            <div>
              <div style={{
                padding: '24px 48px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '3px',
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: 700,
                marginBottom: '32px',
                color: '#ef4444',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                SOLD OUT - First 30 Filled
              </div>

              {/* Waitlist Form */}
              {!waitlistSubmitted ? (
                <form onSubmit={handleWaitlistSubmit} style={{
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  <p style={{
                    fontSize: '18px',
                    marginBottom: '24px',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
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
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
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
                        background: 'linear-gradient(135deg, #7fb069 0%, #9bc4b8 100%)',
                        border: '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        color: '#0a0a0a',
                        fontSize: '16px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        textTransform: 'uppercase',
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
                  background: 'rgba(127, 176, 105, 0.2)',
                  border: '2px solid rgba(127, 176, 105, 0.4)',
                  borderRadius: '3px',
                  color: '#7fb069',
                  fontSize: '18px',
                  fontWeight: 600
                }}>
                  ✓ You're on the waitlist. We'll notify you when spots open.
                </div>
              )}
            </div>
          ) : (
            <>
              
              <a
                href="https://buy.stripe.com/28E8wQaH55Ehes807d9IQ0j"
              onClick={handleStripeClick}
              style={{
                display: 'inline-block',
                padding: '24px 48px',
                background: 'linear-gradient(135deg, #7fb069 0%, #9bc4b8 100%)',
                color: '#0a0a0a',
                fontSize: '18px',
                fontWeight: 700,
                borderRadius: '3px',
                border: '2px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
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
            </>
          )}
        </div>
      </section>

      {/* Story Section */}
      <section style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(127,176,105,0.03) 100%)',
        padding: isMobile ? '100px 20px' : '120px 40px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '36px' : '56px',
            fontWeight: 700,
            marginBottom: '48px',
            textAlign: 'center',
            color: '#ffffff'
          }}>
            A Glimpse Into The Path
          </h2>

          <div style={{
            fontSize: '19px',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 400
          }}>
            <p style={{ marginBottom: '28px' }}>
              Most people spend their lives responding to what happens around them, rather than creating the life they want.
            </p>

            <p style={{ marginBottom: '28px' }}>
              I was the same. For years, I lived in survival mode - addiction and destructive reactions became my norm. My conditioning ran so deep I didn't even realize I was protecting myself from threats that no longer existed.
            </p>

            <p style={{ marginBottom: '28px' }}>
              This left me stuck - playing it safe when I should have moved forward, taking reckless risks when I needed stability. The result? Deep unhappiness.
            </p>

            <p style={{ marginBottom: '28px' }}>
              Living in constant defense against invisible threats is no way to exist. The real threat was me - avoiding the parts of myself I didn't want to face.
            </p>

            <p style={{ marginBottom: '28px', fontWeight: 600, color: '#9bc4b8', fontSize: '21px' }}>
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
        padding: isMobile ? '100px 20px' : '120px 40px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: isMobile ? '36px' : '56px',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '24px',
          color: '#ffffff'
        }}>
          Real Transformations
        </h2>

        <p style={{
          fontSize: '20px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: '80px',
          maxWidth: '700px',
          margin: '0 auto 80px'
        }}>
          See how others just like you broke free from old patterns
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: '32px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            'n8_muJ84AbU',
            '7Y1upKm8bZk',
            'ubCK70jYQDI',
            'UfbMIxlCzgM'
          ].map((videoId, i) => (
            <div key={i} style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              borderRadius: '3px',
              border: '1px solid rgba(255,255,255,0.1)'
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
      </section>

      {/* What's Inside */}
      <section style={{
        padding: isMobile ? '100px 20px' : '160px 40px',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '36px' : '56px',
            fontWeight: 700,
            marginBottom: '80px',
            textAlign: 'center',
            color: '#ffffff'
          }}>
            What's Inside the Circle
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '32px'
          }}>
            {[
              { title: 'Video Library', desc: 'Breathwork sessions, energy healing practices, somatic exercises, and integration guidance. New content added monthly. Everything you need to work through what\'s stored in your body and release what\'s been weighing you down.' },
              { title: 'Live Coaching Calls', desc: 'Bi-weekly sessions with Mason plus guest experts in their fields. Bring your questions, your struggles, your breakthroughs. Get real-time guidance and watch others navigate their own journeys. All recorded for members who can\'t attend live.' },
              { title: 'Somatic Sessions', desc: 'Body-based practices to release stored trauma and tension that talk therapy can\'t reach. Learn to feel what you\'ve been avoiding and let it move through you instead of staying stuck. Your body holds memories your mind has forgotten.' },
              { title: 'Community Support', desc: 'Connect with others who understand when friends and family don\'t. No posturing, no fake growth talk. Just real people doing real work on themselves. The support system you didn\'t know you needed.' },
              { title: 'Confidence Building', desc: 'Goal setting, accountability, and real transformation. Learn to trust yourself again. Build the life you actually want instead of the one you think you should want. Deep work that creates lasting change.' },
              { title: 'Healthy Habits', desc: 'Build new patterns and ways to view yourself that actually stick. Break the cycles that keep you stuck. Replace self-destruction with self-respect. Small shifts that compound into massive life changes over time.' },
              { title: 'Grounded Spirituality', desc: 'Monthly teachings on connecting to your higher self and working with energy without the woo-woo bullshit. God/Allah/Jah/Universe - it\'s all the same. Learn to feel what\'s beyond your five senses while keeping your feet firmly on the ground.' },
              { title: 'Live Masterclasses', desc: 'Deep dives on shadow work, somatic release, anger transformation, and living in alignment. Interactive explorations where we go beneath the surface together. Not lectures - real work. All recorded for members.' }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '40px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '3px',
                transition: 'all 0.3s ease'
              }}>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  marginBottom: '16px',
                  color: '#9bc4b8'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '18px',
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
        padding: isMobile ? '100px 20px' : '160px 40px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '36px' : '56px',
            fontWeight: 700,
            marginBottom: '48px',
            textAlign: 'center',
            color: '#ffffff'
          }}>
            Why This Exists
          </h2>

          <div style={{
            fontSize: '19px',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 400
          }}>
            <p style={{ marginBottom: '28px' }}>
              Since 2020, I've wanted to create The CoR. I didn't know what it would be, I just knew it had to give its members what this work has given me.
            </p>

            <p style={{ marginBottom: '28px' }}>
              Life is a search for truth - you just don't know it. The truth can hurt, which is why most avoid it. But confronting it is the only way to feel at peace with who you are and where you're going.
            </p>

            <p style={{ marginBottom: '28px', fontWeight: 700, color: '#ef4444', fontSize: '21px' }}>
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
        padding: isMobile ? '100px 20px' : '120px 40px',
        background: 'radial-gradient(circle at center, rgba(127,176,105,0.1) 0%, transparent 70%)'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'rgba(255,255,255,0.02)',
          border: '2px solid rgba(127,176,105,0.2)',
          borderRadius: '24px',
          padding: isMobile ? '48px 32px' : '64px 48px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '20px',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            color: '#9bc4b8',
            marginBottom: '16px',
            fontWeight: 700
          }}>
            Founding Member Pricing
          </div>

          <div style={{
            fontSize: isMobile ? '64px' : '80px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #7fb069 0%, #9bc4b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
            lineHeight: 1
          }}>
            £25
            <span style={{
              fontSize: isMobile ? '32px' : '40px',
              color: 'rgba(255,255,255,0.5)'
            }}>/month</span>
          </div>

          <div style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '32px',
            fontWeight: 600
          }}>
            Lock in £25/month FIXED. Never increases.
          </div>

          <div style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            marginBottom: '40px'
          }}>
            Regular price: £50/month from next month
          </div>

          {!isSoldOut ? (
            <>
              {spotsRemaining !== null && (
                <div style={{
                  fontSize: '18px',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '32px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: 600
                }}>
                  <span style={{
                    fontSize: '32px',
                    color: '#9bc4b8',
                    fontWeight: 800
                  }}>{spotsRemaining}</span> spots remaining
                </div>
              )}

              

              <a
                href="https://buy.stripe.com/28E8wQaH55Ehes807d9IQ0j"
                onClick={handleStripeClick}
                style={{
                  display: 'inline-block',
                  padding: '24px 48px',
                  background: 'linear-gradient(135deg, #7fb069 0%, #9bc4b8 100%)',
                  color: '#0a0a0a',
                  fontSize: '18px',
                  fontWeight: 700,
                  borderRadius: '3px',
                  border: '2px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
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
            </>
          ) : (
            <div style={{
              padding: '24px 48px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '3px',
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: '#ef4444',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              All 30 Founding Spots Filled
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 20px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '14px'
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
    </>
  )
}
