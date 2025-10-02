'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import MysticalBackground from '../../components/MysticalBackground'

export default function CircleWelcome() {
  const [isMobile, setIsMobile] = useState(false)
  const [shimmerPhase, setShimmerPhase] = useState(0)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerPhase(prev => (prev + 1) % 4)
    }, 180000)
    return () => clearInterval(interval)
  }, [])

  const shimmerThemes = [
    { primary: '#9bc4b8', accent: '#d4af37' },
    { primary: '#7fb069', accent: '#f4a261' },
    { primary: '#6a994e', accent: '#e76f51' },
    { primary: '#8db4a8', accent: '#c49c30' }
  ]

  const currentTheme = shimmerThemes[shimmerPhase]

  return (
    <>
      <MysticalBackground />
      
      <div style={{
        minHeight: '100vh',
        position: 'relative',
        color: '#ffffff'
      }}>
        {/* Hero Video Section */}
        <section style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '4rem 1.5rem 2rem' : '6rem 2rem 3rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1100px',
            width: '100%'
          }}>
            {/* Founding Circle Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '0.6rem 1.5rem',
              marginBottom: '2rem',
              background: `linear-gradient(135deg, ${currentTheme.primary}15 0%, ${currentTheme.accent}15 100%)`,
              border: `1px solid ${currentTheme.primary}40`,
              borderRadius: '30px',
              backdropFilter: 'blur(10px)',
              transition: 'all 2s ease'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.accent} 100%)`,
                boxShadow: `0 0 15px ${currentTheme.primary}80`,
                transition: 'all 2s ease'
              }} />
              <span style={{
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                fontWeight: '500',
                color: currentTheme.primary,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'color 2s ease'
              }}>
                Founding Circle Member
              </span>
            </div>

            <h1 className="breathing-title" style={{
              fontSize: isMobile ? 'clamp(2.5rem, 10vw, 4.5rem)' : 'clamp(4rem, 7vw, 6.5rem)',
              fontWeight: '200',
              marginBottom: '1.5rem',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
              background: `linear-gradient(135deg, ${currentTheme.primary} 0%, rgba(255, 255, 255, 0.95) 50%, ${currentTheme.accent} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              transition: 'all 2s ease'
            }}>
              You Are About to Make the Return
            </h1>

            <p style={{
              fontSize: isMobile ? '1.3rem' : '1.8rem',
              color: 'rgba(255, 255, 255, 0.85)',
              marginBottom: '4rem',
              lineHeight: '1.5',
              fontWeight: '300',
              maxWidth: '800px',
              margin: '0 auto 4rem'
            }}>
              The portal is open. Your journey home begins.
            </p>

            {/* Video Container with Mystical Frame */}
            <div style={{
              position: 'relative',
              maxWidth: '900px',
              margin: '0 auto',
              padding: '3px',
              background: `linear-gradient(135deg, ${currentTheme.primary}40 0%, ${currentTheme.accent}40 100%)`,
              borderRadius: '16px',
              boxShadow: `0 0 60px ${currentTheme.primary}30, 0 30px 80px rgba(0, 0, 0, 0.6)`
            }}>
              <div style={{
                background: '#000',
                borderRadius: '14px',
                overflow: 'hidden'
              }}>
                <video
                  controls
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                  poster="/circle-welcome-poster.jpg"
                >
                  <source src="/circle-welcome-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section style={{
          padding: isMobile ? '3rem 1.5rem' : '5rem 2rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {/* Opening Message */}
          <div style={{
            textAlign: 'center',
            marginBottom: '5rem',
            maxWidth: '800px',
            margin: '0 auto 5rem'
          }}>
            <div style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              lineHeight: '1.9',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '300'
            }}>
              <p style={{ marginBottom: '2rem' }}>
                This isn't about becoming someone new.
              </p>
              
              <p style={{ marginBottom: '2rem' }}>
                It's about returning to who you've always been underneath the noise, 
                the expectations, and the patterns that kept you stuck.
              </p>

              <p style={{
                fontSize: isMobile ? '1.4rem' : '1.6rem',
                fontWeight: '400',
                color: currentTheme.primary,
                margin: '3rem 0',
                fontStyle: 'italic',
                transition: 'color 2s ease'
              }}>
                Something deeper called you here — and you answered.
              </p>
            </div>
          </div>

          {/* The Journey Begins */}
          <div style={{
            background: `linear-gradient(135deg, ${currentTheme.primary}08 0%, rgba(255, 255, 255, 0.02) 100%)`,
            backdropFilter: 'blur(30px)',
            borderRadius: '20px',
            border: `1px solid ${currentTheme.primary}20`,
            padding: isMobile ? '2.5rem 2rem' : '4rem 3.5rem',
            marginBottom: '4rem',
            transition: 'all 2s ease'
          }}>
            <h2 style={{
              fontSize: isMobile ? '2rem' : '2.8rem',
              fontWeight: '300',
              marginBottom: '3rem',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.95)',
              letterSpacing: '-0.01em'
            }}>
              The Path Forward
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3rem'
            }}>
              {[
                {
                  title: 'Within minutes',
                  desc: 'Your email will arrive. Inside, you'll find your member login and the gateway to The Circle. Check everywhere — inbox, promotions, spam. It's there, waiting.'
                },
                {
                  title: 'Your first step',
                  desc: 'Enter the private portal. Inside, you'll discover the Foundation Module — your guided introduction to the work. No rush. No pressure. Just presence.'
                },
                {
                  title: 'The weekly rhythm',
                  desc: 'New content drops every week. Live sessions. Somatic practices. Real-time guidance. This is where the nervous system shifts and the patterns break.'
                },
                {
                  title: 'The community',
                  desc: 'You're not doing this alone. Inside The Circle, others are walking the same path — showing up messy, honest, and committed to the return.'
                }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: isMobile ? '1.5rem' : '2rem',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    minWidth: isMobile ? '4px' : '6px',
                    height: isMobile ? '4px' : '6px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.accent} 100%)`,
                    marginTop: '0.8rem',
                    flexShrink: 0,
                    boxShadow: `0 0 20px ${currentTheme.primary}60`,
                    transition: 'all 2s ease'
                  }} />
                  <div>
                    <h3 style={{
                      fontSize: isMobile ? '1.3rem' : '1.5rem',
                      fontWeight: '400',
                      marginBottom: '0.8rem',
                      color: currentTheme.accent,
                      transition: 'color 2s ease'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: isMobile ? '1.05rem' : '1.15rem',
                      lineHeight: '1.7',
                      color: 'rgba(255, 255, 255, 0.75)',
                      fontWeight: '300',
                      margin: 0
                    }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Truth */}
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '3rem 1.5rem' : '4rem 2rem',
            marginBottom: '4rem'
          }}>
            <p style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '300',
              lineHeight: '1.5',
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: '2rem',
              fontStyle: 'italic'
            }}>
              Where you are now does not have to be where you end up.
            </p>
            
            <div style={{
              height: '2px',
              width: '100px',
              background: `linear-gradient(90deg, transparent, ${currentTheme.primary}, transparent)`,
              margin: '3rem auto',
              transition: 'all 2s ease'
            }} />

            <p style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.7',
              fontWeight: '300',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              The transformation happens when you engage. Join the calls. 
              Do the practices. Ask the questions. Be real. Be messy. Be here.
            </p>
          </div>

          {/* Final CTA Section */}
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '3rem 0' : '4rem 0'
          }}>
            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '2.5rem',
              fontWeight: '300'
            }}>
              Questions? Reach me directly at +447449052909
            </p>

            <Link 
              href="/members"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: isMobile ? '1.2rem 2.5rem' : '1.4rem 3rem',
                background: `linear-gradient(135deg, ${currentTheme.primary}E6 0%, ${currentTheme.accent}E6 100%)`,
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.4s ease',
                boxShadow: `0 10px 40px ${currentTheme.primary}40`,
                letterSpacing: '0.02em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = `0 15px 50px ${currentTheme.primary}60`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 10px 40px ${currentTheme.primary}40`
              }}
            >
              Enter The Circle <span>→</span>
            </Link>

            <p style={{
              fontSize: isMobile ? '1.4rem' : '1.6rem',
              color: 'rgba(255, 255, 255, 0.9)',
              marginTop: '4rem',
              fontWeight: '300',
              lineHeight: '1.6'
            }}>
              The portal is open.<br />
              Your transformation begins now.
            </p>
          </div>
        </section>
      </div>

      <style jsx>{`
        .breathing-title {
          animation: breathe 8s ease-in-out infinite;
        }

        @keyframes breathe {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  )
}