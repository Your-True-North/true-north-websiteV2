'use client'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import MysticalBackground from '../components/MysticalBackground'
import { useState, useEffect } from 'react'

export default function Work() {
  const [isMobile, setIsMobile] = useState(false)
  const [showPackPopup, setShowPackPopup] = useState(false)
  const whatsappNumber = "+447449052909"
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const timer = setTimeout(() => {
      const hasSeenPopup = sessionStorage.getItem('hasSeenPackPopup')
      if (!hasSeenPopup) {
        setShowPackPopup(true)
        sessionStorage.setItem('hasSeenPackPopup', 'true')
      }
    }, 3000)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(timer)
    }
  }, [])
  
  const createWhatsAppLink = (message) => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  const closePopup = () => {
    setShowPackPopup(false)
  }

  return (
    <>
      <Navigation />
      <MysticalBackground />
      
      {showPackPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          backdropFilter: 'blur(8px)'
        }} onClick={closePopup}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)',
            padding: isMobile ? '2rem' : '3rem',
            borderRadius: '6px',
            maxWidth: '600px',
            width: '100%',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <button onClick={closePopup} style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              lineHeight: 1
            }}>×</button>
            
            <div style={{textAlign: 'center'}}>
              <h3 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                color: '#ffffff',
                marginBottom: '1rem',
                fontWeight: '700'
              }}>
                Commit Deeper, Save More
              </h3>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.3rem',
                color: 'rgba(255, 255, 255, 0.85)',
                marginBottom: '2rem',
                lineHeight: '1.5'
              }}>
                Get <strong style={{color: '#ffffff'}}>15% off</strong> when you book a pack of 5 sessions
              </p>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1.5rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '2rem'
              }}>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Mix and match Breathwork Journeys (£200) and Energy Healing Experiences (£120). 
                  <br/><br/>
                  <strong style={{color: '#ffffff'}}>This is for those ready to go deeper.</strong>
                </p>
              </div>

              <a 
                href={createWhatsAppLink("Hi Mason, I'm interested in the 5-session pack with 15% off. I want to commit to deeper transformation work. Can you share details about how this works?")}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '1.2rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#000',
                  textDecoration: 'none',
                  fontWeight: '700',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  marginBottom: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Get 15% Off Pack
              </a>
              
              <p style={{
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '1rem'
              }}>
                Transformation happens in commitment
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="page-container">
        <section className="section" style={{
          paddingTop: isMobile ? '0' : '5rem',
          position: 'relative',
          minHeight: isMobile ? '100vh' : 'auto',
          display: isMobile ? 'flex' : 'block',
          alignItems: isMobile ? 'center' : 'initial',
          justifyContent: isMobile ? 'center' : 'initial'
        }}>
          
          <div className="container" style={{
            position: 'relative',
            zIndex: 10,
            padding: isMobile ? '4rem 1rem 2rem' : undefined,
            width: '100%'
          }}>
            <div style={{
              textAlign: 'center', 
              marginBottom: isMobile ? '0' : '6rem',
              animation: 'fadeInUp 1.2s ease-out'
            }}>
              <h1 style={{
                fontSize: isMobile ? 'clamp(2rem, 8vw, 3rem)' : 'clamp(2.8rem, 6vw, 4.5rem)',
                marginBottom: '2rem',
                color: '#ffffff',
                fontWeight: '600',
                lineHeight: '1.1',
                textShadow: isMobile ? '2px 2px 4px rgba(0, 0, 0, 0.7)' : undefined
              }}>
                Four ways to work with me.
              </h1>
              <h2 style={{
                fontSize: isMobile ? 'clamp(1rem, 4vw, 1.5rem)' : 'clamp(1.4rem, 3vw, 2rem)',
                marginBottom: '3rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '400',
                fontStyle: 'italic',
                textShadow: isMobile ? '1px 1px 2px rgba(0, 0, 0, 0.7)' : undefined
              }}>
                All powerful, and all transformational!
              </h2>
              <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                fontSize: isMobile ? '1rem' : '1.1rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.6',
                textShadow: isMobile ? '1px 1px 2px rgba(0, 0, 0, 0.7)' : undefined
              }}>
                <p style={{marginBottom: '1rem'}}>
                  I don't just talk mindset. I teach regulation.
                </p>
                <p style={{margin: 0}}>
                  I don't just say "believe in yourself." I show you how to build that belief in your body.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{paddingTop: isMobile ? '3rem' : '0'}}>
          <div className="container">
            <div style={{
              marginBottom: '5rem',
              padding: isMobile ? '2rem' : '3rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              position: 'relative',
              transition: 'all 0.4s ease',
              animation: 'slideUp 0.8s ease-out 0.2s both'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: isMobile ? '1rem' : '2rem',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                padding: '0.3rem 1rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                borderRadius: '6px',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                DEEP WORK
              </div>
              
              <h2 style={{
                fontSize: isMobile ? '2rem' : '2.8rem', 
                marginBottom: '1rem', 
                color: '#ffffff', 
                fontWeight: '700'
              }}>
                1:1 Coaching
              </h2>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.3rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '2rem',
                fontWeight: '500'
              }}>
                A 12-week deep shift for those ready to break cycles, regulate emotion, and reclaim control.
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                marginBottom: '2.5rem'
              }}>
                {[
                  { title: 'Phase 1: Self-Awareness', desc: 'Identify the unconscious patterns running your life. Deep, honest self-awareness.' },
                  { title: 'Phase 2: Somatic Integration', desc: 'Enter the body. Access the subconscious through your body\'s stored intelligence.' },
                  { title: 'Phase 3: Aligned Action', desc: 'Anchor new habits rooted in your values. Become more you.' }
                ].map((phase, index) => (
                  <div key={index} style={{
                    padding: '1.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderLeft: '3px solid rgba(255, 255, 255, 0.6)',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    animation: `slideUp 0.8s ease-out ${0.4 + index * 0.1}s both`
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.currentTarget.style.borderLeftColor = 'rgba(255, 255, 255, 0.9)'
                      e.currentTarget.style.transform = 'translateX(5px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                      e.currentTarget.style.borderLeftColor = 'rgba(255, 255, 255, 0.6)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }
                  }}>
                    <h4 style={{color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.5rem', fontSize: '1.1rem'}}>{phase.title}</h4>
                    <p style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem', lineHeight: '1.4'}}>
                      {phase.desc}
                    </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      fontSize: '2.2rem', 
                      fontWeight: '300', 
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}>£120</div>
                    <div style={{color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem'}}>90 minutes</div>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <a 
                      href="https://buy.stripe.com/cNi4gA9D17Mp0BibPV9IQ0g"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#000',
                        textDecoration: 'none',
                        fontWeight: '700',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ffffff'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      Ready to Book - £120
                    </a>
                    
                    <a 
                      href={createWhatsAppLink("Hi Mason, I'd like to learn more about the Energy Healing Experience. What exactly happens during this 60-minute session and how do I know if it's right for me?")}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontWeight: '600',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      Learn More
                    </a>
                  </div>

                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    Available online (Zoom) or in-person • Energetic clearing, chakra balancing, nervous system regulation
                  </div>
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                maxWidth: '700px',
                margin: '3rem auto 0'
              }}>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  <strong style={{color: 'rgba(255, 255, 255, 0.9)'}}>Two paths to choose from:</strong> Curious about the work? Click "Learn More" to understand what each session involves. 
                  Ready to commit? Click "Ready to Book" and secure your session immediately.
                </p>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: isMobile ? '2rem 1rem' : '3rem 2rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              animation: 'slideUp 0.8s ease-out 1.2s both'
            }}>
              <h3 style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                marginBottom: '1rem',
                color: '#ffffff',
                fontWeight: '600'
              }}>
                Ready to begin your return?
              </h3>
              <p style={{
                fontSize: isMobile ? '1rem' : '1.1rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '2rem',
                maxWidth: '500px',
                margin: '0 auto 2rem'
              }}>
                Whether you're ready for deep transformation or just starting to explore, 
                there's a path that's right for where you are now.
              </p>
              <div style={{
                display: 'flex', 
                gap: '1.5rem', 
                justifyContent: 'center', 
                flexWrap: 'wrap',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center'
              }}>
                <a href="/library" style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                }}>
                  Free Resources
                </a>
                <a 
                  href={createWhatsAppLink("Hi Mason, I'm interested in exploring transformation work. Could you help me understand which path might be right for my current situation?")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#000000',
                    textDecoration: 'none',
                    fontWeight: '600',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    width: isMobile ? '100%' : 'auto'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Let's Talk
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.02);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
                  </div>
                ))}
              </div>

              <blockquote style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                fontStyle: 'italic',
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                margin: '2rem 0',
                padding: '1rem',
                borderLeft: 'none',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px'
              }}>
                "This is high-level, high-impact coaching — for those who are serious about change."
              </blockquote>

              <div style={{textAlign: 'center'}}>
                <a 
                  href={createWhatsAppLink("Hi Mason, I'm interested in your 12-week 1:1 coaching program. I'm ready for deep transformation and want to discuss if we're a good fit for this level of work.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: isMobile ? '1rem 2rem' : '1.2rem 2.5rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#000000',
                    textDecoration: 'none',
                    fontWeight: '700',
                    borderRadius: '6px',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Apply for 1:1 Work
                </a>
              </div>
            </div>

            <div style={{
              marginBottom: '5rem',
              padding: isMobile ? '2rem' : '3rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              transition: 'all 0.4s ease',
              animation: 'slideUp 0.8s ease-out 0.6s both'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
              }
            }}>
              <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                <h2 style={{
                  fontSize: isMobile ? '2rem' : '2.8rem', 
                  marginBottom: '1rem', 
                  color: '#ffffff', 
                  fontWeight: '700'
                }}>
                  The Circle of Return
                </h2>
                <p style={{
                  fontSize: isMobile ? '1.1rem' : '1.3rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginBottom: '1rem'
                }}>
                  Ongoing community for committed souls who want to keep elevating
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontStyle: 'italic'
                }}>
                  Because transformation happens in relationship.
                </p>
              </div>

              <div style={{textAlign: 'center'}}>
                <a href="/circle" style={{
                  display: 'inline-block',
                  padding: isMobile ? '1rem 2rem' : '1.2rem 2.5rem',
                  background: 'transparent',
                  border: '2px solid rgba(255, 255, 255, 0.7)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: '700',
                  borderRadius: '6px',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.7)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                }}>
                  Learn More
                </a>
              </div>
            </div>

            <div style={{marginBottom: '5rem'}}>
              <div style={{textAlign: 'center', marginBottom: '4rem'}}>
                <h2 style={{
                  fontSize: isMobile ? '2rem' : '2.8rem',
                  marginBottom: '1rem',
                  color: '#ffffff',
                  fontWeight: '700'
                }}>
                  Individual Sessions
                </h2>
                <p style={{
                  fontSize: isMobile ? '1.1rem' : '1.3rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: '600px',
                  margin: '0 auto 1rem'
                }}>
                  Targeted healing experiences designed to create breakthrough moments in your transformation journey
                </p>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontStyle: 'italic'
                }}>
                  Get 15% off when you book a pack of 5 (mix & match)
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '3rem'
              }}>
                <div style={{
                  padding: '2.5rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  position: 'relative',
                  transition: 'all 0.4s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                  }
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    padding: '0.2rem 0.8rem',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    borderRadius: '6px'
                  }}>
                    BREATHWORK
                  </div>

                  <h3 style={{
                    fontSize: isMobile ? '1.5rem' : '2rem', 
                    marginBottom: '1rem', 
                    color: '#ffffff', 
                    fontWeight: '600'
                  }}>
                    Breathwork Journey
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.5',
                    marginBottom: '2rem'
                  }}>
                    120 minutes of deep somatic release and spiritual awakening. This isn't relaxation - 
                    this is transformation through conscious breathing and energy work.
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      fontSize: '2.2rem', 
                      fontWeight: '300', 
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}>£200</div>
                    <div style={{color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem'}}>120 minutes</div>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <a 
                      href="https://buy.stripe.com/28E9AU9D1c2Fck01bh9IQ0f"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#000',
                        textDecoration: 'none',
                        fontWeight: '700',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ffffff'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      Ready to Book - £200
                    </a>
                    
                    <a 
                      href={createWhatsAppLink("Hi Mason, I'd like to learn more about the Breathwork Journey session. What exactly does this 120-minute experience involve and how do I know if it's right for me?")}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontWeight: '600',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      Learn More
                    </a>
                  </div>

                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    Available online (Zoom) or in-person • Deep breathing patterns, somatic release, emotional processing
                  </div>
                </div>

                <div style={{
                  padding: '2.5rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  position: 'relative',
                  transition: 'all 0.4s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                  }
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    padding: '0.2rem 0.8rem',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    borderRadius: '6px'
                  }}>
                    ENERGY HEALING
                  </div>

                  <h3 style={{
                    fontSize: isMobile ? '1.5rem' : '2rem', 
                    marginBottom: '1rem', 
                    color: '#ffffff', 
                    fontWeight: '600'
                  }}>
                    Energy Healing Experience
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.5',
                    marginBottom: '2rem'
                  }}>
                    60 minutes of deep energetic clearing and spiritual realignment. Reiki-based healing 
                    that works with your body's natural energy systems.