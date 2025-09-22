'use client'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import MysticalBackground from './components/MysticalBackground'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [shimmerPhase, setShimmerPhase] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [recommendation, setRecommendation] = useState<'coaching' | 'circle' | 'library'>('library')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    const interval = setInterval(() => {
      setShimmerPhase(prev => (prev + 1) % 4)
    }, 180000)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  const questions = [
    {
      id: 1,
      question: "How would you describe where you are in your personal growth journey?",
      options: [
        { text: "Just starting to recognize I need change", value: "beginning" },
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
        { text: "One-on-one where I can go deep without distraction", value: "individual" },
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
      description: "You're ready for deep, personalized work. Let's journey together through intensive transformation.",
      cta: "Explore Coaching",
      link: "/work"
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

  const shimmerThemes = [
    { primary: '#9bc4b8', accent: '#d4af37', shimmer: 'rgba(155, 196, 184, 0.12)' },
    { primary: '#7fb069', accent: '#f4a261', shimmer: 'rgba(127, 176, 105, 0.10)' },
    { primary: '#6a994e', accent: '#e76f51', shimmer: 'rgba(106, 153, 78, 0.14)' },
    { primary: '#8db4a8', accent: '#c49c30', shimmer: 'rgba(141, 180, 168, 0.08)' }
  ]

  const currentTheme = shimmerThemes[shimmerPhase]

  return (
    <>
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
          background: linear-gradient(90deg, transparent 0%, var(--shimmer-color) 50%, transparent 100%);
          animation: shimmer 8s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; opacity: 0; }
          25% { opacity: 0.3; }
          50% { opacity: 0.5; }
          75% { opacity: 0.3; }
          100% { left: 100%; opacity: 0; }
        }
        
        .accent-text {
          transition: color 15s ease-in-out;
        }
        
        .btn-primary, .btn-secondary {
          transition: all 0.3s ease, color 15s ease-in-out, background-color 15s ease-in-out, border-color 15s ease-in-out;
        }
      `}</style>
      
      <Navigation />
      <MysticalBackground />
      
      <main className="page-container">
        <section className="section" style={{
          paddingTop: isMobile ? '0' : '5rem',
          height: isMobile ? '100vh' : 'auto',
          position: 'relative', 
          overflow: 'hidden',
          display: isMobile ? 'flex' : 'block',
          alignItems: isMobile ? 'center' : 'normal'
        }}>
          <div style={{
            position: 'absolute', 
            top: 0, 
            right: 0, 
            bottom: 0, 
            left: isMobile ? 0 : 'auto',
            width: isMobile ? '100%' : '60%',
            backgroundImage: 'url(/serious.jpg)', 
            backgroundSize: 'cover',
            backgroundPosition: isMobile ? 'center center' : 'center top', 
            opacity: isMobile ? 0.7 : 0.2, 
            zIndex: 1
          }}>
            <div style={{
              position: 'absolute', 
              inset: 0,
              background: isMobile 
                ? 'linear-gradient(to bottom, rgba(10, 10, 11, 0.6) 0%, rgba(10, 10, 11, 0.4) 50%, rgba(10, 10, 11, 0.7) 100%)'
                : 'linear-gradient(90deg, #0a0a0b 0%, #0a0a0b 10%, rgba(10, 10, 11, 0.8) 20%, rgba(10, 10, 11, 0.4) 40%, transparent 60%)'
            }}></div>
          </div>

          <div className="container" style={{
            position: 'relative', 
            zIndex: 2,
            textAlign: isMobile ? 'center' : 'left',
            width: isMobile ? '90%' : 'auto'
          }}>
            <div style={{maxWidth: isMobile ? '100%' : '800px'}}>
              <div style={{
                display: 'inline-block', 
                background: 'rgba(56, 72, 93, 0.1)',
                border: '1px solid var(--border-primary)', 
                padding: '0.4rem 0.8rem',
                borderRadius: '20px', 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)',
                marginBottom: '2rem', 
                backdropFilter: 'blur(10px)'
              }}>
                Transformational Inner Work
              </div>
              
              <h1 className="h1 shimmer-accent" style={{
                fontSize: isMobile ? 'clamp(2rem, 8vw, 3rem)' : 'clamp(2.5rem, 6vw, 4.5rem)', 
                marginBottom: '1rem'
              }}>
                What you think, feel and do isn't <span className="accent-text">random</span>
              </h1>
              
              <p className="body-large" style={{
                marginBottom: '2rem', 
                maxWidth: isMobile ? '100%' : '600px', 
                fontSize: isMobile ? '1rem' : '1.1rem'
              }}>
                It's a pattern. It's a protection. It's your truth trying to speak through a body that's never had the space to be heard.
              </p>

              <p className="body-large" style={{
                marginBottom: '3rem', 
                maxWidth: isMobile ? '100%' : '600px', 
                fontSize: isMobile ? '1rem' : '1.1rem',
                fontWeight: '600'
              }}>
                This isn't coaching. This isn't performance. This is a return to the self underneath the noise, the reactions, and the pressure.
              </p>
              
              <div style={{
                display: 'flex', 
                gap: '1rem', 
                flexWrap: 'wrap',
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}>
                <Link href="/work" className="btn-primary" style={{
                  borderRadius: '0.3rem', 
                  padding: '0.8rem 1.5rem', 
                  fontSize: '0.95rem'
                }}>
                  Start Your Journey <span>→</span>
                </Link>
                <Link href="/about" className="btn-secondary" style={{
                  borderRadius: '0.3rem', 
                  padding: '0.8rem 1.5rem', 
                  fontSize: '0.95rem'
                }}>
                  My Story
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div style={{
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '4rem', 
              alignItems: 'center'
            }}>
              <div>
                <h2 className="h2 shimmer-accent" style={{
                  color: 'var(--text-primary-inverse)', 
                  fontSize: isMobile ? '2rem' : '2.5rem'
                }}>
                  This work isn't about trying to become someone new
                </h2>
                <p className="body-large" style={{
                  marginBottom: '2rem', 
                  color: 'rgba(246, 246, 246, 0.9)', 
                  fontSize: isMobile ? '1rem' : '1.1rem'
                }}>
                  It's about returning to who you are before the world told you to be something else.
                </p>
                <p className="body" style={{
                  color: 'rgba(246, 246, 246, 0.8)', 
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  marginBottom: '1.5rem'
                }}>
                  You weren't born to carry this weight forever. You're here to shift. To elevate. To meet what's in the way and move through it.
                </p>
                <p className="body" style={{
                  color: 'rgba(246, 246, 246, 0.8)', 
                  fontSize: isMobile ? '0.9rem' : '1rem'
                }}>
                  Struggle isn't weakness. It's survival. It's guidance. It's your body letting you know it's time to change the pattern.
                </p>
              </div>
              
              <div className="card">
                <blockquote style={{borderLeft: '3px solid var(--primary)', paddingLeft: '2rem'}}>
                  <p style={{
                    fontSize: isMobile ? '1.1rem' : '1.25rem', 
                    fontStyle: 'italic', 
                    color: 'var(--primary)', 
                    marginBottom: '1rem'
                  }}>
                    "Your anger, your reactions, your escapes are not random. They're patterns. And once you reconnect to your truth, new choices become possible. Keep going and it will all make sense from the inside."
                  </p>
                  <footer className="body-small" style={{fontWeight: 'bold'}}>— Core Principle</footer>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{textAlign: 'center', marginBottom: '4rem'}}>
              <h2 className="h2 shimmer-accent" style={{fontSize: isMobile ? '2rem' : '2.5rem'}}>My Modalities</h2>
              <p className="body-large" style={{fontSize: isMobile ? '1rem' : '1.1rem'}}>Proven methods for real transformation.</p>
            </div>
            
            <div style={{
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
              gap: '2rem'
            }}>
              {[
                { 
                  title: 'Somatic Therapy', 
                  subtitle: 'Body-based healing', 
                  description: 'Your body remembers what your mind learned to forget. Together, we work with physical sensation, breath, and stored emotion to release trauma, restore safety, and rebuild trust with your nervous system.' 
                },
                { 
                  title: 'Breathwork', 
                  subtitle: 'Ancient wisdom, modern application', 
                  description: 'Your breath is one of the most powerful tools you have. These guided sessions clear stuck energy, regulate emotion, and create the conditions for clarity, breakthrough, and deep emotional release.' 
                },
                { 
                  title: 'Energy Work', 
                  subtitle: 'Energetic recalibration and emotional clearing', 
                  description: 'Your energetic field holds more than just emotion - it holds patterns, imprints, and memory. This work helps release what no longer belongs, clear inherited blocks, and restore your natural state of clarity, flow, and grounded presence.' 
                },
                { 
                  title: 'Integrative Coaching', 
                  subtitle: 'Depth work that moves the whole system', 
                  description: 'This is where everything comes together - nervous system, psychology, emotion, and direction. We don\'t just talk about change. We build it. Rooted in somatic practice and real accountability, this is coaching that honours your story and leads you forward with purpose.' 
                }
              ].map((item, i) => (
                <div key={i} className="card">
                  <h3 className="h3 shimmer-accent" style={{fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 'bold'}}>{item.title}</h3>
                  <p className="body-small accent-text" style={{
                    marginBottom: '1rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {item.subtitle}
                  </p>
                  <p className="body" style={{fontSize: isMobile ? '0.9rem' : '0.95rem'}}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div style={{textAlign: 'center', marginBottom: '3rem'}}>
              <h2 className="h2 shimmer-accent" style={{
                color: 'var(--text-primary-inverse)', 
                fontSize: isMobile ? '2rem' : '2.5rem'
              }}>Where You Are Now</h2>
              <p className="body-large" style={{
                color: 'rgba(246, 246, 246, 0.9)', 
                fontSize: isMobile ? '1rem' : '1.1rem'
              }}>
                A simple four question check-in to help you see what's really going on — and where to go from here.
              </p>
            </div>

            <div className="card" style={{maxWidth: '800px', margin: '0 auto'}}>
              {!showResult ? (
                <div>
                  <div style={{marginBottom: '2rem'}}>
                    <div style={{
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      color: 'var(--text-muted)', 
                      fontSize: '0.85rem', 
                      marginBottom: '0.5rem'
                    }}>
                      <span>Question {currentQuestion + 1} of {questions.length}</span>
                      <span>{Math.round((currentQuestion / questions.length) * 100)}%</span>
                    </div>
                    <div style={{
                      width: '100%', 
                      background: 'var(--bg-tertiary)', 
                      borderRadius: '10px', 
                      height: '6px'
                    }}>
                      <div style={{
                        background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                        height: '6px', 
                        borderRadius: '10px',
                        width: `${((currentQuestion) / questions.length) * 100}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: isMobile ? '1.3rem' : '1.5rem', 
                    color: 'var(--text-primary)', 
                    marginBottom: '2rem', 
                    lineHeight: '1.4'
                  }}>
                    {questions[currentQuestion].question}
                  </h3>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {questions[currentQuestion].options.map((option, index) => (
                      <button key={index} onClick={() => handleAnswer(option.value)} style={{
                        textAlign: 'left', 
                        padding: '1.5rem', 
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)', 
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)', 
                        fontSize: isMobile ? '0.9rem' : '1rem', 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '3rem', marginBottom: '2rem'}}>🪞</div>
                  <h3 style={{
                    fontSize: isMobile ? '1.5rem' : '1.8rem', 
                    color: 'var(--text-primary)', 
                    marginBottom: '1rem'
                  }}>
                    {recommendations[recommendation].title}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '1rem' : '1.1rem', 
                    color: 'var(--text-secondary)', 
                    marginBottom: '2rem', 
                    lineHeight: '1.6'
                  }}>
                    {recommendations[recommendation].description}
                  </p>
                  <div style={{
                    display: 'flex', 
                    gap: '1rem', 
                    justifyContent: 'center', 
                    flexWrap: 'wrap'
                  }}>
                    <Link href={recommendations[recommendation].link} className="btn-primary" style={{
                      borderRadius: '0.3rem', 
                      padding: '0.8rem 1.5rem', 
                      fontSize: '0.95rem'
                    }}>
                      {recommendations[recommendation].cta} <span>→</span>
                    </Link>
                    <button onClick={resetQuiz} className="btn-secondary" style={{
                      borderRadius: '0.3rem', 
                      padding: '0.8rem 1.5rem', 
                      fontSize: '0.95rem'
                    }}>
                      Take Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{textAlign: 'center', marginBottom: '4rem'}}>
              <h2 className="h2 shimmer-accent" style={{fontSize: isMobile ? '2rem' : '2.5rem'}}>Those Who've Made the Return</h2>
            </div>
            
            <div style={{
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '2rem', 
              maxWidth: '1000px', 
              margin: '0 auto'
            }}>
              {[
                { title: "From Chaos to Clarity", name: "Real Client Story", embedId: "7Y1upKm8bZk" },
                { title: "Breaking the Cycle", name: "Authentic Transformation", embedId: "ubCK70jYQDI" },
                { title: "Finding My Power", name: "Client Journey", embedId: "UfbMIxlCzgM" },
                { title: "The Return Journey", name: "Deep Work Results", embedId: "n8_muJ84AbU" }
              ].map((video, i) => (
                <div key={i} className="card" style={{padding: '0', overflow: 'hidden'}}>
                  <div style={{
                    aspectRatio: '9/16', 
                    background: '#000', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${video.embedId}`}
                      title={video.title} 
                      frameBorder="0" 
                      allowFullScreen 
                      style={{border: 'none'}} 
                    />
                  </div>
                  <div style={{padding: '1.5rem'}}>
                    <h4 style={{
                      color: 'var(--text-primary)', 
                      marginBottom: '0.5rem', 
                      fontSize: isMobile ? '0.9rem' : '1rem'
                    }}>{video.title}</h4>
                    <p className="body-small" style={{fontSize: '0.85rem'}}>{video.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{textAlign: 'center', maxWidth: '600px', margin: '0 auto'}}>
              <h2 className="h2 shimmer-accent" style={{fontSize: isMobile ? '2rem' : '2.5rem'}}>Ready to Begin Your Return?</h2>
              <p className="body-large" style={{
                marginBottom: '3rem', 
                fontSize: isMobile ? '1rem' : '1.1rem'
              }}>
                The path isn't easy. But neither is staying where you are.
              </p>
              <div style={{
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center', 
                flexWrap: 'wrap'
              }}>
                <Link href="/contact" className="btn-primary" style={{
                  borderRadius: '0.3rem', 
                  padding: '0.8rem 1.5rem', 
                  fontSize: '0.95rem'
                }}>
                  Book Discovery Call <span>→</span>
                </Link>
                <Link href="/library" className="btn-secondary" style={{
                  borderRadius: '0.3rem', 
                  padding: '0.8rem 1.5rem', 
                  fontSize: '0.95rem'
                }}>
                  Free Resources
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  )
}