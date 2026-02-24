'use client'

import CircleCalendarTeaser from '../circle/components/CircleCalendarTeaser'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/app/components/GoogleAnalytics'
import { Play, Pause } from 'lucide-react'

export default function FoundingMembersPage() {
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(10)
  const [isMobile, setIsMobile] = useState(false)
  const [isSoldOut, setIsSoldOut] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

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
        setSpotsRemaining(10)
        setIsSoldOut(count >= 30)
      })
      .catch(() => setSpotsRemaining(10))

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
            The Circle of Return
          </h1>

          <p style={{
            fontSize: isMobile ? '20px' : '28px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.4,
            maxWidth: '700px',
            margin: '0 auto 48px'
          }}>
            Founding member price — £25/month
          </p>

          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: 'rgba(255,255,255,0.5)',
            margin: '-32px auto 48px',
            maxWidth: '700px'
          }}>
            This moves to £50 next month.
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
          {/* Video Player */}
          <div style={{
            width: isMobile ? '100vw' : '100%',
            maxWidth: '900px',
            margin: isMobile ? '0 0 48px 0' : '0 auto 48px',
            position: isMobile ? 'relative' : 'static',
            left: isMobile ? '50%' : 'auto',
            transform: isMobile ? 'translateX(-50%)' : 'none'
          }}>
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              background: '#000',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <video
                ref={videoRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                playsInline
                onEnded={() => {
                  setIsPlaying(false)
                  setShowOverlay(true)
                }}
              >
                <source src="https://pub-19417e24742e4c93bb0466196037eeea.r2.dev/Circle%20Page1.mov" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Play Overlay */}
              {showOverlay && (
                <div
                  onClick={handleInitialPlay}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: isMobile ? '70px' : '90px',
                    height: isMobile ? '70px' : '90px',
                    borderRadius: '50%',
                    background: 'rgba(155, 196, 184, 0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.style.background = 'rgba(155, 196, 184, 0.5)'
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.background = 'rgba(155, 196, 184, 0.3)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)'
                  }}
                  >
                    <Play size={isMobile ? 28 : 36} color="#fff" fill="#fff" style={{ marginLeft: '4px' }} />
                  </div>
                </div>
              )}

              {/* Play/Pause Controls */}
              {!showOverlay && (
                <div style={{
                  position: 'absolute',
                  bottom: isMobile ? '1.5rem' : '2rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 100
                }}>
                  <button
                    onClick={handlePlayPause}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'rgba(155, 196, 184, 0.3)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.background = 'rgba(155, 196, 184, 0.5)'
                      e.currentTarget.style.boxShadow = '0 5px 20px rgba(155, 196, 184, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.background = 'rgba(155, 196, 184, 0.3)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {isPlaying ? (
                      <Pause size={24} color="#fff" fill="#fff" />
                    ) : (
                      <Play size={24} color="#fff" fill="#fff" style={{ marginLeft: '2px' }} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
              <div style={{
                fontSize: isMobile ? '56px' : '72px',
                fontWeight: 800,
                background: '#ffffff',
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
                        background: '#ffffff',
                        border: '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        color: '#000000',
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
                background: '#ffffff',
                color: '#000000',
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
              Secure Your Spot — £25/month
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
          <div style={{
            fontSize: '19px',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 400
          }}>
            <p style={{ marginBottom: '48px' }}>
              I was that man. Robbed myself of peace for years before I learned how to stop. Not manage it. Stop it. I'm not standing outside of this work looking in. I came through it. That's the only reason I can guide you through it.
            </p>

            <p>
              The pattern running underneath your decisions isn't a character flaw. It's old code. Written long before you were old enough to question it. And until you see it, it runs the show. Your relationships. Your opportunities. Your ability to hold what you build. The first thing that shifts is perspective. How life lands on you. Situations that used to knock you sideways start to hit differently. That's not positive thinking. That's what happens when the pattern loses its grip.
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

      {/* What We Do Here */}
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
            What we do here
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '32px'
          }}>
            {[
              { title: 'See it.', desc: 'Catch the pattern while it\'s running. Understand what\'s actually underneath the trigger, not the story you\'ve been telling yourself about it.' },
              { title: 'Regulate it.', desc: 'Your body holds what your mind has rationalised away. Breathwork. Somatic work. Real capacity to hold pressure without reverting.' },
              { title: 'Become it.', desc: 'Who does your goal require you to be. We close that gap. In practice.' },
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

      {/* Inside the Circle */}
      <section style={{
        padding: isMobile ? '100px 20px' : '160px 40px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '36px' : '56px',
            fontWeight: 700,
            marginBottom: '80px',
            textAlign: 'center',
            color: '#ffffff'
          }}>
            Inside the Circle
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '32px'
          }}>
            {[
              { title: 'Bi-weekly live coaching', desc: 'Bring your real situations. We find exactly where autopilot takes over.' },
              { title: 'Somatic and breathwork sessions', desc: 'Structured, regulated, built to increase your capacity to hold what you\'re building.' },
              { title: 'Goal mapping calls', desc: 'You\'re working toward something specific. Drift isn\'t welcome here.' },
              { title: 'Video library', desc: 'Frameworks and tools when you need them.' },
              { title: 'Community', desc: 'No performance. Just men doing the work properly.' },
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

      {/* Closing Section */}
      <section style={{
        padding: isMobile ? '100px 20px' : '160px 40px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            fontSize: '19px',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 400
          }}>
            <p>
              I'm selective about who enters this room. The work requires a level of honesty that not every man is ready for yet. There's no shame in that. Better you wait until you are. If you're ready to stop getting in your own way, this is the place. The truth is hard to hear. But you already knew it.
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
            Founding Member Price
          </div>

          <div style={{
            fontSize: isMobile ? '64px' : '80px',
            fontWeight: 800,
            background: '#ffffff',
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
            marginBottom: '40px',
            fontWeight: 600
          }}>
            Founding member price £25/month. This moves to £50 next month.
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
                  background: '#ffffff',
                  color: '#000000',
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
                Secure Your Spot — £25/month
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
