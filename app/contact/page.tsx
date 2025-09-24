'use client'
import Navigation from '../components/Navigation'
import MysticalBackground from '../components/MysticalBackground'
import { useState, useEffect } from 'react'
import Script from 'next/script'

export default function Contact() {
  const [shimmerPhase, setShimmerPhase] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    calling: '',
    support: ''
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerPhase(prev => (prev + 1) % 4)
    }, 180000) // 3 minutes between transitions

    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCalendlyClick = () => {
    if (typeof window !== 'undefined' && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/callwithmason/introduction',
        prefill: {
          name: formData.name,
          email: formData.email,
          customAnswers: {
            a1: formData.calling,
            a2: formData.support
          }
        }
      })
    }
  }

  const shimmerThemes = [
    {
      primary: '#9bc4b8',
      accent: '#d4af37',
      shimmer: 'rgba(155, 196, 184, 0.12)'
    },
    {
      primary: '#7fb069',
      accent: '#f4a261',
      shimmer: 'rgba(127, 176, 105, 0.10)'
    },
    {
      primary: '#6a994e',
      accent: '#e76f51',
      shimmer: 'rgba(106, 153, 78, 0.14)'
    },
    {
      primary: '#8db4a8',
      accent: '#c49c30',
      shimmer: 'rgba(141, 180, 168, 0.08)'
    }
  ]

  const currentTheme = shimmerThemes[shimmerPhase]

  return (
    <>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
      
      <style jsx global>{`
        :root {
          --primary: ${currentTheme.primary};
          --accent: ${currentTheme.accent};
          --shimmer-color: ${currentTheme.shimmer};
        }
        
        .page-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: radial-gradient(ellipse at 30% 50%, var(--shimmer-color) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
          transition: background 15s ease-in-out, opacity 15s ease-in-out;
        }
        
        .shimmer-accent {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-accent::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--shimmer-color) 50%,
            transparent 100%
          );
          animation: shimmer 8s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% {
            left: -100%;
            opacity: 0;
          }
          25% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
          75% {
            opacity: 0.3;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }
        
        .accent-text {
          transition: color 15s ease-in-out;
        }
        
        .btn-primary,
        .btn-secondary {
          transition: all 0.3s ease, color 15s ease-in-out, background-color 15s ease-in-out, border-color 15s ease-in-out;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .contact-form input,
          .contact-form textarea {
            font-size: 16px !important;
          }
          
          .contact-bottom-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .container {
            padding: 0 1rem !important;
          }
          
          .section {
            padding-top: 6rem !important;
          }
        }
      `}</style>
      
      <Navigation />
      <MysticalBackground />
      
      <main className="page-container">
        <section className="section" style={{paddingTop: '4rem', paddingBottom: '4rem'}}>
          <div className="container">
            <div style={{textAlign: 'center', marginBottom: '4rem'}}>
              <h1 style={{
                fontSize: '2.5rem',
                marginBottom: '1.5rem',
                color: '#ffffff',
                fontWeight: '700',
                position: 'relative',
                overflow: 'hidden'
              }} className="shimmer-accent">
                Let's Talk
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Ready to explore what's possible? Let's have a real conversation.
              </p>
            </div>

            <div className="contact-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start'}}>
              {/* Contact Form */}
              <div style={{
                padding: '2.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px'
              }}>
                <h2 style={{
                  fontSize: '1.8rem',
                  marginBottom: '1rem',
                  color: '#ffffff',
                  fontWeight: '600',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="shimmer-accent">
                  Discovery Call
                </h2>
                <p style={{
                  marginBottom: '2rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.6'
                }}>
                  This isn't a sales call. It's a conversation about where you are, 
                  where you want to go, and whether this work is right for you.
                </p>

                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem'
                    }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem'
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem'
                    }}>
                      What's led you to book this call? *
                    </label>
                    <textarea
                      name="calling"
                      value={formData.calling}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        fontSize: '1rem',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                      placeholder="Share what's happening in your life that brought you here..."
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem'
                    }}>
                      What support are you looking for? *
                    </label>
                    <select
                      name="support"
                      value={formData.support}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <option value="" style={{background: '#1a1a1a', color: '#ffffff'}}>Select one...</option>
                      <option value="1:1 Coaching Program" style={{background: '#1a1a1a', color: '#ffffff'}}>1:1 Coaching Program</option>
                      <option value="Circle of Return Membership" style={{background: '#1a1a1a', color: '#ffffff'}}>Circle of Return Membership</option>
                      <option value="Individual Sessions (Breathwork/Energy)" style={{background: '#1a1a1a', color: '#ffffff'}}>Individual Sessions (Breathwork/Energy)</option>
                      <option value="Not sure yet - exploring options" style={{background: '#1a1a1a', color: '#ffffff'}}>Not sure yet - exploring options</option>
                      <option value="Other" style={{background: '#1a1a1a', color: '#ffffff'}}>Other</option>
                    </select>
                  </div>

                  <button 
                    type="button"
                    onClick={handleCalendlyClick}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#000000',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
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
                    Schedule Discovery Call
                    <span>→</span>
                  </button>
                </div>

                <p style={{
                  marginTop: '1rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.9rem'
                }}>
                  Your info will be passed to Calendly for scheduling.
                </p>
              </div>

              {/* Info & Expectations */}
              <div>
                <div style={{
                  padding: '2rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    marginBottom: '1rem',
                    color: '#ffffff',
                    fontWeight: '600',
                    position: 'relative',
                    overflow: 'hidden'
                  }} className="shimmer-accent">
                    What to Expect
                  </h3>
                  <ul style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.8',
                    paddingLeft: '1.2rem'
                  }}>
                    <li>45-minute conversation via Zoom</li>
                    <li>We explore where you are and where you want to go</li>
                    <li>I share how I work and what's involved</li>
                    <li>We see if there's mutual fit</li>
                    <li>No pressure, no hard sell</li>
                    <li>Complete confidentiality</li>
                  </ul>
                </div>

                <div style={{
                  padding: '2rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    marginBottom: '1rem',
                    color: '#ffffff',
                    fontWeight: '600',
                    position: 'relative',
                    overflow: 'hidden'
                  }} className="shimmer-accent">
                    Before We Talk
                  </h3>
                  <p style={{
                    marginBottom: '1rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6'
                  }}>
                    This work is intense. It's for people who are:
                  </p>
                  <ul style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.8',
                    paddingLeft: '1.2rem'
                  }}>
                    <li>Ready to feel their feelings</li>
                    <li>Tired of surface-level solutions</li>
                    <li>Committed to real change</li>
                    <li>Open to working with the body</li>
                    <li>Willing to be uncomfortable</li>
                  </ul>
                </div>

                <div style={{
                  padding: '2rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    marginBottom: '1rem',
                    color: '#ffffff',
                    fontWeight: '600',
                    position: 'relative',
                    overflow: 'hidden'
                  }} className="shimmer-accent">
                    Not Ready Yet?
                  </h3>
                  <p style={{
                    marginBottom: '1.5rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6'
                  }}>
                    Start with the free resources in our Library. 
                    Come back when you're ready to go deeper.
                  </p>
                  <a 
                    href="/library"
                    style={{
                      display: 'inline-block',
                      padding: '0.8rem 1.5rem',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '6px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    Explore Free Resources
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div style={{
              padding: '2.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              marginTop: '4rem',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                marginBottom: '2rem',
                color: '#ffffff',
                fontWeight: '600',
                position: 'relative',
                overflow: 'hidden'
              }} className="shimmer-accent">
                Other Ways to Connect
              </h2>
              <div className="contact-bottom-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                marginTop: '2rem'
              }}>
                <div>
                  <h4 style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem'
                  }}>
                    Circle Waitlist
                  </h4>
                  <p style={{
                    marginBottom: '1rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem'
                  }}>
                    Join the waitlist for monthly group sessions
                  </p>
                  <a 
                    href="/circle"
                    style={{
                      display: 'inline-block',
                      fontSize: '0.85rem',
                      padding: '0.6rem 1.2rem',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '6px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    Learn About Circle
                  </a>
                </div>
                
                <div>
                  <h4 style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem'
                  }}>
                    Weekly Insights
                  </h4>
                  <p style={{
                    marginBottom: '1rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem'
                  }}>
                    Raw thoughts on transformation
                  </p>
                  <a 
                    href="/library"
                    style={{
                      display: 'inline-block',
                      fontSize: '0.85rem',
                      padding: '0.6rem 1.2rem',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '6px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    Subscribe
                  </a>
                </div>
              </div>
            </div>

            {/* Final Message */}
            <div style={{textAlign: 'center', marginTop: '3rem'}}>
              <p style={{
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                "Where you are now does not have to be where you end up."
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}