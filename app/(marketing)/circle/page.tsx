'use client'

import CircleCalendarTeaser from './components/CircleCalendarTeaser'
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
  const [showOverlay, setShowOverlay] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])


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

  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
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

        setMessage('success')
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
        {/* HERO SECTION */}
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
            {/* Fade overlay at sides */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, rgba(10,10,11,0.8) 0%, transparent 15%, transparent 85%, rgba(10,10,11,0.8) 100%)",
              pointerEvents: "none",
              zIndex: 2
            }} />
            <video
              ref={videoRef}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: isMobile ? '177.78vh' : '100%',
                height: isMobile ? '100vh' : '100%',
                minWidth: '100%',
                minHeight: '100%',
                transform: 'translate(-50%, -50%)',
                objectFit: 'cover',
                pointerEvents: showOverlay ? 'none' : 'auto',
                opacity: showOverlay ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }}
              playsInline
              onEnded={() => {
                setIsPlaying(false)
                setShowOverlay(true)
              }}
            >
              <source src="https://pub-19417e24742e4c93bb0466196037eeea.r2.dev/Circle%202026.MP4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
              background: 'transparent',
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
                maxWidth: '700px'
              }}>
                <h2 className="breathing-title" style={{
                  fontSize: isMobile ? '1.2rem' : '1.4rem',
                  fontWeight: '400',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '1rem',
                  lineHeight: '1.2',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  letterSpacing: '0.1em'
                }}>
                  The Circle of Return.
                </h2>
                <p style={{
                  fontSize: isMobile ? '1.4rem' : '1.8rem',
                  color: '#ffffff',
                  lineHeight: '1.4',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  fontWeight: '300'
                }}>
                  The work you keep putting off.<br />Done together.
                </p>
              </div>

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

          {isPlaying && !showOverlay && (
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
                  background: 'rgba(155, 196, 184, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(155, 196, 184, 0.4)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(155, 196, 184, 0.2)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
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
                  background: 'rgba(155, 196, 184, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.background = 'rgba(155, 196, 184, 0.5)'
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(155, 196, 184, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.background = 'rgba(155, 196, 184, 0.3)'
                  e.currentTarget.style.boxShadow = 'none'
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
        </section>

        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: isMobile ? '0 1.5rem' : '0 2rem'
        }}>

          {/* WHO THIS IS FOR SECTION */}
          <section style={{
            padding: isMobile ? '4rem 0' : '6rem 0'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              color: '#ffffff',
              fontWeight: '300',
              marginBottom: '3rem',
              letterSpacing: '-0.01em'
            }}>
              Who this is for.
            </h2>

            <div style={{
              maxWidth: '800px'
            }}>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.8',
                marginBottom: '2rem',
                fontWeight: '300'
              }}>
                You already know this is you.
              </p>

              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.8',
                marginBottom: '2rem',
                fontWeight: '300'
              }}>
                You have a version of yourself you can see clearly. The man who leads with confidence and builds something real. Who doesn't run away when things get hard.
              </p>

              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.8',
                marginBottom: '2rem',
                fontWeight: '300'
              }}>
                And you know there's a gap between that man and where you stand right now. Not because you lack ability or because you haven't tried. But because something underneath keeps pulling you back to where you started.
              </p>

              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.8',
                marginBottom: '2rem',
                fontWeight: '300'
              }}>
                Maybe it shows up in business. You build momentum — then somehow lose the contract, delay the launch, undercharge again. Maybe it's relationships. You find yourself in the same argument, the same moment where you shut down when you most needed to stay open. Maybe it's the version of yourself you perform in public versus the one you live with privately.
              </p>

              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: '#ffffff',
                lineHeight: '1.8',
                marginBottom: '2rem',
                fontWeight: '400'
              }}>
                All these different stories have the same root.
              </p>

              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.8',
                marginBottom: '2rem',
                fontWeight: '300'
              }}>
                I know you've read the books and listened to the podcasts. Maybe you've done therapy. You have more self-awareness than most men you know, yet still the pattern runs.
              </p>

              <p style={{
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                color: '#ffffff',
                lineHeight: '1.6',
                fontWeight: '400',
                marginTop: '3rem'
              }}>
                That's not a failure of effort. That's the nature of what's in the blind spot — by definition, you cannot see it from inside it.
              </p>
            </div>
          </section>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            margin: isMobile ? '3rem 0' : '4rem 0'
          }} />

          {/* MASON'S STORY SECTION */}
          <section style={{
            padding: isMobile ? '3rem 0' : '5rem 0'
          }}>
            <div style={{
              maxWidth: '800px',
              padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '3px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderLeft: '3px solid rgba(155, 196, 184, 0.6)'
            }}>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.9',
                marginBottom: '1.5rem',
                fontWeight: '300'
              }}>
                I'm True. And I'm not standing outside this work looking in.
              </p>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.9',
                marginBottom: '1.5rem',
                fontWeight: '300'
              }}>
                I spent years in the same cycle — and still have my moments. Two steps forward, one back. Building things and burning them. Knowing what I was doing and doing it anyway. The pattern expressed itself in many ways — from procrastination through to violence, addiction, and a level of self-destruction.
              </p>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: '#ffffff',
                lineHeight: '1.9',
                fontWeight: '400'
              }}>
                What changed wasn't a book or a single breakthrough moment. It was sustained, structured work designed to get underneath the story you tell yourself and work with what's actually stored in the body.
              </p>
            </div>
          </section>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            margin: isMobile ? '3rem 0' : '4rem 0'
          }} />

          {/* WHAT YOU GET SECTION */}
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
              What's inside.
            </h2>

            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '3rem',
              lineHeight: '1.6',
              fontWeight: '300'
            }}>
              This isn't random conversation — this work follows a clear path. Nervous system work. Body work. Real change from the inside out.
            </p>

            <div style={{
              display: 'grid',
              gap: isMobile ? '2rem' : '2.5rem'
            }}>
              {[
                {
                  title: 'Two live deep sessions each month',
                  desc: "Built around expansion topics that reveal the pattern underneath your decisions. You apply them to your real-life situations so the work moves you forward, not just inward."
                },
                {
                  title: 'Two somatic regulation sessions',
                  desc: "To help release what's been stuck and weighing you down. We build actual capacity, not just insight."
                },
                {
                  title: 'Quarterly community goal mapping review',
                  desc: "So you know exactly where you're tightening and where you're slipping."
                },
                {
                  title: 'Exclusive supporting content',
                  desc: 'We take a holistic approach — somatics, the psyche, and grounded spiritual perspectives — because understanding how and why you operate is one of the most powerful forms of growth.'
                },
                {
                  title: 'Private community',
                  desc: 'A private community of men doing the work properly. Not a place for big egos trying to out-perform.'
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

          {/* DIFFERENTIATOR SECTION */}
          <section style={{
            padding: isMobile ? '3rem 0' : '5rem 0'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              color: '#ffffff',
              fontWeight: '300',
              marginBottom: '2rem',
              letterSpacing: '-0.01em'
            }}>
              This isn't another membership.
            </h2>

            <div style={{
              maxWidth: '800px'
            }}>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.8',
                marginBottom: '2rem',
                fontWeight: '300'
              }}>
                You're currently running old code that was written long before you were old enough to question it. When this code continues to run unchecked, it shapes your relationships, your opportunities, and your ability to hold what you build.
              </p>

              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: '#ffffff',
                lineHeight: '1.8',
                marginBottom: '2rem',
                fontWeight: '400'
              }}>
                When the code is interrupted, something changes.
              </p>

              {[
                "You stop sabotaging the very thing you say you want.",
                "You respond instead of react.",
                "You stay steady when things don't go your way.",
                "You make decisions without second-guessing yourself afterwards.",
              ].map((line, i) => (
                <div key={i} style={{ borderLeft: '3px solid rgba(155,196,184,0.6)', paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', fontWeight: '300' }}>{line}</p>
                </div>
              ))}

              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: '#ffffff',
                lineHeight: '1.8',
                marginTop: '2rem',
                fontWeight: '400'
              }}>
                When you enter The CoR — you will feel shifts within weeks. And within your first 30 days, you will identify a pattern that has been influencing your decisions for years.
              </p>
            </div>
          </section>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            margin: isMobile ? '3rem 0' : '4rem 0'
          }} />

          {/* CORE PRINCIPLES SECTION */}
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
              How we work.
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
                  title: 'See it.',
                  desc: "Catch the pattern that is running while understanding what's underneath it."
                },
                {
                  num: '02',
                  title: 'Regulate it.',
                  desc: "Your body still holds what the mind doesn't want to deal with. We release what's been stored over the years and build the capacity to hold pressure without reverting. Breathwork. Somatic work. Practical tools that stop the spiral before it starts."
                },
                {
                  num: '03',
                  title: 'Become it.',
                  desc: "Who does your goal require you to be? We close that gap. This cycle repeats, and is applied to real situations — until the old programme loses its grip, and we rewrite a new one."
                },
                {
                  num: '04',
                  title: "No performance",
                  desc: 'No small talk. No proving yourself. Just people doing the real work, quietly and consistently.'
                },
                {
                  num: '05',
                  title: 'Return, not reinvention',
                  desc: "This is not about becoming someone new. It is about coming back to who you are underneath the survival, the pain, and the patterns."
                },
                {
                  num: '06',
                  title: "You are not here to be fixed",
                  desc: "You are here to return to what has always been underneath. Waiting to be remembered."
                }
              ].map((principle, i) => (
                <div key={i} style={{
                  minWidth: isMobile ? '85%' : 'auto',
                  scrollSnapAlign: isMobile ? 'start' : 'none',
                  padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '3px',
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

          {/* SOCIAL PROOF SECTION */}
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
              What members say.
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '2rem'
            }}>
              {[
                {
                  quote: "I've tried therapy, courses, everything. This is the first time something actually shifted in my body, not just my head.",
                  name: "James",
                  result: "Found clarity after years of confusion"
                },
                {
                  quote: "The accountability and the space to be honest without judgement changed everything for me.",
                  name: "David",
                  result: "Broke a 15-year pattern"
                },
                {
                  quote: "I didn't know what I was looking for. Now I do. And I know how to get there.",
                  name: "Michael",
                  result: "Reconnected with purpose"
                },
                {
                  quote: "This isn't like other memberships. People actually show up. The work actually lands.",
                  name: "Chris",
                  result: "Transformed his relationships"
                }
              ].map((testimonial, i) => (
                <div key={i} style={{
                  padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '3px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <p style={{
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: '1.7',
                    marginBottom: '1.5rem',
                    fontWeight: '300',
                    fontStyle: 'italic'
                  }}>
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p style={{
                      fontSize: '1rem',
                      color: '#ffffff',
                      fontWeight: '500',
                      marginBottom: '0.25rem'
                    }}>
                      {testimonial.name}
                    </p>
                    <p style={{
                      fontSize: '0.9rem',
                      color: 'rgba(155, 196, 184, 0.9)',
                      fontWeight: '400'
                    }}>
                      {testimonial.result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            margin: isMobile ? '3rem 0' : '4rem 0'
          }} />

          {/* PRICING SECTION */}
          <section style={{
            padding: isMobile ? '3rem 0 4rem' : '5rem 0 6rem',
            textAlign: 'center'
          }}>
            <CircleCalendarTeaser />

            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              color: '#ffffff',
              fontWeight: '300',
              marginBottom: '1rem',
              letterSpacing: '-0.01em'
            }}>
              Join the Circle of Return.
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
              You've tried other things. The pattern kept repeating. This is where it stops.
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
                    Save £150
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
              Join the Waitlist
            </button>

            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: '300',
              marginBottom: '2rem'
            }}>
              No contracts. Cancel anytime. You're in control.
            </p>
          </section>

          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            margin: isMobile ? '3rem 0' : '4rem 0'
          }} />

          {/* FINAL CTA SECTION */}
          <section style={{
            padding: isMobile ? '3rem 0 5rem' : '5rem 0 7rem',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              color: '#ffffff',
              fontWeight: '300',
              marginBottom: '1.5rem',
              letterSpacing: '-0.01em'
            }}>
              You've read this far and that means something.
            </h2>

            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '2.5rem',
              lineHeight: '1.6',
              fontWeight: '300',
              maxWidth: '600px',
              margin: '0 auto 2.5rem'
            }}>
              Men who aren't ready close the tab in the first two minutes. You already know whether this is for you. You knew it somewhere in the first few paragraphs. What you're doing now is checking whether it's safe to trust that knowing.
            </p>

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
                letterSpacing: '0.02em'
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
              Join the Waitlist
            </button>
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
              borderRadius: '3px',
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

            {message === 'success' ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.4rem', fontWeight: '400', color: '#ffffff', marginBottom: '0.75rem' }}>
                  You're on the list.
                </p>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', fontWeight: '300' }}>
                  We'll be in touch when doors open. Keep doing the work in the meantime.
                </p>
              </div>
            ) : (
              <>
                <h3 style={{
                  fontSize: isMobile ? '1.5rem' : '1.7rem',
                  color: '#ffffff',
                  marginBottom: '0.8rem',
                  fontWeight: '400',
                  letterSpacing: '-0.01em'
                }}>
                  Join the Waitlist
                </h3>

                <p style={{
                  fontSize: '0.95rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '2rem',
                  lineHeight: '1.5',
                  fontWeight: '300'
                }}>
                  Be first to know when the Circle of Return opens.
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
                    onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Join the Waitlist'}
                  </button>

                  {message && message !== 'success' && (
                    <p style={{
                      textAlign: 'center',
                      color: '#ff6b6b',
                      fontSize: '0.85rem',
                      marginTop: '0.5rem',
                      fontWeight: '300'
                    }}>
                      {message}
                    </p>
                  )}
                </form>
              </>
            )}
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
