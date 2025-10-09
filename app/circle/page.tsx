'use client'
import Navigation from '../components/Navigation'
import MysticalBackground from '../components/MysticalBackground'
import { useState, useEffect } from 'react'

export default function Circle() {
  const [isMobile, setIsMobile] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [pricingPlan, setPricingPlan] = useState('yearly')
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    function createShimmer() {
      const container = document.querySelector('.shimmer-container')
      if (!container) return
      
      setInterval(() => {
        const shimmer = document.createElement('div')
        shimmer.className = 'shimmer-line'
        
        shimmer.style.top = '-100px'
        shimmer.style.left = '-100px'
        shimmer.style.width = '200px'
        shimmer.style.height = '2px'
        shimmer.style.background = 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
        shimmer.style.transform = 'rotate(45deg)'
        
        container.appendChild(shimmer)
        
        setTimeout(() => {
          if (container.contains(shimmer)) {
            container.removeChild(shimmer)
          }
        }, 3000)
      }, 4000)
    }

    createShimmer()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/convertkit/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("You are on the waitlist. Check your email.")
        setEmail('')
      } else {
        setMessage(data.error || 'Something went wrong. Try again.')
      }
    } catch (error) {
      setMessage('Connection error. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navigation />
      <MysticalBackground />
      
      <div className="shimmer-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }} />
      
      <main className="page-container">
        {/* Full Screen Video Hero */}
        <section style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}>
            <iframe
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&mute=1&controls=0&loop=1&playlist=YOUR_VIDEO_ID&rel=0&modestbranding=1"
              title="Circle of Return"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: isMobile ? '100%' : '177.77vh',
                height: isMobile ? '56.25vw' : '100%',
                minWidth: '100%',
                minHeight: '100%',
                transform: 'translate(-50%, -50%)',
                border: 'none',
                pointerEvents: 'none'
              }}
              allow="autoplay; encrypted-media"
            />
          </div>

          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)',
            zIndex: 2
          }}></div>

          <div style={{
            position: 'relative',
            zIndex: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '2rem 1.5rem' : '3rem 2rem',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: isMobile ? 'clamp(2.5rem, 8vw, 4rem)' : 'clamp(4rem, 6vw, 6rem)',
              color: '#ffffff',
              fontWeight: '700',
              marginBottom: '1.5rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)',
              lineHeight: '1.1'
            }}>
              The Circle of Return
            </h1>
            
            <p style={{
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              color: 'rgba(255,255,255,0.95)',
              maxWidth: '800px',
              marginBottom: '2rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              lineHeight: '1.6'
            }}>
              This is not a community or a group coaching programme.
            </p>

            <button
              onClick={() => {
                document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              style={{
                padding: '1rem 2.5rem',
                background: 'rgba(255,255,255,0.95)',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Learn More ↓
            </button>
          </div>
        </section>

        {/* Content Section */}
        <section id="content-section" className="section" style={{
          paddingTop: isMobile ? '3rem' : '4rem',
          paddingBottom: '4rem'
        }}>
          <div className="container" style={{maxWidth: '900px', margin: '0 auto'}}>

            <div style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              lineHeight: '1.8',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '4rem',
              position: 'relative'
            }}>
              <div style={{
                textAlign: 'center',
                margin: '3rem 0',
                position: 'relative'
              }}>
                <p style={{
                  marginBottom: '2.5rem',
                  fontSize: isMobile ? '1.3rem' : '1.5rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  lineHeight: '1.4'
                }}>
                  If you join, you are entering a portal - a space to return to yourself. 
                  <span style={{
                    background: 'linear-gradient(135deg, rgba(123, 166, 155, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '700'
                  }}>
                    {' '}Return to your truth.
                  </span>
                </p>
              </div>
              
              <div style={{
                display: 'grid',
                gap: '1.5rem',
                marginTop: '2rem'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '1.5rem',
                  borderRadius: '6px',
                  borderLeft: '4px solid rgba(123, 166, 155, 0.4)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{marginBottom: 0}}>
                    You have built your current identity around survival, pressure, and who you <strong style={{color: '#ffffff'}}>should</strong> be in a world full of expectations.
                  </p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '1.5rem',
                  borderRadius: '6px',
                  borderLeft: '4px solid rgba(123, 166, 155, 0.4)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{marginBottom: 0}}>
                    But something deeper has been calling and you have felt it for a while.
                  </p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '1.5rem',
                  borderRadius: '6px',
                  borderLeft: '4px solid rgba(123, 166, 155, 0.4)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{marginBottom: 0}}>
                    You are seeking connection with the self you <em style={{color: 'rgba(123, 166, 155, 0.9)', fontStyle: 'normal', fontWeight: '600'}}>know</em> is there. The version of you that is more fearless, more grounded, more powerful but still stuck beneath the pain from your wounds.
                  </p>
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                marginTop: '3rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(123, 166, 155, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                borderRadius: '6px',
                border: '2px solid rgba(123, 166, 155, 0.2)'
              }}>
                <p style={{
                  fontWeight: '700',
                  color: '#ffffff',
                  fontSize: isMobile ? '1.3rem' : '1.5rem',
                  textShadow: '0 2px 15px rgba(123, 166, 155, 0.3)',
                  lineHeight: '1.3',
                  marginBottom: 0
                }}>
                  Know this: there is wisdom in your wounds. 
                  <br />
                  There is purpose in your pain.
                </p>
              </div>
            </div>

            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              margin: '4rem 0'
            }} />

            <div style={{marginBottom: '4rem'}}>
              <h2 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                marginBottom: '2.5rem',
                color: '#ffffff',
                fontWeight: '700'
              }}>
                Core Principles of The Circle of Return
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              }}>
                {[
                  {
                    title: '1. No performance.',
                    desc: "You will not find small talk here. Just people doing the real work—quietly, consistently, and without needing to prove anything."
                  },
                  {
                    title: '2. Return, not reinvention.',
                    desc: "This is not about becoming someone new. It is about coming back to who you are underneath the survival, the pain, and the patterns."
                  },
                  {
                    title: '3. No pressure to perform healing.',
                    desc: "You do not need to explain, impress, or have it all figured out. You just need to show up - messy, honest, and ready."
                  },
                  {
                    title: "4. We meet what is real.",
                    desc: "There is no bypassing here. We face the hard stuff, feel it fully, and move through it together with space, breath, and clarity."
                  },
                  {
                    title: '5. This is body-first, truth-led work.',
                    desc: "The shifts happen in the nervous system. In your breath. In your relationships."
                  },
                  {
                    title: "6. You are not here to be fixed.",
                    desc: "You are here to return to what has always been underneath, waiting to be remembered."
                  }
                ].map((principle, index) => (
                  <div key={index} style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderLeft: '3px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '6px'
                  }}>
                    <h3 style={{
                      fontSize: isMobile ? '1.1rem' : '1.2rem',
                      color: '#ffffff',
                      marginBottom: '0.5rem',
                      fontWeight: '600'
                    }}>
                      {principle.title}
                    </h3>
                    <p style={{
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {principle.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              margin: '4rem 0'
            }} />

            <div style={{marginBottom: '4rem'}}>
              <h2 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                marginBottom: '2rem',
                color: '#ffffff',
                fontWeight: '700'
              }}>
                🜂 What Is Inside The Circle of Return
              </h2>
              
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '2.5rem',
                lineHeight: '1.7'
              }}>
                This is not content you will forget in 48 hours. This is nervous system work, soul work, and real change from the inside out.
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                {[
                  {
                    title: 'Weekly coaching prompts + self-reflection practices',
                    desc: 'To keep you anchored in truth even when life tries to pull you out of it.'
                  },
                  {
                    title: 'Live calls, workshops + real-time guidance',
                    desc: 'For when the emotions hit, the questions rise, and you need somewhere solid to land.'
                  },
                  {
                    title: 'Tools for emotional regulation + pattern rewiring',
                    desc: 'Not theory. Practice. So you stop spiralling and start moving from centre — clean, clear, steady.'
                  },
                  {
                    title: 'Monthly themes that build rhythm + depth',
                    desc: 'No more random content or scattered self-help. Each month has a focus, a structure, and a direction.'
                  },
                  {
                    title: 'A space to be witnessed, challenged, and held',
                    desc: "You are not doing this alone. This is where people show up for each other, without judgement or performance."
                  },
                  {
                    title: 'Guest sessions from experts who go deep, not wide',
                    desc: 'To stretch your perspective, deepen your capacity, and support your return.'
                  }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.2rem',
                      flexShrink: 0,
                      marginTop: '0.2rem'
                    }}>✔</span>
                    <div>
                      <strong style={{
                        color: '#ffffff',
                        fontSize: isMobile ? '1.05rem' : '1.1rem',
                        display: 'block',
                        marginBottom: '0.3rem'
                      }}>
                        {item.title}
                      </strong>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.75)',
                        fontSize: isMobile ? '0.95rem' : '1rem',
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              margin: '4rem 0'
            }} />

            <div style={{marginBottom: '4rem'}}>
              <h2 style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                marginBottom: '2rem',
                color: '#ffffff',
                fontWeight: '700'
              }}>
                ⟁ Who This Is For
              </h2>

              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '2rem',
                lineHeight: '1.7'
              }}>
                This is for the person who knows deep down that there is more:
              </p>

              <div style={{
                fontSize: isMobile ? '1.15rem' : '1.25rem',
                color: '#ffffff',
                marginBottom: '2rem',
                lineHeight: '2',
                paddingLeft: isMobile ? '1rem' : '2rem'
              }}>
                <p style={{margin: '0.5rem 0'}}>More purpose.</p>
                <p style={{margin: '0.5rem 0'}}>More clarity.</p>
                <p style={{margin: '0.5rem 0'}}>More money.</p>
                <p style={{margin: '0.5rem 0'}}>More peace.</p>
                <p style={{margin: '0.5rem 0'}}>More of everything you feel you lack.</p>
              </div>

              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '1.5rem',
                lineHeight: '1.7',
                fontWeight: '500'
              }}>
                You are done circling the edge of your healing and ready to walk into the centre of it.
              </p>

              <p style={{
                fontSize: isMobile ? '1.05rem' : '1.15rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.7'
              }}>
                Whether you are navigating anger, addictions, pressure, self-sabotage, or just feeling lost - this is the space to return to yourself.
              </p>
            </div>

            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              margin: '4rem 0'
            }} />

            {/* PRICING SECTION */}
            <div style={{
              textAlign: 'center',
              padding: isMobile ? '2.5rem 1.5rem' : '3rem 2rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              marginBottom: '3rem'
            }}>
              {/* Premium Slick Badge */}
              <div style={{
                display: 'inline-block',
                padding: '0.6rem 1.8rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08))',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '6px',
                marginBottom: '2rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                Pre-Launch Founding Members
              </div>

              <h2 style={{
                fontSize: isMobile ? '1.8rem' : '2.4rem',
                color: '#ffffff',
                marginBottom: '1rem',
                fontWeight: '700'
              }}>
                Join The Circle of Return
              </h2>
              
              <p style={{
                fontSize: isMobile ? '1.05rem' : '1.15rem',
                color: 'rgba(255, 255, 255, 0.85)',
                marginBottom: '3rem',
                lineHeight: '1.7',
                maxWidth: '650px',
                margin: '0 auto 3rem'
              }}>
                You have tried other things. Maybe therapy. Maybe courses. Maybe content and maybe nothing at all... but the pattern keeps repeating.
              </p>

              {/* Toggle with 3px border radius */}
              <div style={{
                display: 'inline-flex',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '3px',
                padding: '4px',
                marginBottom: '2.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  onClick={() => setPricingPlan('monthly')}
                  style={{
                    padding: isMobile ? '0.8rem 1.8rem' : '1rem 2.5rem',
                    background: pricingPlan === 'monthly' ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                    color: pricingPlan === 'monthly' ? '#000' : 'rgba(255, 255, 255, 0.7)',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: isMobile ? '0.95rem' : '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPricingPlan('yearly')}
                  style={{
                    padding: isMobile ? '0.8rem 1.8rem' : '1rem 2.5rem',
                    background: pricingPlan === 'yearly' ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                    color: pricingPlan === 'yearly' ? '#000' : 'rgba(255, 255, 255, 0.7)',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: isMobile ? '0.95rem' : '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  Yearly
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                    color: '#000',
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontWeight: '700'
                  }}>
                    SAVE £150
                  </span>
                </button>
              </div>

              {/* Pricing Display */}
              <div style={{
                marginBottom: '2rem'
              }}>
                {pricingPlan === 'monthly' ? (
                  <div>
                    <div style={{
                      fontSize: isMobile ? '3rem' : '4rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '0.5rem'
                    }}>
                      £50
                      <span style={{
                        fontSize: isMobile ? '1.2rem' : '1.5rem',
                        fontWeight: '400',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        /month
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.95rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '2rem'
                    }}>
                      Billed monthly • Cancel anytime
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      fontSize: isMobile ? '3rem' : '4rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '0.5rem'
                    }}>
                      £450
                      <span style={{
                        fontSize: isMobile ? '1.2rem' : '1.5rem',
                        fontWeight: '400',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        /year
                      </span>
                    </div>
                    <p style={{
                      fontSize: '1rem',
                      color: '#4ade80',
                      fontWeight: '600',
                      marginBottom: '0.3rem'
                    }}>
                      Save £150 per year
                    </p>
                    <p style={{
                      fontSize: '0.9rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '2rem'
                    }}>
                      That is just £37.50/month
                    </p>
                  </div>
                )}
              </div>

              {/* CTA Button - Opens Waitlist Popup */}
              <button
                onClick={() => setShowWaitlistPopup(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: isMobile ? '1.2rem 2.5rem' : '1.4rem 3rem',
                  background: 'linear-gradient(135deg, rgba(123, 166, 155, 0.95), rgba(212, 175, 55, 0.95))',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: isMobile ? '1.1rem' : '1.2rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(123, 166, 155, 0.3)',
                  marginBottom: '2rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(123, 166, 155, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(123, 166, 155, 0.3)'
                }}
              >
                Join The Circle →
              </button>

              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '2rem'
              }}>
                No contracts. Cancel anytime.
              </p>

              <p style={{
                fontSize: isMobile ? '1.2rem' : '1.4rem',
                color: '#ffffff',
                fontWeight: '600',
                marginTop: '2rem'
              }}>
                Breaking the pattern starts now.
              </p>
            </div>

            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              margin: '4rem 0'
            }} />

            {/* Member Login & Waitlist Section */}
            <div style={{
              textAlign: 'center',
              padding: isMobile ? '2.5rem 1.5rem' : '3rem 2rem'
            }}>
              <h3 style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                color: '#ffffff',
                marginBottom: '2rem',
                fontWeight: '600'
              }}>
                Already a Member?
              </h3>

              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '3rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  style={{
                    padding: '0.8rem 2rem',
                    background: 'rgba(123, 166, 155, 0.8)',
                    color: '#ffffff',
                    border: '1px solid rgba(123, 166, 155, 0.5)',
                    fontWeight: '600',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(123, 166, 155, 1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(123, 166, 155, 0.8)'
                  }}
                  onClick={() => {
                    window.location.href = '/auth/login'
                  }}
                >
                  Member Login
                </button>
              </div>

              <div style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                margin: '3rem auto',
                maxWidth: '300px'
              }} />

              <h3 style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '1.5rem',
                fontWeight: '500'
              }}>
                Want updates before the next opening?
              </h3>

              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    padding: '1rem',
                    fontSize: '1rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    outline: 'none',
                    transition: 'all 0.3s ease'
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
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: isMobile ? '1rem 2rem' : '1.2rem 2.5rem',
                    background: isSubmitting ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                    color: '#000000',
                    border: 'none',
                    fontWeight: '700',
                    borderRadius: '6px',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.background = '#ffffff'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(255, 255, 255, 0.2)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  {isSubmitting ? 'Joining...' : '⊛ Join the Waitlist'}
                </button>

                {message && (
                  <p style={{
                    textAlign: 'center',
                    color: message.includes('error') || message.includes('wrong') ? '#ff6b6b' : '#4ade80',
                    fontSize: '0.95rem',
                    marginTop: '0.5rem'
                  }}>
                    {message}
                  </p>
                )}
              </form>
            </div>

          </div>
        </section>
      </main>

      <style jsx>{`
        .shimmer-line {
          position: absolute;
          pointer-events: none;
          animation: shimmerFlow 3s linear infinite;
          opacity: 0.6;
        }

        @keyframes shimmerFlow {
          0% {
            transform: translate(-100px, -100px) rotate(45deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translate(calc(100vw + 100px), calc(100vh + 100px)) rotate(45deg);
            opacity: 0;
          }
        }

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

        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </>
  )
}
