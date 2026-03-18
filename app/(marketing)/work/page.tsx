'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, Play, Pause, RotateCcw } from 'lucide-react'
import { trackEvent } from '@/app/components/GoogleAnalytics'

export default function Work() {
  const [isMobile, setIsMobile] = useState(false)
  const [showPackPopup, setShowPackPopup] = useState(false)
  const [showVSL, setShowVSL] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [showCTA, setShowCTA] = useState(false)
  const playerRef = useRef(null)
  const whatsappNumber = "+447449052909"

  const [showQuizPanel, setShowQuizPanel] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [recommendation, setRecommendation] = useState<'coaching' | 'circle' | 'library'>('library')

  const questions = [
    {
      id: 1,
      question: "How would you describe where you are in your personal growth journey?",
      options: [
        { text: "Just starting to recognise I need change", value: "beginning" },
        { text: "I've tried some approaches but need deeper work", value: "intermediate" },
        { text: "I'm ready for intensive, transformational work", value: "ready" },
        { text: "I need ongoing support to maintain my progress", value: "maintenance" }
      ]
    },
    {
      id: 2,
      question: "When it comes to making real changes in your life, how do you feel right now?",
      options: [
        { text: "I'm willing to explore but want to take it slow", value: "cautious" },
        { text: "I'm committed and ready to do whatever it takes", value: "committed" },
        { text: "I need guidance to figure out what I actually need", value: "uncertain" },
        { text: "I've been putting this off but know I can't wait anymore", value: "urgent" }
      ]
    },
    {
      id: 3,
      question: "How do you prefer to do your deepest personal work?",
      options: [
        { text: "One on one where I can go deep without distraction", value: "individual" },
        { text: "In a group where I can learn from others' experiences", value: "group" },
        { text: "I'm open to both, depending on what works best", value: "flexible" },
        { text: "I prefer to start with resources I can explore on my own", value: "self_directed" }
      ]
    },
    {
      id: 4,
      question: "How comfortable are you with intense emotional and somatic work?",
      options: [
        { text: "I'm ready to feel everything and work through the body", value: "comfortable" },
        { text: "I'm nervous but willing to be pushed outside my comfort zone", value: "willing" },
        { text: "I'd prefer to start gentle and build up gradually", value: "gradual" },
        { text: "I'm not sure what that involves yet", value: "learning" }
      ]
    }
  ]

  const recommendations = {
    coaching: {
      title: "1:1 Transformational Coaching",
      description: "You're ready for deep, personalised work. Let's journey together through intensive transformation.",
      cta: "Explore Coaching",
      link: "/work#coaching"
    },
    circle: {
      title: "Circle of Return Membership",
      description: "You'd benefit from ongoing support and community. Join others on the path of authentic living.",
      cta: "Join the Circle",
      link: "/circle"
    },
    library: {
      title: "Free Resource Library",
      description: "Start with foundational tools and practices. Build your understanding before diving deeper.",
      cta: "Explore Resources",
      link: "/library"
    }
  }

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const readinessLevel = newAnswers[0]
      const changeCommitment = newAnswers[1]
      const workPreference = newAnswers[2]
      const comfortLevel = newAnswers[3]

      if ((readinessLevel === 'ready' || changeCommitment === 'committed' || changeCommitment === 'urgent') &&
          (workPreference === 'individual' || workPreference === 'flexible') &&
          (comfortLevel === 'comfortable' || comfortLevel === 'willing')) {
        setRecommendation('coaching')
      }
      else if ((readinessLevel === 'intermediate' || readinessLevel === 'maintenance') ||
               (workPreference === 'group' && (comfortLevel === 'willing' || comfortLevel === 'gradual'))) {
        setRecommendation('circle')
      }
      else {
        setRecommendation('library')
      }

      setShowResult(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setShowResult(false)
  }
  
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
        trackEvent('view_session_pack', {
          value: 850
        })
      }
    }, 3000)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (showVSL) {
      document.body.style.overflow = 'hidden'
      const timer = setTimeout(() => {
        setShowCTA(true)
      }, 180000)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = 'unset'
        if (playerRef.current) {
          playerRef.current.destroy()
        }
      }
    }
  }, [showVSL])

  useEffect(() => {
    if (isPlaying && !playerRef.current && window.YT) {
      const initPlayer = () => {
        playerRef.current = new window.YT.Player('vsl-youtube-player', {
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
            onReady: () => setPlayerReady(true),
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false)
              } else if (event.data === window.YT.PlayerState.ENDED) {
                setShowCTA(true)
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

  useEffect(() => {
    if (showVSL && !window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }
  }, [showVSL])

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
  }

  const handleBookCall = () => {
    trackEvent('book_discovery_call', {
      value: 5
    })
    window.open('https://calendly.com/callwithmason/introduction', '_blank')
  }

  const handleSkipToBooking = () => {
    trackEvent('book_discovery_call', {
      value: 5
    })
    window.open('https://calendly.com/callwithmason/introduction', '_blank')
  }

  const closeVSL = () => {
    setShowVSL(false)
    setIsPlaying(false)
    setShowCTA(false)
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }
  }
  
  const createWhatsAppLink = (message) => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  const closePopup = () => {
    setShowPackPopup(false)
  }

  return (
    <>
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
            borderRadius: '3px',
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
                borderRadius: '3px',
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
                onClick={() => trackEvent('session_pack_click')}
                style={{
                  display: 'inline-block',
                  padding: '1.2rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#000',
                  textDecoration: 'none',
                  fontWeight: '700',
                  borderRadius: '3px',
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

      {showVSL && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '0' : '2rem',
          animation: 'mysticalFadeIn 0.8s ease-out'
        }}>
          <button
            onClick={closeVSL}
            style={{
              position: 'absolute',
              top: isMobile ? '1rem' : '2rem',
              right: isMobile ? '1rem' : '2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 10000,
              animation: 'float 3s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.transform = 'rotate(90deg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.transform = 'rotate(0deg)'
            }}
          >
            <X size={24} color="#fff" />
          </button>

          <div style={{
            maxWidth: isMobile ? '100%' : '900px',
            width: '100%',
            height: isMobile ? '100vh' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '0' : '2rem',
            justifyContent: isMobile ? 'center' : 'flex-start',
            animation: 'mysticalZoom 1s ease-out',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(155, 196, 184, 0.15) 0%, transparent 70%)',
              animation: 'pulse 4s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: -1
            }} />
            
            {!isPlaying && !isMobile && (
              <div style={{
                textAlign: 'center',
                animation: 'textGlow 2s ease-in-out infinite'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '0.5rem',
                  lineHeight: '1.3',
                  textShadow: '0 0 20px rgba(155, 196, 184, 0.5), 0 0 40px rgba(155, 196, 184, 0.3)'
                }}>
                  Wait... Before You Book Your Call
                </h2>
                <p style={{
                  fontSize: '1.1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  Watch this first - it'll save us both time
                </p>
              </div>
            )}

            <div style={{
              position: 'relative',
              width: '100%',
              height: isMobile ? '100vh' : 'auto',
              paddingBottom: isMobile ? '0' : '56.25%',
              background: '#000',
              borderRadius: isMobile ? '0' : '12px',
              overflow: 'hidden',
              border: isMobile ? 'none' : '2px solid rgba(155, 196, 184, 0.3)',
              boxShadow: isMobile ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(155, 196, 184, 0.2)',
              animation: 'videoReveal 1.2s ease-out'
            }}>
              {!isPlaying ? (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.1), rgba(127, 176, 105, 0.1))',
                  cursor: 'pointer'
                }}
                onClick={handleInitialPlay}
                >
                  {isMobile && (
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      textAlign: 'center',
                      padding: '0 2rem',
                      animation: 'textGlow 2s ease-in-out infinite'
                    }}>
                      Wait... Before You Book Your Call
                    </p>
                  )}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    animation: 'playButtonPulse 2s ease-in-out infinite',
                    boxShadow: '0 0 30px rgba(155, 196, 184, 0.6), 0 0 60px rgba(155, 196, 184, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(155, 196, 184, 0.5), 0 0 80px rgba(155, 196, 184, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(155, 196, 184, 0.6), 0 0 60px rgba(155, 196, 184, 0.4)'
                  }}
                  >
                    <Play size={32} color="#000" fill="#000" style={{ marginLeft: '4px' }} />
                  </div>
                  {isMobile && (
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.9rem',
                      marginTop: '0.5rem'
                    }}>
                      Tap to watch
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div
                    id="vsl-youtube-player"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  
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
                    boxShadow: '0 0 20px rgba(155, 196, 184, 0.2)'
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
                        transition: 'all 0.3s ease',
                        boxShadow: '0 0 20px rgba(155, 196, 184, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                        e.currentTarget.style.boxShadow = '0 5px 20px rgba(155, 196, 184, 0.5), 0 0 30px rgba(155, 196, 184, 0.5)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(155, 196, 184, 0.4)'
                      }}
                    >
                      {isPlaying ? (
                        <Pause size={24} color="#000" fill="#000" />
                      ) : (
                        <Play size={24} color="#000" fill="#000" style={{ marginLeft: '2px' }} />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {showCTA && (
              <div style={{
                textAlign: 'center',
                padding: isMobile ? '1.5rem' : '2rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(155, 196, 184, 0.2)',
                boxShadow: '0 0 30px rgba(155, 196, 184, 0.1)',
                animation: 'mysticalFadeIn 0.8s ease-out'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '1.3rem' : '1.5rem',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '1rem'
                }}>
                  Ready to Begin?
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '1.5rem',
                  maxWidth: '500px',
                  margin: '0 auto 1.5rem auto'
                }}>
                  If what I shared resonates with where you are, let's have a conversation.
                </p>
                <button
                  onClick={handleBookCall}
                  style={{
                    padding: isMobile ? '1rem 2rem' : '1.2rem 2.5rem',
                    background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: isMobile ? '100%' : 'auto',
                    boxShadow: '0 0 20px rgba(155, 196, 184, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(155, 196, 184, 0.4), 0 0 40px rgba(155, 196, 184, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(155, 196, 184, 0.4)'
                  }}
                >
                  Book Your Discovery Call
                </button>
              </div>
            )}

            {!showCTA && isPlaying && (
              <div style={{
                textAlign: 'center'
              }}>
                <button
                  onClick={handleSkipToBooking}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '3px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(155, 196, 184, 0.5)'
                    e.currentTarget.style.color = '#9bc4b8'
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(155, 196, 184, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Already know you're ready? Skip to booking →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="page-container">
        <section className="section" style={{
          paddingTop: isMobile ? '0' : '13rem',
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
              marginBottom: isMobile ? '0' : '10rem',
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
              <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                fontSize: isMobile ? '1rem' : '1.1rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.7',
                textShadow: isMobile ? '1px 1px 2px rgba(0, 0, 0, 0.7)' : undefined
              }}>
                All powerful. All transformational. I don't just talk mindset. I teach regulation. I don't just say believe in yourself. I show you how to build that belief in your body.
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE-OUT QUIZ TAB */}
        {/* Tab trigger — fixed to right edge */}
        <div
          onClick={() => showQuizPanel ? setShowQuizPanel(false) : (setShowQuizPanel(true), resetQuiz())}
          style={{
            position: 'fixed',
            right: 0,
            top: 'calc(50% + 80px)',
            transform: 'translateY(-50%)',
            zIndex: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: showQuizPanel ? '#7da89c' : '#9bc4b8',
            color: '#0a0a0a',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            padding: '22px 13px',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            borderRadius: '8px 0 0 8px',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.35)',
            userSelect: 'none',
            transition: 'background 0.2s',
          }}
        >
          {showQuizPanel ? '✕ Close' : 'Where are you now?'}
        </div>

        {/* Overlay */}
        {showQuizPanel && (
          <div
            onClick={() => setShowQuizPanel(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 300,
            }}
          />
        )}

        {/* Slide-out panel */}
        <div style={{
          position: 'fixed',
          top: 0,
          right: showQuizPanel ? 0 : '-420px',
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          background: '#0f1a17',
          borderLeft: '1px solid rgba(155,196,184,0.15)',
          zIndex: 400,
          overflowY: 'auto',
          transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1)',
          padding: '28px 28px 48px',
          boxSizing: 'border-box',
        }}>
          {/* Close */}
          <button
            onClick={() => setShowQuizPanel(false)}
            style={{
              display: 'block',
              marginBottom: '28px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              lineHeight: 1,
              padding: '8px 14px',
              letterSpacing: '0.04em',
            }}
          >✕ Close</button>

          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9bc4b8', marginBottom: '16px' }}>Find your path</p>
          <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'rgba(255,255,255,0.92)', marginBottom: '10px', lineHeight: 1.25 }}>Where are you right now?</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '28px' }}>
            Four questions. Answer honestly and you will get a clear read on where you are at and which path makes the most sense right now.
          </p>

          {!showResult ? (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  <span>{currentQuestion + 1} / {questions.length}</span>
                  <span>{Math.round((currentQuestion / questions.length) * 100)}%</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '2px' }}>
                  <div style={{ background: '#9bc4b8', height: '2px', borderRadius: '999px', width: `${(currentQuestion / questions.length) * 100}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>

              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.88)', marginBottom: '16px', lineHeight: 1.55, fontWeight: 500 }}>
                {questions[currentQuestion].question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {questions[currentQuestion].options.map((option, index) => (
                  <button key={index} onClick={() => handleAnswer(option.value)} style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    lineHeight: 1.5,
                  }}>
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ border: '1px solid rgba(155,196,184,0.2)', borderRadius: '8px', background: 'rgba(155,196,184,0.05)', padding: '22px 20px', marginBottom: '14px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#9bc4b8', marginBottom: '10px', fontWeight: 600 }}>YOUR RESULT</p>
                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', fontWeight: 500, marginBottom: '10px', lineHeight: 1.35 }}>
                  {recommendations[recommendation].title}
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '18px' }}>
                  {recommendations[recommendation].description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link href={recommendations[recommendation].link} onClick={() => setShowQuizPanel(false)} style={{
                    padding: '10px 20px',
                    borderRadius: '4px',
                    border: '1px solid rgba(155,196,184,0.6)',
                    background: 'rgba(155,196,184,0.12)',
                    color: '#9bc4b8',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    letterSpacing: '0.02em',
                    display: 'inline-block',
                    textAlign: 'center',
                  }}>
                    {recommendations[recommendation].cta} →
                  </Link>
                  <button onClick={resetQuiz} style={{
                    padding: '10px 20px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}>
                    Start over
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <section id="coaching" className="section" style={{paddingTop: isMobile ? '3rem' : '0'}}>
          <div className="container">
            <div style={{
              marginBottom: '5rem',
              padding: isMobile ? '2rem' : '3rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '3px',
              position: 'relative',
              transition: 'all 0.4s ease',
              animation: 'slideUp 0.8s ease-out 0.2s both'
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
                borderRadius: '3px',
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
                  { title: 'Phase 1: Self-Exploration', desc: 'Identify the unconscious patterns running your life. Deep, honest self-awareness.' },
                  { title: 'Phase 2: Somatic Integration', desc: 'Enter the body. Access the subconscious through your body\'s stored intelligence.' },
                  { title: 'Phase 3: Aligned Action', desc: 'Anchor new habits rooted in your values. Become more you.' }
                ].map((phase, index) => (
                  <div key={index} style={{
                    padding: '1.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderLeft: '3px solid rgba(255, 255, 255, 0.6)',
                    borderRadius: '3px',
                    transition: 'all 0.3s ease'
                  }}>
                    <h4 style={{color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.5rem', fontSize: '1.1rem'}}>{phase.title}</h4>
                    <p style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem', lineHeight: '1.4'}}>
                      {phase.desc}
                    </p>
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
                borderRadius: '3px'
              }}>
                "This is high-level, high-impact intestive work for those who are serious about change."
              </blockquote>

              <div style={{textAlign: 'center'}}>
                <button
                  onClick={() => { setShowVSL(true); trackEvent('coaching_apply_click') }}
                  style={{
                    display: 'inline-block',
                    padding: isMobile ? '1rem 2rem' : '1.2rem 2.5rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#000000',
                    textDecoration: 'none',
                    fontWeight: '700',
                    borderRadius: '3px',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Book Your Discovery Call
                </button>
              </div>
            </div>

            <div style={{
              marginBottom: '5rem',
              padding: isMobile ? '2rem' : '3rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '3px',
              transition: 'all 0.4s ease',
              animation: 'slideUp 0.8s ease-out 0.6s both'
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
                  borderRadius: '3px',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease'
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
                  borderRadius: '3px',
                  position: 'relative',
                  transition: 'all 0.4s ease'
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
                    borderRadius: '3px'
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
                      onClick={() => trackEvent('begin_checkout', {
                        service: 'breathwork',
                        value: 200
                      })}
                      style={{
                        display: 'block',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#000',
                        textDecoration: 'none',
                        fontWeight: '700',
                        borderRadius: '3px',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Book Now
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
                        borderRadius: '3px',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
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
                  borderRadius: '3px',
                  position: 'relative',
                  transition: 'all 0.4s ease'
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
                    borderRadius: '3px'
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
                    90 minutes of deep energetic clearing and spiritual realignment. Reiki-based healing 
                    that works with your body's natural energy systems.
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
                      onClick={() => trackEvent('begin_checkout', {
                        service: 'energy_healing',
                        value: 120
                      })}
                      style={{
                        display: 'block',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#000',
                        textDecoration: 'none',
                        fontWeight: '700',
                        borderRadius: '3px',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Book Now
                    </a>
                    
                    <a 
                      href={createWhatsAppLink("Hi Mason, I'd like to learn more about the Energy Healing Experience. What exactly happens during this 90-minute session and how do I know if it's right for me?")}
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
                        borderRadius: '3px',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
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
                borderRadius: '3px',
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
              borderRadius: '3px',
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
                  borderRadius: '3px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  width: isMobile ? '100%' : 'auto'
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
                    borderRadius: '3px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Let's Talk
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      
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
        
        @keyframes mysticalFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(20px);
          }
        }
        
        @keyframes mysticalZoom {
          0% {
            opacity: 0;
            transform: scale(0.9);
            filter: blur(10px);
          }
          50% {
            opacity: 0.5;
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }
        
        @keyframes videoReveal {
          0% {
            opacity: 0;
            transform: scale(0.95);
            box-shadow: 0 0 0 rgba(155, 196, 184, 0);
          }
          50% {
            box-shadow: 0 0 60px rgba(155, 196, 184, 0.4);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(155, 196, 184, 0.2);
          }
        }
        
        @keyframes playButtonPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 30px rgba(155, 196, 184, 0.6), 0 0 60px rgba(155, 196, 184, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(155, 196, 184, 0.8), 0 0 80px rgba(155, 196, 184, 0.6);
          }
        }
        
        @keyframes textGlow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(155, 196, 184, 0.5), 0 0 40px rgba(155, 196, 184, 0.3);
          }
          50% {
            text-shadow: 0 0 30px rgba(155, 196, 184, 0.7), 0 0 60px rgba(155, 196, 184, 0.5);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </>
  )
}