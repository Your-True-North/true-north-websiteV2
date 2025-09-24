'use client'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import MysticalBackground from '../components/MysticalBackground'
import { useState, useEffect } from 'react'

export default function Circle() {
  const [isMobile, setIsMobile] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
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
        setMessage("You're on the waitlist. Check your email.")
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
      
      <main className="page-container">
        <section className="section" style={{
          paddingTop: isMobile ? '6rem' : '8rem',
          paddingBottom: '4rem'
        }}>
          <div className="container" style={{maxWidth: '900px', margin: '0 auto'}}>
            
            <div style={{textAlign: 'center', marginBottom: '4rem'}}>
              <h1 style={{
                fontSize: isMobile ? '2.5rem' : '3.5rem',
                marginBottom: '2rem',
                color: '#ffffff',
                fontWeight: '700',
                lineHeight: '1.1'
              }}>
                The Circle of Return
              </h1>
            </div>

            <div style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              lineHeight: '1.8',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '4rem'
            }}>
              <p style={{marginBottom: '1.5rem'}}>
                This isn't a community or a group coaching programme.
              </p>
              <p style={{marginBottom: '2.5rem'}}>
                If you join, you're entering a portal - a space to return to yourself. Return to your truth.
              </p>
              
              <p style={{marginBottom: '1.5rem'}}>
                You've built your current identity around survival, pressure, and who you <strong>should</strong> be in a world full of expectations.
              </p>
              
              <p style={{marginBottom: '1.5rem'}}>
                But something deeper has been calling and you've felt it for a while.
              </p>
              
              <p style={{marginBottom: '1.5rem'}}>
                You're seeking connection with the self you <em>know</em> is there. The version of you that's more fearless, more grounded, more powerful but still stuck beneath the pain from your wounds.
              </p>
              
              <p style={{
                fontWeight: '600',
                color: '#ffffff',
                fontSize: isMobile ? '1.2rem' : '1.3rem',
                marginTop: '2rem'
              }}>
                Know this: there's wisdom in your wounds. There's purpose in your pain.
              </p>
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
                    desc: "You won't find small talk here. Just people doing the real work—quietly, consistently, and without needing to prove anything."
                  },
                  {
                    title: '2. Return, not reinvention.',
                    desc: "This isn't about becoming someone new. It's about coming back to who you are underneath the survival, the pain, and the patterns."
                  },
                  {
                    title: '3. No pressure to perform healing.',
                    desc: "You don't need to explain, impress, or have it all figured out. You just need to show up - messy, honest, and ready."
                  },
                  {
                    title: '4. We meet what's real.',
                    desc: "There's no bypassing here. We face the hard stuff, feel it fully, and move through it together with space, breath, and clarity."
                  },
                  {
                    title: '5. This is body-first, truth-led work.',
                    desc: "The shifts happen in the nervous system. In your breath. In your relationships."
                  },
                  {
                    title: '6. You're not here to be fixed.',
                    desc: "You're here to return to what's always been underneath, waiting to be remembered."
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
                🜂 What's Inside The Circle of Return
              </h2>
              
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '2.5rem',
                lineHeight: '1.7'
              }}>
                This isn't content you'll forget in 48 hours. This is nervous system work, soul work, and real change from the inside out.
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
                    desc: "You're not doing this alone. This is where people show up for each other, without judgement or performance."
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
                This is for the person who knows deep down that there's more:
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
                You're done circling the edge of your healing and ready to walk into the centre of it.
              </p>

              <p style={{
                fontSize: isMobile ? '1.05rem' : '1.15rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.7'
              }}>
                Whether you're navigating anger, addictions, pressure, self-sabotage, or just feeling lost - this is the space to return to yourself.
              </p>
            </div>

            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              margin: '4rem 0'
            }} />

            <div style={{
              textAlign: 'center',
              padding: isMobile ? '2.5rem 1.5rem' : '3rem 2rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <h2 style={{
                fontSize: isMobile ? '1.6rem' : '2rem',
                color: '#ffffff',
                marginBottom: '1.5rem',
                fontWeight: '700'
              }}>
                The investment in yourself is a gift.
              </h2>
              
              <p style={{
                fontSize: isMobile ? '1.05rem' : '1.15rem',
                color: 'rgba(255, 255, 255, 0.85)',
                marginBottom: '1.5rem',
                lineHeight: '1.7'
              }}>
                You've tried other things. Maybe therapy. Maybe courses. Maybe content and Maybe nothing at all... but the pattern keeps repeating.
              </p>
              
              <p style={{
                fontSize: isMobile ? '1.15rem' : '1.3rem',
                color: '#ffffff',
                fontWeight: '600',
                marginBottom: '2rem'
              }}>
                Breaking the pattern starts now.
              </p>

              <p style={{
                fontSize: '0.95rem',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '2rem'
              }}>
                You can cancel anytime. No pressure. No contracts.
              </p>

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
      `}</style>
    </>
  )
}