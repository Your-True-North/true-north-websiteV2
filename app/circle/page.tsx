'use client'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import MysticalBackground from '../components/MysticalBackground'
import { useState, useEffect, useRef } from 'react'

const CircleHeroVideo = ({ youtubeUrl, onClose }) => {
  const [showIntro, setShowIntro] = useState(true);
  const introText = "WATCH FIRST";
  const [animatedLetters, setAnimatedLetters] = useState([]);

  useEffect(() => {
    const letters = introText.split('').map((letter, index) => {
      const edgePositions = [
        { x: 0, y: -300 },       
        { x: 300, y: -300 },     
        { x: 300, y: 0 },        
        { x: 300, y: 300 },      
        { x: 0, y: 300 },        
        { x: -300, y: 300 },     
        { x: -300, y: 0 },       
        { x: -300, y: -300 },    
      ];
      
      const position = edgePositions[index % 8];
      
      return {
        letter: letter === ' ' ? '\u00A0' : letter,
        index,
        initialX: position.x,
        initialY: position.y,
        delay: index * 80
      };
    });
    
    setAnimatedLetters(letters);

    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1000,
      background: '#000'
    }}>
      {/* YouTube Embed */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}>
        <iframe
          src={`${youtubeUrl}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`}
          title="Circle of Return Introduction"
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

      {/* Charcoal Grey Overlay with Fade */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at center, 
            rgba(54, 54, 54, 0.1) 0%, 
            rgba(54, 54, 54, 0.4) 70%, 
            rgba(54, 54, 54, 0.7) 100%
          )
        `,
        pointerEvents: 'none'
      }} />

      {/* Animated "WATCH FIRST" Text */}
      {showIntro && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: '700',
          color: '#ffffff',
          textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          letterSpacing: '0.1em',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          zIndex: 10
        }}>
          {animatedLetters.map((letterData, index) => (
            <span
              key={index}
              style={{
                display: 'inline-block',
                transform: `translate(${letterData.initialX}px, ${letterData.initialY}px)`,
                opacity: 0,
                animation: `letterSlideIn 1.5s ease-out ${letterData.delay}ms forwards, letterSlideOut 1s ease-in ${3000 + letterData.delay}ms forwards`
              }}
            >
              {letterData.letter}
            </span>
          ))}
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          background: 'rgba(54, 54, 54, 0.8)',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(54, 54, 54, 0.8)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ✕
      </button>

      <style jsx>{`
        @keyframes letterSlideIn {
          0% {
            transform: translate(var(--init-x), var(--init-y));
            opacity: 0;
          }
          100% {
            transform: translate(0, 0);
            opacity: 1;
          }
        }
        
        @keyframes letterSlideOut {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(var(--init-x), var(--init-y));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default function Circle() {
  const [isMobile, setIsMobile] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [showVideo, setShowVideo] = useState(false)
  
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
      
      <div className="shimmer-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {showVideo && (
        <CircleHeroVideo 
          youtubeUrl="https://www.youtube.com/embed/YOUR_VIDEO_ID"
          onClose={() => setShowVideo(false)}
        />
      )}
      
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

              {/* Custom Video Player with Overlay */}
              <div style={{
                marginBottom: '3rem',
                maxWidth: '800px',
                margin: '2rem auto 3rem auto',
                position: 'relative'
              }}>
                <div style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
                  background: 'linear-gradient(135deg, rgba(123, 166, 155, 0.1) 0%, rgba(54, 54, 54, 0.8) 100%)'
                }}>
                  <iframe
                    src="https://www.youtube.com/embed/YOUR_VIDEO_ID?rel=0&modestbranding=1&controls=0&showinfo=0"
                    title="Circle of Return Introduction"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '12px'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  
                  {/* Custom Play Button Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    border: '3px solid rgba(123, 166, 155, 0.3)',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)'
                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(123, 166, 155, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onClick={() => {
                    // This will need JavaScript to interact with YouTube API
                    console.log('Play video')
                  }}
                  >
                    <div style={{
                      width: 0,
                      height: 0,
                      borderLeft: '20px solid #333',
                      borderTop: '12px solid transparent',
                      borderBottom: '12px solid transparent',
                      marginLeft: '4px'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              lineHeight: '1.8',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '4rem',
              position: 'relative'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(123, 166, 155, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                padding: isMobile ? '2rem 1.5rem' : '2.5rem 3rem',
                borderRadius: '16px',
                border: '1px solid rgba(123, 166, 155, 0.1)',
                backdropFilter: 'blur(20px)',
                marginBottom: '2rem'
              }}>
                <p style={{
                  marginBottom: '1.5rem',
                  fontSize: isMobile ? '1.15rem' : '1.25rem',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.95)',
                  textAlign: 'center'
                }}>
                  This isn't a community or a group coaching programme.
                </p>
              </div>
              
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
                  If you join, you're entering a portal - a space to return to yourself. 
                  <span style={{
                    background: 'linear-gradient(135deg, rgba(123, 166, 155, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '700'
                  }}>
                    Return to your truth.
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
                  borderRadius: '12px',
                  borderLeft: '4px solid rgba(123, 166, 155, 0.4)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{marginBottom: '1.5rem'}}>
                    You've built your current identity around survival, pressure, and who you <strong style={{color: '#ffffff'}}>should</strong> be in a world full of expectations.
                  </p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  borderLeft: '4px solid rgba(123, 166, 155, 0.4)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{marginBottom: '1.5rem'}}>
                    But something deeper has been calling and you've felt it for a while.
                  </p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  borderLeft: '4px solid rgba(123, 166, 155, 0.4)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{marginBottom: '1.5rem'}}>
                    You're seeking connection with the self you <em style={{color: 'rgba(123, 166, 155, 0.9)', fontStyle: 'normal', fontWeight: '600'}}>know</em> is there. The version of you that's more fearless, more grounded, more powerful but still stuck beneath the pain from your wounds.
                  </p>
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                marginTop: '3rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(123, 166, 155, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                borderRadius: '16px',
                border: '2px solid rgba(123, 166, 155, 0.2)'
              }}>
                <p style={{
                  fontWeight: '700',
                  color: '#ffffff',
                  fontSize: isMobile ? '1.3rem' : '1.5rem',
                  textShadow: '0 2px 15px rgba(123, 166, 155, 0.3)',
                  lineHeight: '1.3'
                }}>
                  Know this: there's wisdom in your wounds. 
                  <br />
                  There's purpose in your pain.
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
                    title: "4. We meet what's real.",
                    desc: "There's no bypassing here. We face the hard stuff, feel it fully, and move through it together with space, breath, and clarity."
                  },
                  {
                    title: '5. This is body-first, truth-led work.',
                    desc: "The shifts happen in the nervous system. In your breath. In your relationships."
                  },
                  {
                    title: "6. You're not here to be fixed.",
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

              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
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
                    // Redirect to login/register page
                    window.location.href = '/auth/login'
                  }}
                >
                  Member Login
                </button>
                
                <button
                  style={{
                    padding: '0.8rem 2rem',
                    background: 'transparent',
                    color: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontWeight: '600',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                  }}
                  onClick={() => {
                    // Redirect to backend dashboard
                    window.location.href = '/admin'
                  }}
                >
                  Admin Access
                </button>
              </div>

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
      `}</style>
    </>
  )
}