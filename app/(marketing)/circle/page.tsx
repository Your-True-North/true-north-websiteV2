'use client'
import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { trackEvent } from '@/app/components/GoogleAnalytics'

export default function Circle() {
  const [isMobile, setIsMobile] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [pricingPlan, setPricingPlan] = useState('yearly')
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const playerRef = useRef(null)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (isPlaying && !playerRef.current && window.YT) {
      const initPlayer = () => {
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: '-k7UOEJf9wM',
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 1,
            playsinline: 1
          },
          events: {
            onReady: () => {
              setPlayerReady(true)
              setShowOverlay(false)
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)
                setShowOverlay(false)
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false)
              } else if (event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false)
                setShowOverlay(true)
              }
            }
          }
        })
      }

      if (window.YT.Player) {
        initPlayer()
      } else {
        window.onYouTubeIframeAPIReady = initPlayer
      }
    }
  }, [isPlaying])

  const handlePlayPause = () => {
    if (playerRef.current && playerReady) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    }
  }

  const handleRewind = () => {
    if (playerRef.current && playerReady) {
      const currentTime = playerRef.current.getCurrentTime()
      playerRef.current.seekTo(Math.max(0, currentTime - 10), true)
    }
  }

  const handleInitialPlay = () => {
    setIsPlaying(true)
    setShowOverlay(false)
  }

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
        trackEvent('join_waitlist', {
          list: 'circle_of_return',
          value: 1
        })

        const stripeUrl = pricingPlan === 'monthly'
          ? 'https://buy.stripe.com/9B66oIcPd1o1do42fl9IQ0h'
          : 'https://buy.stripe.com/6oU14og1p2s52Jq9HN9IQ0i'

        window.location.href = stripeUrl
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setMessage('Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <main style={{ position: 'relative' }}>
        <section style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '100vh' : '110vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}>
            <div
              id="youtube-player"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: isMobile ? '177.78vh' : '100%',
                height: isMobile ? '100vh' : '100%',
                minWidth: '100%',
                minHeight: '100%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: showOverlay ? 'none' : 'auto',
                opacity: showOverlay ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }}
            />
          </div>

          {showOverlay && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.15), rgba(127, 176, 105, 0.15))',
              backdropFilter: 'blur(10px)',
              zIndex: 10,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              gap: isMobile ? '2rem' : '3rem',
              padding: isMobile ? '2rem' : '4rem'
            }}
            onClick={handleInitialPlay}
            >
              <div style={{
                textAlign: 'center',
                maxWidth: '600px'
              }}>
                <h2 className="breathing-title" style={{
                  fontSize: isMobile ? '1.8rem' : '2.5rem',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '1rem',
                  lineHeight: '1.2',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                }}>
                  Circle of Return
                </h2>
                <p style={{
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: '1.6',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                }}>
                  A space to remember who you are
                </p>
              </div>

              <div style={{
                width: isMobile ? '70px' : '90px',
                height: isMobile ? '70px' : '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(155, 196, 184, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(155, 196, 184, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(155, 196, 184, 0.3)'
              }}
              >
                <Play size={isMobile ? 28 : 36} color="#000" fill="#000" style={{ marginLeft: '4px' }} />
              </div>

              <p style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                marginTop: isMobile ? '-1rem' : '0'
              }}>
                {isMobile ? 'Tap to watch' : 'Click to watch'}
              </p>
            </div>
          )}

          {isPlaying && playerReady && (
            <div style={{
              position: 'absolute',
              bottom: isMobile ? '2rem' : '1.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '1rem',
              zIndex: 100,
              padding: '0.75rem 1.5rem',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50px',
              border: '1px solid rgba(155, 196, 184, 0.3)',
              transition: 'opacity 0.3s ease'
            }}>
              <button
                onClick={handleRewind}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(155, 196, 184, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <RotateCcw size={20} color="#fff" />
              </button>

              <button
                onClick={handlePlayPause}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(155, 196, 184, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {isPlaying ? (
                  <Pause size={24} color="#000" fill="#000" />
                ) : (
                  <Play size={24} color="#000" fill="#000" style={{ marginLeft: '2px' }} />
                )}
              </button>
            </div>
          )}
        </section>

        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: isMobile ? '0 1.5rem' : '0 2rem'
        }}>

          <section style={{
            padding: isMobile ? '4rem 0' : '6rem 0'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              color: '#ffffff',
              fontWeight: '300',
              marginBottom: '3rem',
              textAlign: 'center',
              letterSpacing: '-0.01em'
            }}>
              Who This Is For
            </h2>

            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <p style={{
                fontSize: isMobile ? '1.2rem' : '1.4rem',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.7',
                marginBottom: '2.5rem',
                fontWeight: '300'
              }}>
                This is for the person who knows deep down that there is more:
              </p>

              <div style={{
                display: 'grid',
                gap: '1.5rem',
                maxWidth: '600px',
                margin: '0 auto 3rem'
              }}>
                {[
                  { main: 'More purpose', sub: 'Stop wondering what you are here for' },
                  { main: 'More clarity', sub: 'Know what you want without second-guessing' },
                  { main: 'More money', sub: 'Build the life you keep putting off' },
                  { main: 'More peace', sub: 'Sleep without your mind racing' },
                  { main: 'More of everything you feel you lack', sub: 'Access the power you know is there' }
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '1.5rem 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '1.15rem' : '1.25rem',
                      color: '#ffffff',
                      marginBottom: '0.5rem',
                      fontWeight: '400'
                    }}>
                      {item.main}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '0.95rem' : '1rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '300',
                      lineHeight: '1.5'
                    }}>
                      {item.sub}
                    </div>
                  </div>
                ))}
              </div>

              <p style={{
                fontSize: isMobile ? '1.15rem' : '1.3rem',
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: '1.6',
                fontWeight: '400',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                You are done circling the edge of your healing and ready to walk into the centre of it.
              </p>
            </div>
          </section>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            margin: isMobile ? '3rem 0' : '4rem 0'
          }} />

          <section style={{
            padding: isMobile ? '3rem 0' : '5rem 0',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: isMobile ? '1.4rem' : '1.8rem',
              color: '#ffffff',
              fontWeight: '300',
              lineHeight: '1.5',
              marginBottom: '2rem',
              maxWidth: '800px',
              margin: '0 auto 2rem'
            }}>
              If you join, you are entering a portal—a space to return to yourself.
            </p>

            <p style={{
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              background: 'linear-gradient(135deg, rgba(123, 166, 155, 0.9), rgba(255, 255, 255, 0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '400',
              marginBottom: '3rem'
            }}>
              Return to your truth.
            </p>

            <div style={{
              display: 'grid',
              gap: isMobile ? '1.5rem' : '2rem',
              marginTop: '3rem'
            }}>
              {[
                "You have built your current identity around survival, pressure, and who you should be in a world full of expectations.",
                "But something deeper has been calling and you have felt it for a while.",
                "You are seeking connection with the self you know is there. The version of you that is more fearless, more grounded, more powerful but still stuck beneath the pain from your wounds."
              ].map((text, i) => (
                <p key={i} style={{
                  fontSize: isMobile ? '1.05rem' : '1.15rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.7',
                  fontWeight: '300',
                  padding: isMobile ? '1.5rem' : '2rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease'
                }}>
                  {text}
                </p>
              ))}
            </div>

            <div style={{
              marginTop: '3rem',
              padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
              background: 'linear-gradient(135deg, rgba(123, 166, 155, 0.08), rgba(255, 255, 255, 0.03))',
              borderRadius: '6px',
              border: '1px solid rgba(123, 166, 155, 0.2)'
            }}>
              <p style={{
                fontSize: isMobile ? '1.2rem' : '1.4rem',
                color: '#ffffff',
                fontWeight: '400',
                lineHeight: '1.4',
                margin: 0
              }}>
                Know this: there is wisdom in your wounds.<br />
                There is purpose in your pain.
              </p>
            </div>
          </section>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            margin: isMobile ? '3rem 0' : '4rem 0'
          }} />

          <section style={{
            padding: isMobile ? '3rem 0' : '5rem 0'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              color: '#ffffff',
              fontWeight: '300',
              marginBottom: '1.5rem',
              letterSpacing: '-0.01em'
            }}>
              What Is Inside
            </h2>
            
            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '3rem',
              lineHeight: '1.6',
              fontWeight: '300'
            }}>
              This is not content you will forget in 48 hours. This is nervous system work, soul work, and real change from the inside out.
            </p>

            <div style={{
              display: 'grid',
              gap: isMobile ? '2rem' : '2.5rem'
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
                  desc: 'Not theory. Practice. So you stop spiralling and start moving from centre—clean, clear, steady.'
                },
                {
                  title: 'Monthly themes that build rhythm + depth',
                  desc: 'No more random content or scattered self-help. Each month has a focus, a structure, and a direction.'
                },
                {
                  title: 'A space to be witnessed, challenged, and held',
                  desc: 'You are not doing this alone. This is where people show up for each other, without judgement or performance.'
                },
                {
                  title: 'Guest sessions from experts who go deep, not wide',
                  desc: 'To stretch your perspective, deepen your capacity, and support your return.'
                }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gap: '0.5rem'
                }}>
                  <h3 style={{
                    fontSize: isMobile ? '1.1rem' : '1.2rem',
                    color: '#ffffff',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '0.95rem' : '1rem',
                    color: 'rgba(255, 255, 255, 0.65)',
                    lineHeight: '1.6',
                    fontWeight: '300',
                    margin: 0
                  }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            margin: isMobile ? '3rem 0' : '4rem 0'
          }} />

          <section style={{
            padding: isMobile ? '3rem 0' : '5rem 0'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              color: '#ffffff',
              fontWeight: '300',
              marginBottom: '3rem',
              letterSpacing: '-0.01em'
            }}>
              Core Principles
            </h2>

            <div style={{
              display: isMobile ? 'flex' : 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '1.5rem' : '2rem',
              overflowX: isMobile ? 'auto' : 'visible',
              scrollSnapType: isMobile ? 'x mandatory' : 'none',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: isMobile ? '1rem' : '0'
            }}>
              {[
                {
                  num: '01',
                  title: 'No performance',
                  desc: 'You will not find small talk here. Just people doing the real work—quietly, consistently, and without needing to prove anything.'
                },
                {
                  num: '02',
                  title: 'Return, not reinvention',
                  desc: 'This is not about becoming someone new. It is about coming back to who you are underneath the survival, the pain, and the patterns.'
                },
                {
                  num: '03',
                  title: 'No pressure to perform healing',
                  desc: 'You do not need to explain, impress, or have it all figured out. You just need to show up—messy, honest, and ready.'
                },
                {
                  num: '04',
                  title: 'We meet what is real',
                  desc: 'There is no bypassing here. We face the hard stuff, feel it fully, and move through it together with space, breath, and clarity.'
                },
                {
                  num: '05',
                  title: 'Body-first, truth-led work',
                  desc: 'The shifts happen in the nervous system. In your breath. In your relationships.'
                },
                {
                  num: '06',
                  title: 'You are not here to be fixed',
                  desc: 'You are here to return to what has always been underneath, waiting to be remembered.'
                }
              ].map((principle, i) => (
                <div key={i} style={{
                  minWidth: isMobile ? '85%' : 'auto',
                  scrollSnapAlign: isMobile ? 'start' : 'none',
                  padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginBottom: '1rem',
                    fontWeight: '500',
                    letterSpacing: '0.1em'
                  }}>
                    {principle.num}
                  </div>
                  <h3 style={{
                    fontSize: isMobile ? '1.2rem' : '1.3rem',
                    color: '#ffffff',
                    fontWeight: '400',
                    marginBottom: '0.8rem'
                  }}>
                    {principle.title}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '0.95rem' : '1rem',
                    color: 'rgba(255, 255, 255, 0.65)',
                    lineHeight: '1.6',
                    fontWeight: '300',
                    margin: 0
                  }}>
                    {principle.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            margin: isMobile ? '3rem 0' : '4rem 0'
          }} />

          <section style={{
            padding: isMobile ? '3rem 0 4rem' : '5rem 0 6rem',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              color: '#ffffff',
              fontWeight: '300',
              marginBottom: '1rem',
              letterSpacing: '-0.01em'
            }}>
              Join The Circle of Return
            </h2>
            
            <p style={{
              fontSize: isMobile ? '1.05rem' : '1.15rem',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '3rem',
              lineHeight: '1.6',
              fontWeight: '300',
              maxWidth: '600px',
              margin: '0 auto 3rem'
            }}>
              You have tried other things. Maybe therapy. Maybe courses. Maybe content and maybe nothing at all... but the pattern keeps repeating.
            </p>

            <div style={{
              display: 'inline-flex',
              gap: '0.5rem',
              padding: '0.3rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '3px',
              marginBottom: '2.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <button
                onClick={() => setPricingPlan('monthly')}
                style={{
                  padding: isMobile ? '0.6rem 1.5rem' : '0.7rem 2rem',
                  background: pricingPlan === 'monthly' ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                  color: pricingPlan === 'monthly' ? '#000' : 'rgba(255, 255, 255, 0.7)',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.02em'
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setPricingPlan('yearly')}
                style={{
                  padding: isMobile ? '0.6rem 1.5rem' : '0.7rem 2rem',
                  background: pricingPlan === 'yearly' ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                  color: pricingPlan === 'yearly' ? '#000' : 'rgba(255, 255, 255, 0.7)',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  letterSpacing: '0.02em'
                }}
              >
                Yearly
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#4ade80',
                  color: '#000',
                  fontSize: '0.6rem',
                  padding: '2px 5px',
                  borderRadius: '2px',
                  fontWeight: '700',
                  letterSpacing: '0.03em'
                }}>
                  SAVE £150
                </span>
              </button>
            </div>

            <div style={{
              marginBottom: '2.5rem'
            }}>
              {pricingPlan === 'monthly' ? (
                <>
                  <div style={{
                    fontSize: isMobile ? '3.5rem' : '4.5rem',
                    fontWeight: '300',
                    color: '#ffffff',
                    lineHeight: '1',
                    marginBottom: '0.5rem'
                  }}>
                    £50
                    <span style={{
                      fontSize: isMobile ? '1.3rem' : '1.5rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '300'
                    }}>
                      /month
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: '300'
                  }}>
                    Cancel anytime
                  </p>
                </>
              ) : (
                <>
                  <div style={{
                    fontSize: isMobile ? '3.5rem' : '4.5rem',
                    fontWeight: '300',
                    color: '#ffffff',
                    lineHeight: '1',
                    marginBottom: '0.5rem'
                  }}>
                    £450
                    <span style={{
                      fontSize: isMobile ? '1.3rem' : '1.5rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '300'
                    }}>
                      /year
                    </span>
                  </div>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4ade80',
                    fontWeight: '500',
                    marginBottom: '0.3rem'
                  }}>
                    Save £150 per year
                  </p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: '300'
                  }}>
                    Just £37.50/month
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setShowWaitlistPopup(true)}
              style={{
                padding: isMobile ? '1.2rem 2.5rem' : '1.3rem 3rem',
                background: '#ffffff',
                color: '#000',
                border: 'none',
                borderRadius: '3px',
                fontSize: isMobile ? '1rem' : '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
                marginBottom: '1.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Request Early Access
            </button>

            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: '300',
              marginBottom: '2rem'
            }}>
              No contracts • Cancel anytime
            </p>

            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: '300',
              fontStyle: 'italic'
            }}>
              Breaking the pattern starts now.
            </p>
          </section>

        </div>
      </main>

      {showWaitlistPopup && (
        <div 
          onClick={() => setShowWaitlistPopup(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(10, 10, 11, 0.95), rgba(20, 20, 22, 0.95))',
              padding: isMobile ? '2.5rem 2rem' : '3rem 2.5rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              maxWidth: '480px',
              width: '100%',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowWaitlistPopup(false)}
              style={{
                position: 'absolute',
                top: '1.2rem',
                right: '1.2rem',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.3rem',
                lineHeight: '1',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
            >
              ×
            </button>

            <h3 style={{
              fontSize: isMobile ? '1.5rem' : '1.7rem',
              color: '#ffffff',
              marginBottom: '0.8rem',
              fontWeight: '400',
              letterSpacing: '-0.01em'
            }}>
              Founding Member Access
            </h3>

            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '2rem',
              lineHeight: '1.5',
              fontWeight: '300'
            }}>
              Secure your place at founding member pricing before we open to the public
            </p>

            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
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
                  borderRadius: '3px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontWeight: '300'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '1.1rem',
                  background: isSubmitting ? 'rgba(255, 255, 255, 0.5)' : '#ffffff',
                  color: '#000',
                  border: 'none',
                  fontWeight: '600',
                  borderRadius: '3px',
                  fontSize: '1rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.02em'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                {isSubmitting ? 'Processing...' : 'Reserve My Place'}
              </button>

              {message && (
                <p style={{
                  textAlign: 'center',
                  color: message.includes('error') || message.includes('wrong') ? '#ff6b6b' : '#4ade80',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                  fontWeight: '300'
                }}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        @media (hover: hover) {
          button:not(:disabled):hover {
            transform: scale(1.01);
          }
        }

        @media (hover: none) {
          button:active {
            transform: scale(0.98);
          }
        }

        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}